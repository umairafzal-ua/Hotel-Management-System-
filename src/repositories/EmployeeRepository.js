import Employee from "../models/Employee.js";

const userPopulate = {
    path: "user",
    select: "_id fullName email phoneNumber role",
    populate: { path: "role", select: "_id name slug label" },
};

export const assignEmployee = async (employeeData) => {
    const employee = new Employee(employeeData);
    const saved = await employee.save();
    return await Employee.findById(saved._id)
        .populate(userPopulate)
        .populate("branch", "_id name location distanceFromHaram isActive")
        .lean();
};

export const getActiveEmployeeByUserId = async (userId) => {
    return await Employee.findActiveByUserId(userId);
};

/** Any employee row for user (for login / refresh gates). */
export const getEmployeeGateByUserId = async (userId) => {
    return await Employee.findOne({ user: userId })
        .select("isActive loginAllowed branch")
        .lean();
};

export const getEmployeeById = async (id) => {
    return await Employee.findById(id)
        .populate(userPopulate)
        .populate("branch", "_id name location distanceFromHaram isActive")
        .lean();
};

export const getEmployeeByUserId = async (userId) => {
    return await Employee.findOne({ user: userId, isActive: true })
        .populate(userPopulate)
        .populate("branch", "_id name location distanceFromHaram isActive")
        .lean();
};

export const getAllActiveEmployees = async (skip = 0, per_page = 10, branchId = null) => {
    const filter = { isActive: true };
    if (branchId) {
        filter.branch = branchId;
    }

    if (skip === undefined && per_page === undefined) {
        return await Employee.find(filter)
            .populate(userPopulate)
            .populate("branch", "_id name location distanceFromHaram isActive")
            .sort({ createdAt: -1 })
            .lean();
    }

    return await Employee.find(filter)
        .populate(userPopulate)
        .populate("branch", "_id name location distanceFromHaram isActive")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(per_page)
        .lean();
};

export const countActiveEmployees = async (branchId = null) => {
    const filter = { isActive: true };
    if (branchId) {
        filter.branch = branchId;
    }
    return await Employee.countDocuments(filter);
};

export const updateEmployee = async (id, updateData) => {
    return await Employee.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
    )
        .populate(userPopulate)
        .populate("branch", "_id name location distanceFromHaram isActive")
        .lean();
};

export const removeEmployee = async (id) => {
    return await Employee.findByIdAndDelete(id);
};

export const deactivateEmployeeByUserId = async (userId) => {
    return await Employee.findOneAndUpdate(
        { user: userId },
        { $set: { isActive: false } },
        { new: true }
    );
};

export const countActiveEmployeesByBranch = async (branchId) => {
    return await Employee.countDocuments({ branch: branchId, isActive: true });
};
