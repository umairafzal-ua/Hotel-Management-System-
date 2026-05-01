import mongoose from "mongoose";
import Room from "../../models/Room.js";
import {
    getBookingByIdRaw,
    getOverlappingConfirmedBookings,
    updateBookingById,
} from "../../repositories/BookingRepository.js";
import {
    calculateRequestedSlots,
    derivePartyType,
    parseDateRange,
    validateGenderRestriction,
    validateOperationalStatus,
    validateSharedPolicy,
} from "./BookingRules.js";
import bookingStatusService from "./BookingStatusService.js";

class UpdateBookingService {
    async execute(bookingId, payload, user) {
        const session = await mongoose.startSession();

        try {
            let updated;
            await session.withTransaction(async () => {
                const booking = await getBookingByIdRaw(bookingId, session);
                if (!booking) {
                    throw new Error("Booking not found");
                }

                if (booking.status === "cancelled" || booking.status === "completed") {
                    throw new Error("Cannot update a cancelled or completed booking");
                }

                const isAdmin = String(user?.roleSlug || user?.role || "").toLowerCase() === "admin";
                if (!isAdmin && user?.branchId && String(booking.branch) !== String(user.branchId)) {
                    throw new Error("Branch access denied");
                }

                const room = await Room.findById(booking.room).session(session);
                if (!room) {
                    throw new Error("Room not found");
                }

                // Build update payload
                const updateData = { updatedBy: user.userId };

                // Handle date changes
                const checkInInput = payload.checkInDate
                    ? new Date(payload.checkInDate)
                    : booking.checkInDate;
                const checkOutInput = payload.checkOutDate
                    ? new Date(payload.checkOutDate)
                    : booking.checkOutDate;

                if (payload.checkInDate || payload.checkOutDate) {
                    const { checkIn, checkOut } = parseDateRange(checkInInput, checkOutInput);
                    updateData.checkInDate = checkIn;
                    updateData.checkOutDate = checkOut;
                }

                // Handle guest/party changes
                const guestCount = payload.guestCount
                    ? Number(payload.guestCount)
                    : booking.guestCount;
                const partyType = payload.partyType
                    ? derivePartyType(guestCount, payload.partyType)
                    : booking.partyType;
                const gender = payload.gender || booking.gender || "mixed";

                if (payload.guestCount || payload.partyType) {
                    updateData.guestCount = guestCount;
                    updateData.partyType = partyType;
                }
                if (payload.gender) {
                    updateData.gender = gender;
                }

                // Re-validate room constraints if dates or guests changed
                const needsRevalidation = payload.checkInDate || payload.checkOutDate || payload.guestCount || payload.partyType || payload.gender;
                if (needsRevalidation) {
                    validateOperationalStatus(room);
                    validateGenderRestriction(room, partyType, gender);
                    validateSharedPolicy(room, partyType);

                    const { checkIn, checkOut } = parseDateRange(checkInInput, checkOutInput);
                    const requestedSlots = calculateRequestedSlots(room, partyType, guestCount);

                    const overlapping = await getOverlappingConfirmedBookings(
                        room._id,
                        checkIn,
                        checkOut,
                        booking._id,
                        session
                    );

                    const occupiedSlots = overlapping.reduce((sum, item) => sum + (item.allocatedSlots || 0), 0);
                    const availableSlots = room.capacity - occupiedSlots;

                    if (requestedSlots > availableSlots) {
                        throw new Error(
                            `Overbooking prevented. Only ${availableSlots} slot(s) available for the selected dates`
                        );
                    }

                    updateData.allocatedSlots = requestedSlots;
                }

                // Handle customer info
                if (payload.customer) {
                    updateData.customer = {
                        name: payload.customer.name || booking.customer?.name,
                        email: payload.customer.email ?? booking.customer?.email,
                        phone: payload.customer.phone ?? booking.customer?.phone,
                    };
                }

                // Handle notes
                if (payload.notes !== undefined) {
                    updateData.notes = payload.notes;
                }

                updated = await updateBookingById(bookingId, updateData, session);

                // Refresh room status if dates or capacity changed
                if (needsRevalidation) {
                    await bookingStatusService.refreshRoomOperationalStatus(room._id, session);
                }
            });

            return updated;
        } finally {
            await session.endSession();
        }
    }
}

export default new UpdateBookingService();