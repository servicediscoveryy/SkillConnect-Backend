import User from "../models/userModel";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import ApiError from "../utils/response/ApiError"; // Import custom response functions
import asyncHandler from "../utils/asyncHandler";
import { RequestWithUser } from "../types/RequestWithUser";

export const authuser = asyncHandler(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const token =
      req.cookies?.token || req.headers["authorization"]?.split(" ")[1];

    if (!token) {
      throw new ApiError(401, "Please Login"); // Throw a custom error
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userId: string;
    };

    // Find user by userId
    const user = await User.findById(decoded.userId);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    req.user = user;
    next();
  }
);
