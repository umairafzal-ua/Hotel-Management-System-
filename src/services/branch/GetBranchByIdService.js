import * as branchRepository from "../../repositories/BranchRepository.js";

class GetBranchByIdService {
    async execute(id) {
        const branch = await branchRepository.getBranchById(id);
        if (!branch) {
            throw new Error("Branch not found");
        }
        return branch;
    }
}

export default new GetBranchByIdService();
