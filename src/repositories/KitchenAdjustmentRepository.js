import KitchenAdjustment from "../models/KitchenAdjustment.js";

export const createAdjustment = async (data) => {
    return await KitchenAdjustment.create(data);
};

export const listAdjustments = async ({ branchId, date }) => {
    const query = {};
    if (branchId) query.branchId = branchId;
    if (date) query.date = date;
    return await KitchenAdjustment.find(query).sort({ createdAt: -1 });
};

export const sumAdjustmentsByMealType = async ({ branchId, date }) => {
    const rows = await KitchenAdjustment.aggregate([
        { $match: { branchId, date } },
        { $group: { _id: "$mealType", totalDelta: { $sum: "$deltaQuantity" } } },
    ]);
    const map = { breakfast: 0, lunch: 0, dinner: 0 };
    for (const r of rows) {
        if (r._id && map[r._id] !== undefined) map[r._id] = r.totalDelta || 0;
    }
    return map;
};

