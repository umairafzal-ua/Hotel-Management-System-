import * as roleRepository from "../../repositories/RoleRepository.js";
import * as permissionRepository from "../../repositories/PermissionRepository.js";

class AddPermissionToRoleService {
    async execute(roleId, permissionId) {
        try {
            const role = await roleRepository.getRoleById(roleId);
            if (!role) {
                throw new Error("Role not found");
            }

            const permission = await permissionRepository.getPermissionById(permissionId);
            if (!permission) {
                throw new Error("Permission not found");
            }

            return await roleRepository.addPermissionToRole(roleId, permissionId);
        } catch (error) {
            throw error;
        }
    }
}

export default new AddPermissionToRoleService();
