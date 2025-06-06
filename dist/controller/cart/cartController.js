"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeCartItem = exports.getCartCount = exports.getAllCart = exports.addToCart = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const statusCodes_1 = __importDefault(require("../../data/statusCodes"));
const cartModel_1 = __importDefault(require("../../models/cartModel"));
const serviceModel_1 = __importDefault(require("../../models/serviceModel"));
const asyncHandler_1 = __importDefault(require("../../utils/asyncHandler"));
const ApiError_1 = __importDefault(require("../../utils/response/ApiError"));
const ApiResponse_1 = __importDefault(require("../../utils/response/ApiResponse"));
exports.addToCart = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { serviceId } = req.body;
    const userId = req.user._id;
    if (!serviceId) {
        throw new ApiError_1.default(statusCodes_1.default.badRequest, "serviceId is required");
    }
    // Ensure serviceId is an ObjectId
    const serviceObjectId = new mongoose_1.default.Types.ObjectId(serviceId);
    // Check if the service exists
    const service = yield serviceModel_1.default.findById(serviceObjectId);
    if (!service) {
        throw new ApiError_1.default(statusCodes_1.default.notFound, "Service not found");
    }
    // Check if the user already has an active cart
    let cart = yield cartModel_1.default.findOne({ userId });
    if (!cart) {
        // Create a new cart if not found
        cart = new cartModel_1.default({
            userId,
            items: [{ serviceId: serviceObjectId }],
        });
        yield cart.save();
        return res
            .status(statusCodes_1.default.created)
            .json(new ApiResponse_1.default(statusCodes_1.default.created, cart, "Added to cart successfully"));
    }
    // Check if item already exists in the cart
    const itemExists = cart.items.some((item) => item.serviceId.toString() === serviceId.toString());
    if (itemExists) {
        throw new ApiError_1.default(statusCodes_1.default.badRequest, "Service already in cart");
    }
    // Add new service to cart
    cart.items.push({ serviceId: serviceObjectId });
    yield cart.save();
    res
        .status(statusCodes_1.default.ok)
        .json(new ApiResponse_1.default(statusCodes_1.default.ok, cart, "Item added to cart"));
}));
exports.getAllCart = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user._id;
    // Fetch the cart and populate items with service details
    const cart = yield cartModel_1.default.find({ userId }).populate({
        path: "items.serviceId",
        model: "Service",
    });
    // Calculate cart count (number of items)
    const cartCount = yield cartModel_1.default.aggregate([
        { $match: { userId } },
        { $unwind: "$items" },
        { $count: "totalItems" },
    ]);
    const totalItems = cartCount.length > 0 ? cartCount[0].totalItems : 0;
    // Calculate total amount
    const totalAmountResult = yield cartModel_1.default.aggregate([
        { $match: { userId } },
        { $unwind: "$items" },
        {
            $lookup: {
                from: "services",
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
    const totalAmount = totalAmountResult.length > 0 ? totalAmountResult[0].totalAmount : 0;
    res
        .status(statusCodes_1.default.ok)
        .json(new ApiResponse_1.default(statusCodes_1.default.ok, { cart, totalItems, totalAmount }, "Fetch successfully"));
}));
exports.getCartCount = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user._id;
    const cartCount = yield cartModel_1.default.aggregate([
<<<<<<< HEAD
        { $match: { userId, status: "active" } },
        { $unwind: "$items" },
=======
        { $match: { userId } }, // Ensure only active cart is considered
        { $unwind: "$items" }, // Flatten the items array to count each service separately
>>>>>>> eebf406362d973f5fdf7a5ba630bd530434f17c3
        { $count: "totalItems" }, // Count the number of items
    ]);
    const totalItems = cartCount.length > 0 ? cartCount[0].totalItems : 0;
    res
        .status(statusCodes_1.default.ok)
        .json(new ApiResponse_1.default(statusCodes_1.default.ok, { totalItems }, "Fetched cart count"));
}));
exports.removeCartItem = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { serviceId } = req.body;
    const userId = req.user._id;
    if (!serviceId) {
        throw new ApiError_1.default(statusCodes_1.default.badRequest, "serviceId is required");
    }
    // Find the active cart
    const cart = yield cartModel_1.default.findOne({ userId });
    if (!cart) {
        throw new ApiError_1.default(statusCodes_1.default.notFound, "Cart not found");
    }
    // Find the item in the cart
    const itemIndex = cart.items.findIndex((item) => item.serviceId.toString() === serviceId.toString());
    if (itemIndex === -1) {
        throw new ApiError_1.default(statusCodes_1.default.notFound, "Service not found in cart");
    }
    // Remove the item using Mongoose's `pull` method
    cart.items.pull({ serviceId });
    // If cart becomes empty, delete the cart
    if (cart.items.length === 0) {
        yield cartModel_1.default.deleteOne({ _id: cart._id });
        return res
            .status(statusCodes_1.default.ok)
            .json(new ApiResponse_1.default(statusCodes_1.default.ok, {}, "Cart emptied successfully"));
    }
    yield cart.save();
    res
        .status(statusCodes_1.default.ok)
        .json(new ApiResponse_1.default(statusCodes_1.default.ok, cart, "Item removed from cart"));
}));
