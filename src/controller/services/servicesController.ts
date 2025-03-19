import mongoose from "mongoose";
import STATUS from "../../data/statusCodes";
import Rating from "../../models/ratingModel";
import Service from "../../models/serviceModel";
import asyncHandler from "../../utils/asyncHandler";
import ApiError from "../../utils/response/ApiError";
import ApiResponse from "../../utils/response/ApiResponse";
import { integrateRatings } from "../../utils/rating/integrateRatings";
import Category from "../../models/categoryModel";

export const getServices = asyncHandler(
  asyncHandler(async (req, res) => {
    const { category, query } = req.query; // Using query params for both category and search query
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const filter: any = { status: "active" }; // Default filter by status

    // Add category filter if category is provided in the query
    if (category) {
      const categoryDoc = await Category.findOne({
        category: { $regex: category, $options: "i" }, // ✅ Partial match (case-insensitive)
      });

      if (!categoryDoc) {
        throw new ApiError(404, "Category not found");
      }
      filter.category = categoryDoc._id;
    }

    // Add search filter if query is provided in the query
    if (query) {
      filter.$or = [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { tags: { $regex: query, $options: "i" } },
      ];
    }

    const totalServices = await Service.countDocuments(filter); // Get total count based on filters

    // Fetch paginated services based on the filter
    const services = await Service.find(filter)
      .populate("category", "category")
      .skip((page - 1) * limit)
      .limit(limit);

    const servicesWithRatings = await integrateRatings(services);
    // Send the response with pagination info
    res.status(STATUS.ok).json(
      new ApiResponse(
        STATUS.ok,
        servicesWithRatings,
        "Services fetched successfully",
        {
          totalPages: Math.ceil(totalServices / limit),
          currentPage: page,
          pageSize: limit,
          totalItems: totalServices,
        }
      )
    );
  })
);

export const getTopServices = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit as string) || 10;

  const topServices = await Rating.aggregate([
    {
      $group: {
        _id: "$serviceId",
        avgRating: { $avg: "$rating" },
        ratingCount: { $sum: 1 },
      },
    },
    { $sort: { avgRating: -1, ratingCount: -1 } },
    {
      $limit: limit,
    },
  ]);

  const services = await Service.find({
    _id: { $in: topServices.map((service) => service._id) },
  });

  const servicesWithRatings = await integrateRatings(services);

  res
    .status(STATUS.ok)
    .json(
      new ApiResponse(STATUS.ok, servicesWithRatings, "fetched top services")
    );
});

export const getServiceById = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;
  const limitRating = parseInt(req.query.limitRating as string) || 10;

  if (!mongoose.Types.ObjectId.isValid(serviceId)) {
    throw new ApiError(400, "Invalid service ID");
  }

  const service = await Service.findById(serviceId)
    .populate({
      path: "providerId", // Populating service provider details
      select: "name email",
    })
    .lean();

  if (!service) {
    throw new ApiError(404, "Service not found");
  }

  const ratingAvg = await Rating.aggregate([
    { $match: { serviceId: new mongoose.Types.ObjectId(serviceId) } },
    {
      $group: {
        _id: "$serviceId",
        avgRating: { $avg: "$rating" },
        totalRating: { $sum: 1 },
      },
    },
  ]);

  const ratings = await Rating.find({ serviceId })
    .populate({
      path: "userId",
      select: "name email profilePicture",
    })
    .limit(limitRating);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { ...service, ratings, ratingAvg },
        "Service details fetched"
      )
    );
});

export const getServicesByCategory = asyncHandler(async (req, res) => {});
