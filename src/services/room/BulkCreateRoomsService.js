import * as roomRepository from "../../repositories/RoomRepository.js";

class BulkCreateRoomsService {
    async execute(roomsArray, branchId) {
        if (!roomsArray || roomsArray.length === 0) {
            throw new Error("No rooms provided for bulk creation");
        }

        // Check for duplicate room numbers within the request
        const roomNumbers = roomsArray.map((r) => r.roomNumber);
        const duplicates = roomNumbers.filter((num, index) => roomNumbers.indexOf(num) !== index);
        
        if (duplicates.length > 0) {
            throw new Error(`Duplicate room numbers found: ${duplicates.join(", ")}`);
        }

        // Check if any room numbers already exist in this branch
        const existingRooms = [];
        for (const room of roomsArray) {
            const existing = await roomRepository.getRoomByRoomNumber(room.roomNumber, branchId);
            if (existing) {
                existingRooms.push(room.roomNumber);
            }
        }

        if (existingRooms.length > 0) {
            throw new Error(`Room numbers already exist: ${existingRooms.join(", ")}`);
        }

        // Prepare rooms for insertion
        const roomsToInsert = roomsArray.map((room) => ({
            roomNumber: room.roomNumber,
            type: room.type,
            branch: branchId,
            floor: room.floor,
            capacity: room.capacity,
            basePrice: room.basePrice,
            amenities: room.amenities || [],
            status: room.status || "available",
            genderRestriction: room.genderRestriction || "unrestricted",
            sharedOccupancyPolicy: room.sharedOccupancyPolicy || "mixed",
            isActive: room.isActive !== false,
        }));

        // Bulk insert
        return await roomRepository.bulkCreateRooms(roomsToInsert);
    }
}

export default new BulkCreateRoomsService();
