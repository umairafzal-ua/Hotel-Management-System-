import Booking from "../models/Booking.js";

export const createBooking = async (bookingData, session = null) => {
    const booking = new Booking(bookingData);
    return await booking.save({ session });
};

export const getBookingById = async (id, session = null) => {
    return await Booking.findById(id)
        .populate("room", "roomNumber type capacity status genderRestriction sharedOccupancyPolicy branch")
        .session(session);
};

export const getBookingByIdRaw = async (id, session = null) => {
    return await Booking.findById(id).session(session);
};

export const getOverlappingConfirmedBookings = async (roomId, checkInDate, checkOutDate, excludeBookingId = null, session = null) => {
    const query = {
        room: roomId,
        status: "confirmed",
        checkInDate: { $lt: checkOutDate },
        checkOutDate: { $gt: checkInDate },
    };

    if (excludeBookingId) {
        query._id = { $ne: excludeBookingId };
    }

    return await Booking.find(query).session(session);
};

export const getCurrentConfirmedBookings = async (roomId, session = null) => {
    const now = new Date();
    return await Booking.find({
        room: roomId,
        status: "confirmed",
        checkInDate: { $lte: now },
        checkOutDate: { $gt: now },
    }).session(session);
};

export const listBookings = async (filters = {}, page = 1, per_page = 10) => {
    const skip = (page - 1) * per_page;

    const query = {};
    if (filters.branchId) query.branch = filters.branchId;
    if (filters.roomId) query.room = filters.roomId;
    if (filters.status) query.status = filters.status;
    if (filters.search) {
        const q = String(filters.search).trim();
        if (q) {
            query.$or = [
                { "customer.name": { $regex: q, $options: "i" } },
                { "customer.email": { $regex: q, $options: "i" } },
                { "customer.phone": { $regex: q, $options: "i" } },
            ];
        }
    }

    if (filters.fromDate || filters.toDate) {
        query.checkInDate = {};
        if (filters.fromDate) query.checkInDate.$gte = filters.fromDate;
        if (filters.toDate) query.checkInDate.$lte = filters.toDate;
    }

    const [data, total_items] = await Promise.all([
        Booking.find(query)
            .populate("room", "roomNumber type capacity status genderRestriction sharedOccupancyPolicy")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(per_page),
        Booking.countDocuments(query),
    ]);

    return {
        page,
        per_page,
        total_items,
        total_pages: Math.ceil(total_items / per_page),
        has_more_pages: page < Math.ceil(total_items / per_page),
        data,
    };
};

export const updateBookingById = async (id, updateData, session = null) => {
    return await Booking.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true, session }
    ).populate("room", "roomNumber type capacity status genderRestriction sharedOccupancyPolicy branch");
};

export const aggregateOccupiedSlots = async (roomIds, checkInDate, checkOutDate) => {
    const rows = await Booking.aggregate([
        {
            $match: {
                room: { $in: roomIds },
                status: "confirmed",
                checkInDate: { $lt: checkOutDate },
                checkOutDate: { $gt: checkInDate },
            },
        },
        {
            $group: {
                _id: "$room",
                occupiedSlots: { $sum: "$allocatedSlots" },
            },
        },
    ]);

    const occupiedMap = new Map();
    for (const row of rows) {
        occupiedMap.set(String(row._id), row.occupiedSlots || 0);
    }

    return occupiedMap;
};
