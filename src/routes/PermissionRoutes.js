import { Router } from "express";
import { createPermissionsBulk, deletePermission, getAllPermissions, getPermissionById, togglePermissionStatus, updatePermission, } from "../controllers/PermissionController.js";
import { authenticate } from "../middleware/AuthMiddleware.js";
import { checkPermission } from "../middleware/PermissionMiddleware.js";
import { createPermissionsBulkSchema, updatePermissionSchema, validate } from "../services/permission/Validation.js";

const router = Router();

router.get("/list", authenticate, checkPermission("PERMISSIONS:read"), getAllPermissions);
router.post("/create", authenticate, checkPermission("PERMISSIONS:create"), validate(createPermissionsBulkSchema), createPermissionsBulk);
router.get("/get/:id", authenticate, checkPermission("PERMISSIONS:read"), getPermissionById);
router.put("/update/:id", authenticate, checkPermission("PERMISSIONS:update"), validate(updatePermissionSchema), updatePermission);
router.delete("/delete/:id", authenticate, checkPermission("PERMISSIONS:delete"), deletePermission);
router.patch("/toggle-status/:id", authenticate, checkPermission("PERMISSIONS:update"), togglePermissionStatus);

export default router;
