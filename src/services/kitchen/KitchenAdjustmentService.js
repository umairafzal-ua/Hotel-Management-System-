import * as repo from "../../repositories/KitchenAdjustmentRepository.js";

class KitchenAdjustmentService {
    async create(payload, user) {
        return await repo.createAdjustment({
            ...payload,
            createdBy: user.userId,
        });
    }

    async list(query) {
        return await repo.listAdjustments({
            branchId: query.branchId,
            date: query.date,
        });
    }
}

export default new KitchenAdjustmentService();

