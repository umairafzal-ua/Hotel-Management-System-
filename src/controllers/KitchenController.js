import { sendError, sendSuccess, sendCreated } from "../utils/apiResponse.js";
import kitchenPrepQueryService from "../services/kitchen/KitchenPrepQueryService.js";
import kitchenAdjustmentService from "../services/kitchen/KitchenAdjustmentService.js";

export const getKitchenPrep = async (req, res) => {
    try {
        const result = await kitchenPrepQueryService.getPrep(req.validatedQuery || req.query);
        return sendSuccess(res, result, "Kitchen prep fetched successfully");
    } catch (error) {
        return sendError(res, error.statusCode || 400, error.message || "Error fetching kitchen prep", error.errors || []);
    }
};

export const createKitchenAdjustment = async (req, res) => {
    try {
        const created = await kitchenAdjustmentService.create(req.validatedBody, req.user);
        return sendCreated(res, created, "Kitchen adjustment created successfully");
    } catch (error) {
        return sendError(res, error.statusCode || 400, error.message || "Error creating adjustment", error.errors || []);
    }
};

export const listKitchenAdjustments = async (req, res) => {
    try {
        const list = await kitchenAdjustmentService.list(req.query);
        return sendSuccess(res, list, "Kitchen adjustments fetched successfully");
    } catch (error) {
        return sendError(res, 500, error.message || "Error fetching adjustments");
    }
};

