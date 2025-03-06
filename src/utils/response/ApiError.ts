class ApiError extends Error {
  statusCode: number;
  errors: any[];
  success: boolean;

  constructor(
    statusCode: number,
    message: string,
    errors: any[] = [],
    stack = ""
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.success = false;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  // Method to convert the error to a JSON format
  toJSON() {
    return {
      success: this.success,
      statusCode: this.statusCode,
      message: this.message,
      errors: this.errors,
      stack: process.env.NODE_ENV === "development" ? this.stack : undefined, // Optionally show stack trace in development mode
    };
  }
}

export default ApiError;
