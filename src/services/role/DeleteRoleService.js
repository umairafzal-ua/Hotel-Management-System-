import * as roleRepository from "../../repositories/RoleRepository.js";

class DeleteRoleService {
    async execute(id) {
        try {
            // Check if role exists (including inactive)
            const role = await roleRepository.getRoleByIdIncludingInactive(id);
            if (!role) {
                throw new Error("Role not found");
            }

            return await roleRepository.hardDeleteRole(id);
        } catch (error) {
            throw error;
        }
    }
}

export default new DeleteRoleService();
