class ErrorHandler extends Error {
  constructor(StatusCode, Message) {
    super(Message);
    (this.status = StatusCode), Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ErrorHandler;
