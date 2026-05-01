import { sendResponse, sendError, sendCreated, sendPaginated } from "../utils/apiResponse.js";
import createModuleService from "../services/module/CreateModuleService.js";
import getModulesService from "../services/module/GetModulesService.js";
import getModuleByIdService from "../services/module/GetModuleByIdService.js";
import updateModuleService from "../services/module/UpdateModuleService.js";
import deleteModuleService from "../services/module/DeleteModuleService.js";
import toggleModuleStatusService from "../services/module/ToggleModuleStatusService.js";

const parsePositiveInteger = (value, fallback) => {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

/**Create a new module*/
export const createModule = async (req, res) => {
    try {
        const { name, description } = req.validatedBody;
        const module = await createModuleService.execute({
            name,
            description,
        });
        return sendCreated(res, module, "Module created successfully");
    } catch (error) {
        console.error("[createModule Error]:", error.message || error);
        return sendError(
            res,
            error.statusCode || 400,
            error.message || "Error creating module",
            error.errors || []
        );
    }
};

/**Get all active modules with pagination*/
export const getAllModules = async (req, res) => {
    try {
        const page = parsePositiveInteger(req.query.page, 1);
        const per_page = parsePositiveInteger(req.query.per_page ?? req.query.limit, 10);
        if (page < 1 || per_page < 1) {
            return sendError(res, 400, "Page and per_page must be greater than 0");
        }
        const result = await getModulesService.execute(page, per_page);
        return sendPaginated(res, result.data, result, "Modules fetched successfully");
    } catch (error) {
        console.error("[getAllModules Error]:", error);
        return sendError(res, 500, error.message || "Error fetching modules");
    }
};

/**Get module by ID*/
export const getModuleById = async (req, res) => {
    try {
        const { id } = req.params;
        const module = await getModuleByIdService.execute(id);
        return sendResponse(res, 200, module, "Module retrieved successfully");
    } catch (error) {
        return sendError(res, 500, "Error fetching module");
    }
};

/**Update module*/
export const updateModule = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.validatedBody;
        const updatedModule = await updateModuleService.execute(id, {
            name,
            description,
        });

        return sendResponse(res, 200, updatedModule, "Module updated successfully");
    } catch (error) {
        console.error("[updateModule Error]:", error.message || error);
        return sendError(
            res,
            error.statusCode || 500,
            error.message || "Error updating module",
            error.errors || []
        );
    }
};

/**Soft delete module (deactivate)*/
export const deleteModule = async (req, res) => {
    try {
        const { id } = req.params;
        await deleteModuleService.execute(id);
        return sendResponse(res, 200, null, "Module deleted successfully");
    } catch (error) {
        return sendError(res, error.message.includes("not found") ? 404 : 500, error.message || "Failed to delete module");
    }
};

/**Toggle module active status*/
export const toggleModuleStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedModule = await toggleModuleStatusService.execute(id);
        return sendResponse(res, 200, updatedModule, "Module status toggled successfully");
    } catch (error) {
        return sendError(res, 500, "Error toggling module status");
    }
};
