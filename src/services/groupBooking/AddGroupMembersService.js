import {
    getGroupBookingByIdRaw,
} from "../../repositories/GroupBookingRepository.js";
import {
    bulkInsertMembers,
    countMembersByGroup,
    getMembersByGroupBooking,
} from "../../repositories/GroupMemberRepository.js";

class AddGroupMembersService {
    async execute(groupId, payload, user) {
        // 1. Load group booking
        const group = await getGroupBookingByIdRaw(groupId);
        if (!group) {
            throw new Error("Group booking not found");
        }

        // 2. Only confirmed groups accept members
        if (group.status !== "confirmed") {
            throw new Error("Members can only be added to confirmed group bookings");
        }

        // 3. Ownership check — only group leader can add members
        if (String(group.groupLeader) !== String(user.userId)) {
            const isAdmin = typeof user?.role === "string" && user.role.toLowerCase() === "admin";
            if (!isAdmin) {
                throw new Error("Only the group leader can add members");
            }
        }

        // 4. Validate member count
        const existingCount = await countMembersByGroup(groupId);
        const newCount = payload.members.length;

        if (existingCount + newCount > group.totalPilgrims) {
            throw new Error(
                `Cannot add ${newCount} members. Already have ${existingCount}, total allowed is ${group.totalPilgrims}`
            );
        }

        // 5. Bulk insert members
        const membersToInsert = payload.members.map((m) => ({
            groupBooking: group._id,
            fullName: m.fullName,
            gender: m.gender,
            passportNo: m.passportNo || "",
            phone: m.phone || "",
            assignmentStatus: "unassigned",
        }));

        await bulkInsertMembers(membersToInsert);

        // 6. Return all members for this group
        return await getMembersByGroupBooking(groupId);
    }
}

export default new AddGroupMembersService();
