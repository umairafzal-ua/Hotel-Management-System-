import { Router } from "express";
import {
    createAmenity,
    deleteAmenity,
    getAllAmenities,
    getAmenityById,
    updateAmenity,
} from "../controllers/AmenityController.js";
import { authenticate } from "../middleware/AuthMiddleware.js";
import { checkPermission } from "../middleware/PermissionMiddleware.js";
import {
    createAmenitySchema,
    updateAmenitySchema,
    validate,
} from "../services/amenity/Validation.js";

const router = Router();

router.post("/create", authenticate, checkPermission("ROOM_BOOKING:create"), validate(createAmenitySchema), createAmenity);

router.get("/list", authenticate, checkPermission("ROOM_BOOKING:read"), getAllAmenities);

router.get("/get/:id", authenticate, checkPermission("ROOM_BOOKING:read"), getAmenityById);

router.put("/update/:id", authenticate, checkPermission("ROOM_BOOKING:update"), validate(updateAmenitySchema), updateAmenity);

router.delete("/delete/:id", authenticate, checkPermission("ROOM_BOOKING:delete"), deleteAmenity);

export default router;
