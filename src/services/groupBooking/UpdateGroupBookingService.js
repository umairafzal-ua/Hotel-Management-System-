import mongoose from "mongoose";
import Branch from "../../models/Branch.js";
import {
    getGroupBookingByIdRaw,
    updateGroupBookingById,
} from "../../repositories/GroupBookingRepository.js";
import { updateBookingById } from "../../repositories/BookingRepository.js";
import bookingStatusService from "../booking/BookingStatusService.js";

class UpdateGroupBookingService {
    async execute(groupId, payload, user) {
        const session = await mongoose.startSession();

        try {
            let updated;
            await session.withTransaction(async () => {
                const group = await getGroupBookingByIdRaw(groupId, session);
                if (!group) {
                    throw new Error("Group booking not found");
                }

                if (group.status === "cancelled" || group.status === "completed") {
                    throw new Error("Cannot update a cancelled or completed group booking");
                }

                const isAdmin = String(user?.roleSlug || user?.role || "").toLowerCase() === "admin";
                const isGroupLeader = String(user?.userId) === String(group.groupLeader);
                if (!isAdmin && !isGroupLeader && user?.branchId && String(group.branch) !== String(user.branchId)) {
                    throw new Error("Access denied");
                }

                const updateData = { updatedBy: user.userId };

                // Handle date changes
                const datesChanged = payload.checkInDate || payload.checkOutDate;
                if (payload.checkInDate) {
                    const checkIn = new Date(payload.checkInDate);
                    if (Number.isNaN(checkIn.getTime())) {
                        throw new Error("Invalid check-in date");
                    }
                    updateData.checkInDate = checkIn;
                }
                if (payload.checkOutDate) {
                    const checkOut = new Date(payload.checkOutDate);
                    if (Number.isNaN(checkOut.getTime())) {
                        throw new Error("Invalid check-out date");
                    }
                    updateData.checkOutDate = checkOut;
                }

                // Validate date range
                const finalCheckIn = updateData.checkInDate || group.checkInDate;
                const finalCheckOut = updateData.checkOutDate || group.checkOutDate;
                if (finalCheckOut <= finalCheckIn) {
                    throw new Error("Check-out date must be after check-in date");
                }

                // Other updatable fields
                if (payload.groupName !== undefined) {
                    updateData.groupName = payload.groupName;
                }
                if (payload.totalPilgrims !== undefined) {
                    updateData.totalPilgrims = payload.totalPilgrims;
                }
                if (payload.preferences) {
                    updateData.preferences = {
                        ...group.preferences,
                        ...payload.preferences,
                    };
                }

                // Update group booking
                updated = await updateGroupBookingById(groupId, updateData, session);

                // Cascade date changes to child bookings
                if (datesChanged && group.allocatedBookings && group.allocatedBookings.length > 0) {
                    const childUpdateData = {
                        checkInDate: updateData.checkInDate || group.checkInDate,
                        checkOutDate: updateData.checkOutDate || group.checkOutDate,
                        updatedBy: user.userId,
                    };

                    for (const bookingId of group.allocatedBookings) {
                        await updateBookingById(bookingId, childUpdateData, session);
                    }
                }
            });

            return updated;
        } finally {
            await session.endSession();
        }
    }
}

export default new UpdateGroupBookingService();