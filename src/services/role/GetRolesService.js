import * as roleRepository from "../../repositories/RoleRepository.js";

class GetRolesService {
    async execute(page = 1, per_page = 10) {
        try {
            const skip = (page - 1) * per_page;
            // Parallel execution - fetch count and data simultaneously
            const [total_items, data] = await Promise.all([
                roleRepository.countActiveRoles(),
                roleRepository.getAllActiveRoles(skip, per_page)
            ]);
            
            return {
                page,
                per_page,
                total_items,
                total_pages: Math.ceil(total_items / per_page),
                data
            };
        } catch (error) {
            throw error;
        }
    }
}

export default new GetRolesService();
