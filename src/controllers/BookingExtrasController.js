import { sendError, sendSuccess } from "../utils/apiResponse.js";
import mealSelectionService from "../services/meal/MealSelectionService.js";
import addOnSelectionService from "../services/addon/AddOnSelectionService.js";

export const upsertBookingMealSelection = async (req, res) => {
    try {
        const updated = await mealSelectionService.upsertForBooking(req.params.id, req.validatedBody, req.user);
        return sendSuccess(res, updated, "Meal selection saved successfully");
    } catch (error) {
        return sendError(res, error.statusCode || 400, error.message || "Error saving meal selection", error.errors || []);
    }
};

export const upsertBookingAddOns = async (req, res) => {
    try {
        const updated = await addOnSelectionService.upsertForBooking(req.params.id, req.validatedBody, req.user);
        return sendSuccess(res, updated, "Add-ons saved successfully");
    } catch (error) {
        return sendError(res, error.statusCode || 400, error.message || "Error saving add-ons", error.errors || []);
    }
};

