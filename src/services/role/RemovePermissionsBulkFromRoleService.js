import * as roleRepository from "../../repositories/RoleRepository.js";

class RemovePermissionsBulkFromRoleService {
    async execute(roleId, permissionIds) {
        try {
            const role = await roleRepository.getRoleById(roleId);
            if (!role) {
                throw new Error("Role not found");
            }

            return await roleRepository.removePermissionsBulkFromRole(roleId, permissionIds);
        } catch (error) {
            throw error;
        }
    }
}

export default new RemovePermissionsBulkFromRoleService();
