import * as moduleRepository from "../../repositories/ModuleRepository.js";
import { normalizeModuleCode } from "../../utils/rbacIdentifiers.js";

class UpdateModuleService {
    async execute(id, updateData) {
        const module = await moduleRepository.getModuleById(id);
        if (!module) {
            throw new Error("Module not found");
        }

        if (updateData.code !== undefined) {
            const code = normalizeModuleCode(updateData.code);
            if (!code) {
                const error = new Error("Invalid module code");
                error.statusCode = 400;
                throw error;
            }
            const duplicate = await moduleRepository.getModuleByCode(code);
            if (duplicate && String(duplicate._id) !== String(id)) {
                const error = new Error("Module code already exists");
                error.statusCode = 409;
                error.errors = [{ field: "code", message: "Module code already exists" }];
                throw error;
            }
            updateData.code = code;
        }

        if (updateData.name) {
            const normalizedName = updateData.name.trim();
            const duplicateModule = await moduleRepository.getModuleByName(normalizedName);

            if (duplicateModule && String(duplicateModule._id) !== String(id)) {
                const error = new Error("Module name already exists");
                error.statusCode = 409;
                error.errors = [
                    {
                        field: "name",
                        message: "Module name already exists",
                    },
                ];
                throw error;
            }

            updateData.name = normalizedName;
        }

        return await moduleRepository.updateModule(id, updateData);
    }
}

export default new UpdateModuleService();
