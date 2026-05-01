import * as employeeRepository from "../../repositories/EmployeeRepository.js";
import * as branchRepository from "../../repositories/BranchRepository.js";
import { userRepository } from "../../repositories/UserRepository.js";

class AssignEmployeeService {
    async execute(data) {
        const queries = [
            userRepository.findById(data.userId),
            branchRepository.getBranchByIdIncludingInactive(data.branchId),
            employeeRepository.getEmployeeByUserId(data.userId),
        ];
        
        if (data.roleId) {
            const Role = (await import("../../models/Role.js")).default;
            queries.push(Role.findByIdActive(data.roleId));
        }

        const results = await Promise.all(queries);
        const [user, branch, existingEmployee, role] = results;

        if (!user) {
            throw new Error("User not found");
        }

        if (!branch) {
            throw new Error("Branch not found");
        }

        if (!branch.isActive) {
            throw new Error("Branch is inactive");
        }

        if (existingEmployee) {
            throw new Error("Employee already assigned to a branch");
        }

        if (data.roleId) {
            if (!role) {
                throw new Error("Role not found");
            }
            await userRepository.updateById(data.userId, { role: data.roleId });
        }

        return await employeeRepository.assignEmployee({
            user: data.userId,
            branch: data.branchId,
            position: data.position || "",
            department: data.department || "",
            shift: data.shift || "",
            isActive: data.isActive ?? true,
            loginAllowed: data.loginAllowed ?? true,
        });
    }
}

export default new AssignEmployeeService();
