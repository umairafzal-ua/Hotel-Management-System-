import * as permissionRepository from "../../repositories/PermissionRepository.js";

class UpdatePermissionService {
    async execute(id, updateData) {
        const permission = await permissionRepository.getPermissionById(id);
        if (!permission) {
            throw new Error("Permission not found");
        }

        return await permissionRepository.updatePermission(id, updateData);
    }
}

export default new UpdatePermissionService();
