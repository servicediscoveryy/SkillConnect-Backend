import { Request, Response } from "express";
import ApiError from "../../utils/response/ApiError";
import STATUS from "../../data/statusCodes";
import Service from "../../models/serviceModel";
import ApiResponse from "../../utils/response/ApiResponse";
import { RequestWithUser } from "../../types/RequestWithUser";
import Category from "../../models/categoryModel";
import UserInteraction from "../../models/userInteraction";

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
