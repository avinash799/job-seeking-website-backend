class ErrorHandler extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}

// Error handling middleware to handle different types of errors
const errorMiddleware = (err, req, res, next) => {
    // Default error message and status code
    err.message = err.message || "Internal Server Error";
    err.statusCode = err.statusCode || 500;

    // Log the error for debugging purposes
    if (process.env.NODE_ENV === "development") {
        console.error(err);  // Print the full error stack trace for development
    }

    // Handle Mongoose CastError (Invalid ObjectId error)
    if (err.name === "CastError") {
        const message = `Resource not found. Invalid ${err.path}`;
        err = new ErrorHandler(message, 400);
    }

    // Handle Mongoose duplicate key error (code 11000)
    if (err.code === 11000) {
        const message = `Duplicate ${Object.keys(err.keyValue)} entered`;
        err = new ErrorHandler(message, 400);
    }

    // Handle invalid JWT error (for example, invalid token)
    if (err.name === "JsonWebTokenError") {
        const message = "Invalid JSON Web Token. Please try again.";
        err = new ErrorHandler(message, 400);
    }

    // Handle expired JWT error (for example, expired token)
    if (err.name === "TokenExpiredError") {
        const message = "Your session has expired. Please log in again.";
        err = new ErrorHandler(message, 401);
    }

    // Send the error response
    return res.status(err.statusCode).json({
        success: false,
        message: err.message,
        // Optionally include stack trace in development
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
};

export { ErrorHandler, errorMiddleware };
