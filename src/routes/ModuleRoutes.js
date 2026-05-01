import { Router } from "express";
import {createModule,getAllModules,getModuleById,updateModule,deleteModule,toggleModuleStatus} from "../controllers/ModuleController.js";
import { authenticate } from "../middleware/AuthMiddleware.js";
import { checkPermission } from "../middleware/PermissionMiddleware.js";
import { validate, moduleSchema, updateModuleSchema } from "../services/module/Validation.js";

const router = Router();

router.get("/list", authenticate, checkPermission("MODULES:read"), getAllModules);
router.post("/create", authenticate, checkPermission("MODULES:create"), validate(moduleSchema), createModule);
router.get("/get/:id", authenticate, checkPermission("MODULES:read"), getModuleById);
router.put("/update/:id", authenticate, checkPermission("MODULES:update"), validate(updateModuleSchema), updateModule);
router.delete("/delete/:id", authenticate, checkPermission("MODULES:delete"), deleteModule);
router.patch("/toggle-status/:id", authenticate, checkPermission("MODULES:update"), toggleModuleStatus);

export default router;
