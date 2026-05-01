import * as roleRepository from "../../repositories/RoleRepository.js";

class GetRoleByIdService {
    async execute(id) {
        try {
            const role = await roleRepository.getRoleById(id);
            if (!role) {
                throw new Error("Role not found");
            }
            return role;
        } catch (error) {
            throw error;
        }
    }
}

export default new GetRoleByIdService();
