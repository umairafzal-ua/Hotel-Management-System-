import Room from "../models/Room.js";

export const createRoom = async (roomData) => {
    const room = new Room(roomData);
    const saved = await room.save();
    return await Room.findById(saved._id).populate("amenities");
};

export const bulkCreateRooms = async (roomsArray) => {
    return await Room.insertMany(roomsArray);
};

export const getAllActiveRooms = async (branchId, skip = 0, limit = 10) => {
    if (skip === undefined && limit === undefined) {
        return await Room.find({ branch: branchId, isActive: true })
            .populate("amenities")
            .sort({ floor: 1, roomNumber: 1 });
    }
    return await Room.find({ branch: branchId, isActive: true })
        .populate("amenities")
        .sort({ floor: 1, roomNumber: 1 })
        .skip(skip)
        .limit(limit);
};

export const countActiveRooms = async (branchId) => {
    return await Room.countDocuments({ branch: branchId, isActive: true });
};

export const getRoomById = async (id) => {
    return await Room.findOne({ _id: id, isActive: true }).populate("amenities").populate("branch");
};

export const getRoomByIdIncludingInactive = async (id) => {
    return await Room.findById(id).populate("amenities");
};

export const getRoomByRoomNumber = async (roomNumber, branchId) => {
    return await Room.findOne({ roomNumber, branch: branchId });
};

export const updateRoom = async (id, updateData) => {
    return await Room.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
    ).populate("amenities");
};

export const softDeleteRoom = async (id) => {
    const room = await Room.findOne({ _id: id, isActive: true });
    if (!room) {
        throw new Error("Room not found");
    }
    room.isActive = !room.isActive;
    const saved = await room.save();
    return await Room.findById(saved._id).populate("amenities");
};

export const hardDeleteRoom = async (id) => {
    return await Room.findByIdAndDelete(id);
};

export const toggleRoomActive = async (id) => {
    const room = await Room.findById(id);
    if (!room) {
        throw new Error("Room not found");
    }
    room.isActive = !room.isActive;
    const saved = await room.save();
    return await Room.findById(saved._id).populate("amenities");
};

export const findAvailableRoomsByType = async (branchId, roomType) => {
    return await Room.find({
        branch: branchId,
        type: roomType,
        status: "available",
        isActive: true,
    }).populate("amenities").sort({ floor: 1, roomNumber: 1 });
};

export const updateRoomStatus = async (id, status) => {
    const room = await Room.findOne({ _id: id, isActive: true });
    if (!room) {
        throw new Error("Room not found");
    }
    room.status = status;
    const saved = await room.save();
    return await Room.findById(saved._id).populate("amenities");
};

export const getRoomsByBranchAndStatus = async (branchId, status, skip = 0, limit = 10) => {
    return await Room.find({ branch: branchId, status, isActive: true })
        .populate("amenities")
        .sort({ floor: 1, roomNumber: 1 })
        .skip(skip)
        .limit(limit);
};

export const getRoomsByBranchAndType = async (branchId, type, skip = 0, limit = 10) => {
    return await Room.find({ branch: branchId, type, isActive: true })
        .populate("amenities")
        .sort({ floor: 1, roomNumber: 1 })
        .skip(skip)
        .limit(limit);
};

export const getAllPublicRooms = async (skip = 0, limit = 10) => {
    return await Room.find({ isActive: true })
        .populate("amenities")
        .populate("branch")
        .sort({ floor: 1, roomNumber: 1 })
        .skip(skip)
        .limit(limit);
};

export const countPublicRooms = async () => {
    return await Room.countDocuments({ isActive: true });
};
