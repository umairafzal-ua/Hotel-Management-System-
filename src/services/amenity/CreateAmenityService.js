import * as amenityRepository from "../../repositories/AmenityRepository.js";

class CreateAmenityService {
    async execute(data) {
        const branchId = data.branchId ?? null;
        const existing = await amenityRepository.getAmenityByName(data.name, branchId);
        if (existing) {
            throw new Error(`Amenity "${data.name}" already exists in this branch`);
        }

        return await amenityRepository.createAmenity({
            name: data.name,
            description: data.description || "",
            price: data.price,
            branch: branchId,
            isActive: data.isActive !== false,
        });
    }
}

export default new CreateAmenityService();
