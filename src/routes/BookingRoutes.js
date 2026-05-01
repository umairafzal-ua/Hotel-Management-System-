import { Router } from "express";
import { authenticate, authorize } from "../middleware/AuthMiddleware.js";
import { checkPermission } from "../middleware/PermissionMiddleware.js";
import {
    cancelBooking,
    completeBooking,
    createBooking,
    getAllBookings,
    getBookingById,
    reassignBooking,
    updateBooking,
} from "../controllers/BookingController.js";
import { upsertBookingAddOns, upsertBookingMealSelection } from "../controllers/BookingExtrasController.js";
import {
    cancelBookingSchema,
    createBookingSchema,
    customerCreateBookingSchema,
    listBookingsQuerySchema,
    reassignBookingSchema,
    updateBookingSchema,
    validate,
    validateQuery,
} from "../services/booking/Validation.js";
import { upsertMealSelectionSchema } from "../services/meal/Validation.js";
import { upsertAddOnSelectionSchema } from "../services/addon/Validation.js";

const router = Router();

router.post("/create",authenticate,checkPermission("ROOM_BOOKING:create"),validate(createBookingSchema),createBooking);
router.post("/customer/create", authenticate, authorize("customer", "groupleader"), validate(customerCreateBookingSchema), createBooking);

router.get("/list",authenticate,checkPermission("ROOM_BOOKING:read"),validateQuery(listBookingsQuerySchema),getAllBookings);

router.get("/get/:id",authenticate,checkPermission("ROOM_BOOKING:read"),getBookingById);

router.patch("/:id/cancel",authenticate,checkPermission("ROOM_BOOKING:update"),validate(cancelBookingSchema),cancelBooking);

router.patch("/:id/reassign",authenticate,checkPermission("ROOM_BOOKING:update"),validate(reassignBookingSchema),reassignBooking);

router.patch("/:id/update",authenticate,checkPermission("ROOM_BOOKING:update"),validate(updateBookingSchema),updateBooking);

router.patch("/:id/complete",authenticate,checkPermission("ROOM_BOOKING:update"),completeBooking);

router.put("/:id/meal-selection", authenticate, checkPermission("ROOM_BOOKING:update"), validate(upsertMealSelectionSchema), upsertBookingMealSelection);
router.put("/:id/add-ons", authenticate, checkPermission("ROOM_BOOKING:update"), validate(upsertAddOnSelectionSchema), upsertBookingAddOns);

export default router;
