const errorHandler = (err, req, res, next) => {
    // If the status code is 200 but an error was thrown, default to 500 (Internal Server Error)
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

    res.status(statusCode).json({
        success: false,
        message: err.message || 'An unexpected error occurred',
        // Only show the error stack trace if you are in development mode
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

// Optional: Catch requests to routes that don't exist
const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error); // Passes the error to the errorHandler above
};

module.exports = { errorHandler, notFound };
