import swaggerJsdoc from "swagger-jsdoc";

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Doyum Catering API",
            version: "1.0.0",
            description:
                "Complete REST API for Doyum Catering - Hotel & Branch Management System with RBAC (Role-Based Access Control), Room Management, Employee Management, and more.",
            contact: {
                name: "Doyum Catering Support",
                email: "support@doyumcatering.com",
            },
        },
        servers: [
            {
                url: "/api/v1",
                description: "API v1",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                    description: "Enter your JWT access token",
                },
            },
            schemas: {
                // ── Standard Responses ──
                SuccessResponse: {
                    type: "object",
                    properties: {
                        success: { type: "boolean", example: true },
                        statusCode: { type: "integer", example: 200 },
                        message: { type: "string", example: "Success" },
                        data: { type: "object", nullable: true },
                    },
                },
                CreatedResponse: {
                    type: "object",
                    properties: {
                        success: { type: "boolean", example: true },
                        statusCode: { type: "integer", example: 201 },
                        message: { type: "string", example: "Created successfully" },
                        data: { type: "object", nullable: true },
                    },
                },
                PaginatedResponse: {
                    type: "object",
                    properties: {
                        success: { type: "boolean", example: true },
                        statusCode: { type: "integer", example: 200 },
                        message: { type: "string" },
                        data: { type: "array", items: { type: "object" } },
                        meta: {
                            type: "object",
                            properties: {
                                pagination: {
                                    type: "object",
                                    properties: {
                                        total: { type: "integer" },
                                        per_page: { type: "integer" },
                                        current_page: { type: "integer" },
                                        last_page: { type: "integer" },
                                        from: { type: "integer" },
                                        to: { type: "integer" },
                                        has_more_pages: { type: "boolean" },
                                    },
                                },
                            },
                        },
                    },
                },
                ErrorResponse: {
                    type: "object",
                    properties: {
                        success: { type: "boolean", example: false },
                        statusCode: { type: "integer", example: 400 },
                        message: { type: "string", example: "Something went wrong" },
                        data: { type: "object", nullable: true, example: null },
                        errors: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    field: { type: "string" },
                                    message: { type: "string" },
                                },
                            },
                        },
                    },
                },
                ValidationError: {
                    type: "object",
                    properties: {
                        statusCode: { type: "integer", example: 400 },
                        success: { type: "boolean", example: false },
                        message: { type: "string", example: "Validation failed" },
                        errors: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    field: { type: "string", example: "email" },
                                    message: { type: "string", example: "Please enter a valid email address" },
                                },
                            },
                        },
                        data: { type: "object", nullable: true, example: null },
                    },
                },

                // ── Auth Schemas ──
                RegisterRequest: {
                    type: "object",
                    required: ["fullName", "email", "phoneNumber", "password", "confirmPassword", "role", "agreeToTerms"],
                    properties: {
                        fullName: { type: "string", minLength: 2, maxLength: 100, example: "John Doe" },
                        email: { type: "string", format: "email", example: "john@example.com" },
                        phoneNumber: { type: "string", pattern: "^[0-9]{7,10}$", example: "5551234567" },
                        password: { type: "string", minLength: 8, maxLength: 128, example: "Password1" },
                        confirmPassword: { type: "string", example: "Password1" },
                        role: { type: "string", enum: ["admin", "customer", "groupleader"], example: "customer" },
                        agreeToTerms: { type: "boolean", example: true },
                    },
                },
                LoginRequest: {
                    type: "object",
                    required: ["email", "password"],
                    properties: {
                        email: { type: "string", format: "email", example: "john@example.com" },
                        password: { type: "string", example: "Password1" },
                    },
                },
                LoginResponse: {
                    type: "object",
                    properties: {
                        accessToken: { type: "string" },
                        refreshToken: { type: "string" },
                        user: { $ref: "#/components/schemas/UserProfile" },
                    },
                },
                RefreshTokenRequest: {
                    type: "object",
                    required: ["refreshToken"],
                    properties: {
                        refreshToken: { type: "string", example: "your-refresh-token-here" },
                    },
                },
                ForgotPasswordRequest: {
                    type: "object",
                    required: ["email"],
                    properties: {
                        email: { type: "string", format: "email", example: "john@example.com" },
                    },
                },
                VerifyOTPRequest: {
                    type: "object",
                    required: ["email", "otp"],
                    properties: {
                        email: { type: "string", format: "email", example: "john@example.com" },
                        otp: { type: "string", pattern: "^\\d{6}$", example: "123456" },
                    },
                },
                ResetPasswordRequest: {
                    type: "object",
                    required: ["token", "newPassword", "confirmNewPassword"],
                    properties: {
                        token: { type: "string", example: "reset-token-here" },
                        newPassword: { type: "string", minLength: 8, example: "NewPassword1" },
                        confirmNewPassword: { type: "string", example: "NewPassword1" },
                    },
                },
                ChangePasswordRequest: {
                    type: "object",
                    required: ["currentPassword", "newPassword", "confirmNewPassword"],
                    properties: {
                        currentPassword: { type: "string", example: "OldPassword1" },
                        newPassword: { type: "string", minLength: 8, example: "NewPassword1" },
                        confirmNewPassword: { type: "string", example: "NewPassword1" },
                    },
                },
                UpdateProfileRequest: {
                    type: "object",
                    properties: {
                        fullName: { type: "string", minLength: 2, maxLength: 100, example: "John Updated" },
                        phoneNumber: { type: "string", pattern: "^[0-9]{7,10}$", example: "5559876543" },
                    },
                },
                UserProfile: {
                    type: "object",
                    properties: {
                        _id: { type: "string", example: "507f1f77bcf86cd799439011" },
                        fullName: { type: "string", example: "John Doe" },
                        email: { type: "string", example: "john@example.com" },
                        phoneNumber: { type: "string", example: "5551234567" },
                        role: { $ref: "#/components/schemas/Role" },
                        isActive: { type: "boolean", example: true },
                        isEmailVerified: { type: "boolean", example: false },
                        lastLogin: { type: "string", format: "date-time", nullable: true },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" },
                    },
                },

                // ── Module Schemas ──
                Module: {
                    type: "object",
                    properties: {
                        _id: { type: "string", example: "507f1f77bcf86cd799439011" },
                        name: { type: "string", example: "Hotel & Branch Management" },
                        description: { type: "string", example: "Manage hotels and branches" },
                        icon: { type: "string", nullable: true },
                        isActive: { type: "boolean", example: true },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" },
                    },
                },
                CreateModuleRequest: {
                    type: "object",
                    required: ["name"],
                    properties: {
                        name: { type: "string", minLength: 2, maxLength: 50, example: "Room Management & Booking" },
                        description: { type: "string", maxLength: 255, example: "Manage rooms and bookings" },
                        isActive: { type: "boolean", default: true },
                    },
                },
                UpdateModuleRequest: {
                    type: "object",
                    properties: {
                        name: { type: "string", minLength: 2, maxLength: 50, example: "Updated Module Name" },
                        description: { type: "string", maxLength: 255, example: "Updated description" },
                        isActive: { type: "boolean" },
                    },
                },

                // ── Permission Schemas ──
                Permission: {
                    type: "object",
                    properties: {
                        _id: { type: "string", example: "507f1f77bcf86cd799439022" },
                        module: { $ref: "#/components/schemas/ModuleRef" },
                        action: { type: "string", enum: ["create", "read", "update", "delete", "execute"], example: "read" },
                        description: { type: "string", example: "Read access" },
                        isActive: { type: "boolean", example: true },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" },
                    },
                },
                ModuleRef: {
                    type: "object",
                    properties: {
                        _id: { type: "string", example: "507f1f77bcf86cd799439011" },
                        name: { type: "string", example: "Hotel & Branch Management" },
                    },
                },
                CreatePermissionsBulkRequest: {
                    type: "object",
                    required: ["permissions"],
                    properties: {
                        permissions: {
                            type: "array",
                            minItems: 1,
                            items: {
                                type: "object",
                                required: ["module", "action"],
                                properties: {
                                    module: { type: "string", example: "507f1f77bcf86cd799439011" },
                                    action: { type: "string", enum: ["create", "read", "update", "delete", "execute"], example: "read" },
                                    description: { type: "string", example: "Read access for module" },
                                },
                            },
                        },
                    },
                },
                UpdatePermissionRequest: {
                    type: "object",
                    properties: {
                        action: { type: "string", enum: ["create", "read", "update", "delete", "execute"] },
                        description: { type: "string", maxLength: 255 },
                        isActive: { type: "boolean" },
                    },
                },

                // ── Role Schemas ──
                Role: {
                    type: "object",
                    properties: {
                        _id: { type: "string", example: "507f1f77bcf86cd799439033" },
                        name: { type: "string", example: "Admin" },
                        description: { type: "string", example: "Administrator with full access" },
                        permissions: {
                            type: "array",
                            items: { $ref: "#/components/schemas/Permission" },
                        },
                        isActive: { type: "boolean", example: true },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" },
                    },
                },
                CreateRoleRequest: {
                    type: "object",
                    required: ["name"],
                    properties: {
                        name: { type: "string", minLength: 2, maxLength: 50, example: "Manager" },
                        description: { type: "string", maxLength: 255, example: "Branch manager role" },
                        permissions: {
                            type: "array",
                            items: { type: "string" },
                            example: ["507f1f77bcf86cd799439022"],
                        },
                        isActive: { type: "boolean", default: true },
                    },
                },
                UpdateRoleRequest: {
                    type: "object",
                    properties: {
                        name: { type: "string", minLength: 2, maxLength: 50, example: "Updated Role" },
                        description: { type: "string", maxLength: 255 },
                        permissions: {
                            type: "array",
                            items: { type: "string" },
                        },
                        isActive: { type: "boolean" },
                    },
                },
                RolePermissionRequest: {
                    type: "object",
                    required: ["roleId", "permissionId"],
                    properties: {
                        roleId: { type: "string", example: "507f1f77bcf86cd799439033" },
                        permissionId: { type: "string", example: "507f1f77bcf86cd799439022" },
                    },
                },
                RolePermissionsBulkRequest: {
                    type: "object",
                    required: ["roleId", "permissionIds"],
                    properties: {
                        roleId: { type: "string", example: "507f1f77bcf86cd799439033" },
                        permissionIds: {
                            type: "array",
                            minItems: 1,
                            items: { type: "string" },
                            example: ["507f1f77bcf86cd799439022", "507f1f77bcf86cd799439023"],
                        },
                    },
                },
                SetPermissionsForRoleRequest: {
                    type: "object",
                    required: ["roleId", "permissionIds"],
                    properties: {
                        roleId: { type: "string", example: "507f1f77bcf86cd799439033" },
                        permissionIds: {
                            type: "array",
                            items: { type: "string" },
                            example: ["507f1f77bcf86cd799439022"],
                        },
                    },
                },

                // ── Branch Schemas ──
                Branch: {
                    type: "object",
                    properties: {
                        _id: { type: "string", example: "507f1f77bcf86cd799439044" },
                        name: { type: "string", example: "Doyum Makkah Main" },
                        location: {
                            type: "object",
                            properties: {
                                address: { type: "string", example: "123 Main Street" },
                                city: { type: "string", example: "Makkah" },
                                coordinates: {
                                    type: "object",
                                    properties: {
                                        lat: { type: "number", example: 21.4225 },
                                        lng: { type: "number", example: 39.8262 },
                                    },
                                },
                            },
                        },
                        distanceFromHaram: { type: "number", example: 1.5 },
                        isActive: { type: "boolean", example: true },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" },
                    },
                },
                CreateBranchRequest: {
                    type: "object",
                    required: ["name", "distanceFromHaram"],
                    properties: {
                        name: { type: "string", minLength: 2, maxLength: 100, example: "Doyum Branch 2" },
                        location: {
                            type: "object",
                            properties: {
                                address: { type: "string", example: "456 Side Street" },
                                city: { type: "string", default: "Makkah", example: "Makkah" },
                                coordinates: {
                                    type: "object",
                                    properties: {
                                        lat: { type: "number", example: 21.4225 },
                                        lng: { type: "number", example: 39.8262 },
                                    },
                                },
                            },
                        },
                        distanceFromHaram: { type: "number", minimum: 0, example: 2.3 },
                        isActive: { type: "boolean", default: true },
                    },
                },
                UpdateBranchRequest: {
                    type: "object",
                    properties: {
                        name: { type: "string", minLength: 2, maxLength: 100 },
                        location: {
                            type: "object",
                            properties: {
                                address: { type: "string" },
                                city: { type: "string" },
                                coordinates: {
                                    type: "object",
                                    properties: {
                                        lat: { type: "number" },
                                        lng: { type: "number" },
                                    },
                                },
                            },
                        },
                        distanceFromHaram: { type: "number", minimum: 0 },
                        isActive: { type: "boolean" },
                    },
                },

                // ── Employee Schemas ──
                Employee: {
                    type: "object",
                    properties: {
                        _id: { type: "string", example: "507f1f77bcf86cd799439055" },
                        user: { $ref: "#/components/schemas/UserProfile" },
                        branch: { $ref: "#/components/schemas/Branch" },
                        position: { type: "string", example: "Receptionist" },
                        department: { type: "string", example: "Front Desk" },
                        shift: { type: "string", example: "Morning" },
                        isActive: { type: "boolean", example: true },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" },
                    },
                },
                CreateEmployeeWithUserRequest: {
                    type: "object",
                    required: ["fullName", "email", "phoneNumber", "branchId", "roleId", "position", "department", "shift"],
                    properties: {
                        fullName: { type: "string", minLength: 2, maxLength: 100, example: "Ali Ahmed" },
                        email: { type: "string", format: "email", example: "ali@example.com" },
                        phoneNumber: { type: "string", pattern: "^\\d{7,10}$", example: "5551112222" },
                        branchId: { type: "string", example: "507f1f77bcf86cd799439044" },
                        roleId: { type: "string", example: "507f1f77bcf86cd799439033" },
                        position: { type: "string", minLength: 1, maxLength: 100, example: "Receptionist" },
                        department: { type: "string", minLength: 1, maxLength: 100, example: "Front Desk" },
                        shift: { type: "string", minLength: 1, maxLength: 100, example: "Morning" },
                    },
                },
                AssignEmployeeRequest: {
                    type: "object",
                    required: ["userId", "branchId"],
                    properties: {
                        userId: { type: "string", example: "507f1f77bcf86cd799439011" },
                        branchId: { type: "string", example: "507f1f77bcf86cd799439044" },
                        roleId: { type: "string", example: "507f1f77bcf86cd799439033" },
                        position: { type: "string", maxLength: 100, example: "Manager" },
                        department: { type: "string", maxLength: 100, example: "Operations" },
                        shift: { type: "string", maxLength: 100, example: "Full-time" },
                        isActive: { type: "boolean", default: true },
                    },
                },
                UpdateEmployeeRequest: {
                    type: "object",
                    properties: {
                        branchId: { type: "string" },
                        roleId: { type: "string" },
                        position: { type: "string", maxLength: 100 },
                        department: { type: "string", maxLength: 100 },
                        shift: { type: "string", maxLength: 100 },
                        isActive: { type: "boolean" },
                    },
                },

                // ── Room Schemas ──
                Room: {
                    type: "object",
                    properties: {
                        _id: { type: "string", example: "507f1f77bcf86cd799439066" },
                        roomNumber: { type: "string", example: "101" },
                        type: { type: "string", enum: ["single", "double", "triple", "shared", "dormitory", "group", "quad"], example: "double" },
                        branch: { type: "string", example: "507f1f77bcf86cd799439044" },
                        floor: { type: "integer", example: 1 },
                        capacity: { type: "integer", minimum: 1, example: 2 },
                        basePrice: { type: "number", minimum: 0, example: 150.0 },
                        amenities: { type: "array", items: { type: "string" }, example: ["WiFi", "AC", "TV"] },
                        status: { type: "string", enum: ["available", "occupied", "maintenance", "cleaning"], example: "available" },
                        genderRestriction: { type: "string", enum: ["unrestricted", "male_only", "female_only", "couples_only"], example: "unrestricted" },
                        sharedOccupancyPolicy: { type: "string", enum: ["mixed", "individuals_only", "couples_only"], example: "mixed" },
                        isActive: { type: "boolean", example: true },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" },
                    },
                },
                CreateRoomRequest: {
                    type: "object",
                    required: ["roomNumber", "type", "branchId", "floor", "capacity", "basePrice"],
                    properties: {
                        roomNumber: { type: "string", minLength: 1, maxLength: 50, example: "201" },
                        type: { type: "string", enum: ["single", "double", "triple", "shared", "dormitory", "group", "quad"], example: "single" },
                        branchId: { type: "string", example: "507f1f77bcf86cd799439044" },
                        floor: { type: "integer", minimum: 0, example: 2 },
                        capacity: { type: "integer", minimum: 1, example: 1 },
                        basePrice: { type: "number", minimum: 0, example: 100.0 },
                        amenities: { type: "array", items: { type: "string" }, default: [], example: ["WiFi", "AC"] },
                        status: { type: "string", enum: ["available", "occupied", "maintenance", "cleaning"], default: "available" },
                        genderRestriction: { type: "string", enum: ["unrestricted", "male_only", "female_only", "couples_only"], default: "unrestricted" },
                        sharedOccupancyPolicy: { type: "string", enum: ["mixed", "individuals_only", "couples_only"], default: "mixed" },
                        isActive: { type: "boolean", default: true },
                    },
                },
                BulkCreateRoomsRequest: {
                    type: "object",
                    required: ["rooms"],
                    properties: {
                        branchId: { type: "string", example: "507f1f77bcf86cd799439044" },
                        rooms: {
                            type: "array",
                            minItems: 1,
                            items: {
                                type: "object",
                                required: ["roomNumber", "type", "branchId", "floor", "capacity", "basePrice"],
                                properties: {
                                    roomNumber: { type: "string", example: "301" },
                                    type: { type: "string", enum: ["single", "double", "triple", "shared", "dormitory", "group", "quad"] },
                                    branchId: { type: "string" },
                                    floor: { type: "integer", minimum: 0 },
                                    capacity: { type: "integer", minimum: 1 },
                                    basePrice: { type: "number", minimum: 0 },
                                    amenities: { type: "array", items: { type: "string" }, default: [] },
                                    status: { type: "string", enum: ["available", "occupied", "maintenance", "cleaning"], default: "available" },
                                    genderRestriction: { type: "string", enum: ["unrestricted", "male_only", "female_only", "couples_only"], default: "unrestricted" },
                                    sharedOccupancyPolicy: { type: "string", enum: ["mixed", "individuals_only", "couples_only"], default: "mixed" },
                                    isActive: { type: "boolean", default: true },
                                },
                            },
                        },
                    },
                },
                UpdateRoomRequest: {
                    type: "object",
                    properties: {
                        roomNumber: { type: "string", minLength: 1, maxLength: 50 },
                        type: { type: "string", enum: ["single", "double", "triple", "shared", "dormitory", "group", "quad"] },
                        floor: { type: "integer" },
                        capacity: { type: "integer" },
                        basePrice: { type: "number" },
                        amenities: { type: "array", items: { type: "string" } },
                        status: { type: "string", enum: ["available", "occupied", "maintenance", "cleaning"] },
                        genderRestriction: { type: "string", enum: ["unrestricted", "male_only", "female_only", "couples_only"] },
                        sharedOccupancyPolicy: { type: "string", enum: ["mixed", "individuals_only", "couples_only"] },
                        isActive: { type: "boolean" },
                    },
                },
                UpdateRoomStatusRequest: {
                    type: "object",
                    required: ["status"],
                    properties: {
                        status: { type: "string", enum: ["available", "occupied", "maintenance", "cleaning"], example: "maintenance" },
                    },
                },

                Booking: {
                    type: "object",
                    properties: {
                        _id: { type: "string", example: "507f1f77bcf86cd799439077" },
                        branch: { type: "string", example: "507f1f77bcf86cd799439044" },
                        room: { type: "string", example: "507f1f77bcf86cd799439066" },
                        customer: {
                            type: "object",
                            properties: {
                                name: { type: "string", example: "Ali Ahmed" },
                                email: { type: "string", example: "ali@example.com" },
                                phone: { type: "string", example: "5551234567" },
                            },
                        },
                        partyType: { type: "string", enum: ["individual", "couple", "group"], example: "group" },
                        guestCount: { type: "integer", minimum: 1, example: 3 },
                        gender: { type: "string", enum: ["male", "female", "mixed"], example: "mixed" },
                        checkInDate: { type: "string", format: "date-time" },
                        checkOutDate: { type: "string", format: "date-time" },
                        allocatedSlots: { type: "integer", minimum: 1, example: 3 },
                        status: { type: "string", enum: ["confirmed", "cancelled", "reassigned"], example: "confirmed" },
                        previousRoom: { type: "string", nullable: true },
                        reassignedAt: { type: "string", format: "date-time", nullable: true },
                        cancelledAt: { type: "string", format: "date-time", nullable: true },
                        cancellationReason: { type: "string", nullable: true },
                        notes: { type: "string", nullable: true },
                    },
                },
                CreateBookingRequest: {
                    type: "object",
                    required: ["roomId", "checkInDate", "checkOutDate", "partyType", "guestCount", "customer"],
                    properties: {
                        roomId: { type: "string", example: "507f1f77bcf86cd799439066" },
                        checkInDate: { type: "string", format: "date-time" },
                        checkOutDate: { type: "string", format: "date-time" },
                        partyType: { type: "string", enum: ["individual", "couple", "group"] },
                        guestCount: { type: "integer", minimum: 1, example: 2 },
                        gender: { type: "string", enum: ["male", "female", "mixed"], default: "mixed" },
                        customer: {
                            type: "object",
                            required: ["name"],
                            properties: {
                                name: { type: "string", minLength: 2, maxLength: 100 },
                                email: { type: "string", format: "email" },
                                phone: { type: "string" },
                            },
                        },
                        notes: { type: "string", maxLength: 500 },
                    },
                },
                ReassignBookingRequest: {
                    type: "object",
                    required: ["newRoomId"],
                    properties: {
                        newRoomId: { type: "string", example: "507f1f77bcf86cd799439088" },
                        checkInDate: { type: "string", format: "date-time" },
                        checkOutDate: { type: "string", format: "date-time" },
                        notes: { type: "string", maxLength: 500 },
                    },
                },
                CancelBookingRequest: {
                    type: "object",
                    properties: {
                        reason: { type: "string", maxLength: 255, example: "Customer requested cancellation" },
                    },
                },

                // ── Contact Us Schema ──
                ContactUsRequest: {
                    type: "object",
                    required: ["fullName", "email", "subject", "message"],
                    properties: {
                        fullName: { type: "string", minLength: 2, maxLength: 100, example: "Guest User" },
                        email: { type: "string", format: "email", maxLength: 100, example: "guest@example.com" },
                        subject: { type: "string", minLength: 3, maxLength: 150, example: "Booking Inquiry" },
                        message: { type: "string", minLength: 10, maxLength: 5000, example: "I would like to inquire about room availability for next month." },
                    },
                },
            },
        },
        tags: [
            { name: "Health", description: "Health check endpoints" },
            { name: "Auth", description: "Authentication & authorization" },
            { name: "Modules", description: "System modules management" },
            { name: "Permissions", description: "Permissions management" },
            { name: "Roles", description: "Roles management with permission assignments" },
            { name: "Branches", description: "Hotel & branch management" },
            { name: "Employees", description: "Employee management" },
            { name: "Rooms", description: "Room management & availability" },
            { name: "Bookings", description: "Room booking, cancellation, reassignment" },
            { name: "Meal Plans", description: "Meal plan management" },
            { name: "Add-Ons", description: "Add-on services management" },
            { name: "Kitchen", description: "Kitchen prep and adjustments" },
            { name: "Contact Us", description: "Contact form submission" },
        ],
        paths: {
            // ═══════════════════════════════════════
            //  HEALTH
            // ═══════════════════════════════════════
            "/health": {
                get: {
                    tags: ["Health"],
                    summary: "Basic health check",
                    description: "Returns basic API health status",
                    responses: {
                        200: { description: "API is healthy", content: { "application/json": { schema: { $ref: "#/components/schemas/SuccessResponse" } } } },
                    },
                },
            },
            "/health/detailed": {
                get: {
                    tags: ["Health"],
                    summary: "Detailed health check",
                    description: "Returns detailed health status including database connectivity and uptime",
                    responses: {
                        200: { description: "Detailed health info", content: { "application/json": { schema: { $ref: "#/components/schemas/SuccessResponse" } } } },
                        503: { description: "Service unhealthy" },
                    },
                },
            },
            "/health/live": {
                get: {
                    tags: ["Health"],
                    summary: "Liveness probe",
                    description: "Kubernetes-style liveness probe - checks if process is running",
                    responses: {
                        200: { description: "Service is alive" },
                    },
                },
            },
            "/health/ready": {
                get: {
                    tags: ["Health"],
                    summary: "Readiness probe",
                    description: "Kubernetes-style readiness probe - checks if service can accept traffic",
                    responses: {
                        200: { description: "Service is ready" },
                        503: { description: "Service not ready" },
                    },
                },
            },

            // ═══════════════════════════════════════
            //  AUTH
            // ═══════════════════════════════════════
            "/auth/register": {
                post: {
                    tags: ["Auth"],
                    summary: "Register a new user",
                    description: "Create a new user account. Rate limited to 30 requests per minute.",
                    requestBody: {
                        required: true,
                        content: { "application/json": { schema: { $ref: "#/components/schemas/RegisterRequest" } } },
                    },
                    responses: {
                        201: { description: "Registration successful", content: { "application/json": { schema: { $ref: "#/components/schemas/CreatedResponse" } } } },
                        400: { description: "Validation failed", content: { "application/json": { schema: { $ref: "#/components/schemas/ValidationError" } } } },
                        429: { description: "Too many requests" },
                    },
                },
            },
            "/auth/login": {
                post: {
                    tags: ["Auth"],
                    summary: "Login",
                    description: "Authenticate with email and password. Returns access and refresh tokens. Rate limited to 5 attempts per 15 minutes.",
                    requestBody: {
                        required: true,
                        content: { "application/json": { schema: { $ref: "#/components/schemas/LoginRequest" } } },
                    },
                    responses: {
                        200: {
                            description: "Login successful",
                            content: { "application/json": { schema: { allOf: [{ $ref: "#/components/schemas/SuccessResponse" }, { type: "object", properties: { data: { $ref: "#/components/schemas/LoginResponse" } } }] } } },
                        },
                        400: { description: "Validation failed", content: { "application/json": { schema: { $ref: "#/components/schemas/ValidationError" } } } },
                        401: { description: "Invalid credentials", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
                        429: { description: "Too many login attempts" },
                    },
                },
            },
            "/auth/refresh-token": {
                post: {
                    tags: ["Auth"],
                    summary: "Refresh access token",
                    description: "Get a new access token using a valid refresh token",
                    requestBody: {
                        required: true,
                        content: { "application/json": { schema: { $ref: "#/components/schemas/RefreshTokenRequest" } } },
                    },
                    responses: {
                        200: { description: "Token refreshed successfully", content: { "application/json": { schema: { $ref: "#/components/schemas/SuccessResponse" } } } },
                        400: { description: "Invalid or expired refresh token", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
                    },
                },
            },
            "/auth/forgot-password": {
                post: {
                    tags: ["Auth"],
                    summary: "Forgot password",
                    description: "Send a password reset OTP to the registered email. Rate limited to 5 requests per 15 minutes.",
                    requestBody: {
                        required: true,
                        content: { "application/json": { schema: { $ref: "#/components/schemas/ForgotPasswordRequest" } } },
                    },
                    responses: {
                        200: { description: "OTP sent successfully", content: { "application/json": { schema: { $ref: "#/components/schemas/SuccessResponse" } } } },
                        400: { description: "Validation failed" },
                        429: { description: "Too many requests" },
                    },
                },
            },
            "/auth/verify-otp": {
                post: {
                    tags: ["Auth"],
                    summary: "Verify OTP",
                    description: "Verify the OTP sent to email for password reset. Returns a temporary reset token.",
                    requestBody: {
                        required: true,
                        content: { "application/json": { schema: { $ref: "#/components/schemas/VerifyOTPRequest" } } },
                    },
                    responses: {
                        200: { description: "OTP verified - returns reset token", content: { "application/json": { schema: { $ref: "#/components/schemas/SuccessResponse" } } } },
                        400: { description: "Invalid or expired OTP", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
                        429: { description: "Too many attempts" },
                    },
                },
            },
            "/auth/reset-password": {
                post: {
                    tags: ["Auth"],
                    summary: "Reset password",
                    description: "Reset password using the token received after OTP verification",
                    requestBody: {
                        required: true,
                        content: { "application/json": { schema: { $ref: "#/components/schemas/ResetPasswordRequest" } } },
                    },
                    responses: {
                        200: { description: "Password reset successful", content: { "application/json": { schema: { $ref: "#/components/schemas/SuccessResponse" } } } },
                        400: { description: "Invalid token or validation failed", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
                        429: { description: "Too many attempts" },
                    },
                },
            },
            "/auth/logout": {
                post: {
                    tags: ["Auth"],
                    summary: "Logout",
                    description: "Logout current session (revokes current refresh token)",
                    security: [{ bearerAuth: [] }],
                    responses: {
                        200: { description: "Logged out successfully", content: { "application/json": { schema: { $ref: "#/components/schemas/SuccessResponse" } } } },
                        401: { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
                    },
                },
            },
            "/auth/logout-all": {
                post: {
                    tags: ["Auth"],
                    summary: "Logout from all devices",
                    description: "Revoke all refresh tokens for the user - logs out from every device",
                    security: [{ bearerAuth: [] }],
                    responses: {
                        200: { description: "Logged out from all devices", content: { "application/json": { schema: { $ref: "#/components/schemas/SuccessResponse" } } } },
                        401: { description: "Unauthorized" },
                    },
                },
            },
            "/auth/me": {
                get: {
                    tags: ["Auth"],
                    summary: "Get profile",
                    description: "Get the authenticated user's profile with role and permissions",
                    security: [{ bearerAuth: [] }],
                    responses: {
                        200: {
                            description: "Profile retrieved",
                            content: { "application/json": { schema: { allOf: [{ $ref: "#/components/schemas/SuccessResponse" }, { type: "object", properties: { data: { $ref: "#/components/schemas/UserProfile" } } }] } } },
                        },
                        401: { description: "Unauthorized" },
                    },
                },
                patch: {
                    tags: ["Auth"],
                    summary: "Update profile",
                    description: "Update the authenticated user's profile (fullName and/or phoneNumber)",
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateProfileRequest" } } },
                    },
                    responses: {
                        200: { description: "Profile updated", content: { "application/json": { schema: { $ref: "#/components/schemas/SuccessResponse" } } } },
                        400: { description: "Validation failed", content: { "application/json": { schema: { $ref: "#/components/schemas/ValidationError" } } } },
                        401: { description: "Unauthorized" },
                    },
                },
            },
            "/auth/change-password": {
                post: {
                    tags: ["Auth"],
                    summary: "Change password",
                    description: "Change the authenticated user's password (requires current password)",
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: { "application/json": { schema: { $ref: "#/components/schemas/ChangePasswordRequest" } } },
                    },
                    responses: {
                        200: { description: "Password changed", content: { "application/json": { schema: { $ref: "#/components/schemas/SuccessResponse" } } } },
                        400: { description: "Validation failed or wrong current password" },
                        401: { description: "Unauthorized" },
                    },
                },
            },

            // ═══════════════════════════════════════
            //  MODULES
            // ═══════════════════════════════════════
            "/modules/list": {
                get: {
                    tags: ["Modules"],
                    summary: "List all modules",
                    description: "Get a paginated list of all system modules",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { name: "page", in: "query", schema: { type: "integer", default: 1, minimum: 1 }, description: "Page number" },
                        { name: "per_page", in: "query", schema: { type: "integer", default: 10, minimum: 1 }, description: "Items per page" },
                    ],
                    responses: {
                        200: { description: "Modules fetched", content: { "application/json": { schema: { $ref: "#/components/schemas/PaginatedResponse" } } } },
                        401: { description: "Unauthorized" },
                        403: { description: "Insufficient permissions" },
                    },
                },
            },
            "/modules/create": {
                post: {
                    tags: ["Modules"],
                    summary: "Create a module",
                    description: "Create a new system module. Requires `MODULES:create` permission.",
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: { "application/json": { schema: { $ref: "#/components/schemas/CreateModuleRequest" } } },
                    },
                    responses: {
                        201: { description: "Module created", content: { "application/json": { schema: { $ref: "#/components/schemas/CreatedResponse" } } } },
                        400: { description: "Validation failed or duplicate name" },
                        401: { description: "Unauthorized" },
                        403: { description: "Insufficient permissions" },
                    },
                },
            },
            "/modules/get/{id}": {
                get: {
                    tags: ["Modules"],
                    summary: "Get module by ID",
                    description: "Retrieve a single module by its ID",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { name: "id", in: "path", required: true, schema: { type: "string" }, description: "Module ID" },
                    ],
                    responses: {
                        200: { description: "Module retrieved", content: { "application/json": { schema: { allOf: [{ $ref: "#/components/schemas/SuccessResponse" }, { type: "object", properties: { data: { $ref: "#/components/schemas/Module" } } }] } } } },
                        401: { description: "Unauthorized" },
                        403: { description: "Insufficient permissions" },
                        404: { description: "Module not found" },
                    },
                },
            },
            "/modules/update/{id}": {
                put: {
                    tags: ["Modules"],
                    summary: "Update a module",
                    description: "Update an existing module. Requires `MODULES:update` permission.",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { name: "id", in: "path", required: true, schema: { type: "string" }, description: "Module ID" },
                    ],
                    requestBody: {
                        required: true,
                        content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateModuleRequest" } } },
                    },
                    responses: {
                        200: { description: "Module updated", content: { "application/json": { schema: { $ref: "#/components/schemas/SuccessResponse" } } } },
                        400: { description: "Validation failed" },
                        401: { description: "Unauthorized" },
                        403: { description: "Insufficient permissions" },
                        404: { description: "Module not found" },
                    },
                },
            },
            "/modules/delete/{id}": {
                delete: {
                    tags: ["Modules"],
                    summary: "Delete a module",
                    description: "Delete a module by ID. Requires `MODULES:delete` permission.",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { name: "id", in: "path", required: true, schema: { type: "string" }, description: "Module ID" },
                    ],
                    responses: {
                        200: { description: "Module deleted", content: { "application/json": { schema: { $ref: "#/components/schemas/SuccessResponse" } } } },
                        401: { description: "Unauthorized" },
                        403: { description: "Insufficient permissions" },
                        404: { description: "Module not found" },
                    },
                },
            },
            "/modules/toggle-status/{id}": {
                patch: {
                    tags: ["Modules"],
                    summary: "Toggle module status",
                    description: "Toggle a module's active/inactive status. Requires `MODULES:update` permission.",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { name: "id", in: "path", required: true, schema: { type: "string" }, description: "Module ID" },
                    ],
                    responses: {
                        200: { description: "Module status toggled", content: { "application/json": { schema: { $ref: "#/components/schemas/SuccessResponse" } } } },
                        401: { description: "Unauthorized" },
                        403: { description: "Insufficient permissions" },
                        404: { description: "Module not found" },
                    },
                },
            },

            // ═══════════════════════════════════════
            //  PERMISSIONS
            // ═══════════════════════════════════════
            "/permissions/list": {
                get: {
                    tags: ["Permissions"],
                    summary: "List all permissions",
                    description: "Get a paginated list of all permissions. Requires `PERMISSIONS:read` permission.",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { name: "page", in: "query", schema: { type: "integer", default: 1 }, description: "Page number" },
                        { name: "per_page", in: "query", schema: { type: "integer", default: 10 }, description: "Items per page" },
                    ],
                    responses: {
                        200: { description: "Permissions fetched", content: { "application/json": { schema: { $ref: "#/components/schemas/PaginatedResponse" } } } },
                        401: { description: "Unauthorized" },
                        403: { description: "Insufficient permissions" },
                    },
                },
            },
            "/permissions/create": {
                post: {
                    tags: ["Permissions"],
                    summary: "Create permissions (bulk)",
                    description: "Create one or more permissions in bulk. Requires `PERMISSIONS:create` permission.",
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: { "application/json": { schema: { $ref: "#/components/schemas/CreatePermissionsBulkRequest" } } },
                    },
                    responses: {
                        201: { description: "Permissions created", content: { "application/json": { schema: { $ref: "#/components/schemas/CreatedResponse" } } } },
                        400: { description: "Validation failed or duplicates" },
                        401: { description: "Unauthorized" },
                        403: { description: "Insufficient permissions" },
                    },
                },
            },
            "/permissions/get/{id}": {
                get: {
                    tags: ["Permissions"],
                    summary: "Get permission by ID",
                    description: "Retrieve a single permission by its ID",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { name: "id", in: "path", required: true, schema: { type: "string" }, description: "Permission ID" },
                    ],
                    responses: {
                        200: { description: "Permission retrieved", content: { "application/json": { schema: { allOf: [{ $ref: "#/components/schemas/SuccessResponse" }, { type: "object", properties: { data: { $ref: "#/components/schemas/Permission" } } }] } } } },
                        401: { description: "Unauthorized" },
                        403: { description: "Insufficient permissions" },
                        404: { description: "Permission not found" },
                    },
                },
            },
            "/permissions/update/{id}": {
                put: {
                    tags: ["Permissions"],
                    summary: "Update a permission",
                    description: "Update an existing permission. Requires `PERMISSIONS:update` permission.",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { name: "id", in: "path", required: true, schema: { type: "string" }, description: "Permission ID" },
                    ],
                    requestBody: {
                        required: true,
                        content: { "application/json": { schema: { $ref: "#/components/schemas/UpdatePermissionRequest" } } },
                    },
                    responses: {
                        200: { description: "Permission updated" },
                        400: { description: "Validation failed" },
                        401: { description: "Unauthorized" },
                        403: { description: "Insufficient permissions" },
                        404: { description: "Permission not found" },
                    },
                },
            },
            "/permissions/delete/{id}": {
                delete: {
                    tags: ["Permissions"],
                    summary: "Delete a permission",
                    description: "Delete a permission by ID. Requires `PERMISSIONS:delete` permission.",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { name: "id", in: "path", required: true, schema: { type: "string" }, description: "Permission ID" },
                    ],
                    responses: {
                        200: { description: "Permission deleted" },
                        401: { description: "Unauthorized" },
                        403: { description: "Insufficient permissions" },
                        404: { description: "Permission not found" },
                    },
                },
            },
            "/permissions/toggle-status/{id}": {
                patch: {
                    tags: ["Permissions"],
                    summary: "Toggle permission status",
                    description: "Toggle a permission's active/inactive status. Requires `PERMISSIONS:update` permission.",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { name: "id", in: "path", required: true, schema: { type: "string" }, description: "Permission ID" },
                    ],
                    responses: {
                        200: { description: "Permission status toggled" },
                        401: { description: "Unauthorized" },
                        403: { description: "Insufficient permissions" },
                        404: { description: "Permission not found" },
                    },
                },
            },

            // ═══════════════════════════════════════
            //  ROLES
            // ═══════════════════════════════════════
            "/roles/list": {
                get: {
                    tags: ["Roles"],
                    summary: "List all roles",
                    description: "Get a paginated list of all roles with their permissions. Requires `ROLES:read` permission.",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { name: "page", in: "query", schema: { type: "integer", default: 1 }, description: "Page number" },
                        { name: "per_page", in: "query", schema: { type: "integer", default: 10 }, description: "Items per page" },
                    ],
                    responses: {
                        200: { description: "Roles fetched", content: { "application/json": { schema: { $ref: "#/components/schemas/PaginatedResponse" } } } },
                        401: { description: "Unauthorized" },
                        403: { description: "Insufficient permissions" },
                    },
                },
            },
            "/roles/create": {
                post: {
                    tags: ["Roles"],
                    summary: "Create a role",
                    description: "Create a new role with optional permissions. Requires `ROLES:create` permission.",
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: { "application/json": { schema: { $ref: "#/components/schemas/CreateRoleRequest" } } },
                    },
                    responses: {
                        201: { description: "Role created", content: { "application/json": { schema: { $ref: "#/components/schemas/CreatedResponse" } } } },
                        400: { description: "Validation failed or duplicate name" },
                        401: { description: "Unauthorized" },
                        403: { description: "Insufficient permissions" },
                    },
                },
            },
            "/roles/get/{id}": {
                get: {
                    tags: ["Roles"],
                    summary: "Get role by ID",
                    description: "Retrieve a single role with its permissions",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { name: "id", in: "path", required: true, schema: { type: "string" }, description: "Role ID" },
                    ],
                    responses: {
                        200: { description: "Role retrieved", content: { "application/json": { schema: { allOf: [{ $ref: "#/components/schemas/SuccessResponse" }, { type: "object", properties: { data: { $ref: "#/components/schemas/Role" } } }] } } } },
                        401: { description: "Unauthorized" },
                        403: { description: "Insufficient permissions" },
                        404: { description: "Role not found" },
                    },
                },
            },
            "/roles/update/{id}": {
                put: {
                    tags: ["Roles"],
                    summary: "Update a role",
                    description: "Update role name, description, or permissions. Requires `ROLES:update` permission.",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { name: "id", in: "path", required: true, schema: { type: "string" }, description: "Role ID" },
                    ],
                    requestBody: {
                        required: true,
                        content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateRoleRequest" } } },
                    },
                    responses: {
                        200: { description: "Role updated" },
                        400: { description: "Validation failed" },
                        401: { description: "Unauthorized" },
                        403: { description: "Insufficient permissions" },
                        404: { description: "Role not found" },
                    },
                },
            },
            "/roles/delete/{id}": {
                delete: {
                    tags: ["Roles"],
                    summary: "Delete a role",
                    description: "Delete a role by ID. Requires `ROLES:delete` permission.",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { name: "id", in: "path", required: true, schema: { type: "string" }, description: "Role ID" },
                    ],
                    responses: {
                        200: { description: "Role deleted" },
                        401: { description: "Unauthorized" },
                        403: { description: "Insufficient permissions" },
                        404: { description: "Role not found" },
                    },
                },
            },
            "/roles/toggle-status/{id}": {
                patch: {
                    tags: ["Roles"],
                    summary: "Toggle role status",
                    description: "Toggle a role's active/inactive status. Requires `ROLES:update` permission.",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { name: "id", in: "path", required: true, schema: { type: "string" }, description: "Role ID" },
                    ],
                    responses: {
                        200: { description: "Role status toggled" },
                        401: { description: "Unauthorized" },
                        403: { description: "Insufficient permissions" },
                    },
                },
            },
            "/roles/permissions/add": {
                post: {
                    tags: ["Roles"],
                    summary: "Add permission to role",
                    description: "Add a single permission to a role. Requires `ROLES:update` permission.",
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: { "application/json": { schema: { $ref: "#/components/schemas/RolePermissionRequest" } } },
                    },
                    responses: {
                        200: { description: "Permission added to role" },
                        400: { description: "Invalid IDs" },
                        401: { description: "Unauthorized" },
                        403: { description: "Insufficient permissions" },
                    },
                },
            },
            "/roles/permissions/add-bulk": {
                post: {
                    tags: ["Roles"],
                    summary: "Add permissions to role (bulk)",
                    description: "Add multiple permissions to a role at once. Requires `ROLES:update` permission.",
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: { "application/json": { schema: { $ref: "#/components/schemas/RolePermissionsBulkRequest" } } },
                    },
                    responses: {
                        200: { description: "Permissions added to role" },
                        400: { description: "Validation failed" },
                        401: { description: "Unauthorized" },
                        403: { description: "Insufficient permissions" },
                    },
                },
            },
            "/roles/permissions/remove": {
                post: {
                    tags: ["Roles"],
                    summary: "Remove permission from role",
                    description: "Remove a single permission from a role. Requires `ROLES:update` permission.",
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: { "application/json": { schema: { $ref: "#/components/schemas/RolePermissionRequest" } } },
                    },
                    responses: {
                        200: { description: "Permission removed from role" },
                        400: { description: "Invalid IDs" },
                        401: { description: "Unauthorized" },
                        403: { description: "Insufficient permissions" },
                    },
                },
            },
            "/roles/permissions/remove-bulk": {
                post: {
                    tags: ["Roles"],
                    summary: "Remove permissions from role (bulk)",
                    description: "Remove multiple permissions from a role at once. Requires `ROLES:update` permission.",
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: { "application/json": { schema: { $ref: "#/components/schemas/RolePermissionsBulkRequest" } } },
                    },
                    responses: {
                        200: { description: "Permissions removed from role" },
                        400: { description: "Validation failed" },
                        401: { description: "Unauthorized" },
                        403: { description: "Insufficient permissions" },
                    },
                },
            },
            "/roles/permissions/set": {
                patch: {
                    tags: ["Roles"],
                    summary: "Set permissions for role",
                    description: "Replace all permissions for a role with the provided list. Requires `ROLES:update` permission.",
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: { "application/json": { schema: { $ref: "#/components/schemas/SetPermissionsForRoleRequest" } } },
                    },
                    responses: {
                        200: { description: "Role permissions updated" },
                        400: { description: "Validation failed" },
                        401: { description: "Unauthorized" },
                        403: { description: "Insufficient permissions" },
                    },
                },
            },

            // ═══════════════════════════════════════
            //  BRANCHES
            // ═══════════════════════════════════════
            "/branches/list": {
                get: {
                    tags: ["Branches"],
                    summary: "List all branches",
                    description: "Get a paginated list of branches. Non-admin users only see their assigned branch. Requires `Hotel & Branch Management:read` permission.",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { name: "page", in: "query", schema: { type: "integer", default: 1 }, description: "Page number" },
                        { name: "per_page", in: "query", schema: { type: "integer", default: 10 }, description: "Items per page" },
                    ],
                    responses: {
                        200: { description: "Branches fetched", content: { "application/json": { schema: { $ref: "#/components/schemas/PaginatedResponse" } } } },
                        401: { description: "Unauthorized" },
                        403: { description: "Insufficient permissions" },
                    },
                },
            },
            "/branches/create": {
                post: {
                    tags: ["Branches"],
                    summary: "Create a branch",
                    description: "Create a new hotel branch. Requires `Hotel & Branch Management:create` permission.",
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: { "application/json": { schema: { $ref: "#/components/schemas/CreateBranchRequest" } } },
                    },
                    responses: {
                        201: { description: "Branch created", content: { "application/json": { schema: { $ref: "#/components/schemas/CreatedResponse" } } } },
                        400: { description: "Validation failed or duplicate name" },
                        401: { description: "Unauthorized" },
                        403: { description: "Insufficient permissions" },
                    },
                },
            },
            "/branches/get/{id}": {
                get: {
                    tags: ["Branches"],
                    summary: "Get branch by ID",
                    description: "Retrieve a single branch. Branch access middleware ensures the user has access to this branch.",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { name: "id", in: "path", required: true, schema: { type: "string" }, description: "Branch ID" },
                    ],
                    responses: {
                        200: { description: "Branch retrieved", content: { "application/json": { schema: { allOf: [{ $ref: "#/components/schemas/SuccessResponse" }, { type: "object", properties: { data: { $ref: "#/components/schemas/Branch" } } }] } } } },
                        401: { description: "Unauthorized" },
                        403: { description: "No access to this branch" },
                        404: { description: "Branch not found" },
                    },
                },
            },
            "/branches/update/{id}": {
                put: {
                    tags: ["Branches"],
                    summary: "Update a branch",
                    description: "Update an existing branch. Requires `Hotel & Branch Management:update` permission and branch access.",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { name: "id", in: "path", required: true, schema: { type: "string" }, description: "Branch ID" },
                    ],
                    requestBody: {
                        required: true,
                        content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateBranchRequest" } } },
                    },
                    responses: {
                        200: { description: "Branch updated" },
                        400: { description: "Validation failed" },
                        401: { description: "Unauthorized" },
                        403: { description: "No access to this branch" },
                        404: { description: "Branch not found" },
                    },
                },
            },
            "/branches/delete/{id}": {
                delete: {
                    tags: ["Branches"],
                    summary: "Delete a branch",
                    description: "Delete a branch by ID. Requires `Hotel & Branch Management:delete` permission and branch access.",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { name: "id", in: "path", required: true, schema: { type: "string" }, description: "Branch ID" },
                    ],
                    responses: {
                        200: { description: "Branch deleted" },
                        401: { description: "Unauthorized" },
                        403: { description: "No access to this branch" },
                        404: { description: "Branch not found" },
                    },
                },
            },
            "/branches/toggle-status/{id}": {
                patch: {
                    tags: ["Branches"],
                    summary: "Toggle branch status",
                    description: "Toggle a branch's active/inactive status. Requires `Hotel & Branch Management:update` permission and branch access.",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { name: "id", in: "path", required: true, schema: { type: "string" }, description: "Branch ID" },
                    ],
                    responses: {
                        200: { description: "Branch status toggled" },
                        401: { description: "Unauthorized" },
                        403: { description: "No access to this branch" },
                        404: { description: "Branch not found" },
                    },
                },
            },

            // ═══════════════════════════════════════
            //  EMPLOYEES
            // ═══════════════════════════════════════
            "/employees/create-with-user": {
                post: {
                    tags: ["Employees"],
                    summary: "Create employee with user account",
                    description: "Create a new employee and their user account simultaneously. A password reset email is sent. Requires `Hotel & Branch Management:create` permission.",
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: { "application/json": { schema: { $ref: "#/components/schemas/CreateEmployeeWithUserRequest" } } },
                    },
                    responses: {
                        201: { description: "Employee and user created", content: { "application/json": { schema: { $ref: "#/components/schemas/CreatedResponse" } } } },
                        400: { description: "Validation failed or user already exists" },
                        401: { description: "Unauthorized" },
                        403: { description: "Insufficient permissions or no branch access" },
                    },
                },
            },
            "/employees/list": {
                get: {
                    tags: ["Employees"],
                    summary: "List all employees",
                    description: "Get a paginated list of employees. Non-admin users only see employees in their branch. Requires `Hotel & Branch Management:read` permission.",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { name: "page", in: "query", schema: { type: "integer", default: 1 }, description: "Page number" },
                        { name: "per_page", in: "query", schema: { type: "integer", default: 10 }, description: "Items per page" },
                    ],
                    responses: {
                        200: { description: "Employees fetched", content: { "application/json": { schema: { $ref: "#/components/schemas/PaginatedResponse" } } } },
                        401: { description: "Unauthorized" },
                        403: { description: "Insufficient permissions" },
                    },
                },
            },
            "/employees/assign": {
                post: {
                    tags: ["Employees"],
                    summary: "Assign existing user as employee",
                    description: "Assign an existing user to a branch as an employee. Requires `Hotel & Branch Management:create` permission.",
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: { "application/json": { schema: { $ref: "#/components/schemas/AssignEmployeeRequest" } } },
                    },
                    responses: {
                        201: { description: "Employee assigned", content: { "application/json": { schema: { $ref: "#/components/schemas/CreatedResponse" } } } },
                        400: { description: "Validation failed or already assigned" },
                        401: { description: "Unauthorized" },
                        403: { description: "Insufficient permissions or no branch access" },
                    },
                },
            },
            "/employees/get/{id}": {
                get: {
                    tags: ["Employees"],
                    summary: "Get employee by ID",
                    description: "Retrieve a single employee with user and branch details",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { name: "id", in: "path", required: true, schema: { type: "string" }, description: "Employee ID" },
                    ],
                    responses: {
                        200: { description: "Employee retrieved", content: { "application/json": { schema: { allOf: [{ $ref: "#/components/schemas/SuccessResponse" }, { type: "object", properties: { data: { $ref: "#/components/schemas/Employee" } } }] } } } },
                        401: { description: "Unauthorized" },
                        403: { description: "No access to this employee" },
                        404: { description: "Employee not found" },
                    },
                },
            },
            "/employees/update/{id}": {
                put: {
                    tags: ["Employees"],
                    summary: "Update an employee",
                    description: "Update employee details. Requires `Hotel & Branch Management:update` permission and employee/branch access.",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { name: "id", in: "path", required: true, schema: { type: "string" }, description: "Employee ID" },
                    ],
                    requestBody: {
                        required: true,
                        content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateEmployeeRequest" } } },
                    },
                    responses: {
                        200: { description: "Employee updated" },
                        400: { description: "Validation failed" },
                        401: { description: "Unauthorized" },
                        403: { description: "No access" },
                        404: { description: "Employee not found" },
                    },
                },
            },
            "/employees/remove/{id}": {
                delete: {
                    tags: ["Employees"],
                    summary: "Remove an employee",
                    description: "Remove an employee from the branch. Requires `Hotel & Branch Management:delete` permission and employee access.",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { name: "id", in: "path", required: true, schema: { type: "string" }, description: "Employee ID" },
                    ],
                    responses: {
                        200: { description: "Employee removed" },
                        401: { description: "Unauthorized" },
                        403: { description: "No access" },
                        404: { description: "Employee not found" },
                    },
                },
            },
            "/employees/branch/{branchId}": {
                get: {
                    tags: ["Employees"],
                    summary: "Get employees by branch",
                    description: "Get a paginated list of employees in a specific branch. Requires `Hotel & Branch Management:read` permission and branch access.",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { name: "branchId", in: "path", required: true, schema: { type: "string" }, description: "Branch ID" },
                        { name: "page", in: "query", schema: { type: "integer", default: 1 }, description: "Page number" },
                        { name: "per_page", in: "query", schema: { type: "integer", default: 10 }, description: "Items per page" },
                    ],
                    responses: {
                        200: { description: "Employees fetched", content: { "application/json": { schema: { $ref: "#/components/schemas/PaginatedResponse" } } } },
                        401: { description: "Unauthorized" },
                        403: { description: "No access to this branch" },
                    },
                },
            },

            // ═══════════════════════════════════════
            //  ROOMS
            // ═══════════════════════════════════════
            "/rooms/create": {
                post: {
                    tags: ["Rooms"],
                    summary: "Create a room",
                    description: "Create a new room in a branch. Requires `Room Management & Booking:create` permission.",
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: { "application/json": { schema: { $ref: "#/components/schemas/CreateRoomRequest" } } },
                    },
                    responses: {
                        201: { description: "Room created", content: { "application/json": { schema: { $ref: "#/components/schemas/CreatedResponse" } } } },
                        400: { description: "Validation failed or duplicate room number" },
                        401: { description: "Unauthorized" },
                        403: { description: "Insufficient permissions or no branch access" },
                    },
                },
            },
            "/rooms/bulk-create": {
                post: {
                    tags: ["Rooms"],
                    summary: "Bulk create rooms",
                    description: "Create multiple rooms at once. Requires `Room Management & Booking:create` permission.",
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: { "application/json": { schema: { $ref: "#/components/schemas/BulkCreateRoomsRequest" } } },
                    },
                    responses: {
                        201: { description: "Rooms created", content: { "application/json": { schema: { $ref: "#/components/schemas/CreatedResponse" } } } },
                        400: { description: "Validation failed" },
                        401: { description: "Unauthorized" },
                        403: { description: "Insufficient permissions" },
                    },
                },
            },
            "/rooms/list": {
                get: {
                    tags: ["Rooms"],
                    summary: "List all rooms",
                    description: "Get a paginated list of rooms. Admins can filter by branchId; non-admins see only their branch rooms. Requires `Room Management & Booking:read` permission.",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { name: "page", in: "query", schema: { type: "integer", default: 1 }, description: "Page number" },
                        { name: "per_page", in: "query", schema: { type: "integer", default: 10 }, description: "Items per page" },
                        { name: "branchId", in: "query", schema: { type: "string" }, description: "Branch ID (admin only)" },
                        { name: "type", in: "query", schema: { type: "string", enum: ["single", "double", "triple", "shared", "dormitory", "group", "quad"] }, description: "Filter by room type" },
                        { name: "status", in: "query", schema: { type: "string", enum: ["available", "occupied", "maintenance", "cleaning"] }, description: "Filter by room status" },
                    ],
                    responses: {
                        200: { description: "Rooms fetched", content: { "application/json": { schema: { $ref: "#/components/schemas/PaginatedResponse" } } } },
                        400: { description: "Branch ID required" },
                        401: { description: "Unauthorized" },
                        403: { description: "Insufficient permissions" },
                    },
                },
            },
            "/rooms/get/{id}": {
                get: {
                    tags: ["Rooms"],
                    summary: "Get room by ID",
                    description: "Retrieve a single room by its ID",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { name: "id", in: "path", required: true, schema: { type: "string" }, description: "Room ID" },
                    ],
                    responses: {
                        200: { description: "Room retrieved", content: { "application/json": { schema: { allOf: [{ $ref: "#/components/schemas/SuccessResponse" }, { type: "object", properties: { data: { $ref: "#/components/schemas/Room" } } }] } } } },
                        401: { description: "Unauthorized" },
                        403: { description: "No access to this room" },
                        404: { description: "Room not found" },
                    },
                },
            },
            "/rooms/availability": {
                get: {
                    tags: ["Rooms"],
                    summary: "Check room availability",
                    description: "Get available rooms filtered by branch, type, and/or capacity",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { name: "branchId", in: "query", schema: { type: "string" }, description: "Branch ID (defaults to user's branch)" },
                        { name: "type", in: "query", schema: { type: "string", enum: ["single", "double", "triple", "shared", "dormitory", "group", "quad"] }, description: "Room type filter" },
                        { name: "checkInDate", in: "query", schema: { type: "string", format: "date-time" }, description: "Requested check-in date/time" },
                        { name: "checkOutDate", in: "query", schema: { type: "string", format: "date-time" }, description: "Requested check-out date/time" },
                        { name: "partyType", in: "query", schema: { type: "string", enum: ["individual", "couple", "group"], default: "individual" }, description: "Booking party type" },
                        { name: "guestCount", in: "query", schema: { type: "integer", minimum: 1, default: 1 }, description: "Number of guests" },
                        { name: "gender", in: "query", schema: { type: "string", enum: ["male", "female", "mixed"], default: "mixed" }, description: "Guest gender for gender-restricted rooms" },
                        { name: "capacity", in: "query", schema: { type: "integer", minimum: 1 }, description: "Minimum capacity filter" },
                        { name: "page", in: "query", schema: { type: "integer", default: 1 }, description: "Page number" },
                        { name: "per_page", in: "query", schema: { type: "integer", default: 10 }, description: "Items per page" },
                    ],
                    responses: {
                        200: { description: "Available rooms fetched", content: { "application/json": { schema: { $ref: "#/components/schemas/PaginatedResponse" } } } },
                        400: { description: "Invalid parameters" },
                        401: { description: "Unauthorized" },
                        403: { description: "Insufficient permissions" },
                    },
                },
            },
            "/rooms/by-floor": {
                get: {
                    tags: ["Rooms"],
                    summary: "Get rooms by floor",
                    description: "Get rooms on a specific floor in a branch",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { name: "branchId", in: "query", schema: { type: "string" }, description: "Branch ID (defaults to user's branch)" },
                        { name: "floor", in: "query", required: true, schema: { type: "integer" }, description: "Floor number" },
                        { name: "page", in: "query", schema: { type: "integer", default: 1 }, description: "Page number" },
                        { name: "per_page", in: "query", schema: { type: "integer", default: 10 }, description: "Items per page" },
                    ],
                    responses: {
                        200: { description: "Rooms by floor fetched", content: { "application/json": { schema: { $ref: "#/components/schemas/PaginatedResponse" } } } },
                        400: { description: "Floor number required and must be valid" },
                        401: { description: "Unauthorized" },
                        403: { description: "Insufficient permissions" },
                    },
                },
            },
            "/rooms/update/{id}": {
                put: {
                    tags: ["Rooms"],
                    summary: "Update a room",
                    description: "Update room details. Requires `Room Management & Booking:update` permission and room access.",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { name: "id", in: "path", required: true, schema: { type: "string" }, description: "Room ID" },
                    ],
                    requestBody: {
                        required: true,
                        content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateRoomRequest" } } },
                    },
                    responses: {
                        200: { description: "Room updated" },
                        400: { description: "Validation failed" },
                        401: { description: "Unauthorized" },
                        403: { description: "No access to this room" },
                        404: { description: "Room not found" },
                    },
                },
            },
            "/rooms/delete/{id}": {
                delete: {
                    tags: ["Rooms"],
                    summary: "Delete a room",
                    description: "Delete a room by ID. Requires `Room Management & Booking:delete` permission and room access.",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { name: "id", in: "path", required: true, schema: { type: "string" }, description: "Room ID" },
                    ],
                    responses: {
                        200: { description: "Room deleted" },
                        401: { description: "Unauthorized" },
                        403: { description: "No access" },
                        404: { description: "Room not found" },
                    },
                },
            },
            "/rooms/toggle-status/{id}": {
                patch: {
                    tags: ["Rooms"],
                    summary: "Toggle room active status",
                    description: "Toggle a room's isActive status. Requires `Room Management & Booking:update` permission and room access.",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { name: "id", in: "path", required: true, schema: { type: "string" }, description: "Room ID" },
                    ],
                    responses: {
                        200: { description: "Room status toggled" },
                        401: { description: "Unauthorized" },
                        403: { description: "No access" },
                        404: { description: "Room not found" },
                    },
                },
            },
            "/rooms/{id}/status": {
                patch: {
                    tags: ["Rooms"],
                    summary: "Update room status",
                    description: "Update a room's operational status (available, occupied, maintenance, cleaning). Requires `Room Management & Booking:update` permission and room access.",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { name: "id", in: "path", required: true, schema: { type: "string" }, description: "Room ID" },
                    ],
                    requestBody: {
                        required: true,
                        content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateRoomStatusRequest" } } },
                    },
                    responses: {
                        200: { description: "Room status updated" },
                        400: { description: "Invalid status value" },
                        401: { description: "Unauthorized" },
                        403: { description: "No access" },
                        404: { description: "Room not found" },
                    },
                },
            },

            // ═══════════════════════════════════════
            //  BOOKINGS
            // ═══════════════════════════════════════
            "/bookings/create": {
                post: {
                    tags: ["Bookings"],
                    summary: "Create booking",
                    description: "Create a room booking with capacity, gender restriction, and overbooking protection checks.",
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: { "application/json": { schema: { $ref: "#/components/schemas/CreateBookingRequest" } } },
                    },
                    responses: {
                        201: { description: "Booking created" },
                        400: { description: "Validation or business rule failure" },
                        401: { description: "Unauthorized" },
                        403: { description: "Insufficient permissions or no branch access" },
                        409: { description: "Overbooking prevented" },
                    },
                },
            },
            "/bookings/list": {
                get: {
                    tags: ["Bookings"],
                    summary: "List bookings",
                    description: "List bookings by branch with optional filters.",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { name: "page", in: "query", schema: { type: "integer", default: 1 } },
                        { name: "per_page", in: "query", schema: { type: "integer", default: 10 } },
                        { name: "branchId", in: "query", schema: { type: "string" }, description: "Admin only filter" },
                        { name: "roomId", in: "query", schema: { type: "string" } },
                        { name: "status", in: "query", schema: { type: "string", enum: ["confirmed", "cancelled", "reassigned"] } },
                        { name: "fromDate", in: "query", schema: { type: "string", format: "date-time" } },
                        { name: "toDate", in: "query", schema: { type: "string", format: "date-time" } },
                    ],
                    responses: {
                        200: { description: "Bookings fetched", content: { "application/json": { schema: { $ref: "#/components/schemas/PaginatedResponse" } } } },
                        401: { description: "Unauthorized" },
                        403: { description: "Insufficient permissions" },
                    },
                },
            },
            "/meal-plans": {
                get: {
                    tags: ["Meal Plans"],
                    summary: "List meal plans",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { name: "branchId", in: "query", schema: { type: "string" } },
                        { name: "active", in: "query", schema: { type: "boolean" } },
                    ],
                    responses: {
                        200: { description: "Meal plans fetched" },
                        401: { description: "Unauthorized" },
                        403: { description: "Forbidden" },
                    },
                },
                post: {
                    tags: ["Meal Plans"],
                    summary: "Create meal plan",
                    security: [{ bearerAuth: [] }],
                    requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } },
                    responses: {
                        201: { description: "Meal plan created" },
                        400: { description: "Bad request" },
                        401: { description: "Unauthorized" },
                        403: { description: "Forbidden" },
                    },
                },
            },
            "/meal-plans/{id}": {
                put: {
                    tags: ["Meal Plans"],
                    summary: "Update meal plan",
                    security: [{ bearerAuth: [] }],
                    parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
                    requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } },
                    responses: { 200: { description: "Meal plan updated" } },
                },
            },
            "/meal-plans/{id}/toggle": {
                patch: {
                    tags: ["Meal Plans"],
                    summary: "Toggle meal plan active status",
                    security: [{ bearerAuth: [] }],
                    parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
                    responses: { 200: { description: "Meal plan toggled" } },
                },
            },
            "/add-ons": {
                get: {
                    tags: ["Add-Ons"],
                    summary: "List add-on services",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { name: "branchId", in: "query", schema: { type: "string" } },
                        { name: "active", in: "query", schema: { type: "boolean" } },
                    ],
                    responses: { 200: { description: "Add-ons fetched" } },
                },
                post: {
                    tags: ["Add-Ons"],
                    summary: "Create add-on service",
                    security: [{ bearerAuth: [] }],
                    requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } },
                    responses: { 201: { description: "Add-on created" } },
                },
            },
            "/add-ons/{id}": {
                put: {
                    tags: ["Add-Ons"],
                    summary: "Update add-on service",
                    security: [{ bearerAuth: [] }],
                    parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
                    requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } },
                    responses: { 200: { description: "Add-on updated" } },
                },
            },
            "/add-ons/{id}/toggle": {
                patch: {
                    tags: ["Add-Ons"],
                    summary: "Toggle add-on active status",
                    security: [{ bearerAuth: [] }],
                    parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
                    responses: { 200: { description: "Add-on toggled" } },
                },
            },
            "/kitchen/prep": {
                get: {
                    tags: ["Kitchen"],
                    summary: "Get kitchen prep totals (computed)",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { name: "branchId", in: "query", required: true, schema: { type: "string" } },
                        { name: "date", in: "query", required: true, schema: { type: "string", example: "2026-04-15" } },
                    ],
                    responses: { 200: { description: "Kitchen prep fetched" } },
                },
            },
            "/kitchen/adjustments": {
                get: {
                    tags: ["Kitchen"],
                    summary: "List kitchen adjustments",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { name: "branchId", in: "query", schema: { type: "string" } },
                        { name: "date", in: "query", schema: { type: "string" } },
                    ],
                    responses: { 200: { description: "Adjustments fetched" } },
                },
                post: {
                    tags: ["Kitchen"],
                    summary: "Create kitchen adjustment",
                    security: [{ bearerAuth: [] }],
                    requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } },
                    responses: { 201: { description: "Adjustment created" } },
                },
            },
            "/bookings/get/{id}": {
                get: {
                    tags: ["Bookings"],
                    summary: "Get booking by ID",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { name: "id", in: "path", required: true, schema: { type: "string" } },
                    ],
                    responses: {
                        200: { description: "Booking retrieved", content: { "application/json": { schema: { allOf: [{ $ref: "#/components/schemas/SuccessResponse" }, { type: "object", properties: { data: { $ref: "#/components/schemas/Booking" } } }] } } } },
                        401: { description: "Unauthorized" },
                        403: { description: "No access" },
                        404: { description: "Booking not found" },
                    },
                },
            },
            "/bookings/{id}/cancel": {
                patch: {
                    tags: ["Bookings"],
                    summary: "Cancel booking",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { name: "id", in: "path", required: true, schema: { type: "string" } },
                    ],
                    requestBody: {
                        required: false,
                        content: { "application/json": { schema: { $ref: "#/components/schemas/CancelBookingRequest" } } },
                    },
                    responses: {
                        200: { description: "Booking cancelled" },
                        400: { description: "Invalid booking state" },
                        401: { description: "Unauthorized" },
                        403: { description: "No access" },
                        404: { description: "Booking not found" },
                    },
                },
            },
            "/bookings/{id}/reassign": {
                patch: {
                    tags: ["Bookings"],
                    summary: "Reassign booking",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { name: "id", in: "path", required: true, schema: { type: "string" } },
                    ],
                    requestBody: {
                        required: true,
                        content: { "application/json": { schema: { $ref: "#/components/schemas/ReassignBookingRequest" } } },
                    },
                    responses: {
                        200: { description: "Booking reassigned" },
                        400: { description: "Validation or business rule failure" },
                        401: { description: "Unauthorized" },
                        403: { description: "No access" },
                        404: { description: "Booking or room not found" },
                        409: { description: "Overbooking prevented" },
                    },
                },
            },

            // ═══════════════════════════════════════
            //  CONTACT US
            // ═══════════════════════════════════════
            "/contact-us": {
                post: {
                    tags: ["Contact Us"],
                    summary: "Submit contact form",
                    description: "Submit a contact us form. No authentication required. Sends notification emails to admin and confirmation to the user.",
                    requestBody: {
                        required: true,
                        content: { "application/json": { schema: { $ref: "#/components/schemas/ContactUsRequest" } } },
                    },
                    responses: {
                        201: { description: "Message submitted successfully", content: { "application/json": { schema: { $ref: "#/components/schemas/CreatedResponse" } } } },
                        400: { description: "Validation failed", content: { "application/json": { schema: { $ref: "#/components/schemas/ValidationError" } } } },
                        500: { description: "Server error" },
                    },
                },
            },
        },
    },
    apis: [],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
