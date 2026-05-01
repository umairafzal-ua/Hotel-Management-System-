import { sendCreated, sendError, sendPaginated, sendSuccess } from "../utils/apiResponse.js";
import { isAdminAuthUser } from "../utils/authUser.js";
import createBranchService from "../services/branch/CreateBranchService.js";
import getBranchesService from "../services/branch/GetBranchesService.js";
import getBranchByIdService from "../services/branch/GetBranchByIdService.js";
import updateBranchService from "../services/branch/UpdateBranchService.js";
import deleteBranchService from "../services/branch/DeleteBranchService.js";
import toggleBranchStatusService from "../services/branch/ToggleBranchStatusService.js";

export const createBranch = async (req, res) => {
    try {
        const branch = await createBranchService.execute(req.validatedBody);
        return sendCreated(res, branch, "Branch created successfully");
    } catch (error) {
        return sendError(res, 400, error.message || "Error creating branch");
    }
};

export const getAllBranches = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const per_page = parseInt(req.query.per_page || req.query.limit) || 10;
        if (page < 1 || per_page < 1) {
            return sendError(res, 400, "Page and per_page must be greater than 0");
        }
        
        const isAdmin = isAdminAuthUser(req.user);
        const scopedBranchId = isAdmin ? null : (req.user?.branchId || null);

        const result = await getBranchesService.execute(page, per_page, scopedBranchId);
        return sendPaginated(res, result.data, result, "Branches fetched successfully");
    } catch (error) {
        return sendError(res, 500, error.message || "Error fetching branches");
    }
};

export const getPublicBranches = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const per_page = parseInt(req.query.per_page || req.query.limit) || 100;

        if (page < 1 || per_page < 1) {
            return sendError(res, 400, "Page and per_page must be greater than 0");
        }

        const result = await getBranchesService.execute(page, per_page, null, true);
        return sendPaginated(res, result.data, result, "Public branches fetched successfully");
    } catch (error) {
        return sendError(res, 500, error.message || "Error fetching public branches");
    }
};

export const getBranchById = async (req, res) => {
    try {
        const branch = await getBranchByIdService.execute(req.params.id);
        return sendSuccess(res, branch, "Branch retrieved successfully");
    } catch (error) {
        return sendError(res, error.message?.includes("not found") ? 404 : 500, error.message || "Error fetching branch");
    }
};

export const updateBranch = async (req, res) => {
    try {
        const updated = await updateBranchService.execute(req.params.id, req.validatedBody);
        return sendSuccess(res, updated, "Branch updated successfully");
    } catch (error) {
        return sendError(res, error.message?.includes("not found") ? 404 : 400, error.message || "Error updating branch");
    }
};

export const deleteBranch = async (req, res) => {
    try {
        await deleteBranchService.execute(req.params.id);
        return sendSuccess(res, null, "Branch deleted successfully");
    } catch (error) {
        return sendError(res, error.message?.includes("not found") ? 404 : 400, error.message || "Error deleting branch");
    }
};

export const toggleBranchStatus = async (req, res) => {
    try {
        const updated = await toggleBranchStatusService.execute(req.params.id);
        return sendSuccess(res, updated, "Branch status toggled successfully");
    } catch (error) {
        return sendError(res, error.message?.includes("not found") ? 404 : 500, error.message || "Error toggling branch status");
    }
};
