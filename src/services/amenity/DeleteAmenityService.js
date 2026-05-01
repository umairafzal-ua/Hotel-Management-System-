import * as amenityRepository from "../../repositories/AmenityRepository.js";

class DeleteAmenityService {
    async execute(id) {
        if (!id) throw new Error("Amenity ID is required");

        const existing = await amenityRepository.getAmenityByIdIncludingInactive(id);
        if (!existing) throw new Error("Amenity not found");

        return await amenityRepository.deleteAmenity(id);
    }
}

export default new DeleteAmenityService();
