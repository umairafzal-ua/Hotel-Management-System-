import mongoose from "mongoose";

const amenitySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Amenity name is required"],
            trim: true,
        },
        description: {
            type: String,
            default: "",
            trim: true,
        },
        price: {
            type: Number,
            default: 0,
            min: [0, "Price cannot be negative"],
        },
        branch: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Branch",
            default: null,
            index: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Compound indexes
amenitySchema.index({ name: 1, branch: 1 }, { unique: true });
amenitySchema.index({ branch: 1, isActive: 1 });

const Amenity = mongoose.model("Amenity", amenitySchema);
export default Amenity;
