/**
 * One-off migration: populate Role.slug and Module.code, print audit report.
 * Run: node scripts/migrateRbacCodes.js  (from dyoum_api, with MONGO_URI in .env)
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import Role from "../src/models/Role.js";
import Module from "../src/models/Module.js";
import {
    deriveModuleCode,
    deriveRoleSlug,
    normalizeModuleCode,
} from "../src/utils/rbacIdentifiers.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "..", ".env") });

/** Preferred module codes (align with route guards + legacy shorthand). */
const MODULE_CODE_BY_NAME = {
    "Hotel & Branch Management": "HOTEL_BRANCH_MANAGEMENT",
    "Room Management & Booking": "ROOM_BOOKING",
    "Group Booking & Management": "GROUP_BOOKING",
    "Kitchen & Meal Management": "KITCHENANDMEALS",
    "Add-On Services Management": "ADDONS",
    "Pricing, Billing & Invoicing": "PRICING_BILLING",
    "Notifications & Communication": "NOTIFICATIONS",
    "Reporting & Analytics": "REPORTING",
    Roles: "ROLES",
    Role: "ROLES",
    Module: "MODULES",
    Modules: "MODULES",
    Permission: "PERMISSIONS",
    Permissions: "PERMISSIONS",
};

/** Preferred role slugs when name does not derive cleanly. */
const ROLE_SLUG_BY_NAME = {
    Admin: "admin",
    Administrator: "admin",
    Manager: "manager",
    Owner: "owner",
    Kitchen: "kitchen",
    Agent: "agent",
    Customer: "customer",
    "Group Leader": "groupleader",
    Groupleader: "groupleader",
};

const main = async () => {
    const uri = process.env.MONGO_URI;
    if (!uri) {
        console.error("MONGO_URI is not set");
        process.exit(1);
    }

    await mongoose.connect(uri);
    console.log("Connected. Migrating RBAC codes…\n");

    const roleReport = { updated: [], skipped: [] };
    const moduleReport = { updated: [], skipped: [] };

    const roles = await Role.find({}).lean();

    for (const r of roles) {
        const desired =
            ROLE_SLUG_BY_NAME[r.name] ||
            (r.slug ? String(r.slug) : "") ||
            deriveRoleSlug(r.name);
        if (!desired) {
            roleReport.skipped.push({ id: r._id, name: r.name, reason: "empty_slug" });
            continue;
        }
        let candidate = desired;
        let n = 1;
        let takenByOther = await Role.findOne({
            slug: candidate,
            _id: { $ne: r._id },
        }).lean();
        while (takenByOther) {
            candidate = `${desired}${n++}`;
            takenByOther = await Role.findOne({
                slug: candidate,
                _id: { $ne: r._id },
            }).lean();
        }
        if (r.slug === candidate) {
            roleReport.skipped.push({ id: r._id, name: r.name, slug: candidate });
            continue;
        }
        await Role.updateOne({ _id: r._id }, { $set: { slug: candidate } });
        roleReport.updated.push({ id: r._id, name: r.name, slug: candidate });
    }

    const modules = await Module.find({}).lean();

    for (const m of modules) {
        const raw =
            MODULE_CODE_BY_NAME[m.name] ||
            (m.code ? String(m.code) : "") ||
            deriveModuleCode(m.name);
        const desired = normalizeModuleCode(raw);
        if (!desired) {
            moduleReport.skipped.push({ id: m._id, name: m.name, reason: "empty_code" });
            continue;
        }
        let candidate = desired;
        let n = 1;
        let takenByOther = await Module.findOne({
            code: candidate,
            _id: { $ne: m._id },
        }).lean();
        while (takenByOther) {
            candidate = normalizeModuleCode(`${desired}_${n++}`);
            takenByOther = await Module.findOne({
                code: candidate,
                _id: { $ne: m._id },
            }).lean();
        }
        if (m.code === candidate) {
            moduleReport.skipped.push({ id: m._id, name: m.name, code: candidate });
            continue;
        }
        await Module.updateOne({ _id: m._id }, { $set: { code: candidate } });
        moduleReport.updated.push({ id: m._id, name: m.name, code: candidate });
    }

    console.log("--- Roles ---");
    console.log("Updated:", roleReport.updated.length);
    console.log(JSON.stringify(roleReport.updated, null, 2));
    console.log("Skipped (already set / no change):", roleReport.skipped.length);
    console.log("\n--- Modules ---");
    console.log("Updated:", moduleReport.updated.length);
    console.log(JSON.stringify(moduleReport.updated, null, 2));
    console.log("Skipped:", moduleReport.skipped.length);

    const rolesMissingSlug = await Role.countDocuments({
        $or: [{ slug: { $exists: false } }, { slug: null }, { slug: "" }],
    });
    const modulesMissingCode = await Module.countDocuments({
        $or: [{ code: { $exists: false } }, { code: null }, { code: "" }],
    });

    console.log("\n--- Audit ---");
    console.log("Roles still missing slug:", rolesMissingSlug);
    console.log("Modules still missing code:", modulesMissingCode);

    await mongoose.disconnect();
    console.log("\nDone.");
    process.exit(0);
};

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
