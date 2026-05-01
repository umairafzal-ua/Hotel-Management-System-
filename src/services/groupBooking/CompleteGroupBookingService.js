import mongoose from "mongoose";
import {
    getGroupBookingByIdRaw,
    updateGroupBookingById,
} from "../../repositories/GroupBookingRepository.js";
import { updateBookingById } from "../../repositories/BookingRepository.js";
import bookingStatusService from "../booking/BookingStatusService.js";

class CompleteGroupBookingService {
    async execute(groupId, user) {
        const session = await mongoose.startSession();

        try {
            let updated;
            await session.withTransaction(async () => {
                // 1. Load group booking
                const group = await getGroupBookingByIdRaw(groupId, session);
                if (!group) {
                    throw new Error("Group booking not found");
                }

                // 2. Only confirmed groups can be completed
                if (group.status !== "confirmed") {
                    throw new Error("Only confirmed group bookings can be marked as completed");
                }

                // 3. Branch access check
                const isAdmin = typeof user?.role === "string" && user.role.toLowerCase() === "admin";
                if (!isAdmin && user?.branchId && String(group.branch) !== String(user.branchId)) {
                    throw new Error("Branch access denied");
                }

                // 4. Cannot complete before checkout date
                if (new Date(group.checkOutDate) > new Date()) {
                    throw new Error("Cannot complete group booking before check-out date has passed");
                }

                // 5. Mark group completed
                updated = await updateGroupBookingById(groupId, {
                    status: "completed",
                    updatedBy: user.userId,
                }, session);

                // 6. Cascade completed status to all child bookings
                if (group.allocatedBookings && group.allocatedBookings.length > 0) {
                    const now = new Date();
                    const roomIds = new Set();

                    for (const bookingId of group.allocatedBookings) {
                        const childBooking = await updateBookingById(
                            bookingId,
                            {
                                status: "completed",
                                completedAt: now,
                                updatedBy: user.userId,
                            },
                            session
                        );

                        if (childBooking?.room) {
                            roomIds.add(String(childBooking.room._id || childBooking.room));
                        }
                    }

                    // 7. Refresh room operational status for affected rooms
                    for (const roomId of roomIds) {
                        await bookingStatusService.refreshRoomOperationalStatus(roomId, session);
                    }
                }
            });

            return updated;
        } finally {
            await session.endSession();
        }
    }
}

export default new CompleteGroupBookingService();