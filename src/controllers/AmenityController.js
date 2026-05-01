import { sendCreated, sendError, sendPaginated, sendSuccess } from "../utils/apiResponse.js";
import { isAdminAuthUser } from "../utils/authUser.js";
import createAmenityService from "../services/amenity/CreateAmenityService.js";
import getAmenitiesService from "../services/amenity/GetAmenitiesService.js";
import getAmenityByIdService from "../services/amenity/GetAmenityByIdService.js";
import updateAmenityService from "../services/amenity/UpdateAmenityService.js";
import deleteAmenityService from "../services/amenity/DeleteAmenityService.js";

export const createAmenity = async (req, res) => {
    try {
        const amenity = await createAmenityService.execute(req.validatedBody);
        return sendCreated(res, amenity, "Amenity created successfully");
    } catch (error) {
        return sendError(res, 400, error.message || "Error creating amenity");
    }
};

export const getAllAmenities = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const per_page = parseInt(req.query.per_page) || 10;

        const isAdmin = isAdminAuthUser(req.user);
        const branchId = isAdmin ? req.query.branchId : req.user?.branchId;

        if (!branchId) {
            return sendError(res, 400, "Branch ID is required");
        }

        const result = await getAmenitiesService.execute(page, per_page, branchId);
        return sendPaginated(res, result.data, result, "Amenities fetched successfully");
    } catch (error) {
        return sendError(res, 500, error.message || "Error fetching amenities");
    }
};

export const getAmenityById = async (req, res) => {
    try {
        const amenity = await getAmenityByIdService.execute(req.params.id);
        return sendSuccess(res, amenity, "Amenity retrieved successfully");
    } catch (error) {
        return sendError(res, error.message?.includes("not found") ? 404 : 500, error.message);
    }
};

export const updateAmenity = async (req, res) => {
    try {
        const updated = await updateAmenityService.execute(req.params.id, req.validatedBody);
        return sendSuccess(res, updated, "Amenity updated successfully");
    } catch (error) {
        return sendError(res, error.message?.includes("not found") ? 404 : 400, error.message);
    }
};

export const deleteAmenity = async (req, res) => {
    try {
        await deleteAmenityService.execute(req.params.id);
        return sendSuccess(res, null, "Amenity deleted successfully");
    } catch (error) {
        return sendError(res, error.message?.includes("not found") ? 404 : 400, error.message);
    }
};
