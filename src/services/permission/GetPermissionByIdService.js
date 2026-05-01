import * as permissionRepository from "../../repositories/PermissionRepository.js";

class GetPermissionByIdService {
    async execute(id) {
        const permission = await permissionRepository.getPermissionById(id);
        if (!permission) {
            throw new Error("Permission not found");
        }
        return permission;
    }
}

export default new GetPermissionByIdService();
