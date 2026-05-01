import * as moduleRepository from "../../repositories/ModuleRepository.js";
import * as permissionRepository from "../../repositories/PermissionRepository.js";
import { deriveModuleCode, normalizeModuleCode } from "../../utils/rbacIdentifiers.js";

class CreateModuleService {
    async execute(moduleData) {
        const normalizedName = moduleData.name.trim();
        const existingModule = await moduleRepository.getModuleByName(normalizedName);

        if (existingModule) {
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

        const code = normalizeModuleCode(moduleData.code || deriveModuleCode(normalizedName));
        if (!code) {
            const err = new Error("Module code could not be derived from name");
            err.statusCode = 400;
            throw err;
        }
        const codeTaken = await moduleRepository.getModuleByCode(code);
        if (codeTaken) {
            const error = new Error("Module code already exists");
            error.statusCode = 409;
            error.errors = [{ field: "code", message: "Module code already exists" }];
            throw error;
        }

        const module = await moduleRepository.createModule({
            name: normalizedName,
            code,
            description: moduleData.description,
        });

        const defaultPermissions = [
            {
                module: module._id,
                action: "create",
                description: `Can create ${moduleData.name}`,
                isActive: true,
            },
            {
                module: module._id,
                action: "read",
                description: `Can read ${moduleData.name}`,
                isActive: true,
            },
            {
                module: module._id,
                action: "update",
                description: `Can update ${moduleData.name}`,
                isActive: true,
            },
            {
                module: module._id,
                action: "delete",
                description: `Can delete ${moduleData.name}`,
                isActive: true,
            },
        ];

        await permissionRepository.createPermissionsBulk(defaultPermissions);

        return module;
    }
}

export default new CreateModuleService();
