import mongoose from "mongoose";
import STATUS from "../../data/statusCodes";
import Rating from "../../models/ratingModel";
import Service from "../../models/serviceModel";
import asyncHandler from "../../utils/asyncHandler";
import ApiError from "../../utils/response/ApiError";
import ApiResponse from "../../utils/response/ApiResponse";
import { integrateRatings } from "../../utils/rating/integrateRatings";
import Category from "../../models/categoryModel";

export const getServices = asyncHandler(async (req, res) => {
  const { category, query } = req.query;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  const filter: any = { status: "active" };
  let categoryIds: string[] = [];

  // 🔍 Search for matching categories if query is provided
  if (query) {
    const matchedCategories = await Category.find({
      category: { $regex: query, $options: "i" }, // Case-insensitive search
    });

    if (matchedCategories.length > 0) {
      categoryIds = matchedCategories.map((cat) => cat._id.toString());
    }
  }

  // 🔍 If category filter is provided in the request, find its ID
  if (category) {
    const categoryDoc = await Category.findOne({
      category: { $regex: category },
    });

    if (!categoryDoc) {
      throw new ApiError(404, "Category not found");
    }
    categoryIds.push(categoryDoc._id.toString());
  }

  // ✅ Convert categoryIds to ObjectId for proper matching
  if (categoryIds.length > 0) {
    const categoryIdsAsObjectIds = categoryIds.map(
      (id) => new mongoose.Types.ObjectId(id)
    );
    filter.category = { $in: categoryIdsAsObjectIds };
  }

  // 🔍 Ensure `$or` does not override category filtering
  if (query) {
    filter.$or = [
      { category: { $in: [categoryIds] } },
      { title: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
      { location: { $regex: query, $options: "i" } },
      { tags: { $regex: query, $options: "i" } },
    ];
  }


  // 🏆 Check if matching services exist before querying
  const existingServices = await Service.find(filter);

  // 📦 Fetch paginated services
  const totalServices = await Service.countDocuments(filter);
  const services = await Service.find(filter)
    .populate("category", "category")
    .skip((page - 1) * limit)
    .limit(limit);

  // 🏆 Integrate Ratings (Assuming integrateRatings function exists)
  const servicesWithRatings = await integrateRatings(services);

  // 📝 Format response
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
});

export const getTopServices = asyncHandler(async (req, res) => {
  try {
    const { limit = 10, location, category, status } = req.query;

    const filter: any = {}; // Dynamic filter object

    if (location) filter.location = location;
    if (category) filter.category = category;
    if (status) filter.status = status;

    const topServices = await Rating.aggregate([
      {
        $group: {
          _id: "$serviceId",
          avgRating: { $avg: "$rating" },
          ratingCount: { $sum: 1 },
        },
      },
      { $sort: { avgRating: -1, ratingCount: -1 } },
      { $limit: parseInt(limit as string) },
    ]);

    const serviceIds = topServices.map((service) => service._id);

    // Fetch services that match filters and are in the top-rated list
    const services = await Service.find({
      _id: { $in: serviceIds },
      ...filter, // ✅ Apply dynamic filters
    }).populate("category");

    const servicesWithRatings = await integrateRatings(services);

    res
      .status(STATUS.ok)
      .json(
        new ApiResponse(STATUS.ok, servicesWithRatings, "Fetched top services")
      );
  } catch (error) {
    res
      .status(STATUS.internalServerError)
      .json(new ApiResponse(STATUS.internalServerError, null, "Server Error"));
  }
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

export const getCategroyWiseServices = asyncHandler(async (req, res) => {
  try {
    const categories = await Category.find({});

    const categoryWithServices = await Promise.all(
      categories.map(async (cat) => {
        const services = await Service.find({ category: cat.id })
          .sort({ view: -1, createdAt: -1 }) // Prioritize most viewed & recent
          .limit(10)
          .populate("category");
        const servicesWithRating = await integrateRatings(services);

        return { ...cat.toObject(), services: servicesWithRating };
      })
    );

    res
      .status(STATUS.ok)
      .json(
        new ApiResponse(STATUS.ok, categoryWithServices, "Fetched successfully")
      );
  } catch (error) {
    res
      .status(STATUS.notFound)
      .json(new ApiResponse(STATUS.badGateway, null, "Error"));
  }
});

export const getSearchSuggestions = asyncHandler(async (req, res) => {
  const { query } = req.query;

  // Find services where the title matches
  const services = await Service.find({
    $or: [
      { title: { $regex: query, $options: "i" } }, // Case-insensitive search in title
      { description: { $regex: query, $options: "i" } },
      { location: { $regex: query, $options: "i" } },
    ],
  })
    .select("title")
    .limit(10);

  const category = await Category.find({
    category: { $regex: query, $options: "i" },
  })
    .select("category")
    .limit(10);

  const titleCategory = category.map((cat) => ({
    _id: cat._id,
    title: cat.category,
  }));

  res
    .status(STATUS.ok)
    .json(new ApiResponse(STATUS.ok, [...services, ...titleCategory]));
});
