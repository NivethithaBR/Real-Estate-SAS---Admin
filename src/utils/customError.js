class CustomError extends Error {
    constructor(message, statusCode, success = false){
        super(message);
        this.statusCode = statusCode;
        this.success = success;
        Error.captureStackTrace(this, this.constructor);
    }
}

const customError = (message, statuscode, success = false) => {
    return new CustomError(message, statuscode, success);
}

module.exports = {customError, CustomError};