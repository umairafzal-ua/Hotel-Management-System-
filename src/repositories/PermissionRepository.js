import Permission from "../models/Permission.js";

export const createPermission = async (permissionData) => {
    return await Permission.createPermission(permissionData);
};

export const createPermissionsBulk = async (permissionsData) => {
    return await Permission.insertMany(permissionsData);
};

export const getAllActivePermissions = async (skip = 0, per_page = 10) => {
    if (skip === undefined && per_page === undefined) {
        // Called without pagination parameters - return all
        return await Permission.findAllActive();
    }
    return await Permission.find({ isActive: true })
        .skip(skip)
        .limit(per_page)
        .populate("module", "_id name");
};

export const countActivePermissions = async () => {
    return await Permission.countDocuments({ isActive: true });
};

export const getPermissionById = async (id) => {
    return await Permission.findByIdActive(id);
};

export const getPermissionByCode = async (code) => {
    return await Permission.findByCode(code);
};

export const getPermissionsByModule = async (moduleId, skip = 0, per_page = 10) => {
    if (skip === undefined && per_page === undefined) {
        // Called without pagination parameters - return all
        return await Permission.findByModule(moduleId);
    }
    return await Permission.find({ module: moduleId, isActive: true })
        .skip(skip)
        .limit(per_page)
        .populate("module", "_id name");
};

export const countPermissionsByModule = async (moduleId) => {
    return await Permission.countDocuments({ module: moduleId, isActive: true });
};

export const updatePermission = async (id, updateData) => {
    return await Permission.updatePermissionById(id, updateData);
};

export const softDeletePermission = async (id) => {
    return await Permission.softDeletePermission(id);
};

export const hardDeletePermission = async (id) => {
    return await Permission.hardDeletePermission(id);
};

export const togglePermissionActive = async (id) => {
    const permission = await Permission.findByIdActive(id);
    if (!permission) {
        throw new Error("Permission not found");
    }
    return await permission.toggleActive();
};

export const deletePermissionsByModule = async (moduleId) => {
    return await Permission.deleteMany({ module: moduleId });
};
