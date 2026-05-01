import * as roleRepository from "../../repositories/RoleRepository.js";
import * as permissionRepository from "../../repositories/PermissionRepository.js";

class AddPermissionsBulkToRoleService {
    async execute(roleId, permissionIds) {
        try {
            const role = await roleRepository.getRoleById(roleId);
            if (!role) {
                throw new Error("Role not found");
            }

            // Verify all permissions exist
            for (const permissionId of permissionIds) {
                const permission = await permissionRepository.getPermissionById(permissionId);
                if (!permission) {
                    throw new Error(`Permission ${permissionId} not found`);
                }
            }

            return await roleRepository.addPermissionsBulkToRole(roleId, permissionIds);
        } catch (error) {
            throw error;
        }
    }
}

export default new AddPermissionsBulkToRoleService();
