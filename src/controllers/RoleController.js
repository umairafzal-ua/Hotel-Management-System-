import { sendSuccess, sendCreated, sendError, sendPaginated } from "../utils/apiResponse.js";
import createRoleService from "../services/role/CreateRoleService.js";
import getRolesService from "../services/role/GetRolesService.js";
import getRoleByIdService from "../services/role/GetRoleByIdService.js";
import updateRoleService from "../services/role/UpdateRoleService.js";
import deleteRoleService from "../services/role/DeleteRoleService.js";
import toggleRoleStatusService from "../services/role/ToggleRoleStatusService.js";
import addPermissionToRoleService from "../services/role/AddPermissionToRoleService.js";
import addPermissionsBulkToRoleService from "../services/role/AddPermissionsBulkToRoleService.js";
import removePermissionFromRoleService from "../services/role/RemovePermissionFromRoleService.js";
import removePermissionsBulkFromRoleService from "../services/role/RemovePermissionsBulkFromRoleService.js";
import setPermissionsForRoleService from "../services/role/SetPermissionsForRoleService.js";
import { formatRoleResponse } from "../utils/roleFormatter.js";

export const createRole = async (req, res, next) => {
    try {
        const role = await createRoleService.execute(req.validatedBody);
        return sendCreated(res, formatRoleResponse(role), "Role created successfully");
    } catch (error) {
        next(error);
    }
};

export const getAllRoles = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const per_page = parseInt(req.query.per_page) || 10;

        if (page < 1 || per_page < 1) {
            return sendError(res, 400, "Page and per_page must be greater than 0");
        }

        const result = await getRolesService.execute(page, per_page);
        const formattedData = result.data.map(formatRoleResponse);
        return sendPaginated(res, formattedData, result, "Roles fetched successfully");
    } catch (error) {
        next(error);
    }
};

export const getRoleById = async (req, res, next) => {
    try {
        const role = await getRoleByIdService.execute(req.params.id);
        return sendSuccess(res, formatRoleResponse(role), "Role retrieved successfully");
    } catch (error) {
        next(error);
    }
};

export const updateRole = async (req, res, next) => {
    try {
        const { name, description, permissions } = req.validatedBody;
        const updatedRole = await updateRoleService.execute(req.params.id, { name, description, permissions });
        return sendSuccess(res, formatRoleResponse(updatedRole), "Role updated successfully");
    } catch (error) {
        next(error);
    }
};

export const deleteRole = async (req, res, next) => {
    try {
        await deleteRoleService.execute(req.params.id);
        return sendSuccess(res, null, "Role deleted successfully");
    } catch (error) {
        next(error);
    }
};

export const toggleRoleStatus = async (req, res, next) => {
    try {
        const updatedRole = await toggleRoleStatusService.execute(req.params.id);
        return sendSuccess(res, formatRoleResponse(updatedRole), "Role status toggled successfully");
    } catch (error) {
        next(error);
    }
};

export const addPermissionToRole = async (req, res, next) => {
    try {
        const { roleId, permissionId } = req.validatedBody;
        const updatedRole = await addPermissionToRoleService.execute(roleId, permissionId);
        return sendSuccess(res, formatRoleResponse(updatedRole), "Permission added to role successfully");
    } catch (error) {
        next(error);
    }
};

export const addPermissionsBulkToRole = async (req, res, next) => {
    try {
        const { roleId, permissionIds } = req.validatedBody;
        const updatedRole = await addPermissionsBulkToRoleService.execute(roleId, permissionIds);
        return sendSuccess(res, formatRoleResponse(updatedRole), `${permissionIds.length} permissions added to role successfully`);
    } catch (error) {
        next(error);
    }
};

export const removePermissionFromRole = async (req, res, next) => {
    try {
        const { roleId, permissionId } = req.validatedBody;
        const updatedRole = await removePermissionFromRoleService.execute(roleId, permissionId);
        return sendSuccess(res, formatRoleResponse(updatedRole), "Permission removed from role successfully");
    } catch (error) {
        next(error);
    }
};

export const removePermissionsBulkFromRole = async (req, res, next) => {
    try {
        const { roleId, permissionIds } = req.validatedBody;
        const updatedRole = await removePermissionsBulkFromRoleService.execute(roleId, permissionIds);
        return sendSuccess(res, formatRoleResponse(updatedRole), `${permissionIds.length} permissions removed from role successfully`);
    } catch (error) {
        next(error);
    }
};

export const setPermissionsForRole = async (req, res, next) => {
    try {
        const { roleId, permissionIds } = req.validatedBody;
        const updatedRole = await setPermissionsForRoleService.execute(roleId, permissionIds);
        return sendSuccess(res, formatRoleResponse(updatedRole), `Role permissions updated successfully (${permissionIds.length} permissions set)`);
    } catch (error) {
        next(error);
    }
};

