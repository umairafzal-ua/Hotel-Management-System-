import AddOnSelection from "../models/AddOnSelection.js";

export const upsertAddOnSelectionByBookingId = async (bookingId, data) => {
    return await AddOnSelection.findOneAndUpdate(
        { bookingId },
        { $set: { ...data, bookingId } },
        { new: true, upsert: true, runValidators: true }
    );
};

export const getAddOnSelectionByBookingId = async (bookingId) => {
    return await AddOnSelection.findOne({ bookingId });
};

