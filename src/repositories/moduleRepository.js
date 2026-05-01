import Module from "../models/Module.js";

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const createModule = async (moduleData) => {
    return await Module.createModule(moduleData);
};

export const getAllActiveModules = async (skip = 0, per_page = 10) => {
    if (skip === undefined && per_page === undefined) {
        // Called without pagination parameters - return all
        return await Module.findAllActive();
    }
    return await Module.find({ isActive: true })
        .skip(skip)
        .limit(per_page);
};

export const getModuleByName = async (name) => {
    const normalizedName = name.trim();
    return await Module.findOne({
        name: new RegExp(`^${escapeRegex(normalizedName)}$`, "i"),
    });
};

export const getModuleByCode = async (code) => {
    if (!code) return null;
    const normalized = code.trim().toUpperCase();
    return await Module.findOne({
        code: new RegExp(`^${escapeRegex(normalized)}$`, "i"),
    });
};

export const countActiveModules = async () => {
    return await Module.countDocuments({ isActive: true });
};

export const getModuleById = async (id) => {
    return await Module.findByIdActive(id);
};

export const getModuleByIdIncludingInactive = async (id) => {
    return await Module.findById(id);
};

export const updateModule = async (id, updateData) => {
    return await Module.updateModuleById(id, updateData);
};

export const softDeleteModule = async (id) => {
    return await Module.softDeleteModule(id);
};

export const hardDeleteModule = async (id) => {
    return await Module.hardDeleteModule(id);
};

export const toggleModuleActive = async (id) => {
    const module = await Module.findByIdActive(id);
    if (!module) {
        throw new Error("Module not found");
    }
    return await module.toggleActive();
};
