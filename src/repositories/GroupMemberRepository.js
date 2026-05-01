import GroupMember from "../models/GroupMember.js";

// Format member response: exclude null/unassigned fields and version metadata
const formatMember = (member) => {
    const formatted = {
        _id: member._id,
        fullName: member.fullName,
        gender: member.gender,
    };

    // Only include optional fields if they have values
    if (member.passportNo) {
        formatted.passportNo = member.passportNo;
    }
    if (member.phone) {
        formatted.phone = member.phone;
    }

    // Only include assignment details if actually assigned
    if (member.assignmentStatus === "assigned") {
        formatted.assignmentStatus = "assigned";
        if (member.assignedRoom) {
            formatted.assignedRoom = {
                _id: member.assignedRoom._id,
                roomNumber: member.assignedRoom.roomNumber,
                type: member.assignedRoom.type,
                floor: member.assignedRoom.floor,
            };
        }
        if (member.assignedBooking) {
            formatted.assignedBooking = {
                _id: member.assignedBooking._id,
                allocatedSlots: member.assignedBooking.allocatedSlots,
            };
        }
    }

    return formatted;
};

export const bulkInsertMembers = async (membersArray, session = null) => {
    return await GroupMember.insertMany(membersArray, { session });
};

export const getMembersByGroupBooking = async (groupBookingId) => {
    const members = await GroupMember.find({ groupBooking: groupBookingId })
        .select("_id fullName gender passportNo phone assignmentStatus assignedRoom assignedBooking")
        .populate("assignedRoom", "_id roomNumber type floor")
        .populate("assignedBooking", "_id allocatedSlots")
        .sort({ createdAt: 1 })
        .lean();
    return members.map(formatMember);
};

export const getMemberById = async (id, session = null) => {
    return await GroupMember.findById(id).session(session);
};

export const countMembersByGroup = async (groupBookingId, session = null) => {
    return await GroupMember.countDocuments({ groupBooking: groupBookingId }).session(session);
};

export const countAssignedMembersByBooking = async (bookingId, session = null) => {
    return await GroupMember.countDocuments({
        assignedBooking: bookingId,
        assignmentStatus: "assigned",
    }).session(session);
};

export const updateMemberAssignment = async (memberId, bookingId, roomId, session = null) => {
    return await GroupMember.findByIdAndUpdate(
        memberId,
        {
            $set: {
                assignedBooking: bookingId,
                assignedRoom: roomId,
                assignmentStatus: "assigned",
            },
        },
        { new: true, runValidators: true, session }
    );
};

export const unassignMembersByGroup = async (groupBookingId, session = null) => {
    return await GroupMember.updateMany(
        { groupBooking: groupBookingId },
        {
            $set: {
                assignedBooking: null,
                assignedRoom: null,
                assignmentStatus: "unassigned",
            },
        },
        { session }
    );
};

export const deleteByGroupBooking = async (groupBookingId, session = null) => {
    return await GroupMember.deleteMany({ groupBooking: groupBookingId }, { session });
};
