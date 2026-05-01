import * as roomRepository from "../../repositories/RoomRepository.js";
import { deleteFromCloudinary } from "../../utils/cloudinaryUpload.js";

class UpdateRoomService {
    async execute(id, updateData) {
        if (!id) {
            throw new Error("Room ID is required");
        }

        // Get existing room to validate
        const existingRoom = await roomRepository.getRoomByIdIncludingInactive(id);
        
        if (!existingRoom) {
            throw new Error("Room not found");
        }

        // Prepare update data
        const dataToUpdate = {};
        
        if (updateData.roomNumber !== undefined) {
            dataToUpdate.roomNumber = updateData.roomNumber;
        }
        if (updateData.type !== undefined) {
            dataToUpdate.type = updateData.type;
        }
        if (updateData.floor !== undefined) {
            dataToUpdate.floor = updateData.floor;
        }
        if (updateData.capacity !== undefined) {
            dataToUpdate.capacity = updateData.capacity;
        }
        if (updateData.basePrice !== undefined) {
            dataToUpdate.basePrice = updateData.basePrice;
        }
        if (updateData.amenities !== undefined) {
            dataToUpdate.amenities = updateData.amenities;
        }
        if (updateData.image !== undefined) {
            // Delete old image from Cloudinary if it exists
            if (existingRoom.image?.publicId) {
                await deleteFromCloudinary(existingRoom.image.publicId);
            }
            dataToUpdate.image = updateData.image;
        }
        if (updateData.status !== undefined) {
            dataToUpdate.status = updateData.status;
        }
        if (updateData.genderRestriction !== undefined) {
            dataToUpdate.genderRestriction = updateData.genderRestriction;
        }
        if (updateData.sharedOccupancyPolicy !== undefined) {
            dataToUpdate.sharedOccupancyPolicy = updateData.sharedOccupancyPolicy;
        }
        if (updateData.isActive !== undefined) {
            dataToUpdate.isActive = updateData.isActive;
        }

        // Update the room
        return await roomRepository.updateRoom(id, dataToUpdate);
    }
}

export default new UpdateRoomService();
