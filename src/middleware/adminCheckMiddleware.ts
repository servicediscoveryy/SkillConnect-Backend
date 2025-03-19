import { RequestWithUser } from "../types/RequestWithUser";
import asyncHandler from "../utils/asyncHandler";
import ApiError from "../utils/response/ApiError";
import { NextFunction, Response } from "express";

export const isAdminCheck = asyncHandler(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== "admin") {
      return next(
        new ApiError(403, "You are not authorized to perform this action")
      );
    }
    return next();
  }
);
