import Branch from "../models/Branch.js";

export const createBranch = async (branchData) => {
    return await Branch.createBranch(branchData);
};

export const getAllBranches = async (skip = 0, per_page = 10) => {
    if (skip === undefined && per_page === undefined) {
        return await Branch.find({}).sort({ name: 1 });
    }
    return await Branch.find({})
        .sort({ name: 1 })
        .skip(skip)
        .limit(per_page);
};

export const getAllActiveBranches = async (skip = 0, per_page = 10) => {
    if (skip === undefined && per_page === undefined) {
        return await Branch.findAllActive();
    }
    return await Branch.find({ isActive: true })
        .sort({ name: 1 })
        .skip(skip)
        .limit(per_page);
};

export const countActiveBranches = async () => {
    return await Branch.countDocuments({ isActive: true });
};

export const countBranches = async () => {
    return await Branch.countDocuments({});
};

export const getBranchById = async (id) => {
    return await Branch.findByIdActive(id);
};

export const getBranchByIdIncludingInactive = async (id) => {
    return await Branch.findById(id);
};

export const updateBranch = async (id, updateData) => {
    return await Branch.updateBranchById(id, updateData);
};

export const softDeleteBranch = async (id) => {
    return await Branch.softDeleteBranch(id);
};

export const hardDeleteBranch = async (id) => {
    return await Branch.hardDeleteBranch(id);
};

export const toggleBranchActive = async (id) => {
    const branch = await Branch.findById(id);
    if (!branch) {
        throw new Error("Branch not found");
    }
    return await branch.toggleActive();
};
