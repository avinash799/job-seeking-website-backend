class ErrorHandler extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}

export const errorMiddleware = (err, req, res, next) => {
    err.message = err.message || "Internal Server Error";
    err.statusCode = err.statusCode || 500;

    // Handle Mongoose CastError for invalid ObjectId
    if (err.name === "CastError") {
        const message = `Resource not found. Invalid ${err.path}`;
        err = new ErrorHandler(message, 400);
    }

    // Handle Mongoose duplicate key error
    if (err.code === 11000) {
        const message = `Duplicate ${Object.keys(err.keyValue)} entered`;
        err = new ErrorHandler(message, 400);
    }

    // Handle invalid JWT error
    if (err.name === "JsonWebTokenError") {
        const message = "Invalid JSON Web Token. Please try again.";
        err = new ErrorHandler(message, 400);
    }

    // Handle expired JWT error
    if (err.name === "TokenExpiredError") {
        const message = "Your session has expired. Please log in again.";
        err = new ErrorHandler(message, 401);
    }

    // Send JSON response
    return res.status(err.statusCode).json({
        success: false,
        message: err.message,
    });
};

export { ErrorHandler };