import createPermissionsBulkService from "../services/permission/CreatePermissionsBulkService.js";
import getAllPermissionsService from "../services/permission/GetAllPermissionsService.js";
import getPermissionByIdService from "../services/permission/GetPermissionByIdService.js";
import updatePermissionService from "../services/permission/UpdatePermissionService.js";
import deletePermissionService from "../services/permission/DeletePermissionService.js";
import togglePermissionStatusService from "../services/permission/TogglePermissionStatusService.js";
import { sendCreated, sendError, sendPaginated, sendResponse } from "../utils/apiResponse.js";

/**Create multiple permissions in bulk*/
export const createPermissionsBulk = async (req, res) => {
    try {
        const { permissions } = req.validatedBody;
        if (!Array.isArray(permissions) || permissions.length === 0) {
            return sendError(res, 400, "Permissions must be a non-empty array");
        }
        const createdPermissions = await createPermissionsBulkService.execute(permissions);
        return sendCreated(res, createdPermissions, `${createdPermissions.length} permissions created successfully`);
    } catch (error) {
        return sendError(res, 400, error.message || "Error creating permissions");
    }
};

/*Get all active permissions with pagination*/
export const getAllPermissions = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const per_page = parseInt(req.query.per_page) || 10;
        const { module: moduleId } = req.query;
        if (page < 1 || per_page < 1) {
            return sendError(res, 400, "Page and per_page must be greater than 0");
        }
        const result = await getAllPermissionsService.execute(page, per_page);

        return sendPaginated(res, result.data, {
            page: result.page,
            per_page: result.per_page,
            total_items: result.total_items,
            total_pages: result.total_pages,
        }, "Permissions fetched successfully");
    } catch (error) {
        return sendError(res, 500, error.message || "Error fetching permissions");
    }
};

/*Get permission by ID*/
export const getPermissionById = async (req, res) => {
    try {
        const { id } = req.params;
        const permission = await getPermissionByIdService.execute(id);
        return sendResponse(res, 200, permission, "Permission retrieved successfully");
    } catch (error) {
        return sendError(
            res,
            error.message.includes("not found") ? 404 : 500,
            error.message || "Error fetching permission"
        );
    }
};

/*Update permission*/
export const updatePermission = async (req, res) => {
    try {
        const { id } = req.params;
        const { action, code, description } = req.validatedBody;
        const updatedPermission = await updatePermissionService.execute(id, {
            action,
            code,
            description,
        });

        return sendResponse(res, 200, updatedPermission, "Permission updated successfully");
    } catch (error) {
        return sendError(
            res,
            error.message.includes("not found") ? 404 : 400,
            error.message || "Error updating permission"
        );
    }
};

/*Delete permission (soft delete)*/
export const deletePermission = async (req, res) => {
    try {
        const { id } = req.params;
        await deletePermissionService.execute(id);
        return sendResponse(res, 200, null, "Permission deleted successfully");
    } catch (error) {
        return sendError(
            res,
            error.message.includes("not found") ? 404 : 500,
            error.message || "Error deleting permission"
        );
    }
};

/*Toggle permission active status*/
export const togglePermissionStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedPermission = await togglePermissionStatusService.execute(id);
        return sendResponse(res, 200, updatedPermission, "Permission status toggled successfully");
    } catch (error) {
        return sendError(
            res,
            error.message.includes("not found") ? 404 : 500,
            error.message || "Error toggling permission status"
        );
    }
};
