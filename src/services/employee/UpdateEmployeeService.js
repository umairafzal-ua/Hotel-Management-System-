import * as employeeRepository from "../../repositories/EmployeeRepository.js";
import * as branchRepository from "../../repositories/BranchRepository.js";

class UpdateEmployeeService {
    async execute(id, updateData) {
        const employee = await employeeRepository.getEmployeeById(id);
        if (!employee) {
            throw new Error("Employee not found");
        }

        if (updateData.branchId) {
            const branch = await branchRepository.getBranchByIdIncludingInactive(updateData.branchId);
            if (!branch) {
                throw new Error("Branch not found");
            }
            if (!branch.isActive) {
                throw new Error("Branch is inactive");
            }
        }

        const userUpdate = {};

        if (updateData.roleId) {
            const Role = (await import("../../models/Role.js")).default;
            const role = await Role.findByIdActive(updateData.roleId);
            if (!role) {
                throw new Error("Role not found");
            }
            userUpdate.role = updateData.roleId;
        }

        if (updateData.fullName !== undefined) userUpdate.fullName = updateData.fullName;
        if (updateData.email !== undefined) userUpdate.email = updateData.email;
        if (updateData.phoneNumber !== undefined) userUpdate.phoneNumber = updateData.phoneNumber;

        if (Object.keys(userUpdate).length > 0) {
            const { userRepository } = await import("../../repositories/UserRepository.js");
            await userRepository.updateById(employee.user._id, userUpdate);
        }

        const updated = await employeeRepository.updateEmployee(id, {
            ...(updateData.branchId ? { branch: updateData.branchId } : {}),
            ...(updateData.position !== undefined ? { position: updateData.position } : {}),
            ...(updateData.department !== undefined ? { department: updateData.department } : {}),
            ...(updateData.shift !== undefined ? { shift: updateData.shift } : {}),
            ...(updateData.isActive !== undefined ? { isActive: updateData.isActive } : {}),
            ...(updateData.loginAllowed !== undefined ? { loginAllowed: updateData.loginAllowed } : {}),
        });

        if (!updated) {
            throw new Error("Employee not found");
        }

        return updated;
    }
}

export default new UpdateEmployeeService();
