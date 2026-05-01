import { Router } from "express";
import { authenticate } from "../middleware/AuthMiddleware.js";
import { checkPermission } from "../middleware/PermissionMiddleware.js";
import { createMealPlan, listMealPlans, toggleMealPlan, updateMealPlan } from "../controllers/MealController.js";
import { createMealPlanSchema, updateMealPlanSchema, validate } from "../services/meal/Validation.js";

const router = Router();

router.post("/", authenticate, checkPermission("KITCHENANDMEALS:create"), validate(createMealPlanSchema), createMealPlan);
router.get("/", authenticate, checkPermission("KITCHENANDMEALS:read"), listMealPlans);
router.put("/:id", authenticate, checkPermission("KITCHENANDMEALS:update"), validate(updateMealPlanSchema), updateMealPlan);
router.patch("/:id/toggle", authenticate, checkPermission("KITCHENANDMEALS:update"), toggleMealPlan);

export default router;

