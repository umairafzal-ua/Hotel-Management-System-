import { sendCreated, sendError, sendPaginated, sendSuccess } from "../utils/apiResponse.js";
import { isAdminAuthUser } from "../utils/authUser.js";
import assignEmployeeService from "../services/employee/AssignEmployeeService.js";
import getEmployeesService from "../services/employee/GetEmployeesService.js";
import getEmployeeByIdService from "../services/employee/GetEmployeeByIdService.js";
import updateEmployeeService from "../services/employee/UpdateEmployeeService.js";
import removeEmployeeService from "../services/employee/RemoveEmployeeService.js";
import getEmployeesByBranchService from "../services/employee/GetEmployeesByBranchService.js";
import createEmployeeWithUserService from "../services/employee/CreateEmployeeWithUserService.js";

export const createEmployeeWithUser = async (req, res) => {
    try {
        const result = await createEmployeeWithUserService.execute(req.validatedBody);
        return sendCreated(res, result, "Employee and user created successfully. Password reset email sent.");
    } catch (error) {
        return sendError(res, error.statusCode || 400, error.message || "Error creating employee with user");
    }
};

export const assignEmployee = async (req, res) => {
    try {
        const employee = await assignEmployeeService.execute(req.validatedBody);
        return sendCreated(res, employee, "Employee assigned successfully");
    } catch (error) {
        return sendError(res, 400, error.message || "Error assigning employee");
    }
};

export const getAllEmployees = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const per_page = parseInt(req.query.per_page || req.query.limit) || 10;
        if (page < 1 || per_page < 1) {
            return sendError(res, 400, "Page and per_page must be greater than 0");
        }

        const isAdmin = isAdminAuthUser(req.user);
        const scopedBranchId = isAdmin ? null : (req.user?.branchId || null);

        const result = await getEmployeesService.execute(page, per_page, scopedBranchId);
        return sendPaginated(res, result.data, result, "Employees fetched successfully");
    } catch (error) {
        return sendError(res, 500, error.message || "Error fetching employees");
    }
};

export const getEmployeeById = async (req, res) => {
    try {
        const employee = await getEmployeeByIdService.execute(req.params.id);
        return sendSuccess(res, employee, "Employee retrieved successfully");
    } catch (error) {
        return sendError(res, error.message?.includes("not found") ? 404 : 500, error.message || "Error fetching employee");
    }
};

export const updateEmployee = async (req, res) => {
    try {
        const updated = await updateEmployeeService.execute(req.params.id, req.validatedBody);
        return sendSuccess(res, updated, "Employee updated successfully");
    } catch (error) {
        return sendError(res, error.message?.includes("not found") ? 404 : 400, error.message || "Error updating employee");
    }
};

export const removeEmployee = async (req, res) => {
    try {
        await removeEmployeeService.execute(req.params.id);
        return sendSuccess(res, null, "Employee removed successfully");
    } catch (error) {
        return sendError(res, error.message?.includes("not found") ? 404 : 500, error.message || "Error removing employee");
    }
};

export const getEmployeesByBranch = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const per_page = parseInt(req.query.per_page) || 10;
        if (page < 1 || per_page < 1) {
            return sendError(res, 400, "Page and per_page must be greater than 0");
        }

        const result = await getEmployeesByBranchService.execute(req.params.branchId, page, per_page);
        return sendPaginated(res, result.data, result, "Employees fetched successfully");
    } catch (error) {
        return sendError(res, 500, error.message || "Error fetching employees");
    }
};
