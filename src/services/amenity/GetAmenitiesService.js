import * as amenityRepository from "../../repositories/AmenityRepository.js";

class GetAmenitiesService {
    async execute(page = 1, per_page = 10, branchId) {
        if (!branchId) {
            throw new Error("Branch ID is required");
        }

        const skip = (page - 1) * per_page;
        const total_items = await amenityRepository.countActiveAmenities(branchId);
        const amenities = await amenityRepository.getAllActiveAmenities(branchId, skip, per_page);

        return {
            page,
            per_page,
            total_items,
            total_pages: Math.ceil(total_items / per_page),
            has_more_pages: page < Math.ceil(total_items / per_page),
            data: amenities,
        };
    }
}

export default new GetAmenitiesService();
