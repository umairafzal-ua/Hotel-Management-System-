const SHAREABLE_ROOM_TYPES = ["shared", "dormitory", "group"];

export const parseDateRange = (checkInDate, checkOutDate) => {
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime())) {
        throw new Error("Invalid check-in or check-out date");
    }

    if (checkOut <= checkIn) {
        throw new Error("Check-out date must be after check-in date");
    }

    return { checkIn, checkOut };
};

export const validateParty = (partyType, guestCount) => {
    if (partyType === "individual" && guestCount !== 1) {
        throw new Error("Individual booking must have guestCount = 1");
    }

    if (partyType === "couple" && guestCount !== 2) {
        throw new Error("Couple booking must have guestCount = 2");
    }

    if (partyType === "group" && guestCount < 2) {
        throw new Error("Group booking must have guestCount >= 2");
    }
};

export const derivePartyType = (guestCount = 1, partyType = null) => {
    const normalized = typeof partyType === "string" ? partyType.toLowerCase() : "";
    if (["individual", "couple", "group"].includes(normalized)) {
        return normalized;
    }

    if (guestCount <= 1) return "individual";
    if (guestCount === 2) return "couple";
    return "group";
};

export const validateGenderRestriction = (room, partyType, gender) => {
    const policy = room.genderRestriction || "unrestricted";

    if (policy === "unrestricted") {
        return;
    }

    if (policy === "couples_only") {
        if (partyType !== "couple") {
            throw new Error("This room allows couples only");
        }
        return;
    }

    if (policy === "male_only" && gender !== "male") {
        throw new Error("This room allows male guests only");
    }

    if (policy === "female_only" && gender !== "female") {
        throw new Error("This room allows female guests only");
    }
};

export const validateSharedPolicy = (room, partyType) => {
    if (room.type !== "shared") {
        return;
    }

    const policy = room.sharedOccupancyPolicy || "mixed";
    if (policy === "mixed") {
        return;
    }

    if (policy === "individuals_only" && partyType !== "individual") {
        throw new Error("This shared room allows individual bookings only");
    }

    if (policy === "couples_only" && partyType !== "couple") {
        throw new Error("This shared room allows couple bookings only");
    }
};

export const isShareableRoomType = (roomType) => SHAREABLE_ROOM_TYPES.includes(roomType);

export const calculateRequestedSlots = (room, partyType, guestCount) => {
    const shareable = isShareableRoomType(room.type);

    if (!shareable) {
        if (guestCount > room.capacity) {
            throw new Error(`Guest count exceeds room capacity (${room.capacity})`);
        }
        return room.capacity;
    }

    if (guestCount > room.capacity) {
        throw new Error(`Guest count exceeds room capacity (${room.capacity})`);
    }

    if (partyType === "individual") {
        return 1;
    }

    if (partyType === "couple") {
        return 2;
    }

    return guestCount;
};

export const validateOperationalStatus = (room) => {
    if (!room.isActive) {
        throw new Error("Room is inactive and cannot be booked");
    }

    if (["maintenance", "cleaning"].includes(room.status)) {
        throw new Error(`Room is currently in ${room.status} and cannot be booked`);
    }
};
