import * as moduleRepository from "../../repositories/ModuleRepository.js";

class GetModulesService {
    async execute(page = 1, per_page = 10) {
        const skip = (page - 1) * per_page;
        const total_items = await moduleRepository.countActiveModules();
        const data = await moduleRepository.getAllActiveModules(skip, per_page);

        return {
            page,
            per_page,
            total_items,
            total_pages: Math.ceil(total_items / per_page),
            data,
        };
    }
}

export default new GetModulesService();
