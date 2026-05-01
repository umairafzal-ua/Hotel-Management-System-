import * as permissionRepository from "../../repositories/PermissionRepository.js";

class DeletePermissionService {
    async execute(id) {
        const permission = await permissionRepository.getPermissionById(id);
        if (!permission) {
            throw new Error("Permission not found");
        }

        return await permissionRepository.hardDeletePermission(id);
    }
}

export default new DeletePermissionService();
