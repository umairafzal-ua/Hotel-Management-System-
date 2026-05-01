import { sendCreated, sendError, sendSuccess } from "../utils/apiResponse.js";
import mealPlanService from "../services/meal/MealPlanService.js";

export const createMealPlan = async (req, res) => {
    try {
        const plan = await mealPlanService.create(req.validatedBody, req.user);
        return sendCreated(res, plan, "Meal plan created successfully");
    } catch (error) {
        return sendError(res, error.statusCode || 400, error.message || "Error creating meal plan", error.errors || []);
    }
};

export const listMealPlans = async (req, res) => {
    try {
        const plans = await mealPlanService.list(req.query);
        return sendSuccess(res, plans, "Meal plans fetched successfully");
    } catch (error) {
        return sendError(res, 500, error.message || "Error fetching meal plans");
    }
};

export const updateMealPlan = async (req, res) => {
    try {
        const updated = await mealPlanService.update(req.params.id, req.validatedBody, req.user);
        return sendSuccess(res, updated, "Meal plan updated successfully");
    } catch (error) {
        return sendError(res, error.statusCode || 400, error.message || "Error updating meal plan", error.errors || []);
    }
};

export const toggleMealPlan = async (req, res) => {
    try {
        const updated = await mealPlanService.toggle(req.params.id, req.user);
        return sendSuccess(res, updated, "Meal plan toggled successfully");
    } catch (error) {
        return sendError(res, error.statusCode || 400, error.message || "Error toggling meal plan", error.errors || []);
    }
};

