import AddOnService from "../models/AddOnService.js";

export const createAddOnService = async (data) => {
    return await AddOnService.create(data);
};

export const listAddOnServices = async ({ branchId = null, active = null } = {}) => {
    const query = {};
    if (branchId) query.branchId = branchId;
    if (active === true) query.isActive = true;
    if (active === false) query.isActive = false;
    return await AddOnService.find(query).sort({ createdAt: -1 });
};

export const getAddOnServiceById = async (id) => {
    return await AddOnService.findById(id);
};

export const updateAddOnServiceById = async (id, updateData) => {
    return await AddOnService.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true });
};

