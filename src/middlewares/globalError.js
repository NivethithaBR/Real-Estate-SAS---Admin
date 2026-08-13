const globalError = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const success = err.success || false;
    const message = err.message || "Internal Server Error";
    const stack = err.stack;
    res.status(statusCode).json({
        message,
        statusCode,
        success,
        stack
    });
}

module.exports = globalError;
