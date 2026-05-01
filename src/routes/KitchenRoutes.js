import { Router } from "express";
import { authenticate } from "../middleware/AuthMiddleware.js";
import { checkPermission } from "../middleware/PermissionMiddleware.js";
import { createKitchenAdjustment, getKitchenPrep, listKitchenAdjustments } from "../controllers/KitchenController.js";
import { createAdjustmentSchema, kitchenPrepQuerySchema, validate, validateQuery } from "../services/kitchen/Validation.js";

const router = Router();

router.get("/prep", authenticate, checkPermission("KITCHENANDMEALS:read"), validateQuery(kitchenPrepQuerySchema), getKitchenPrep);
router.post("/adjustments", authenticate, checkPermission("KITCHENANDMEALS:update"), validate(createAdjustmentSchema), createKitchenAdjustment);
router.get("/adjustments", authenticate, checkPermission("KITCHENANDMEALS:read"), listKitchenAdjustments);

export default router;

