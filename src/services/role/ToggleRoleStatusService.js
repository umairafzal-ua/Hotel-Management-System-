import * as roleRepository from "../../repositories/RoleRepository.js";

class ToggleRoleStatusService {
    async execute(id) {
        try {
            const role = await roleRepository.getRoleById(id);
            if (!role) {
                throw new Error("Role not found");
            }

            return await roleRepository.toggleRoleActive(id);
        } catch (error) {
            throw error;
        }
    }
}

export default new ToggleRoleStatusService();
