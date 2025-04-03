import mongoose from "mongoose";
import STATUS from "../../data/statusCodes";
import Cart from "../../models/cartModel";
import Service from "../../models/serviceModel";
import { RequestWithUser } from "../../types/RequestWithUser";
import { ResponseReturnType } from "../../types/ReturnController";
import asyncHandler from "../../utils/asyncHandler";
import { integrateRatings } from "../../utils/rating/integrateRatings";
import ApiError from "../../utils/response/ApiError";
import ApiResponse from "../../utils/response/ApiResponse";

export const addToCart = asyncHandler(
  async (req: RequestWithUser, res): ResponseReturnType => {
    const { serviceId } = req.body;
    const userId = req.user._id;

    if (!serviceId) {
      throw new ApiError(STATUS.badRequest, "serviceId is required");
    }

    // Ensure serviceId is an ObjectId
    const serviceObjectId = new mongoose.Types.ObjectId(serviceId);

    // Check if the service exists
    const service = await Service.findById(serviceObjectId);
    if (!service) {
      throw new ApiError(STATUS.notFound, "Service not found");
    }

    // Check if the user already has an active cart
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      // Create a new cart if not found
      cart = new Cart({
        userId,
        items: [{ serviceId: serviceObjectId }],
      });
      await cart.save();
      return res
        .status(STATUS.created)
        .json(
          new ApiResponse(STATUS.created, cart, "Added to cart successfully")
        );
    }

    // Check if item already exists in the cart
    const itemExists = cart.items.some(
      (item) => item.serviceId.toString() === serviceId.toString()
    );

    if (itemExists) {
      throw new ApiError(STATUS.badRequest, "Service already in cart");
    }

    // Add new service to cart
    cart.items.push({ serviceId: serviceObjectId });
    await cart.save();

    res
      .status(STATUS.ok)
      .json(new ApiResponse(STATUS.ok, cart, "Item added to cart"));
  }
);

export const getAllCart = asyncHandler(async (req: RequestWithUser, res) => {
  const userId = req.user._id;

  // Fetch the cart and populate items with service details
  const cart = await Cart.find({ userId }).populate({
    path: "items.serviceId",
    model: "Service",
  });

  // Calculate cart count (number of items)
  const cartCount = await Cart.aggregate([
    { $match: { userId } },
    { $unwind: "$items" },
    { $count: "totalItems" },
  ]);

  const totalItems = cartCount.length > 0 ? cartCount[0].totalItems : 0;

  // Calculate total amount
  const totalAmountResult = await Cart.aggregate([
    { $match: { userId } },
    { $unwind: "$items" },
    {
      $lookup: {
        from: "services", // Ensure this matches your actual collection name
        localField: "items.serviceId",
        foreignField: "_id",
        as: "serviceDetails",
      },
    },
    { $unwind: "$serviceDetails" },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: "$serviceDetails.price" }, // Sum up all service prices
      },
    },
  ]);

  const totalAmount =
    totalAmountResult.length > 0 ? totalAmountResult[0].totalAmount : 0;

  res
    .status(STATUS.ok)
    .json(
      new ApiResponse(
        STATUS.ok,
        { cart, totalItems, totalAmount },
        "Fetch successfully"
      )
    );
});

export const getCartCount = asyncHandler(async (req: RequestWithUser, res) => {
  const userId = req.user._id;

  const cartCount = await Cart.aggregate([
    { $match: { userId } }, // Ensure only active cart is considered
    { $unwind: "$items" }, // Flatten the items array to count each service separately
    { $count: "totalItems" }, // Count the number of items
  ]);

  const totalItems = cartCount.length > 0 ? cartCount[0].totalItems : 0;

  res
    .status(STATUS.ok)
    .json(new ApiResponse(STATUS.ok, { totalItems }, "Fetched cart count"));
});

export const removeCartItem = asyncHandler(
  async (req: RequestWithUser, res): ResponseReturnType => {
    const { serviceId } = req.body;
    const userId = req.user._id;

    if (!serviceId) {
      throw new ApiError(STATUS.badRequest, "serviceId is required");
    }

    // Find the active cart
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      throw new ApiError(STATUS.notFound, "Cart not found");
    }

    // Find the item in the cart
    const itemIndex = cart.items.findIndex(
      (item) => item.serviceId.toString() === serviceId.toString()
    );

    if (itemIndex === -1) {
      throw new ApiError(STATUS.notFound, "Service not found in cart");
    }

    // Remove the item using Mongoose's `pull` method
    cart.items.pull({ serviceId });

    // If cart becomes empty, delete the cart
    if (cart.items.length === 0) {
      await Cart.deleteOne({ _id: cart._id });
      return res
        .status(STATUS.ok)
        .json(new ApiResponse(STATUS.ok, {}, "Cart emptied successfully"));
    }

    await cart.save();

    res
      .status(STATUS.ok)
      .json(new ApiResponse(STATUS.ok, cart, "Item removed from cart"));
  }
);
