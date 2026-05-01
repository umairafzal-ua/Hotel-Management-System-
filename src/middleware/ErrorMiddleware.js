import { ApiError, HttpStatus, sendError } from "../utils/apiResponse.js";


export const notFoundHandler = (req, res, next) => {
    const error = new ApiError(
        HttpStatus.NOT_FOUND,
        `Cannot ${req.method} ${req.originalUrl}`
    );
    next(error);
};

export const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
    error.stack = err.stack;

    // Log error in development
    if (process.env.NODE_ENV === "development") {
        console.error("Error:", {
            message: err.message,
            stack: err.stack,
            statusCode: err.statusCode,
        });
    }

    // Mongoose Bad ObjectId Error
    if (err.name === "CastError") {
        error = new ApiError(HttpStatus.BAD_REQUEST, "Invalid resource ID format");
    }

    // Mongoose Duplicate Key Error
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue || {})[0];
        const message = field
            ? `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`
            : "Duplicate field value entered";
        error = new ApiError(HttpStatus.CONFLICT, message);
    }

    // Mongoose Validation Error
    if (err.name === "ValidationError") {
        const errors = Object.values(err.errors).map((e) => ({
            field: e.path,
            message: e.message,
        }));
        return sendError(
            res,
            HttpStatus.BAD_REQUEST,
            "Validation failed",
            errors
        );
    }

    // JWT Errors
    if (err.name === "JsonWebTokenError") {
        error = new ApiError(HttpStatus.UNAUTHORIZED, "Invalid token");
    }

    if (err.name === "TokenExpiredError") {
        error = new ApiError(HttpStatus.UNAUTHORIZED, "Token has expired");
    }

    // Syntax Error (invalid JSON)
    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
        error = new ApiError(HttpStatus.BAD_REQUEST, "Invalid JSON payload");
    }

    // ApiError instances
    if (err instanceof ApiError) {
        return sendError(res, err.statusCode, err.message, err.errors);
    }

    // Default to 500 Internal Server Error
    const statusCode = error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR;
    const message =
        process.env.NODE_ENV === "production" && statusCode === 500
            ? "Internal server error"
            : error.message || "Internal server error";

    return sendError(res, statusCode, message);
};

export const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

export default {
    notFoundHandler,
    errorHandler,
    asyncHandler,
};
