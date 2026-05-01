import * as branchRepository from "../../repositories/BranchRepository.js";
import * as employeeRepository from "../../repositories/EmployeeRepository.js";

class DeleteBranchService {
    async execute(id) {
        const branch = await branchRepository.getBranchByIdIncludingInactive(id);
        if (!branch) {
            throw new Error("Branch not found");
        }

        const activeEmployees = await employeeRepository.countActiveEmployeesByBranch(id);
        if (activeEmployees > 0) {
            throw new Error("Cannot delete branch with active employees assigned");
        }

        return await branchRepository.hardDeleteBranch(id);
    }
}

export default new DeleteBranchService();
