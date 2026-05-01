import * as repo from "../../repositories/MealSelectionRepository.js";
import Booking from "../../models/Booking.js";

class MealSelectionService {
    async upsertForBooking(bookingId, payload, user) {
        const booking = await Booking.findById(bookingId);
        if (!booking) throw new Error("Booking not found");

        return await repo.upsertMealSelectionByBookingId(bookingId, {
            ...payload,
            createdBy: user.userId,
            updatedBy: user.userId,
        });
    }
}

export default new MealSelectionService();

