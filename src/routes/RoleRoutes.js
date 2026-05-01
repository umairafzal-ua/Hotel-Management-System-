import { Router } from "express";
import {createRole,getAllRoles,getRoleById,updateRole,deleteRole,toggleRoleStatus,addPermissionToRole,addPermissionsBulkToRole,removePermissionFromRole,removePermissionsBulkFromRole,setPermissionsForRole} from "../controllers/RoleController.js";
import { authenticate } from "../middleware/AuthMiddleware.js";
import { checkPermission } from "../middleware/PermissionMiddleware.js";
import {validate,roleSchema_create,updateRoleSchema,addPermissionsToRoleSchema,removePermissionsFromRoleSchema,setPermissionsForRoleSchema} from "../services/role/Validation.js";

const router = Router();
router.get("/list", authenticate, checkPermission("ROLES:read"), getAllRoles);
router.post("/create", authenticate, checkPermission("ROLES:create"), validate(roleSchema_create), createRole);
router.get("/get/:id", authenticate, checkPermission("ROLES:read"), getRoleById);
router.put("/update/:id", authenticate, checkPermission("ROLES:update"), validate(updateRoleSchema), updateRole);
router.delete("/delete/:id", authenticate, checkPermission("ROLES:delete"), deleteRole);
router.patch("/toggle-status/:id", authenticate, checkPermission("ROLES:update"), toggleRoleStatus);
router.post("/permissions/add", authenticate, checkPermission("ROLES:update"), addPermissionToRole);
router.post("/permissions/add-bulk", authenticate, checkPermission("ROLES:update"), validate(addPermissionsToRoleSchema), addPermissionsBulkToRole);
router.post("/permissions/remove", authenticate, checkPermission("ROLES:update"), removePermissionFromRole);
router.post("/permissions/remove-bulk", authenticate, checkPermission("ROLES:update"), validate(removePermissionsFromRoleSchema), removePermissionsBulkFromRole);
router.patch("/permissions/set", authenticate, checkPermission("ROLES:update"), validate(setPermissionsForRoleSchema), setPermissionsForRole);

export default router;
