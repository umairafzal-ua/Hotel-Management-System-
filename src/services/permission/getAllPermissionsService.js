import Module from "../../models/Module.js";
import Permission from "../../models/Permission.js";

class GetAllPermissionsService {
    async execute(page = 1, per_page = 10) {
        const allModules = await Module.find({ isActive: true }).lean();

        const allPermissions = await Permission.find({ isActive: true })
            .populate("module", "_id name code")
            .lean();

        const permissionsByModule = new Map();
        for (const perm of allPermissions) {
            const moduleIdStr = perm.module?._id?.toString?.() || String(perm.module);
            if (!permissionsByModule.has(moduleIdStr)) {
                permissionsByModule.set(moduleIdStr, []);
            }
            permissionsByModule.get(moduleIdStr).push({
                id: perm._id,
                action: perm.action,
                isActive: perm.isActive,
            });
        }

        const transformedData = allModules.map((mod) => ({
            moduleId: mod._id,
            moduleName: mod.name,
            moduleCode: mod.code || null,
            permissions: permissionsByModule.get(mod._id.toString()) || [],
        }));

        const totalModules = transformedData.length;
        const totalPages = Math.ceil(totalModules / per_page);

        const startIdx = (page - 1) * per_page;
        const endIdx = Math.min(page * per_page, totalModules);
        const paginatedData = transformedData.slice(startIdx, endIdx);

        return {
            data: paginatedData,
            page,
            per_page,
            total_items: totalModules,
            total_pages: totalPages,
        };
    }
}

export default new GetAllPermissionsService();
