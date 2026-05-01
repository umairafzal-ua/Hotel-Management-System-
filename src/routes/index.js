import express from "express";
import authRoutes from "./AuthRoutes.js";
import healthRoutes from "./HealthRoutes.js";
import moduleRoutes from "./ModuleRoutes.js";
import permissionRoutes from "./PermissionRoutes.js";
import roleRoutes from "./RoleRoutes.js";
import branchRoutes from "./BranchRoutes.js";
import employeeRoutes from "./EmployeeRoutes.js";
import roomRoutes from "./RoomRoutes.js";
import bookingRoutes from "./BookingRoutes.js";
import groupBookingRoutes from "./GroupBookingRoutes.js";
import contactUsRoutes from "./ContactUsRoutes.js";
import mealRoutes from "./MealRoutes.js";
import addOnRoutes from "./AddOnRoutes.js";
import kitchenRoutes from "./KitchenRoutes.js";
import amenityRoutes from "./AmenityRoutes.js";

const router=express.Router();

router.use("/auth", authRoutes);
router.use("/health", healthRoutes);
router.use("/modules", moduleRoutes);
router.use("/permissions", permissionRoutes);
router.use("/roles", roleRoutes);
router.use("/branches", branchRoutes);
router.use("/employees", employeeRoutes);
router.use("/rooms", roomRoutes);
router.use("/bookings", bookingRoutes);
router.use("/group-bookings", groupBookingRoutes);
router.use("/contact-us", contactUsRoutes);
router.use("/meal-plans", mealRoutes);
router.use("/add-ons", addOnRoutes);
router.use("/kitchen", kitchenRoutes);
router.use("/amenities", amenityRoutes);

export default router;

