import {sendCreated,sendError,sendPaginated,sendSuccess,} from "../utils/apiResponse.js";
import createGroupBookingService from "../services/groupBooking/CreateGroupBookingService.js";
import allocateGroupRoomsService from "../services/groupBooking/AllocateGroupRoomsService.js";
import addGroupMembersService from "../services/groupBooking/AddGroupMembersService.js";
import assignMembersToRoomsService from "../services/groupBooking/AssignMembersToRoomsService.js";
import updateGroupMealAddOnsService from "../services/groupBooking/UpdateGroupMealAddOnsService.js";
import generateGroupInvoiceService from "../services/groupBooking/GenerateGroupInvoiceService.js";
import completeGroupBookingService from "../services/groupBooking/CompleteGroupBookingService.js";
import cancelGroupBookingService from "../services/groupBooking/CancelGroupBookingService.js";
import updateGroupBookingService from "../services/groupBooking/UpdateGroupBookingService.js";
import getGroupBookingService from "../services/groupBooking/GetGroupBookingService.js";
import getGroupBookingsService from "../services/groupBooking/GetGroupBookingsService.js";

// ── Step 1: Group Leader creates group ──
export const createGroupBooking = async (req, res) => {
    try {
        const group = await createGroupBookingService.execute(req.validatedBody, req.user);
        const responseData = typeof group?.toObject === "function"
            ? group.toObject()
            : { ...group };
        delete responseData.mealSelection;
        return sendCreated(res, responseData, "Group booking created successfully (status: pending)");
    } catch (error) {
        const message = error.message || "Error creating group booking";
        const status = message.includes("not found") ? 404 : 400;
        return sendError(res, status, message);
    }
};

// ── Step 2: Branch Manager allocates rooms ──
export const allocateGroupRooms = async (req, res) => {
    try {
        const group = await allocateGroupRoomsService.execute(
            req.params.id,
            req.validatedBody,
            req.user
        );
        return sendSuccess(res, group, "Rooms allocated successfully (status: confirmed)");
    } catch (error) {
        const message = error.message || "Error allocating rooms";
        const status = message.includes("not found")
            ? 404
            : message.includes("Overbooking")
              ? 409
              : message.includes("access")
                ? 403
                : 400;
        return sendError(res, status, message);
    }
};

// ── Step 3: Group Leader adds pilgrims ──
export const addGroupMembers = async (req, res) => {
    try {
        const members = await addGroupMembersService.execute(
            req.params.id,
            req.validatedBody,
            req.user
        );
        return sendSuccess(res, members, "Members added successfully");
    } catch (error) {
        const message = error.message || "Error adding members";
        const status = message.includes("not found")
            ? 404
            : message.includes("leader")
              ? 403
              : 400;
        return sendError(res, status, message);
    }
};

// ── Step 4: Group Leader assigns pilgrims to rooms ──
export const assignMembersToRooms = async (req, res) => {
    try {
        const members = await assignMembersToRoomsService.execute(
            req.params.id,
            req.validatedBody,
            req.user
        );
        return sendSuccess(res, members, "Members assigned to rooms successfully");
    } catch (error) {
        const message = error.message || "Error assigning members";
        const status = message.includes("not found")
            ? 404
            : message.includes("leader") || message.includes("Access")
              ? 403
              : message.includes("capacity")
                ? 409
                : 400;
        return sendError(res, status, message);
    }
};

// ── Step 5: Group Leader selects meals + add-ons ──
export const updateGroupMealAddOns = async (req, res) => {
    try {
        const group = await updateGroupMealAddOnsService.execute(
            req.params.id,
            req.validatedBody,
            req.user
        );
        return sendSuccess(res, group, "Meal and add-on selections updated successfully");
    } catch (error) {
        const message = error.message || "Error updating meal/add-on selections";
        const status = message.includes("not found")
            ? 404
            : message.includes("leader")
              ? 403
              : 400;
        return sendError(res, status, message);
    }
};

// ── Step 6: Generate combined invoice ──
export const generateGroupInvoice = async (req, res) => {
    try {
        const invoice = await generateGroupInvoiceService.execute(req.params.id, req.user);
        return sendSuccess(res, invoice, "Invoice generated successfully");
    } catch (error) {
        const message = error.message || "Error generating invoice";
        const status = message.includes("not found")
            ? 404
            : message.includes("access")
              ? 403
              : 400;
        return sendError(res, status, message);
    }
};

// ── Step 7: Branch Manager marks completed ──
export const completeGroupBooking = async (req, res) => {
    try {
        const group = await completeGroupBookingService.execute(req.params.id, req.user);
        return sendSuccess(res, group, "Group booking marked as completed");
    } catch (error) {
        const message = error.message || "Error completing group booking";
        const status = message.includes("not found")
            ? 404
            : message.includes("access")
              ? 403
              : 400;
        return sendError(res, status, message);
    }
};

// ── Update group booking ──
export const updateGroupBooking = async (req, res) => {
    try {
        const group = await updateGroupBookingService.execute(req.params.id, req.validatedBody, req.user);
        return sendSuccess(res, group, "Group booking updated successfully");
    } catch (error) {
        const message = error.message || "Error updating group booking";
        const status = message.includes("not found") ? 404 : message.includes("access") || message.includes("Access") ? 403 : 400;
        return sendError(res, status, message);
    }
};

// ── Cancel group ──
export const cancelGroupBooking = async (req, res) => {
    try {
        const group = await cancelGroupBookingService.execute(
            req.params.id,
            req.validatedBody?.reason,
            req.user
        );
        return sendSuccess(res, group, "Group booking cancelled successfully");
    } catch (error) {
        const message = error.message || "Error cancelling group booking";
        const status = message.includes("not found")
            ? 404
            : message.includes("access")
              ? 403
              : 400;
        return sendError(res, status, message);
    }
};

// ── Get single group ──
export const getGroupBookingById = async (req, res) => {
    try {
        const group = await getGroupBookingService.execute(req.params.id, req.user);
        return sendSuccess(res, group, "Group booking retrieved successfully");
    } catch (error) {
        const message = error.message || "Error fetching group booking";
        const status = message.includes("not found")
            ? 404
            : message.includes("Access") || message.includes("access")
              ? 403
              : 400;
        return sendError(res, status, message);
    }
};

// ── List groups ──
export const getAllGroupBookings = async (req, res) => {
    try {
        const result = await getGroupBookingsService.execute(
            req.validatedQuery || req.query,
            req.user
        );
        return sendPaginated(res, result.data, result, "Group bookings fetched successfully");
    } catch (error) {
        const message = error.message || "Error fetching group bookings";
        const status = message.includes("required") ? 400 : 500;
        return sendError(res, status, message);
    }
};
