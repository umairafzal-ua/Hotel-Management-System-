import * as branchRepository from "../../repositories/BranchRepository.js";

class UpdateBranchService {
    async execute(id, updateData) {
        const branch = await branchRepository.getBranchByIdIncludingInactive(id);
        if (!branch) {
            throw new Error("Branch not found");
        }

        return await branchRepository.updateBranch(id, updateData);
    }
}

export default new UpdateBranchService();
