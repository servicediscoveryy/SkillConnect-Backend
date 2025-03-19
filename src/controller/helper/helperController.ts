import { Request, Response } from "express";
import mongoose from "mongoose";
import asyncHandler from "../../utils/asyncHandler";
import ApiError from "../../utils/response/ApiError";
import ApiResponse from "../../utils/response/ApiResponse";

export const clearDatabase = asyncHandler(async (req, res) => {
  //@ts-expect-error
  const collections = await mongoose.connection.db.collections();

  if (collections.length === 0) {
    throw new ApiError(404, "No collections found to delete");
  }

  for (const collection of collections) {
    await collection.drop();
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "All collections and data have been deleted successfully."
      )
    );
});
