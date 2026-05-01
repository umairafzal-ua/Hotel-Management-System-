import mongoose from "mongoose";
import Room from "../../models/Room.js";
import {
    getGroupBookingByIdRaw,
    updateGroupBookingById,
    pushAllocatedBookings,
} from "../../repositories/GroupBookingRepository.js";
import {
    createBooking,
    getOverlappingConfirmedBookings,
} from "../../repositories/BookingRepository.js";
import { validateOperationalStatus } from "../booking/BookingRules.js";
import bookingStatusService from "../booking/BookingStatusService.js";

class AllocateGroupRoomsService {
    async execute(groupId, payload, user) {
        const session = await mongoose.startSession();

        try {
            let result;
            await session.withTransaction(async () => {
                // 1. Load group booking
                const group = await getGroupBookingByIdRaw(groupId, session);
                if (!group) {
                    throw new Error("Group booking not found");
                }

                // 2. Only pending groups can have rooms allocated
                if (group.status !== "pending") {
                    throw new Error("Rooms can only be allocated to pending group bookings");
                }

                // 3. Branch access check (non-admin must match branch)
                const isAdmin = typeof user?.role === "string" && user.role.toLowerCase() === "admin";
                if (!isAdmin && user?.branchId && String(group.branch) !== String(user.branchId)) {
                    throw new Error("Branch access denied");
                }

                const { roomIds } = payload;
                const childBookingIds = [];
                let totalSlots = 0;

                // 4. Process each room — system auto-uses full room capacity
                for (const roomId of roomIds) {
                    const room = await Room.findById(roomId).session(session);
                    if (!room) {
                        throw new Error(`Room not found: ${roomId}`);
                    }

                    // Verify room belongs to same branch
                    if (String(room.branch) !== String(group.branch)) {
                        throw new Error(`Room ${room.roomNumber} does not belong to the group's branch`);
                    }

                    // Verify room is operational
                    validateOperationalStatus(room);

                    // Check overlapping bookings for overbooking prevention
                    const overlapping = await getOverlappingConfirmedBookings(
                        room._id,
                        group.checkInDate,
                        group.checkOutDate,
                        null,
                        session
                    );

                    const occupiedSlots = overlapping.reduce(
                        (sum, b) => sum + (b.allocatedSlots || 0),
                        0
                    );
                    const availableSlots = room.capacity - occupiedSlots;

                    if (availableSlots <= 0) {
                        throw new Error(
                            `Room ${room.roomNumber} has no available slots for the selected dates`
                        );
                    }

                    // Use full available capacity of the room automatically
                    const slotsToAllocate = availableSlots;

                    // Create child booking record
                    const childBooking = await createBooking(
                        {
                            branch: group.branch,
                            room: room._id,
                            customer: { name: group.groupName },
                            partyType: "group",
                            guestCount: slotsToAllocate,
                            gender: "mixed",
                            checkInDate: group.checkInDate,
                            checkOutDate: group.checkOutDate,
                            allocatedSlots: slotsToAllocate,
                            status: "confirmed",
                            bookingScope: "group_child",
                            groupBooking: group._id,
                            notes: `Group allocation for "${group.groupName}" — Room ${room.roomNumber}`,
                            createdBy: user.userId,
                            updatedBy: user.userId,
                        },
                        session
                    );

                    childBookingIds.push(childBooking._id);
                    totalSlots += slotsToAllocate;

                    // Update room operational status
                    await bookingStatusService.refreshRoomOperationalStatus(room._id, session);
                }

                // 5. Validate total capacity covers all pilgrims
                if (totalSlots < group.totalPilgrims) {
                    throw new Error(
                        `Total room capacity (${totalSlots}) is less than total pilgrims (${group.totalPilgrims}). Add more rooms.`
                    );
                }

                // 6. Link child bookings and confirm group
                await pushAllocatedBookings(group._id, childBookingIds, session);
                await updateGroupBookingById(
                    group._id,
                    {
                        status: "confirmed",
                        updatedBy: user.userId,
                    },
                    session
                );

                // 7. Reload for response
                result = await mongoose.model("GroupBooking")
                    .findById(group._id)
                    .populate("branch", "name location")
                    .populate("groupLeader", "fullName email")
                    .populate({
                        path: "allocatedBookings",
                        populate: {
                            path: "room",
                            select: "roomNumber type capacity floor basePrice",
                        },
                    })
                    .session(session);
            });

            return result;
        } finally {
            await session.endSession();
        }
    }
}

export default new AllocateGroupRoomsService();
