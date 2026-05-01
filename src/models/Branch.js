import mongoose from "mongoose";

const branchSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Branch name is required"],
            trim: true,
            unique: true,
        },
        location: {
            address: {
                type: String,
                default: "",
            },
            city: {
                type: String,
                default: "Makkah",
                trim: true,
            },
            coordinates: {
                lat: {
                    type: Number,
                    default: null,
                },
                lng: {
                    type: Number,
                    default: null,
                },
            },
        },
        distanceFromHaram: {
            type: Number,
            required: [true, "distanceFromHaram is required"],
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

branchSchema.index({ isActive: 1 });
branchSchema.index({ "location.city": 1 });

branchSchema.statics.findAllActive = function () {
    return this.find({ isActive: true }).sort({ name: 1 });
};

branchSchema.statics.findByIdActive = function (id) {
    return this.findOne({ _id: id, isActive: true });
};

branchSchema.statics.createBranch = async function (data) {
    const branch = new this(data);
    return await branch.save();
};

branchSchema.statics.updateBranchById = async function (id, updateData) {
    return await this.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
    );
};

branchSchema.statics.softDeleteBranch = async function (id) {
    return await this.findByIdAndUpdate(id, { isActive: false }, { new: true });
};

branchSchema.statics.hardDeleteBranch = async function (id) {
    return await this.deleteOne({ _id: id });
};

branchSchema.methods.toggleActive = async function () {
    this.isActive = !this.isActive;
    return await this.save();
};

const Branch = mongoose.model("Branch", branchSchema);

export default Branch;
