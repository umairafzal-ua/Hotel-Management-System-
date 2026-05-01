import Room from "../../models/Room.js";
import { aggregateOccupiedSlots } from "../../repositories/BookingRepository.js";
import {
    calculateRequestedSlots,
    parseDateRange,
    validateGenderRestriction,
    validateSharedPolicy,
    validateParty,
} from "../booking/BookingRules.js";

// Format room availability response: keep only essential fields
const formatAvailableRoom = (roomData, availableSlots, occupiedSlots, requestedSlots, checkInDate, checkOutDate) => {
    return {
        _id: roomData._id,
        roomNumber: roomData.roomNumber,
        type: roomData.type,
        floor: roomData.floor,
        capacity: roomData.capacity,
        basePrice: roomData.basePrice,
        amenities: roomData.amenities,
        image: roomData.image,
        status: roomData.status,
        availableSlots,
        occupiedSlots,
        requestedSlots,
        canBook: true,
        checkInDate,
        checkOutDate,
    };
};

class CheckAvailabilityService {
    async execute(
        branchId,
        roomType,
        capacity = null,
        page = 1,
        per_page = 10,
        checkInDate,
        checkOutDate,
        partyType = "individual",
        guestCount = 1,
        gender = "mixed"
    ) {
        if (!branchId) {
            throw new Error("Branch ID is required");
        }

        if (page < 1 || per_page < 1) {
            throw new Error("Page and per_page must be greater than 0");
        }

        validateParty(partyType, guestCount);

        const now = new Date();
        const dateRange = (checkInDate && checkOutDate)
            ? parseDateRange(checkInDate, checkOutDate)
            : { checkIn: now, checkOut: new Date(now.getTime() + 24 * 60 * 60 * 1000) };

        const roomQuery = {
            branch: branchId,
            isActive: true,
            status: { $nin: ["maintenance", "cleaning"] },
        };

        if (roomType) {
            roomQuery.type = roomType;
        }

        const rooms = await Room.find(roomQuery)
            .select("_id roomNumber type floor capacity basePrice amenities image status genderRestriction sharedOccupancyPolicy")
            .populate("amenities")
            .populate("branch")
            .sort({ floor: 1, roomNumber: 1 })
            .lean();

        const roomIds = rooms.map((room) => room._id);
        const occupiedMap = roomIds.length
            ? await aggregateOccupiedSlots(roomIds, dateRange.checkIn, dateRange.checkOut)
            : new Map();

        const filtered = [];

        for (const room of rooms) {
            try {
                validateGenderRestriction(room, partyType, gender);
                validateSharedPolicy(room, partyType);
            } catch {
                continue;
            }

            const occupiedSlots = occupiedMap.get(String(room._id)) || 0;
            const availableSlots = Math.max(room.capacity - occupiedSlots, 0);

            let requiredSlots;
            try {
                requiredSlots = calculateRequestedSlots(room, partyType, guestCount);
            } catch {
                continue;
            }

            if (capacity && room.capacity < capacity) {
                continue;
            }

            if (requiredSlots <= availableSlots) {
                filtered.push(
                    formatAvailableRoom(
                        room,
                        availableSlots,
                        occupiedSlots,
                        requiredSlots,
                        dateRange.checkIn,
                        dateRange.checkOut
                    )
                );
            }
        }

        const skip = (page - 1) * per_page;
        const total_items = filtered.length;
        const data = filtered.slice(skip, skip + per_page);

        return {
            page,
            per_page,
            total_items,
            total_pages: Math.ceil(total_items / per_page),
            has_more_pages: page < Math.ceil(total_items / per_page),
            data,
        };
    }
}

export default new CheckAvailabilityService();
