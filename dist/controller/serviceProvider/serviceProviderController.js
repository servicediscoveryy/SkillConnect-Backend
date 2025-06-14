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
exports.getUsersForProviderBookings = exports.rateService = exports.getProviderServiceById = exports.getProviderServices = exports.deleteService = exports.updateService = exports.createService = void 0;
const asyncHandler_1 = __importDefault(require("../../utils/asyncHandler"));
const ApiError_1 = __importDefault(require("../../utils/response/ApiError"));
const ApiResponse_1 = __importDefault(require("../../utils/response/ApiResponse"));
const ratingModel_1 = __importDefault(require("../../models/ratingModel"));
const serviceModel_1 = __importDefault(require("../../models/serviceModel"));
const statusCodes_1 = __importDefault(require("../../data/statusCodes"));
const validation_1 = require("../../validation");
const mongoose_1 = __importDefault(require("mongoose"));
const userServices_1 = require("../../services/userServices");
// Create a new service
exports.createService = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, description, category, image, price, tags, location, coordinates, } = req.body;
    (0, validation_1.validateRequest)(validation_1.createServiceValidationSchema, req.body);
    if (!Array.isArray(image)) {
        throw new ApiError_1.default(statusCodes_1.default.badRequest, "Images should be an array of URLs");
    }
    if (!category) {
        throw new ApiError_1.default(statusCodes_1.default.badRequest, "Choose Right Category");
    }
    if (!Array.isArray(coordinates) || coordinates.length !== 2) {
        throw new ApiError_1.default(statusCodes_1.default.badRequest, "Invalid coordinates (lng, lat required)");
    }
    const newService = new serviceModel_1.default({
        // @ts-ignore
        providerId: req.user._id,
        title,
        description,
        category,
        image,
        price,
        status: "active",
        location,
        tags,
        geoLocation: {
            type: "Point",
            coordinates,
        },
    });
    const savedService = yield newService.save();
    res
        .status(201)
        .json(new ApiResponse_1.default(201, savedService, "Service created successfully"));
}));
exports.updateService = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, description, category, price, tags, location, status, image, // should be an array of Cloudinary URLs
    coordinates, } = req.body;
    if (!Array.isArray(image)) {
        throw new ApiError_1.default(statusCodes_1.default.badRequest, "Images should be an array of URLs");
    }
    let parsedCoordinates = [];
    try {
        parsedCoordinates = JSON.parse(coordinates); // frontend sends it as JSON string
    }
    catch (_a) {
        throw new ApiError_1.default(statusCodes_1.default.badRequest, "Invalid coordinates format");
    }
    if (!Array.isArray(parsedCoordinates) || parsedCoordinates.length !== 2) {
        throw new ApiError_1.default(statusCodes_1.default.badRequest, "Coordinates must be [lng, lat]");
    }
    const updatePayload = {
        title,
        description,
        category,
        price,
        tags,
        location,
        status,
        image,
        geoLocation: {
            type: "Point",
            coordinates: parsedCoordinates,
        },
    };
    const updatedService = yield serviceModel_1.default.findByIdAndUpdate(req.params.serviceId, updatePayload, { new: true });
    if (!updatedService)
        throw new ApiError_1.default(statusCodes_1.default.notFound, "Service not found");
    res
        .status(statusCodes_1.default.ok)
        .json(new ApiResponse_1.default(statusCodes_1.default.ok, updatedService, "Service updated successfully"));
}));
// Delete service
exports.deleteService = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const deletedService = yield serviceModel_1.default.findByIdAndDelete(req.params.serviceId);
    if (!deletedService)
        throw new ApiError_1.default(statusCodes_1.default.notFound, "Service not found");
    res
        .status(statusCodes_1.default.ok)
        .json(new ApiResponse_1.default(statusCodes_1.default.ok, {}, "Service deleted successfully"));
}));
// Get all services by serach category
exports.getProviderServices = (0, asyncHandler_1.default)((0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req === null || req === void 0 ? void 0 : req.user._id;
    const { category, query } = req.query; // Using query params for both category and search query
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filter = { providerId: id, status: "active" }; // Default filter by status
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
    const totalServices = yield serviceModel_1.default.countDocuments(filter); // Get total count based on filters
    // Fetch paginated services based on the filter
    const services = yield serviceModel_1.default.find(filter)
        .populate("category", "category")
        .skip((page - 1) * limit)
        .limit(limit);
    // Send the response with pagination info
    res.status(statusCodes_1.default.ok).json(new ApiResponse_1.default(statusCodes_1.default.ok, services, "Services fetched successfully", {
        totalPages: Math.ceil(totalServices / limit),
        currentPage: page,
        pageSize: limit,
        totalItems: totalServices,
    }));
})));
exports.getProviderServiceById = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        // Find service by ID and populate category
        const service = yield serviceModel_1.default.findById(id).populate("category", "category");
        if (!service) {
            res
                .status(statusCodes_1.default.notFound)
                .json(new ApiResponse_1.default(statusCodes_1.default.notFound, null, "Service not found"));
        }
        res
            .status(statusCodes_1.default.ok)
            .json(new ApiResponse_1.default(statusCodes_1.default.ok, service, "Service fetched successfully"));
    }
    catch (error) {
        console.error("Error fetching service:", error);
        res
            .status(statusCodes_1.default.badRequest)
            .json(new ApiResponse_1.default(statusCodes_1.default.badRequest, null, "Internal server error"));
    }
}));
// Rate a service
exports.rateService = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user)
        throw new ApiError_1.default(401, "Unauthorized user");
    const _id = req.user._id.toString();
    const { serviceId } = req.params;
    const { rating, description } = req.body;
    // Validate input
    (0, validation_1.validateRequest)(validation_1.ratingValidationSchema, {
        _id,
        serviceId,
        rating,
        description,
    });
    // Convert serviceId to ObjectId
    if (!mongoose_1.default.Types.ObjectId.isValid(serviceId)) {
        throw new ApiError_1.default(statusCodes_1.default.badRequest, "Invalid service ID format");
    }
    const service = yield serviceModel_1.default.findById(serviceId);
    if (!service) {
        throw new ApiError_1.default(statusCodes_1.default.notFound, "Service not found");
    }
    // Create and save rating
    const newRating = new ratingModel_1.default({
        userId: _id,
        serviceId,
        rating,
        description,
    });
    yield newRating.save();
    res
        .status(201)
        .json(new ApiResponse_1.default(201, newRating, "Service rated successfully"));
}));
exports.getUsersForProviderBookings = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user)
        throw new ApiError_1.default(statusCodes_1.default.unauthorized, "Unauthorized");
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { users, totalUsers } = yield (0, userServices_1.getUsersWhoBookedProviderServices)(req.user._id, page, limit);
    res.status(statusCodes_1.default.ok).json(new ApiResponse_1.default(statusCodes_1.default.ok, {
        users,
        totalUsers,
        currentPage: page,
        totalPages: Math.ceil(totalUsers / limit),
    }, "Users who booked provider's services fetched"));
}));
