import * as permissionRepository from "../../repositories/PermissionRepository.js";

class TogglePermissionStatusService {
    async execute(id) {
        const permission = await permissionRepository.getPermissionById(id);
        if (!permission) {
            throw new Error("Permission not found");
        }

        return await permissionRepository.togglePermissionActive(id);
    }
}

export default new TogglePermissionStatusService();
