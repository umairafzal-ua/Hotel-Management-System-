
class ApiResponse {
    constructor(statusCode, data, message = "Success", meta = null, links = null) {
        this.success = statusCode < 400;
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
        
        if (meta) {
            this.meta = meta;
        }
        
        if (links) {
            this.links = links;
        }
    }
}

class ApiError extends Error {
    constructor(
        statusCode,
        message = "Something went wrong",
        errors = [],
        stack = ""
    ) {
        super(message);
        this.success = false;
        this.statusCode = statusCode;
        this.message = message;
        this.data = null;
        this.errors = errors;

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

// HTTP Status Codes
const HttpStatus = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,
};

// Response helper functions
const sendResponse = (res, statusCode, data, message = "Success", meta = null, links = null) => {
    return res.status(statusCode).json(new ApiResponse(statusCode, data, message, meta, links));
};

const sendSuccess = (res, data = null, message = "Success", statusCode = HttpStatus.OK, meta = null, links = null) => {
    return sendResponse(res, statusCode, data, message, meta, links);
};

const sendCreated = (res, data = null, message = "Created successfully", meta = null, links = null) => {
    return sendResponse(res, HttpStatus.CREATED, data, message, meta, links);
};

const sendPaginated = (res, data, pagination, message = "Success", statusCode = HttpStatus.OK) => {
    const meta = {
        pagination: {
            total: pagination.total_items,
            per_page: pagination.per_page,
            current_page: pagination.page,
            last_page: pagination.total_pages,
            from: (pagination.page - 1) * pagination.per_page + 1,
            to: Math.min(pagination.page * pagination.per_page, pagination.total_items),
            has_more_pages: pagination.page < pagination.total_pages,
        }
    };
    
    return sendResponse(res, statusCode, data, message, meta, null);
};

const sendError = (res, statusCode = HttpStatus.INTERNAL_SERVER_ERROR, message = "Something went wrong", errors = []) => {
    return res.status(statusCode).json({
        success: false,
        statusCode,
        message,
        data: null,
        errors: errors.length > 0 ? errors : undefined,
    });
};

const sendBadRequest = (res, message = "Bad request", errors = []) => {
    return sendError(res, HttpStatus.BAD_REQUEST, message, errors);
};

const sendUnauthorized = (res, message = "Unauthorized access") => {
    return sendError(res, HttpStatus.UNAUTHORIZED, message);
};

const sendForbidden = (res, message = "Access forbidden") => {
    return sendError(res, HttpStatus.FORBIDDEN, message);
};

const sendNotFound = (res, message = "Resource not found") => {
    return sendError(res, HttpStatus.NOT_FOUND, message);
};

const sendConflict = (res, message = "Resource already exists") => {
    return sendError(res, HttpStatus.CONFLICT, message);
};

export {
    ApiResponse,
    ApiError,
    HttpStatus,
    sendResponse,
    sendSuccess,
    sendCreated,
    sendPaginated,
    sendError,
    sendBadRequest,
    sendUnauthorized,
    sendForbidden,
    sendNotFound,
    sendConflict,
};