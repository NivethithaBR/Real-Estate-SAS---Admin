const handleError = (err) => {
  let error = new Error(err.message);

  if (err.name == "ValidationError") {
    console.log(err.errors.role, err.errors.email)
    message = Object.values(err.errors).map((value) => {
      let isNormalValidation = value?.message?.replaceAll("`", "")?.trim() == `Path ${value?.path} is required.`?.trim();
      
      console.log(`Path ${value?.path} is required`, value.message?.replaceAll("`",""))
      console.log(isNormalValidation)
      return isNormalValidation ? `${value?.path} is Required` : value?.message
    });
    console.log(message)
    error = new Error(message?.[0]?.split("_")?.join(",").replace(",", " "));
    error.statusCode = 400;
  }

  if (err.name == "CastError") {
    message = `Resource not found: ${err.path}`;
    error = new Error(message);
    error.statusCode = 400;
  }

  if (err.code == 11000) {
    let message = `Duplicate ${Object.keys(err.keyValue)} error`;
    error = new Error(message);
    error.statusCode = 400;
  }

  if (err.name == "JSONWebTokenError") {
    let message = `JSON Web Token is invalid. Try again`;
    error = new Error(message);
    error.statusCode = 400;
  }

  if (err.name == "TokenExpiredError") {
    let message = `JSON Web Token is expired. Try again`;
    error = new Error(message);
    error.statusCode = 400;
  }
  return error;
};

const ErrorMiddleware = (err, req, res, next) => {
  err.statusCode = err.status || 500;
  console.log(err)
  err.message = err.message || "Internal Server Error";
  if (process.env.NODE_ENV == "development") {
    let error = handleError(err);
    res.status(err.statusCode).json({
      success: false,
      message: error.message,
      stack: error.stack,
      error,
    });
  }

  if (process.env.NODE_ENV == "production") {
    let error = handleError(err);
    res.status(err.statusCode).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

module.exports = ErrorMiddleware;
