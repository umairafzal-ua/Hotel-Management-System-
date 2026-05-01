import { Router } from "express";
import { authenticate } from "../middleware/AuthMiddleware.js";
import { checkPermission } from "../middleware/PermissionMiddleware.js";
import {
    cancelGroupBooking,
    completeGroupBooking,
    createGroupBooking,
    allocateGroupRooms,
    addGroupMembers,
    assignMembersToRooms,
    updateGroupMealAddOns,
    generateGroupInvoice,
    getAllGroupBookings,
    getGroupBookingById,
    updateGroupBooking,
} from "../controllers/GroupBookingController.js";
import {
    createGroupSchema,
    allocateRoomsSchema,
    addMembersSchema,
    assignMembersSchema,
    updateMealAddOnsSchema,
    cancelGroupSchema,
    updateGroupSchema,
    listGroupBookingsQuerySchema,
    validate,
    validateQuery,
} from "../services/groupBooking/Validation.js";

const router = Router();

// ── Step 1: Group Leader creates group (status → pending) ──
router.post(
    "/create",
    authenticate,
    checkPermission("GROUP_BOOKING:create"),
    validate(createGroupSchema),
    createGroupBooking
);

// ── Step 2: Branch Manager allocates rooms (status → confirmed) ──
router.patch(
    "/:id/allocate-rooms",
    authenticate,
    checkPermission("GROUP_BOOKING:update"),
    validate(allocateRoomsSchema),
    allocateGroupRooms
);

// ── Step 3: Group Leader adds pilgrims ──
router.patch(
    "/:id/members",
    authenticate,
    checkPermission("GROUP_BOOKING:update"),
    validate(addMembersSchema),
    addGroupMembers
);

// ── Step 4: Group Leader assigns pilgrims to rooms ──
router.patch(
    "/:id/assign-members",
    authenticate,
    checkPermission("GROUP_BOOKING:update"),
    validate(assignMembersSchema),
    assignMembersToRooms
);

// ── Step 5: Group Leader selects meals + add-ons ──
router.patch(
    "/:id/meal-addons",
    authenticate,
    checkPermission("GROUP_BOOKING:update"),
    validate(updateMealAddOnsSchema),
    updateGroupMealAddOns
);

// ── Update group booking (dates, name, pilgrims, preferences) ──
router.patch(
    "/:id/update",
    authenticate,
    checkPermission("GROUP_BOOKING:update"),
    validate(updateGroupSchema),
    updateGroupBooking
);

// ── Step 6: Generate combined invoice ──
router.post(
    "/:id/invoice",
    authenticate,
    checkPermission("GROUP_BOOKING:update"),
    generateGroupInvoice
);

// ── Step 7: Branch Manager marks completed ──
router.patch(
    "/:id/complete",
    authenticate,
    checkPermission("GROUP_BOOKING:update"),
    completeGroupBooking
);

// ── Cancel group booking ──
router.patch(
    "/:id/cancel",
    authenticate,
    checkPermission("GROUP_BOOKING:update"),
    validate(cancelGroupSchema),
    cancelGroupBooking
);

// ── Get single group booking ──
router.get(
    "/get/:id",
    authenticate,
    checkPermission("GROUP_BOOKING:read"),
    getGroupBookingById
);

// ── List group bookings ──
router.get(
    "/list",
    authenticate,
    checkPermission("GROUP_BOOKING:read"),
    validateQuery(listGroupBookingsQuerySchema),
    getAllGroupBookings
);

export default router;
