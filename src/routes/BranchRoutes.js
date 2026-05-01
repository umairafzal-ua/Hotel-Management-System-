import { Router } from "express";
import { createBranch, deleteBranch, getAllBranches, getBranchById, getPublicBranches, toggleBranchStatus, updateBranch } from "../controllers/BranchController.js";
import { authenticate } from "../middleware/AuthMiddleware.js";
import { checkPermission } from "../middleware/PermissionMiddleware.js";
import { createBranchSchema, updateBranchSchema, validate } from "../services/branch/Validation.js";
import { checkBranchAccess } from "../middleware/BranchAccessMiddleware.js";

const router = Router();

router.get("/public-list", getPublicBranches);
router.get("/list", authenticate, checkPermission("HOTEL_BRANCH_MANAGEMENT:read"), getAllBranches);
router.post("/create", authenticate, checkPermission("HOTEL_BRANCH_MANAGEMENT:create"), validate(createBranchSchema), createBranch);
router.get("/get/:id", authenticate, checkPermission("HOTEL_BRANCH_MANAGEMENT:read"), checkBranchAccess("id"), getBranchById);
router.put("/update/:id", authenticate, checkPermission("HOTEL_BRANCH_MANAGEMENT:update"), checkBranchAccess("id"), validate(updateBranchSchema), updateBranch);
router.delete("/delete/:id", authenticate, checkPermission("HOTEL_BRANCH_MANAGEMENT:delete"), checkBranchAccess("id"), deleteBranch);
router.patch("/toggle-status/:id", authenticate, checkPermission("HOTEL_BRANCH_MANAGEMENT:update"), checkBranchAccess("id"), toggleBranchStatus);

export default router;
