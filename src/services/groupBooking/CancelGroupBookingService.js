import mongoose from "mongoose";
import {
    getGroupBookingByIdRaw,
    updateGroupBookingById,
} from "../../repositories/GroupBookingRepository.js";
import {
    updateBookingById,
} from "../../repositories/BookingRepository.js";
import { unassignMembersByGroup } from "../../repositories/GroupMemberRepository.js";
import bookingStatusService from "../booking/BookingStatusService.js";

class CancelGroupBookingService {
    async execute(groupId, reason, user) {
        const session = await mongoose.startSession();

        try {
            let result;
            await session.withTransaction(async () => {
                // 1. Load group
                const group = await getGroupBookingByIdRaw(groupId, session);
                if (!group) {
                    throw new Error("Group booking not found");
                }

                // 2. Cannot cancel completed groups
                if (group.status === "completed") {
                    throw new Error("Completed group bookings cannot be cancelled");
                }

                if (group.status === "cancelled") {
                    throw new Error("Group booking is already cancelled");
                }

                // 3. Branch access check
                const isAdmin = typeof user?.role === "string" && user.role.toLowerCase() === "admin";
                if (!isAdmin && user?.branchId && String(group.branch) !== String(user.branchId)) {
                    throw new Error("Branch access denied");
                }

                // 4. Cancel all child bookings
                const affectedRoomIds = [];
                for (const bookingId of group.allocatedBookings || []) {
                    const updated = await updateBookingById(
                        bookingId,
                        {
                            status: "cancelled",
                            cancelledAt: new Date(),
                            cancellationReason: reason || "Group booking cancelled",
                            updatedBy: user.userId,
                        },
                        session
                    );

                    if (updated?.room) {
                        affectedRoomIds.push(updated.room._id || updated.room);
                    }
                }

                // 5. Refresh room statuses
                const uniqueRoomIds = [...new Set(affectedRoomIds.map(String))];
                for (const roomId of uniqueRoomIds) {
                    await bookingStatusService.refreshRoomOperationalStatus(roomId, session);
                }

                // 6. Unassign all members
                await unassignMembersByGroup(groupId, session);

                // 7. Update group status
                result = await updateGroupBookingById(
                    groupId,
                    {
                        status: "cancelled",
                        cancelledAt: new Date(),
                        cancellationReason: reason || undefined,
                        updatedBy: user.userId,
                    },
                    session
                );
            });

            return result;
        } finally {
            await session.endSession();
        }
    }
}

export default new CancelGroupBookingService();
