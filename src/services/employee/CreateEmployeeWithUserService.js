import { userRepository } from "../../repositories/UserRepository.js";
import { assignEmployee } from "../../repositories/EmployeeRepository.js";
import { getBranchById } from "../../repositories/BranchRepository.js";
import crypto from "crypto";
import Role from "../../models/Role.js";
import { ApiError, HttpStatus } from "../../utils/apiResponse.js";
import { queueEmployeeCredentialsEmail } from "../../queues/EmailQueue.js";

class CreateEmployeeWithUserService {
    async execute(data) {
        // Check if email already exists
        const emailAlreadyExists = await userRepository.emailExists(data.email);
        if (emailAlreadyExists) {
            throw new ApiError(HttpStatus.BAD_REQUEST, "Email already registered");
        }

        // Check if branch exists and is active
        const branch = await getBranchById(data.branchId);
        if (!branch) {
            throw new ApiError(HttpStatus.NOT_FOUND, "Branch not found or is inactive");
        }

        // Check if role exists
        const role = await Role.findById(data.roleId);
        if (!role) {
            throw new ApiError(HttpStatus.NOT_FOUND, "Role not found");
        }

        try {
            const tempPassword = this.generateTempPassword();

            // Create user with temporary password
            const userData = {
                fullName: data.fullName,
                email: data.email,
                phoneNumber: data.phoneNumber,
                password: tempPassword,
                role: data.roleId,
                isActive: true,
                isEmailVerified: false,
                isTemporaryPassword: true,
                agreeToTerms: true, // Admin is creating, assume they agree
            };

            const user = await userRepository.create(userData);

            // Create employee record linking user to branch
            const employeeData = {
                user: user._id,
                branch: data.branchId,
                position: data.position,
                department: data.department,
                shift: data.shift,
                isActive: true,
                loginAllowed: data.loginAllowed ?? true,
            };

            const employee = await assignEmployee(employeeData);

            // Send credentials email with temporary password
            await queueEmployeeCredentialsEmail(user.email, user.fullName, tempPassword);

            return {
                userId: user._id,
                employeeId: employee._id,
                fullName: user.fullName,
                email: user.email,
                phoneNumber: user.phoneNumber,
                branch: employee.branch,
                position: employee.position,
                department: employee.department,
                shift: employee.shift,
                role: employee.user.role,
                status: "Employee created successfully. Credentials email has been sent.",
            };
        } catch (error) {
            // If error is already ApiError, re-throw it
            if (error instanceof ApiError) {
                throw error;
            }
            console.error("Error in CreateEmployeeWithUserService:", error);
            throw new ApiError(
                HttpStatus.INTERNAL_SERVER_ERROR,
                error.message || "Failed to create employee with user"
            );
        }
    }

    generateTempPassword() {
        const raw = crypto.randomBytes(12).toString("base64");
        const cleaned = raw.replace(/[^A-Za-z0-9]/g, "");
        const base = cleaned.length >= 10 ? cleaned.slice(0, 10) : cleaned.padEnd(10, "A");
        return `${base}A1`;
    }
}

export default new CreateEmployeeWithUserService();
