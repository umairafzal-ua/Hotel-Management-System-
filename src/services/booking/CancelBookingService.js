import mongoose from "mongoose";
import { getBookingByIdRaw, updateBookingById } from "../../repositories/BookingRepository.js";
import bookingStatusService from "./BookingStatusService.js";

class CancelBookingService {
    async execute(bookingId, reason, user) {
        const session = await mongoose.startSession();

        try {
            let updated;
            await session.withTransaction(async () => {
                const booking = await getBookingByIdRaw(bookingId, session);

                if (!booking) {
                    throw new Error("Booking not found");
                }

                if (booking.status !== "confirmed") {
                    throw new Error("Only confirmed bookings can be cancelled");
                }

                const isAdmin = String(user?.roleSlug || user?.role || "").toLowerCase() === "admin";
                if (!isAdmin && user?.branchId && String(booking.branch) !== String(user.branchId)) {
                    throw new Error("Branch access denied");
                }

                updated = await updateBookingById(
                    bookingId,
                    {
                        status: "cancelled",
                        cancelledAt: new Date(),
                        cancellationReason: reason || undefined,
                        updatedBy: user.userId,
                    },
                    session
                );

                await bookingStatusService.refreshRoomOperationalStatus(booking.room, session);
            });

            return updated;
        } finally {
            await session.endSession();
        }
    }
}

export default new CancelBookingService();
