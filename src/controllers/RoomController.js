import { sendCreated, sendError, sendPaginated, sendSuccess } from "../utils/apiResponse.js";
import { isAdminAuthUser } from "../utils/authUser.js";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";
import createRoomService from "../services/room/CreateRoomService.js";
import bulkCreateRoomsService from "../services/room/BulkCreateRoomsService.js";
import getRoomsService from "../services/room/GetRoomsService.js";
import getRoomByIdService from "../services/room/GetRoomByIdService.js";
import updateRoomService from "../services/room/UpdateRoomService.js";
import deleteRoomService from "../services/room/DeleteRoomService.js";
import toggleRoomStatusService from "../services/room/ToggleRoomStatusService.js";
import checkAvailabilityService from "../services/room/CheckAvailabilityService.js";
import updateRoomStatusService from "../services/room/UpdateRoomStatusService.js";
import getRoomsByFloorService from "../services/room/GetRoomsByFloorService.js";
import getPublicRoomsService from "../services/room/GetPublicRoomsService.js";

export const createRoom = async (req, res) => {
    try {
        const roomData = { ...req.validatedBody };

        // Handle image upload if a file was attached
        if (req.file) {
            const uploaded = await uploadToCloudinary(req.file.buffer, "rooms");
            roomData.image = { url: uploaded.url, publicId: uploaded.publicId };
        }

        const room = await createRoomService.execute(roomData);
        return sendCreated(res, room, "Room created successfully");
    } catch (error) {
        return sendError(res, 400, error.message || "Error creating room");
    }
};

export const bulkCreateRooms = async (req, res) => {
    try {
        const branchId = req.validatedBody.branchId || req.body.branchId;
        const rooms = await bulkCreateRoomsService.execute(req.validatedBody.rooms, branchId);
        return sendCreated(res, rooms, `${rooms.length} rooms created successfully`);
    } catch (error) {
        return sendError(res, 400, error.message || "Error creating rooms");
    }
};

export const getAllRooms = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const per_page = parseInt(req.query.per_page) || 10;

        if (page < 1 || per_page < 1) {
            return sendError(res, 400, "Page and per_page must be greater than 0");
        }

        // Branch scoping for non-admins
        const isAdmin = isAdminAuthUser(req.user);
        const branchId = isAdmin ? req.query.branchId : req.user?.branchId;

        if (!branchId) {
            return sendError(res, 400, "Branch ID is required");
        }

        const filters = {};
        if (req.query.type) filters.type = req.query.type;
        if (req.query.status) filters.status = req.query.status;

        const result = await getRoomsService.execute(page, per_page, branchId, filters);
        return sendPaginated(res, result.data, result, "Rooms fetched successfully");
    } catch (error) {
        return sendError(res, 500, error.message || "Error fetching rooms");
    }
};

export const getRoomById = async (req, res) => {
    try {
        const room = await getRoomByIdService.execute(req.params.id);
        return sendSuccess(res, room, "Room retrieved successfully");
    } catch (error) {
        return sendError(res, error.message?.includes("not found") ? 404 : 500, error.message);
    }
};

export const getPublicRooms = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const per_page = parseInt(req.query.per_page || req.query.limit) || 10;

        if (page < 1 || per_page < 1) {
            return sendError(res, 400, "Page and per_page must be greater than 0");
        }

        const result = await getPublicRoomsService.execute(page, per_page);
        return sendPaginated(res, result.data, result, "Rooms fetched successfully");
    } catch (error) {
        return sendError(res, 500, error.message || "Error fetching rooms");
    }
};

export const checkAvailability = async (req, res) => {
    try {
        const branchId = req.query.branchId || req.user?.branchId;
        const roomType = req.query.type;
        const capacity = req.query.capacity ? parseInt(req.query.capacity) : null;
        const page = parseInt(req.query.page) || 1;
        const per_page = parseInt(req.query.per_page) || 10;
        const checkInDate = req.query.checkInDate;
        const checkOutDate = req.query.checkOutDate;
        const partyType = req.query.partyType || "individual";
        const guestCount = req.query.guestCount ? parseInt(req.query.guestCount) : 1;
        const gender = req.query.gender || "mixed";

        const result = await checkAvailabilityService.execute(
            branchId,
            roomType,
            capacity,
            page,
            per_page,
            checkInDate,
            checkOutDate,
            partyType,
            guestCount,
            gender
        );
        return sendPaginated(res, result.data, result, "Available rooms fetched successfully");
    } catch (error) {
        return sendError(res, 400, error.message || "Error checking availability");
    }
};

export const updateRoom = async (req, res) => {
    try {
        const updateData = { ...req.validatedBody };

        // Handle image upload if a new file was attached
        if (req.file) {
            const uploaded = await uploadToCloudinary(req.file.buffer, "rooms");
            updateData.image = { url: uploaded.url, publicId: uploaded.publicId };
        }

        const updated = await updateRoomService.execute(req.params.id, updateData);
        return sendSuccess(res, updated, "Room updated successfully");
    } catch (error) {
        return sendError(res, error.message?.includes("not found") ? 404 : 400, error.message);
    }
};

export const deleteRoom = async (req, res) => {
    try {
        await deleteRoomService.execute(req.params.id);
        return sendSuccess(res, null, "Room deleted successfully");
    } catch (error) {
        return sendError(res, error.message?.includes("not found") ? 404 : 400, error.message);
    }
};

export const toggleRoomStatus = async (req, res) => {
    try {
        const updated = await toggleRoomStatusService.execute(req.params.id);
        return sendSuccess(res, updated, `Room status toggled successfully`);
    } catch (error) {
        return sendError(res, error.message?.includes("not found") ? 404 : 400, error.message);
    }
};

export const updateRoomStatus = async (req, res) => {
    try {
        const updated = await updateRoomStatusService.execute(req.params.id, req.validatedBody.status);
        return sendSuccess(res, updated, "Room status updated successfully");
    } catch (error) {
        return sendError(res, error.message?.includes("not found") ? 404 : 400, error.message);
    }
};

export const getRoomsByFloor = async (req, res) => {
    try {
        const branchId = req.query.branchId || req.user?.branchId;
        const floor = parseInt(req.query.floor);
        const page = parseInt(req.query.page) || 1;
        const per_page = parseInt(req.query.per_page) || 10;

        if (isNaN(floor)) {
            return sendError(res, 400, "Floor number must be a valid number");
        }

        const result = await getRoomsByFloorService.execute(branchId, floor, page, per_page);
        return sendPaginated(res, result.data, result, "Rooms by floor fetched successfully");
    } catch (error) {
        return sendError(res, 400, error.message || "Error fetching rooms by floor");
    }
};
