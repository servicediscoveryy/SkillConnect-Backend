import { Request, Response, NextFunction } from "express";
import ApiError from "../utils/response/ApiError"; // Import your custom error class

const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let errors = err.errors || [];

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors,
  });
};

export default errorHandler;
