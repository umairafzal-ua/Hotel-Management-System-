import * as branchRepository from "../../repositories/BranchRepository.js";

class GetBranchesService {
    async execute(page = 1, per_page = 10, scopedBranchId = null, activeOnly = false) {
        if (scopedBranchId) {
            const branch = await branchRepository.getBranchById(scopedBranchId);
            return {
                page: 1,
                per_page: 1,
                total_items: branch ? 1 : 0,
                total_pages: 1,
                data: branch ? [branch] : [],
            };
        }

        const skip = (page - 1) * per_page;
        const total_items = activeOnly
            ? await branchRepository.countActiveBranches()
            : await branchRepository.countBranches();
        const data = activeOnly
            ? await branchRepository.getAllActiveBranches(skip, per_page)
            : await branchRepository.getAllBranches(skip, per_page);

        return {
            page,
            per_page,
            total_items,
            total_pages: Math.ceil(total_items / per_page),
            data,
        };
    }
}

export default new GetBranchesService();
