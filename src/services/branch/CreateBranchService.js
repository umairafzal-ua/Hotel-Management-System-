import * as branchRepository from "../../repositories/BranchRepository.js";

class CreateBranchService {
    async execute(branchData) {
        const existing = await branchRepository.getAllBranches(undefined, undefined);
        const nameExists = existing.some(
            (b) => b.name.toLowerCase() === branchData.name.toLowerCase()
        );
        if (nameExists) {
            throw new Error("Branch name already exists");
        }

        return await branchRepository.createBranch({
            name: branchData.name,
            location: branchData.location,
            distanceFromHaram: branchData.distanceFromHaram,
            isActive: branchData.isActive,
        });
    }
}

export default new CreateBranchService();
