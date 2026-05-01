import * as amenityRepository from "../../repositories/AmenityRepository.js";

class UpdateAmenityService {
    async execute(id, updateData) {
        if (!id) throw new Error("Amenity ID is required");

        const existing = await amenityRepository.getAmenityByIdIncludingInactive(id);
        if (!existing) throw new Error("Amenity not found");

        const dataToUpdate = {};
        if (updateData.name !== undefined) dataToUpdate.name = updateData.name;
        if (updateData.description !== undefined) dataToUpdate.description = updateData.description;
        if (updateData.price !== undefined) dataToUpdate.price = updateData.price;
        if (updateData.isActive !== undefined) dataToUpdate.isActive = updateData.isActive;

        return await amenityRepository.updateAmenity(id, dataToUpdate);
    }
}

export default new UpdateAmenityService();
