import { Router } from "express";
import {
    bulkCreateRooms,
    checkAvailability,
    createRoom,
    deleteRoom,
    getAllRooms,
    getPublicRooms,
    getRoomById,
    getRoomsByFloor,
    toggleRoomStatus,
    updateRoom,
    updateRoomStatus,
} from "../controllers/RoomController.js";
import { authenticate } from "../middleware/AuthMiddleware.js";
import { checkPermission } from "../middleware/PermissionMiddleware.js";
import { checkRoomAccess, checkRoomBodyAccess } from "../middleware/RoomAccessMiddleware.js";
import { uploadRoomImage } from "../middleware/UploadMiddleware.js";
import {
    bulkCreateRoomsSchema,
    createRoomSchema,
    updateRoomSchema,
    updateStatusSchema,
    validate,
    validateMultipart,
} from "../services/room/Validation.js";
const router = Router();

router.post("/create", authenticate, checkPermission("ROOM_BOOKING:create"), uploadRoomImage, validateMultipart(createRoomSchema), checkRoomBodyAccess("branchId"), createRoom);

router.post("/bulk-create", authenticate, checkPermission("ROOM_BOOKING:create"), validate(bulkCreateRoomsSchema), bulkCreateRooms);

router.get("/list", authenticate, checkPermission("ROOM_BOOKING:read"), getAllRooms);

router.get("/public-lists", getPublicRooms);

router.get("/get/:id", getRoomById);

router.get("/availability", /* authenticate, checkPermission("ROOM_BOOKING:read"),*/ checkAvailability);

router.get("/by-floor", authenticate, checkPermission("ROOM_BOOKING:read"), getRoomsByFloor);

router.put("/update/:id", authenticate, checkPermission("ROOM_BOOKING:update"), checkRoomAccess("id"), uploadRoomImage, validateMultipart(updateRoomSchema), updateRoom);

router.delete("/delete/:id", authenticate, checkPermission("ROOM_BOOKING:delete"), checkRoomAccess("id"), deleteRoom);

router.patch("/toggle-status/:id", authenticate, checkPermission("ROOM_BOOKING:update"), checkRoomAccess("id"), toggleRoomStatus);

router.patch("/:id/status", authenticate, checkPermission("ROOM_BOOKING:update"), checkRoomAccess("id"), validate(updateStatusSchema), updateRoomStatus);
export default router;
