import * as amenityRepository from "../../repositories/AmenityRepository.js";

class GetAmenityByIdService {
    async execute(id) {
        if (!id) throw new Error("Amenity ID is required");
        const amenity = await amenityRepository.getAmenityById(id);
        if (!amenity) throw new Error("Amenity not found");
        return amenity;
    }
}

export default new GetAmenityByIdService();
