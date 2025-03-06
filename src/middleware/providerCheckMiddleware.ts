import { Request, Response, NextFunction } from "express";
import asyncHandler from "../utils/asyncHandler";
import ApiError from "../utils/response/ApiError";
import { RequestWithUser } from "../types/RequestWithUser";
import { ResponseReturnType } from "../types/ReturnController";

export const isServiceProvider = asyncHandler(
  async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): ResponseReturnType => {
    if (!req.user || req.user.role !== "provider") {
      const response = new ApiError(
        403,
        "You are not authorized to perform this action"
      );
      return res.status(response.statusCode).json(response.toJSON());
    }
    next();
  }
);
