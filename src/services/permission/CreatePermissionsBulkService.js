import * as permissionRepository from "../../repositories/PermissionRepository.js";
import * as moduleRepository from "../../repositories/ModuleRepository.js";

class CreatePermissionsBulkService {
    async execute(permissionsData) {
        const preparedPermissions = [];

        for (const permData of permissionsData) {
            const module = await moduleRepository.getModuleById(permData.module);
            if (!module) {
                throw new Error(`Module ${permData.module} not found`);
            }

            preparedPermissions.push({
                module: permData.module,
                action: permData.action,
                description: permData.description || "",
                isActive: true,
            });
        }

        const createdPermissions = await permissionRepository.createPermissionsBulk(preparedPermissions);

        const populatedPermissions = await Promise.all(
            createdPermissions.map((perm) => perm.populate("module"))
        );

        return populatedPermissions;
    }
}

export default new CreatePermissionsBulkService();
