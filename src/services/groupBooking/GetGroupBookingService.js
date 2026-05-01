import { getGroupBookingById } from "../../repositories/GroupBookingRepository.js";
import { getMembersByGroupBooking } from "../../repositories/GroupMemberRepository.js";

class GetGroupBookingService {
    async execute(groupId, user) {
        if (!groupId) {
            throw new Error("Group booking ID is required");
        }

        const group = await getGroupBookingById(groupId);
        if (!group) {
            throw new Error("Group booking not found");
        }

        const isAdmin = typeof user?.role === "string" && user.role.toLowerCase() === "admin";
        const branchId = group.branch?._id || group.branch;

        if (!isAdmin) {
            // Group leader can see their own groups
            const isLeader = String(group.groupLeader?._id || group.groupLeader) === String(user.userId);
            // Branch manager can see their branch groups
            const isBranchUser = user?.branchId && String(branchId) === String(user.branchId);

            if (!isLeader && !isBranchUser) {
                throw new Error("Access denied");
            }
        }

        const members = await getMembersByGroupBooking(groupId);

        return {
            ...group.toObject(),
            members,
            memberStats: {
                total: members.length,
                assigned: members.filter((m) => m.assignmentStatus === "assigned").length,
                unassigned: members.filter((m) => !m.assignmentStatus || m.assignmentStatus !== "assigned").length,
            },
        };
    }
}

export default new GetGroupBookingService();
