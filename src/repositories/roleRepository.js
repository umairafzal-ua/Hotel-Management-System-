import Role from "../models/Role.js";
import { normalizeRoleSlug } from "../utils/rbacIdentifiers.js";

export const createRole = async (roleData) => {
    return await Role.createRole(roleData);
};

export const getAllActiveRoles = async (skip = 0, per_page = 10) => {
    if (skip === undefined && per_page === undefined) {
        // Called without pagination parameters - return all
        return await Role.find({ isActive: true })
            .select("-createdAt -updatedAt")
            .populate({
                path: "permissions",
                select: "-createdAt -updatedAt",
                populate: { path: "module", select: "_id code" }
            })
            .lean();
    }
    return await Role.find({ isActive: true })
        .select("-createdAt -updatedAt")
        .skip(skip)
        .limit(per_page)
        .populate({
            path: "permissions",
            select: "-createdAt -updatedAt",
            populate: { path: "module", select: "_id code" }
        })
        .lean();
};

export const countActiveRoles = async () => {
    return await Role.countDocuments({ isActive: true });
};

export const getRoleById = async (id) => {
    return await Role.findByIdActive(id);
};

export const getRoleByIdIncludingInactive = async (id) => {
    return await Role.findById(id).populate({
        path: "permissions",
        populate: { path: "module", select: "_id code" }
    });
};

export const getRoleByName = async (name) => {
    return await Role.findByName(name);
};

export const getRoleBySlug = async (slug) => {
    const normalized = normalizeRoleSlug(slug);
    if (!normalized) return null;
    return await Role.findOne({ slug: normalized }).lean();
};

export const updateRole = async (id, updateData) => {
    return await Role.updateRoleById(id, updateData);
};

export const softDeleteRole = async (id) => {
    return await Role.softDeleteRole(id);
};

export const hardDeleteRole = async (id) => {
    return await Role.hardDeleteRole(id);
};

export const toggleRoleActive = async (id) => {
    const role = await Role.findByIdActive(id);
    if (!role) {
        throw new Error("Role not found");
    }
    return await role.toggleActive();
};

export const addPermissionToRole = async (roleId, permissionId) => {
    const role = await Role.findByIdActive(roleId);
    if (!role) {
        throw new Error("Role not found");
    }
    return await role.addPermission(permissionId);
};

export const addPermissionsBulkToRole = async (roleId, permissionIds) => {
    const role = await Role.findByIdActive(roleId);
    if (!role) {
        throw new Error("Role not found");
    }
    return await role.addPermissionsBulk(permissionIds);
};

export const removePermissionFromRole = async (roleId, permissionId) => {
    const role = await Role.findByIdActive(roleId);
    if (!role) {
        throw new Error("Role not found");
    }
    return await role.removePermission(permissionId);
};

export const removePermissionsBulkFromRole = async (roleId, permissionIds) => {
    const role = await Role.findByIdActive(roleId);
    if (!role) {
        throw new Error("Role not found");
    }
    return await role.removePermissionsBulk(permissionIds);
};

export const setPermissionsForRole = async (roleId, permissionIds) => {
    const role = await Role.findByIdActive(roleId);
    if (!role) {
        throw new Error("Role not found");
    }
    return await role.setPermissions(permissionIds);
};

export const roleHasPermission = async (roleId, permissionId) => {
    const role = await Role.findByIdActive(roleId);
    if (!role) {
        throw new Error("Role not found");
    }
    return await role.hasPermission(permissionId);
};
