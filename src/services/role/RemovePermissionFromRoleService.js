import * as roleRepository from "../../repositories/RoleRepository.js";

class RemovePermissionFromRoleService {
    async execute(roleId, permissionId) {
        try {
            const role = await roleRepository.getRoleById(roleId);
            if (!role) {
                throw new Error("Role not found");
            }

            return await roleRepository.removePermissionFromRole(roleId, permissionId);
        } catch (error) {
            throw error;
        }
    }
}

export default new RemovePermissionFromRoleService();
