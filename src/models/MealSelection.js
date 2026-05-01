import mongoose from "mongoose";

const mealSelectionMealSchema = new mongoose.Schema(
    {
        enabled: { type: Boolean, default: false },
        quantityOverride: { type: Number, default: null },
        scheduleOverride: {
            start: { type: String, default: "" },
            end: { type: String, default: "" },
        },
    },
    { _id: false }
);

const mealSelectionSchema = new mongoose.Schema(
    {
        bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true, unique: true, index: true },
        scope: { type: String, enum: ["booking", "groupBooking"], default: "booking" },
        mealPlanId: { type: mongoose.Schema.Types.ObjectId, ref: "MealPlan", default: null },
        unitMode: { type: String, enum: ["per_person", "per_room", "hybrid"], default: "hybrid" },
        meals: {
            breakfast: { type: mealSelectionMealSchema, default: () => ({}) },
            lunch: { type: mealSelectionMealSchema, default: () => ({}) },
            dinner: { type: mealSelectionMealSchema, default: () => ({}) },
        },
        preferences: {
            diet: { type: String, enum: ["veg", "non_veg", "unspecified"], default: "unspecified" },
            spiceLevel: { type: String, enum: ["mild", "medium", "hot", "unspecified"], default: "unspecified" },
            allergies: { type: [String], default: () => ([]) },
            religiousNotes: { type: String, default: "", trim: true },
            notes: { type: String, default: "", trim: true },
        },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    },
    { timestamps: true }
);

const MealSelection = mongoose.model("MealSelection", mealSelectionSchema);
export default MealSelection;

