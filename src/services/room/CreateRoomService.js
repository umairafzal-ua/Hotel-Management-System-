import * as roomRepository from "../../repositories/RoomRepository.js";

class CreateRoomService {
    async execute(roomData) {
        // Check if room number already exists for this branch
        const existing = await roomRepository.getRoomByRoomNumber(
            roomData.roomNumber,
            roomData.branchId
        );
        
        if (existing) {
            throw new Error(`Room number ${roomData.roomNumber} already exists in this branch`);
        }

        // Create the room
        return await roomRepository.createRoom({
            roomNumber: roomData.roomNumber,
            type: roomData.type,
            branch: roomData.branchId,
            floor: roomData.floor,
            capacity: roomData.capacity,
            basePrice: roomData.basePrice,
            amenities: roomData.amenities || [],
            image: roomData.image || { url: null, publicId: null },
            status: roomData.status || "available",
            genderRestriction: roomData.genderRestriction || "unrestricted",
            sharedOccupancyPolicy: roomData.sharedOccupancyPolicy || "mixed",
            isActive: roomData.isActive !== false,
        });
    }
}

export default new CreateRoomService();
