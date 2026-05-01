import MealPlan from "../models/MealPlan.js";

export const createMealPlan = async (data) => {
    return await MealPlan.create(data);
};

export const listMealPlans = async ({ branchId = null, active = null } = {}) => {
    const query = {};
    if (branchId) query.branchId = branchId;
    if (active === true) query.isActive = true;
    if (active === false) query.isActive = false;
    return await MealPlan.find(query).sort({ createdAt: -1 });
};

export const getMealPlanById = async (id) => {
    return await MealPlan.findById(id);
};

export const updateMealPlanById = async (id, updateData) => {
    return await MealPlan.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true });
};

