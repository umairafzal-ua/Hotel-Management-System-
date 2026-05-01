import * as moduleRepository from "../../repositories/ModuleRepository.js";
import * as permissionRepository from "../../repositories/PermissionRepository.js";

class DeleteModuleService {
    async execute(id) {
        const module = await moduleRepository.getModuleByIdIncludingInactive(id);
        if (!module) {
            throw new Error("Module not found");
        }

        await permissionRepository.deletePermissionsByModule(id);
        return await moduleRepository.hardDeleteModule(id);
    }
}

export default new DeleteModuleService();
