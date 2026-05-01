import { Router } from "express";
import { assignEmployee, createEmployeeWithUser, getAllEmployees, getEmployeeById, getEmployeesByBranch, removeEmployee, updateEmployee } from "../controllers/EmployeeController.js";
import { authenticate } from "../middleware/AuthMiddleware.js";
import { checkPermission } from "../middleware/PermissionMiddleware.js";
import { assignEmployeeSchema, createEmployeeWithUserSchema, updateEmployeeSchema, validate } from "../services/employee/Validation.js";
import { checkBranchAccess, checkBranchBodyAccess, checkEmployeeAccess } from "../middleware/BranchAccessMiddleware.js";

const router = Router();

router.post("/create-with-user", authenticate, checkPermission("HOTEL_BRANCH_MANAGEMENT:create"), validate(createEmployeeWithUserSchema), checkBranchBodyAccess("branchId"), createEmployeeWithUser);
router.get("/list", authenticate, checkPermission("HOTEL_BRANCH_MANAGEMENT:read"), getAllEmployees);
router.post("/assign", authenticate, checkPermission("HOTEL_BRANCH_MANAGEMENT:create"), validate(assignEmployeeSchema), checkBranchBodyAccess("branchId"), assignEmployee);
router.get("/get/:id", authenticate, checkPermission("HOTEL_BRANCH_MANAGEMENT:read"), checkEmployeeAccess("id"), getEmployeeById);
router.put("/update/:id", authenticate, checkPermission("HOTEL_BRANCH_MANAGEMENT:update"), validate(updateEmployeeSchema), checkEmployeeAccess("id"), checkBranchBodyAccess("branchId"), updateEmployee);
router.delete("/remove/:id", authenticate, checkPermission("HOTEL_BRANCH_MANAGEMENT:delete"), checkEmployeeAccess("id"), removeEmployee);
router.get("/branch/:branchId", authenticate, checkPermission("HOTEL_BRANCH_MANAGEMENT:read"), checkBranchAccess("branchId"), getEmployeesByBranch);

export default router;
