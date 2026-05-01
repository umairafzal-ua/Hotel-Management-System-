import mongoose from "mongoose";
import Room from "../../models/Room.js";
import {
    getBookingByIdRaw,
    getOverlappingConfirmedBookings,
    updateBookingById,
} from "../../repositories/BookingRepository.js";
import {
    calculateRequestedSlots,
    parseDateRange,
    validateGenderRestriction,
    validateOperationalStatus,
    validateSharedPolicy,
} from "./BookingRules.js";
import bookingStatusService from "./BookingStatusService.js";

class ReassignBookingService {
    async execute(bookingId, payload, user) {
        const session = await mongoose.startSession();

        try {
            let updated;
            await session.withTransaction(async () => {
                const booking = await getBookingByIdRaw(bookingId, session);
                if (!booking) {
                    throw new Error("Booking not found");
                }

                if (booking.status !== "confirmed") {
                    throw new Error("Only confirmed bookings can be reassigned");
                }

                const isAdmin = String(user?.roleSlug || user?.role || "").toLowerCase() === "admin";
                if (!isAdmin && user?.branchId && String(booking.branch) !== String(user.branchId)) {
                    throw new Error("Branch access denied");
                }

                const targetRoom = await Room.findById(payload.newRoomId).session(session);
                if (!targetRoom) {
                    throw new Error("Target room not found");
                }

                if (!isAdmin && user?.branchId && String(targetRoom.branch) !== String(user.branchId)) {
                    throw new Error("Branch access denied");
                }

                validateOperationalStatus(targetRoom);
                validateGenderRestriction(targetRoom, booking.partyType, booking.gender || "mixed");
                validateSharedPolicy(targetRoom, booking.partyType);

                const checkInInput = payload.checkInDate || booking.checkInDate;
                const checkOutInput = payload.checkOutDate || booking.checkOutDate;
                const { checkIn, checkOut } = parseDateRange(checkInInput, checkOutInput);

                const requestedSlots = calculateRequestedSlots(targetRoom, booking.partyType, booking.guestCount);

                const overlapping = await getOverlappingConfirmedBookings(
                    targetRoom._id,
                    checkIn,
                    checkOut,
                    null,
                    session
                );

                const occupiedSlots = overlapping.reduce((sum, item) => sum + (item.allocatedSlots || 0), 0);
                const availableSlots = targetRoom.capacity - occupiedSlots;

                if (requestedSlots > availableSlots) {
                    throw new Error(`Overbooking prevented. Only ${availableSlots} slot(s) available in target room`);
                }

                const previousRoomId = booking.room;

                updated = await updateBookingById(
                    bookingId,
                    {
                        room: targetRoom._id,
                        branch: targetRoom.branch,
                        previousRoom: previousRoomId,
                        reassignedAt: new Date(),
                        checkInDate: checkIn,
                        checkOutDate: checkOut,
                        allocatedSlots: requestedSlots,
                        status: "confirmed",
                        notes: payload.notes ?? booking.notes,
                        updatedBy: user.userId,
                    },
                    session
                );

                await bookingStatusService.refreshRoomOperationalStatus(previousRoomId, session);
                await bookingStatusService.refreshRoomOperationalStatus(targetRoom._id, session);
            });

            return updated;
        } finally {
            await session.endSession();
        }
    }
}

export default new ReassignBookingService();
