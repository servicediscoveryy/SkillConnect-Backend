import { Request, Response } from "express";
import asyncHandler from "../../utils/asyncHandler";
import ApiError from "../../utils/response/ApiError";
import ApiResponse from "../../utils/response/ApiResponse";
import Rating from "../../models/ratingModel";
import Service from "../../models/serviceModel";
import { RequestWithUser } from "../../types/RequestWithUser";
import STATUS from "../../data/statusCodes";
import {
  createServiceValidationSchema,
  ratingValidationSchema,
  validateRequest,
} from "../../validation";
import mongoose from "mongoose";

// Create a new service
export const createService = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    const { title, description, category, image, price, tags, location } =
      req.body;

    validateRequest(createServiceValidationSchema, req.body);

    if (!Array.isArray(image)) {
      throw new ApiError(
        STATUS.badRequest,
        "Images should be an array of urls"
      );
    }

    if (!category) {
      throw new ApiError(STATUS.badRequest, "Choose Right Category");
    }

    const newService = new Service({
      providerId: "67db1307330a765af9d93e4a",
      title,
      description,
      category: "67db12bd330a765af9d93e42",
      image,
      price,
      status: "active",
      location,
      tags,
    });

    const savedService = await newService.save();

    res
      .status(201)
      .json(new ApiResponse(201, savedService, "Service created successfully"));
  }
);

// Update service
export const updateService = asyncHandler(
  async (req: Request, res: Response) => {
    const { title, description, category, image, price, tags } = req.body;

    const updatedService = await Service.findByIdAndUpdate(
      req.params.serviceId,
      { title, description, category, image, price, tags },
      { new: true }
    );

    if (!updatedService)
      throw new ApiError(STATUS.notFound, "Service not found");

    res
      .status(STATUS.ok)
      .json(
        new ApiResponse(
          STATUS.ok,
          updatedService,
          "Service updated successfully"
        )
      );
  }
);

// Delete service
export const deleteService = asyncHandler(
  async (req: Request, res: Response) => {
    const deletedService = await Service.findByIdAndDelete(
      req.params.serviceId
    );

    if (!deletedService)
      throw new ApiError(STATUS.notFound, "Service not found");

    res
      .status(STATUS.ok)
      .json(new ApiResponse(STATUS.ok, {}, "Service deleted successfully"));
  }
);

// Get all services by serach category
export const getProviderServices = asyncHandler(
  asyncHandler(async (req: RequestWithUser, res) => {
    // const { id } = req?.user;
    const id = "67db1307330a765af9d93e4a";
    const { category, query } = req.query; // Using query params for both category and search query
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const filter: any = { providerId: id, status: "active" }; // Default filter by status

    // Add category filter if category is provided in the query
    if (category) {
      filter.category = category;
    }

    // Add search filter if query is provided in the query
    if (query) {
      filter.$or = [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } },
        { tags: { $regex: query, $options: "i" } },
      ];
    }

    const totalServices = await Service.countDocuments(filter); // Get total count based on filters

    // Fetch paginated services based on the filter
    const services = await Service.find(filter)
      .populate("category", "category")
      .skip((page - 1) * limit)
      .limit(limit);

    // Send the response with pagination info
    res.status(STATUS.ok).json(
      new ApiResponse(STATUS.ok, services, "Services fetched successfully", {
        totalPages: Math.ceil(totalServices / limit),
        currentPage: page,
        pageSize: limit,
        totalItems: totalServices,
      })
    );
  })
);

export const getProviderServiceById = asyncHandler(
  async (req: RequestWithUser, res) => {
    const { id } = req.params;

    try {
      // Find service by ID and populate category
      const service = await Service.findById(id).populate(
        "category",
        "category"
      );

      if (!service) {
        return res
          .status(STATUS.notFound)
          .json(new ApiResponse(STATUS.notFound, null, "Service not found"));
      }

      res
        .status(STATUS.ok)
        .json(
          new ApiResponse(STATUS.ok, service, "Service fetched successfully")
        );
    } catch (error) {
      console.error("Error fetching service:", error);
      res
        .status(STATUS.serverError)
        .json(
          new ApiResponse(STATUS.serverError, null, "Internal server error")
        );
    }
  }
);

// Rate a service
export const rateService = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    if (!req.user) throw new ApiError(401, "Unauthorized user");

    const _id = req.user._id.toString();
    const { serviceId } = req.params;
    const { rating, description } = req.body;

    // Validate input
    validateRequest(ratingValidationSchema, {
      _id,
      serviceId,
      rating,
      description,
    });

    // Convert serviceId to ObjectId
    if (!mongoose.Types.ObjectId.isValid(serviceId)) {
      throw new ApiError(STATUS.badRequest, "Invalid service ID format");
    }

    const service = await Service.findById(serviceId);

    if (!service) {
      throw new ApiError(STATUS.notFound, "Service not found");
    }

    // Create and save rating
    const newRating = new Rating({
      userId: _id,
      serviceId,
      rating,
      description,
    });
    await newRating.save();

    res
      .status(201)
      .json(new ApiResponse(201, newRating, "Service rated successfully"));
  }
);
