import * as moduleRepository from "../../repositories/ModuleRepository.js";

class ToggleModuleStatusService {
    async execute(id) {
        const module = await moduleRepository.getModuleById(id);
        if (!module) {
            throw new Error("Module not found");
        }

        return await moduleRepository.toggleModuleActive(id);
    }
}

export default new ToggleModuleStatusService();
