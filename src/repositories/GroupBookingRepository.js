import GroupBooking from "../models/GroupBooking.js";

export const createGroupBooking = async (data, session = null) => {
    const group = new GroupBooking(data);
    return await group.save({ session });
};

export const getGroupBookingById = async (id, session = null) => {
    return await GroupBooking.findById(id)
        .populate("branch", "name location distanceFromHaram isActive")
        .populate("groupLeader", "fullName email phoneNumber")
        .populate({
            path: "allocatedBookings",
            populate: {
                path: "room",
                select: "roomNumber type capacity floor basePrice status",
            },
        })
        .session(session);
};

export const getGroupBookingByIdRaw = async (id, session = null) => {
    return await GroupBooking.findById(id).session(session);
};

export const listGroupBookings = async (filters = {}, page = 1, perPage = 10) => {
    const skip = (page - 1) * perPage;
    const query = {};

    if (filters.branchId) query.branch = filters.branchId;
    if (filters.status) query.status = filters.status;
    if (filters.groupLeader) query.groupLeader = filters.groupLeader;

    if (filters.fromDate || filters.toDate) {
        query.checkInDate = {};
        if (filters.fromDate) query.checkInDate.$gte = new Date(filters.fromDate);
        if (filters.toDate) query.checkInDate.$lte = new Date(filters.toDate);
    }

    const [data, totalItems] = await Promise.all([
        GroupBooking.find(query)
            .populate("branch", "name location")
            .populate("groupLeader", "fullName email")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(perPage),
        GroupBooking.countDocuments(query),
    ]);

    return {
        page,
        per_page: perPage,
        total_items: totalItems,
        total_pages: Math.ceil(totalItems / perPage),
        has_more_pages: page < Math.ceil(totalItems / perPage),
        data,
    };
};

export const updateGroupBookingById = async (id, data, session = null) => {
    return await GroupBooking.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true, runValidators: true, session }
    );
};

export const pushAllocatedBookings = async (id, bookingIds, session = null) => {
    return await GroupBooking.findByIdAndUpdate(
        id,
        { $push: { allocatedBookings: { $each: bookingIds } } },
        { new: true, session }
    );
};
