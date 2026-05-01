import * as repo from "../../repositories/MealPlanRepository.js";

class MealPlanService {
    async create(payload, user) {
        return await repo.createMealPlan({
            ...payload,
            createdBy: user.userId,
            updatedBy: null,
        });
    }

    async list(query) {
        const branchId = query.branchId || null;
        const active = query.active === undefined ? null : String(query.active).toLowerCase() === "true";
        return await repo.listMealPlans({ branchId, active });
    }

    async update(id, payload, user) {
        return await repo.updateMealPlanById(id, { ...payload, updatedBy: user.userId });
    }

    async toggle(id, user) {
        const plan = await repo.getMealPlanById(id);
        if (!plan) throw new Error("Meal plan not found");
        return await repo.updateMealPlanById(id, { isActive: !plan.isActive, updatedBy: user.userId });
    }
}

export default new MealPlanService();

