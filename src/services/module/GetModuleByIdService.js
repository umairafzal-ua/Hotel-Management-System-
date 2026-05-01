import * as moduleRepository from "../../repositories/ModuleRepository.js";

class GetModuleByIdService {
    async execute(id) {
        const module = await moduleRepository.getModuleById(id);
        if (!module) {
            throw new Error("Module not found");
        }
        return module;
    }
}

export default new GetModuleByIdService();
