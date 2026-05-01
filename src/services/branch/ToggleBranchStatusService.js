import * as branchRepository from "../../repositories/BranchRepository.js";

class ToggleBranchStatusService {
    async execute(id) {
        const branch = await branchRepository.getBranchByIdIncludingInactive(id);
        if (!branch) {
            throw new Error("Branch not found");
        }
        return await branchRepository.toggleBranchActive(id);
    }
}

export default new ToggleBranchStatusService();
