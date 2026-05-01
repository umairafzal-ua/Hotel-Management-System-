import mongoose from "mongoose";
import {
    getGroupBookingByIdRaw,
} from "../../repositories/GroupBookingRepository.js";
import {
    getMemberById,
    countAssignedMembersByBooking,
    updateMemberAssignment,
    getMembersByGroupBooking,
} from "../../repositories/GroupMemberRepository.js";
import { getBookingByIdRaw } from "../../repositories/BookingRepository.js";

class AssignMembersToRoomsService {
    async execute(groupId, payload, user) {
        const session = await mongoose.startSession();

        try {
            let members;
            await session.withTransaction(async () => {
                // 1. Load group
                const group = await getGroupBookingByIdRaw(groupId, session);
                if (!group) {
                    throw new Error("Group booking not found");
                }

                // 2. Only confirmed groups allow assignment
                if (group.status !== "confirmed") {
                    throw new Error("Members can only be assigned in confirmed group bookings");
                }

                // 3. Ownership — only group leader (or admin)
                if (String(group.groupLeader) !== String(user.userId)) {
                    const isAdmin = typeof user?.role === "string" && user.role.toLowerCase() === "admin";
                    if (!isAdmin) {
                        throw new Error("Only the group leader can assign members to rooms");
                    }
                }

                // 4. Cannot assign after check-in
                if (new Date(group.checkInDate) <= new Date()) {
                    throw new Error("Cannot assign members after check-in date has passed");
                }

                const allocatedBookingIds = group.allocatedBookings.map((id) => String(id));

                // 5. Process each assignment
                for (const assignment of payload.assignments) {
                    // Verify member belongs to this group
                    const member = await getMemberById(assignment.memberId, session);
                    if (!member) {
                        throw new Error(`Member not found: ${assignment.memberId}`);
                    }
                    if (String(member.groupBooking) !== String(groupId)) {
                        throw new Error(`Member ${member.fullName} does not belong to this group`);
                    }
                    if (member.assignmentStatus === "assigned") {
                        throw new Error(`Member ${member.fullName} is already assigned to a room`);
                    }

                    // Verify booking belongs to this group
                    if (!allocatedBookingIds.includes(String(assignment.bookingId))) {
                        throw new Error(
                            `Booking ${assignment.bookingId} is not part of this group's allocated rooms`
                        );
                    }

                    // Load booking to get room and capacity
                    const booking = await getBookingByIdRaw(assignment.bookingId, session);
                    if (!booking) {
                        throw new Error(`Booking not found: ${assignment.bookingId}`);
                    }

                    // Check capacity − count currently assigned + 1 must not exceed allocatedSlots
                    const assignedCount = await countAssignedMembersByBooking(
                        assignment.bookingId,
                        session
                    );

                    if (assignedCount + 1 > booking.allocatedSlots) {
                        throw new Error(
                            `Room capacity exceeded for booking ${assignment.bookingId}. ` +
                            `Already ${assignedCount} assigned, max is ${booking.allocatedSlots}`
                        );
                    }

                    // Assign member
                    await updateMemberAssignment(
                        assignment.memberId,
                        booking._id,
                        booking.room,
                        session
                    );
                }
            });

            // Return updated members list
            members = await getMembersByGroupBooking(groupId);
            return members;
        } finally {
            await session.endSession();
        }
    }
}

export default new AssignMembersToRoomsService();
