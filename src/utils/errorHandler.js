class CustomError extends Error {
  constructor(statusCode, message, boolean) {
    super(message);
    this.statusCode = statusCode;
    this.boolean = boolean;
  }
}

export default CustomError;
