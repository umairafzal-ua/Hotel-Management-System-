import { sendCreated, sendError, sendPaginated, sendSuccess } from "../utils/apiResponse.js";
import createBookingService from "../services/booking/CreateBookingService.js";
import cancelBookingService from "../services/booking/CancelBookingService.js";
import completeBookingService from "../services/booking/CompleteBookingService.js";
import reassignBookingService from "../services/booking/ReassignBookingService.js";
import updateBookingService from "../services/booking/UpdateBookingService.js";
import getBookingsService from "../services/booking/GetBookingsService.js";
import getBookingByIdService from "../services/booking/GetBookingByIdService.js";

export const createBooking = async (req, res) => {
    try {
        const booking = await createBookingService.execute(req.validatedBody, req.user);
        return sendCreated(res, booking, "Booking created successfully");
    } catch (error) {
        const message = error.message || "Error creating booking";
        const status = message.includes("not found") ? 404 : message.includes("Overbooking") ? 409 : 400;
        return sendError(res, status, message);
    }
};

export const cancelBooking = async (req, res) => {
    try {
        const booking = await cancelBookingService.execute(req.params.id, req.validatedBody?.reason, req.user);
        return sendSuccess(res, booking, "Booking cancelled successfully");
    } catch (error) {
        const message = error.message || "Error cancelling booking";
        const status = message.includes("not found") ? 404 : 400;
        return sendError(res, status, message);
    }
};

export const reassignBooking = async (req, res) => {
    try {
        const booking = await reassignBookingService.execute(req.params.id, req.validatedBody, req.user);
        return sendSuccess(res, booking, "Booking reassigned successfully");
    } catch (error) {
        const message = error.message || "Error reassigning booking";
        const status = message.includes("not found") ? 404 : message.includes("Overbooking") ? 409 : 400;
        return sendError(res, status, message);
    }
};

export const getAllBookings = async (req, res) => {
    try {
        const result = await getBookingsService.execute(req.validatedQuery || req.query, req.user);
        return sendPaginated(res, result.data, result, "Bookings fetched successfully");
    } catch (error) {
        const message = error.message || "Error fetching bookings";
        const status = message.includes("required") ? 400 : 500;
        return sendError(res, status, message);
    }
};

export const getBookingById = async (req, res) => {
    try {
        const booking = await getBookingByIdService.execute(req.params.id, req.user);
        return sendSuccess(res, booking, "Booking retrieved successfully");
    } catch (error) {
        const message = error.message || "Error fetching booking";
        const status = message.includes("not found") ? 404 : message.includes("access") ? 403 : 400;
        return sendError(res, status, message);
    }
};

export const updateBooking = async (req, res) => {
    try {
        const booking = await updateBookingService.execute(req.params.id, req.validatedBody, req.user);
        return sendSuccess(res, booking, "Booking updated successfully");
    } catch (error) {
        const message = error.message || "Error updating booking";
        const status = message.includes("not found") ? 404 : message.includes("Overbooking") ? 409 : message.includes("access") ? 403 : 400;
        return sendError(res, status, message);
    }
};

export const completeBooking = async (req, res) => {
    try {
        const booking = await completeBookingService.execute(req.params.id, req.user);
        return sendSuccess(res, booking, "Booking marked as completed");
    } catch (error) {
        const message = error.message || "Error completing booking";
        const status = message.includes("not found") ? 404 : message.includes("access") ? 403 : 400;
        return sendError(res, status, message);
    }
};
