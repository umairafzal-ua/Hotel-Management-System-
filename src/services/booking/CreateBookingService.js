import mongoose from "mongoose";
import Room from "../../models/Room.js";
import { userRepository } from "../../repositories/UserRepository.js";
import {
    createBooking,
    getOverlappingConfirmedBookings,
} from "../../repositories/BookingRepository.js";
import {
    calculateRequestedSlots,
    derivePartyType,
    parseDateRange,
    validateGenderRestriction,
    validateOperationalStatus,
    validateParty,
    validateSharedPolicy,
} from "./BookingRules.js";
import bookingStatusService from "./BookingStatusService.js";

class CreateBookingService {
    async execute(payload, user) {
        const session = await mongoose.startSession();

        try {
            let created;
            await session.withTransaction(async () => {
                const profile = await userRepository.findById(user.userId);
                if (!profile) {
                    throw new Error("User not found");
                }

                const room = await Room.findById(payload.roomId).session(session);
                if (!room) {
                    throw new Error("Room not found");
                }

                const isAdmin = String(user?.roleSlug || user?.role || "").toLowerCase() === "admin";
                if (!isAdmin && user?.branchId && String(room.branch) !== String(user.branchId)) {
                    throw new Error("Branch access denied");
                }

                validateOperationalStatus(room);
                const guestCount = Number(payload.guestCount || 1);
                const partyType = derivePartyType(guestCount, payload.partyType);
                const gender = payload.gender || "mixed";
                const customer = {
                    name: payload.customer?.name || profile.fullName,
                    email: payload.customer?.email || profile.email,
                    phone: payload.customer?.phone || profile.phoneNumber,
                };

                validateParty(partyType, guestCount);
                validateGenderRestriction(room, partyType, gender);
                validateSharedPolicy(room, partyType);

                const { checkIn, checkOut } = parseDateRange(payload.checkInDate, payload.checkOutDate);
                const requestedSlots = calculateRequestedSlots(room, partyType, guestCount);

                const overlapping = await getOverlappingConfirmedBookings(
                    room._id,
                    checkIn,
                    checkOut,
                    null,
                    session
                );

                const occupiedSlots = overlapping.reduce((sum, booking) => sum + (booking.allocatedSlots || 0), 0);
                const availableSlots = room.capacity - occupiedSlots;

                if (requestedSlots > availableSlots) {
                    throw new Error(`Overbooking prevented. Only ${availableSlots} slot(s) available for the selected dates`);
                }

                created = await createBooking(
                    {
                        branch: room.branch,
                        room: room._id,
                        customer,
                        partyType,
                        guestCount,
                        gender,
                        checkInDate: checkIn,
                        checkOutDate: checkOut,
                        allocatedSlots: requestedSlots,
                        status: "confirmed",
                        notes: payload.notes,
                        createdBy: user.userId,
                        updatedBy: user.userId,
                    },
                    session
                );

                await bookingStatusService.refreshRoomOperationalStatus(room._id, session);
            });

            return created;
        } finally {
            await session.endSession();
        }
    }
}

export default new CreateBookingService();
