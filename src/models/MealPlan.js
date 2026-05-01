import mongoose from "mongoose";

const mealTimeWindowSchema = new mongoose.Schema(
    {
        start: { type: String, default: "" }, // e.g. "06:30"
        end: { type: String, default: "" },   // e.g. "10:00"
    },
    { _id: false }
);

const mealPlanMealSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            enum: ["breakfast", "lunch", "dinner"],
            required: true,
        },
        enabled: { type: Boolean, default: true },
        defaultTimeWindow: { type: mealTimeWindowSchema, default: () => ({}) },
        defaultMenuId: { type: mongoose.Schema.Types.ObjectId, ref: "Menu", default: null },
    },
    { _id: false }
);

const mealPlanSchema = new mongoose.Schema(
    {
        branchId: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", default: null, index: true },
        name: { type: String, required: true, trim: true },
        isActive: { type: Boolean, default: true, index: true },
        unitMode: { type: String, enum: ["per_person", "per_room", "hybrid"], default: "hybrid" },
        meals: { type: [mealPlanMealSchema], default: () => ([]) },
        rules: { type: mongoose.Schema.Types.Mixed, default: {} },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    },
    { timestamps: true }
);

mealPlanSchema.index({ branchId: 1, isActive: 1 });
mealPlanSchema.index({ name: 1, branchId: 1 });

const MealPlan = mongoose.model("MealPlan", mealPlanSchema);
export default MealPlan;

