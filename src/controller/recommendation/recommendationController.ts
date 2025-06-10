import axios from "axios";
import { Request, Response } from "express";
import Service from "../../models/serviceModel"; // Assuming this is your service model
import ApiError from "../../utils/response/ApiError";
import STATUS from "../../data/statusCodes";
import ApiResponse from "../../utils/response/ApiResponse";
import { RequestWithUser } from "../../types/RequestWithUser";
import Category from "../../models/categoryModel";
import UserInteraction from "../../models/userInteraction";
import mongoose from "mongoose";

export const viewService = async (req: Request, res: Response) => {
  try {
    const { serviceId } = req.params;

    const service = await Service.findByIdAndUpdate(
      serviceId,
      {
        $inc: { views: 1 },
      },
      { new: true }
    );
    res.status(STATUS.ok);
    return;
  } catch (error) {
    throw new ApiError(STATUS.internalServerError, "something went wrong");
  }
};

export const recordInteraction = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    const userId = req.user._id;
    const { serviceId, actionType } = req.body;

    if (!serviceId || !actionType || !userId) {
      res
        .status(STATUS.badRequest)
        .json(
          new ApiError(STATUS.badRequest, "Service Id and Action Required")
        );
      return;
    }

    const validActions = ["view", "book", "cart", "review", "search"];
    if (!validActions.includes(actionType)) {
      res
        .status(STATUS.badRequest)
        .json(new ApiError(STATUS.badRequest, "Invalid action type"));
      return;
    }

    // Check if the service exists
    const service = await Service.findById(serviceId);
    if (!service) {
      res
        .status(STATUS.notFound)
        .json(new ApiError(STATUS.notFound, "Service Not Found"));
      return;
    }

    console.log(service);

    // Check if the category exists
    const category = await Category.findById(service.category);
    if (!category) {
      res
        .status(STATUS.notFound)
        .json(new ApiError(STATUS.notFound, "Category Not Found"));
      return;
    }

    // Prevent duplicate "view" interactions within a short timeframe (e.g., 5 minutes)
    if (actionType === "view") {
      const recentInteraction = await UserInteraction.findOne({
        userId,
        serviceId,
        actionType: "view",
        createdAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) }, // Last 5 minutes
      });

      if (recentInteraction) {
        res
          .status(STATUS.ok)
          .json(
            new ApiResponse(
              STATUS.ok,
              null,
              "View interaction already recorded recently"
            )
          );
        return;
      }
    }

    // Create and save the interaction
    const interaction = new UserInteraction({
      userId,
      serviceId,
      categoryId: category._id,
      actionType,
    });

    await interaction.save();

    res
      .status(STATUS.ok)
      .json(
        new ApiResponse(
          STATUS.ok,
          interaction,
          "Interaction recorded successfully"
        )
      );
  } catch (error) {
    console.error("Error recording interaction:", error);
    res
      .status(STATUS.internalServerError)
      .json(new ApiError(STATUS.internalServerError, "Something went wrong"));
    return;
  }
};

export const getRecommendedByUser = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    // @ts-ignore
    const userId = req.user._id;

    const respon = await axios.get("https://recommondedsys.onrender.com/train");

    // Call external recommendation system
    const response = await axios.get(
      `https://recommondedsys.onrender.com/recommend/${userId}`
    );

    console.log(response);

    const recommendedServiceIds: string[] = response?.data?.map(
      (service: any) => service.id
    );

    if (!recommendedServiceIds || recommendedServiceIds.length === 0) {
      res.status(200).json({
        data: [],
        success: true,
        error: false,
        message: "No recommendations found for this user.",
      });
      return;
    }

    // Fetch services from your database
    const recommendedServices = await Service.find({
      _id: { $in: recommendedServiceIds },
    });

    console.log(recommendedServices);
    res.status(200).json({
      data: recommendedServices,
      success: true,
      error: false,
      message: "Recommended services fetched successfully.",
    });
  } catch (error: any) {
    console.error("Error fetching recommendations:", error.message);

    res.status(500).json({
      message: error.message || "Server error",
      error: true,
      success: false,
    });
  }
};

export const getRelatedRecommendation = async (req: Request, res: Response) => {
  try {
    const { service } = req.params;

    // 1. fetch the list of recommended titles from your Python service
    const response = await axios.get<{ recommendations: string[] }>(
      `http://localhost:5000/recommendations?service=${encodeURIComponent(
        service
      )}`
    );

    const recommendedTitles = response.data.recommendations;
    if (!recommendedTitles.length) {
      res.status(200).json({
        data: [],
        success: true,
        error: false,
        message: "No recommendations found.",
      });
      return;
    }

    // 2. aggregate to find those Service docs, join ratings, compute avgRating, sort, and return
    const services = await Service.aggregate([
      {
        $match: {
          status: "active",
          // match any title in recommendedTitles (case-insensitive exact match)
          $or: recommendedTitles.map((t) => ({
            title: { $regex: `^${t}$`, $options: "i" },
          })),
        },
      },
      {
        $lookup: {
          from: "ratings", // your Ratings collection
          localField: "_id",
          foreignField: "serviceId",
          as: "ratings",
        },
      },
      {
        $addFields: {
          avgRating: { $avg: "$ratings.rating" },
        },
      },
      {
        $sort: { avgRating: -1, createdAt: -1 },
      },
      // optionally limit to top N
      { $limit: 1 },
    ]);

    res.status(200).json({
      data: services,
      success: true,
      error: false,
      message: "Recommended services fetched successfully.",
    });
  } catch (error: any) {
    console.error("Error fetching related recommendations:", error);
    res.status(500).json({
      message: error.message || "Internal Server Error",
    });
    return;
  }
};

export const getNearbyServices = async (req: Request, res: Response) => {
  try {
    const longitude = parseFloat(req.query.longitude as string);
    const latitude = parseFloat(req.query.latitude as string);
    const categoryId =
      (req.query.categoryId as string) || "67dbdab6dfdd315f88f954e8";

    if (isNaN(longitude) || isNaN(latitude)) {
      res.status(400).json({ message: "Invalid coordinates" });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      res.status(400).json({ message: "Invalid category ID" });
      return;
    }

    const services = await Service.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          distanceField: "distance",
          maxDistance: 50000, // 50 km
          spherical: true,
          query: {
            status: "active",
            category: new mongoose.Types.ObjectId(categoryId),
          },
        },
      },
      { $sort: { distance: 1 } },
    ]);

    res.status(200).json({
      data: services,
      success: true,
      error: false,
      message: "Nearby services fetched successfully.",
    });
  } catch (error) {
    console.error("Error fetching nearby services:", error);
    res.status(500).json({ message: "Server error" });
  }
};
