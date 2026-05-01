import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import { Role, User, Branch, Booking, MealPlan, MealSelection, AddOnService, AddOnSelection, KitchenAdjustment, Amenity } from "../src/models/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "..", ".env") });

function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var ${name}`);
  return v;
}

function toISODate(d) {
  const dt = d instanceof Date ? d : new Date(d);
  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

async function resolveSeedUserId() {
  const adminRole = await Role.findOne({ name: { $regex: /^admin$/i } }).lean();
  if (adminRole?._id) {
    const adminUser = await User.findOne({ role: adminRole._id }).lean();
    if (adminUser?._id) return adminUser._id;
  }

  const anyUser = await User.findOne({}).lean();
  if (anyUser?._id) return anyUser._id;

  throw new Error("No users found. Create an admin user first, then re-run seeding.");
}

async function main() {
  const mongoUri = requireEnv("MONGO_URI");
  console.log("Seeding meals/add-ons/kitchen data...");
  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB");

  const seedUserId = await resolveSeedUserId();
  const branches = await Branch.find({}).sort({ createdAt: 1 }).limit(5).lean();
  if (!branches.length) throw new Error("No branches found. Create a branch first, then re-run seeding.");

  const primaryBranchId = branches[0]._id;
  const secondaryBranchId = branches[1]?._id || null;
  const branchStandardPlanBranchId = secondaryBranchId || primaryBranchId;

  const mealPlansToEnsure = [
    {
      branchId: null,
      name: "Standard Meals (Global)",
      isActive: false,
      unitMode: "per_person",
      meals: [
        { type: "breakfast", enabled: true, defaultTimeWindow: {} },
        { type: "lunch", enabled: false, defaultTimeWindow: {} },
        { type: "dinner", enabled: false, defaultTimeWindow: {} },
      ],
      rules: {},
    },
    {
      branchId: primaryBranchId,
      name: "Branch Premium Plan",
      isActive: false,
      unitMode: "per_person",
      meals: [
        { type: "breakfast", enabled: true, defaultTimeWindow: {} },
        { type: "lunch", enabled: true, defaultTimeWindow: {} },
        { type: "dinner", enabled: true, defaultTimeWindow: {} },
      ],
      rules: {},
    },
    {
      branchId: branchStandardPlanBranchId,
      name: "Branch Standard Plan",
      isActive: true,
      unitMode: "per_person",
      meals: [
        { type: "breakfast", enabled: true, defaultTimeWindow: {} },
        { type: "lunch", enabled: false, defaultTimeWindow: {} },
        { type: "dinner", enabled: false, defaultTimeWindow: {} },
      ],
      rules: {
        standard: true,
        mealType: "breakfast",
        billingType: "perPerson",
        price: 2333,
        description: "",
      },
    },
  ];

  const ensuredMealPlans = [];
  for (const plan of mealPlansToEnsure) {
    const upserted = await MealPlan.findOneAndUpdate(
      { name: plan.name, branchId: plan.branchId ?? null },
      {
        $set: {
          branchId: plan.branchId ?? null,
          name: plan.name,
          isActive: plan.isActive ?? true,
          unitMode: plan.unitMode,
          meals: plan.meals,
          rules: plan.rules || {},
          updatedBy: seedUserId,
        },
        $setOnInsert: {
          createdBy: seedUserId,
        },
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    ensuredMealPlans.push(upserted.toObject());
  }

  const globalAmenitiesToEnsure = [
    {
      branchId: null,
      name: "WiFi",
      description: "High-speed wireless internet access",
      price: 0,
    },
    {
      branchId: null,
      name: "Air Conditioning",
      description: "Climate-controlled rooms for a comfortable stay",
      price: 0,
    },
    {
      branchId: null,
      name: "Hot Water",
      description: "24/7 hot water availability",
      price: 0,
    },
    {
      branchId: null,
      name: "Television",
      description: "In-room entertainment with TV access",
      price: 0,
    },
    {
      branchId: null,
      name: "Housekeeping",
      description: "Regular room cleaning and tidying",
      price: 0,
    },
    {
      branchId: null,
      name: "Prayer Mats",
      description: "Prayer mats available for guests",
      price: 0,
    },
  ];

  const branchAmenityTemplates = [
    {
      name: "Laundry Service",
      description: (branch) => `Pickup and delivery laundry service for ${branch.name}`,
      price: 25,
    },
    {
      name: "Airport Shuttle",
      description: (branch) => `Guest airport transfer for ${branch.name}`,
      price: 120,
    },
    {
      name: "Private Parking",
      description: (branch) => `Reserved parking for guests at ${branch.name}`,
      price: 40,
    },
  ];

  const amenitiesToEnsure = [
    ...globalAmenitiesToEnsure,
    ...branches.flatMap((branch) =>
      branchAmenityTemplates.map((template) => ({
        branchId: branch._id,
        name: template.name,
        description: template.description(branch),
        price: template.price,
      }))
    ),
  ];

  for (const amenity of amenitiesToEnsure) {
    await Amenity.findOneAndUpdate(
      { name: amenity.name, branch: amenity.branchId ?? null },
      {
        $set: {
          branch: amenity.branchId ?? null,
          name: amenity.name,
          description: amenity.description,
          price: amenity.price,
          isActive: true,
        },
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
  }

  const addOnsToEnsure = [
    {
      branchId: null,
      name: "Laundry Service",
      description: "Laundry pickup and delivery",
      pricingModel: "usage_based",
      unitLabel: "kg",
      rate: 15,
      isMandatory: false,
    },
    {
      branchId: null,
      name: "Airport Transportation",
      description: "Pickup/drop-off",
      pricingModel: "fixed",
      unitLabel: "trip",
      price: 120,
      isMandatory: false,
    },
    {
      branchId: primaryBranchId,
      name: "Extra Meal",
      description: "Additional meal serving",
      pricingModel: "fixed",
      unitLabel: "meal",
      price: 25,
      isMandatory: false,
    },
    {
      branchId: primaryBranchId,
      name: "Room Upgrade",
      description: "Upgrade room category (subject to availability)",
      pricingModel: "fixed",
      unitLabel: "upgrade",
      price: 300,
      isMandatory: false,
    },
  ];

  const ensuredAddOns = [];
  for (const addOn of addOnsToEnsure) {
    const existing = await AddOnService.findOne({ name: addOn.name, branchId: addOn.branchId ?? null }).lean();
    if (existing?._id) {
      ensuredAddOns.push(existing);
      continue;
    }
    const created = await AddOnService.create({
      ...addOn,
      isActive: true,
      price: addOn.price ?? 0,
      rate: addOn.rate ?? 0,
      createdBy: seedUserId,
      updatedBy: null,
    });
    ensuredAddOns.push(created.toObject());
  }

  const today = toISODate(new Date());
  const adjustmentsToEnsure = [
    { branchId: primaryBranchId, date: today, mealType: "breakfast", deltaQuantity: 10, reason: "Walk-ins expected" },
    { branchId: primaryBranchId, date: today, mealType: "dinner", deltaQuantity: -5, reason: "Late cancellations" },
  ];
  for (const adj of adjustmentsToEnsure) {
    const exists = await KitchenAdjustment.findOne({
      branchId: adj.branchId,
      date: adj.date,
      mealType: adj.mealType,
      deltaQuantity: adj.deltaQuantity,
      reason: adj.reason,
    }).lean();
    if (!exists?._id) {
      await KitchenAdjustment.create({ ...adj, createdBy: seedUserId });
    }
  }

  // Attach selections to some confirmed bookings in primary branch
  const bookings = await Booking.find({ branch: primaryBranchId, status: "confirmed" })
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  const planForBranch =
    ensuredMealPlans.find((p) => String(p.branchId || "") === String(primaryBranchId)) ||
    ensuredMealPlans.find((p) => p.branchId === null) ||
    ensuredMealPlans[0];

  const branchAddOns = ensuredAddOns.filter((a) => a.branchId === null || String(a.branchId) === String(primaryBranchId));
  const pickAddOns = branchAddOns.slice(0, 2);

  for (const booking of bookings) {
    await MealSelection.updateOne(
      { bookingId: booking._id },
      {
        $setOnInsert: {
          bookingId: booking._id,
          scope: "booking",
          mealPlanId: planForBranch?._id || null,
          unitMode: "hybrid",
          meals: {
            breakfast: { enabled: true, quantityOverride: null, scheduleOverride: { start: "", end: "" } },
            lunch: { enabled: true, quantityOverride: null, scheduleOverride: { start: "", end: "" } },
            dinner: { enabled: false, quantityOverride: null, scheduleOverride: { start: "", end: "" } },
          },
          preferences: {
            diet: "unspecified",
            spiceLevel: "unspecified",
            allergies: [],
            religiousNotes: "",
            notes: "Seeded selection",
          },
          createdBy: seedUserId,
          updatedBy: null,
        },
      },
      { upsert: true }
    );

    await AddOnSelection.updateOne(
      { bookingId: booking._id },
      {
        $setOnInsert: {
          bookingId: booking._id,
          items: pickAddOns.map((a) => ({
            addOnServiceId: a._id,
            quantity: 1,
            notes: "Seeded add-on",
            priceSnapshot: {
              pricingModel: a.pricingModel,
              unitLabel: a.unitLabel || "",
              price: a.price || 0,
              rate: a.rate || 0,
              currency: "SAR",
            },
          })),
          createdBy: seedUserId,
          updatedBy: null,
        },
      },
      { upsert: true }
    );
  }

  const mealPlanCount = await MealPlan.countDocuments();
  const amenityCount = await Amenity.countDocuments();
  const addOnCount = await AddOnService.countDocuments();
  const mealSelCount = await MealSelection.countDocuments();
  const addOnSelCount = await AddOnSelection.countDocuments();
  const adjCount = await KitchenAdjustment.countDocuments();

  console.log("Seeding complete.");
  console.log(`MealPlans: ${mealPlanCount}`);
  console.log(`Amenities: ${amenityCount}`);
  console.log(`AddOnServices: ${addOnCount}`);
  console.log(`MealSelections: ${mealSelCount}`);
  console.log(`AddOnSelections: ${addOnSelCount}`);
  console.log(`KitchenAdjustments: ${adjCount}`);

  await mongoose.connection.close();
  process.exit(0);
}

main().catch(async (err) => {
  console.error("Seed failed:", err);
  try {
    await mongoose.connection.close();
  } catch {}
  process.exit(1);
});

