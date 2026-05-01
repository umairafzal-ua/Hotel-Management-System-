/**
 * Read-only audit report for Doyum DB.
 *
 * Prints counts + key summaries for:
 * - Modules (name/code/isActive)
 * - Permissions grouped by module (actions)
 * - Roles (name/slug/label/isActive + permission coverage)
 * - Users (basic flags + role)
 * - Employees (isActive/loginAllowed + user + branch)
 *
 * Run: node scripts/auditDatabase.js   (from dyoum_api, with MONGO_URI in .env)
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import Module from "../src/models/Module.js";
import Permission from "../src/models/Permission.js";
import Role from "../src/models/Role.js";
import User from "../src/models/User.js";
import Employee from "../src/models/Employee.js";
import Branch from "../src/models/Branch.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const fmt = {
    bool(v) { return v ? "Yes" : "No"; },
    str(v) { return v === null || v === undefined || v === "" ? "—" : String(v); },
    id(v) { return v ? String(v) : "—"; },
};

const keyForModule = (mod) => {
    if (!mod) return "UNKNOWN";
    if (mod.code) return String(mod.code).toUpperCase();
    if (mod.name) return String(mod.name);
    return "UNKNOWN";
};

const main = async () => {
    const uri = process.env.MONGO_URI;
    if (!uri) {
        console.error("MONGO_URI is not set (check dyoum_api/.env)");
        process.exit(1);
    }

    await mongoose.connect(uri);

    const [modules, permissions, roles, users, employees] = await Promise.all([
        Module.find({}).sort({ name: 1 }).lean(),
        Permission.find({})
            .populate("module", "_id name code")
            .sort({ action: 1 })
            .lean(),
        Role.find({})
            .populate({
                path: "permissions",
                select: "_id action isActive module",
                populate: { path: "module", select: "_id name code" },
            })
            .sort({ name: 1 })
            .lean(),
        User.find({})
            .populate("role", "_id name slug label")
            .sort({ createdAt: -1 })
            .lean(),
        Employee.find({})
            .populate({
                path: "user",
                select:
                    "_id fullName email phoneNumber isActive isEmailVerified isTemporaryPassword role",
                populate: { path: "role", select: "_id name slug label" },
            })
            .populate("branch", "_id name isActive")
            .sort({ createdAt: -1 })
            .lean(),
    ]);

    // Modules
    console.log("=== MODULES ===");
    console.log("Count:", modules.length);
    for (const m of modules) {
        console.log(
            `- ${fmt.str(m.name)} | code=${fmt.str(m.code)} | active=${fmt.bool(m.isActive)}`
        );
    }

    // Permissions by module
    const permByMod = new Map(); // key -> { actions:Set, ids:Map(action->id), activeCount }
    for (const p of permissions) {
        const modKey = keyForModule(p.module);
        if (!permByMod.has(modKey)) {
            permByMod.set(modKey, { actions: new Set(), activeCount: 0 });
        }
        const row = permByMod.get(modKey);
        if (p.action) row.actions.add(String(p.action).toLowerCase());
        if (p.isActive) row.activeCount += 1;
    }

    console.log("\n=== PERMISSIONS (grouped by module) ===");
    console.log("Count:", permissions.length);
    for (const [k, v] of Array.from(permByMod.entries()).sort((a, b) =>
        a[0].localeCompare(b[0])
    )) {
        console.log(
            `- ${k}: ${Array.from(v.actions).sort().join(", ") || "—"} | active=${v.activeCount}`
        );
    }

    // Roles
    console.log("\n=== ROLES ===");
    console.log("Count:", roles.length);
    for (const r of roles) {
        const byMod = new Map(); // modKey -> Set(actions)
        const perms = Array.isArray(r.permissions) ? r.permissions : [];
        for (const p of perms) {
            const mk = keyForModule(p.module);
            if (!byMod.has(mk)) byMod.set(mk, new Set());
            if (p.action) byMod.get(mk).add(String(p.action).toLowerCase());
        }
        const coverage = Array.from(byMod.entries())
            .sort((a, b) => a[0].localeCompare(b[0]))
            .slice(0, 12)
            .map(([mk, acts]) => `${mk}:[${Array.from(acts).sort().join(",")}]`)
            .join(" ");
        console.log(
            `- ${fmt.str(r.name)} | slug=${fmt.str(r.slug)} | label=${fmt.str(r.label)} | active=${fmt.bool(
                r.isActive
            )} | perms=${perms.length}`
        );
        if (coverage) console.log(`  modules: ${coverage}${byMod.size > 12 ? " …" : ""}`);
    }

    // Users
    console.log("\n=== USERS ===");
    console.log("Count:", users.length);
    const userStats = {
        active: 0,
        inactive: 0,
        emailVerified: 0,
        tempPassword: 0,
        noRole: 0,
    };
    for (const u of users) {
        if (u.isActive) userStats.active += 1;
        else userStats.inactive += 1;
        if (u.isEmailVerified) userStats.emailVerified += 1;
        if (u.isTemporaryPassword) userStats.tempPassword += 1;
        if (!u.role) userStats.noRole += 1;
    }
    console.log("Active:", userStats.active);
    console.log("Inactive:", userStats.inactive);
    console.log("Email verified:", userStats.emailVerified);
    console.log("Temporary password:", userStats.tempPassword);
    console.log("No role:", userStats.noRole);

    // Employees
    console.log("\n=== EMPLOYEES ===");
    console.log("Count:", employees.length);
    const empStats = {
        active: 0,
        inactive: 0,
        loginAllowedTrue: 0,
        loginAllowedFalse: 0,
        loginAllowedMissing: 0,
        missingUser: 0,
        missingBranch: 0,
    };
    for (const e of employees) {
        if (e.isActive) empStats.active += 1;
        else empStats.inactive += 1;
        if (e.loginAllowed === true) empStats.loginAllowedTrue += 1;
        else if (e.loginAllowed === false) empStats.loginAllowedFalse += 1;
        else empStats.loginAllowedMissing += 1;
        if (!e.user) empStats.missingUser += 1;
        if (!e.branch) empStats.missingBranch += 1;
    }
    console.log("Active:", empStats.active);
    console.log("Inactive:", empStats.inactive);
    console.log("loginAllowed=true:", empStats.loginAllowedTrue);
    console.log("loginAllowed=false:", empStats.loginAllowedFalse);
    console.log("loginAllowed missing:", empStats.loginAllowedMissing);
    console.log("Missing user ref:", empStats.missingUser);
    console.log("Missing branch ref:", empStats.missingBranch);

    // Print a short sample (latest 20 employees)
    console.log("\nLatest employees (max 20):");
    for (const e of employees.slice(0, 20)) {
        const u = e.user;
        console.log(
            `- emp=${fmt.id(e._id)} active=${fmt.bool(e.isActive)} loginAllowed=${fmt.str(
                e.loginAllowed
            )} | user=${fmt.id(u?._id)} ${fmt.str(u?.fullName)} <${fmt.str(u?.email)}> role=${fmt.str(
                u?.role?.name
            )} | branch=${fmt.str(e.branch?.name)}`
        );
    }

    await mongoose.disconnect();
};

main().catch(async (err) => {
    console.error("Audit failed:", err?.message || err);
    try {
        await mongoose.disconnect();
    } catch {}
    process.exit(1);
});

