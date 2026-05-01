import MealSelection from "../models/MealSelection.js";

export const upsertMealSelectionByBookingId = async (bookingId, data) => {
    return await MealSelection.findOneAndUpdate(
        { bookingId },
        { $set: { ...data, bookingId } },
        { new: true, upsert: true, runValidators: true }
    );
};

export const getMealSelectionByBookingId = async (bookingId) => {
    return await MealSelection.findOne({ bookingId });
};

export const getMealSelectionsForBookingIds = async (bookingIds) => {
    return await MealSelection.find({ bookingId: { $in: bookingIds } });
};

