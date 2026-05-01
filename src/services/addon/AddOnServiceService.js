import * as repo from "../../repositories/AddOnRepository.js";

class AddOnServiceService {
    async create(payload, user) {
        return await repo.createAddOnService({
            ...payload,
            createdBy: user.userId,
            updatedBy: null,
        });
    }

    async list(query) {
        const branchId = query.branchId || null;
        const active = query.active === undefined ? null : String(query.active).toLowerCase() === "true";
        return await repo.listAddOnServices({ branchId, active });
    }

    async update(id, payload, user) {
        return await repo.updateAddOnServiceById(id, { ...payload, updatedBy: user.userId });
    }

    async toggle(id, user) {
        const addOn = await repo.getAddOnServiceById(id);
        if (!addOn) throw new Error("Add-on not found");
        return await repo.updateAddOnServiceById(id, { isActive: !addOn.isActive, updatedBy: user.userId });
    }
}

export default new AddOnServiceService();

