import { sendCreated, sendError, sendSuccess } from "../utils/apiResponse.js";
import addOnServiceService from "../services/addon/AddOnServiceService.js";

export const createAddOn = async (req, res) => {
    try {
        const created = await addOnServiceService.create(req.validatedBody, req.user);
        return sendCreated(res, created, "Add-on created successfully");
    } catch (error) {
        return sendError(res, error.statusCode || 400, error.message || "Error creating add-on", error.errors || []);
    }
};

export const listAddOns = async (req, res) => {
    try {
        const list = await addOnServiceService.list(req.query);
        return sendSuccess(res, list, "Add-ons fetched successfully");
    } catch (error) {
        return sendError(res, 500, error.message || "Error fetching add-ons");
    }
};

export const updateAddOn = async (req, res) => {
    try {
        const updated = await addOnServiceService.update(req.params.id, req.validatedBody, req.user);
        return sendSuccess(res, updated, "Add-on updated successfully");
    } catch (error) {
        return sendError(res, error.statusCode || 400, error.message || "Error updating add-on", error.errors || []);
    }
};

export const toggleAddOn = async (req, res) => {
    try {
        const updated = await addOnServiceService.toggle(req.params.id, req.user);
        return sendSuccess(res, updated, "Add-on toggled successfully");
    } catch (error) {
        return sendError(res, error.statusCode || 400, error.message || "Error toggling add-on", error.errors || []);
    }
};

