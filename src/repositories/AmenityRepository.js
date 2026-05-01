import Amenity from "../models/Amenity.js";

const buildAmenityScopeQuery = (branchId) => {
    const branchClauses = [];

    if (branchId !== undefined && branchId !== null && branchId !== "") {
        branchClauses.push({ branch: branchId });
    }

    branchClauses.push({ branch: null });

    return { isActive: true, $or: branchClauses };
};

export const createAmenity = async (data) => {
    const amenity = new Amenity(data);
    return await amenity.save();
};

export const getAllActiveAmenities = async (branchId, skip = 0, limit = 10) => {
    return await Amenity.find(buildAmenityScopeQuery(branchId))
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit);
};

export const countActiveAmenities = async (branchId) => {
    return await Amenity.countDocuments(buildAmenityScopeQuery(branchId));
};

export const getAmenityById = async (id) => {
    return await Amenity.findOne({ _id: id, isActive: true });
};

export const getAmenityByIdIncludingInactive = async (id) => {
    return await Amenity.findById(id);
};

export const getAmenityByName = async (name, branchId) => {
    return await Amenity.findOne({ name, branch: branchId ?? null });
};

export const updateAmenity = async (id, updateData) => {
    return await Amenity.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
    );
};

export const deleteAmenity = async (id) => {
    return await Amenity.findByIdAndDelete(id);
};

export const getAmenitiesByIds = async (ids) => {
    return await Amenity.find({ _id: { $in: ids }, isActive: true });
};
