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
exports.rateService = exports.getProviderServiceById = exports.getProviderServices = exports.deleteService = exports.updateService = exports.createService = void 0;
const asyncHandler_1 = __importDefault(require("../../utils/asyncHandler"));
const ApiError_1 = __importDefault(require("../../utils/response/ApiError"));
const ApiResponse_1 = __importDefault(require("../../utils/response/ApiResponse"));
const ratingModel_1 = __importDefault(require("../../models/ratingModel"));
const serviceModel_1 = __importDefault(require("../../models/serviceModel"));
const statusCodes_1 = __importDefault(require("../../data/statusCodes"));
const validation_1 = require("../../validation");
const mongoose_1 = __importDefault(require("mongoose"));
// Create a new service
exports.createService = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, description, category, image, price, tags, location } = req.body;
    (0, validation_1.validateRequest)(validation_1.createServiceValidationSchema, req.body);
    if (!Array.isArray(image)) {
        throw new ApiError_1.default(statusCodes_1.default.badRequest, "Images should be an array of urls");
    }
    if (!category) {
        throw new ApiError_1.default(statusCodes_1.default.badRequest, "Choose Right Category");
    }
    const newService = new serviceModel_1.default({
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
    const savedService = yield newService.save();
    res
        .status(201)
        .json(new ApiResponse_1.default(201, savedService, "Service created successfully"));
}));
// Update service
exports.updateService = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, description, category, image, price, tags } = req.body;
    const updatedService = yield serviceModel_1.default.findByIdAndUpdate(req.params.serviceId, { title, description, category, image, price, tags }, { new: true });
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
    // const { id } = req?.user;
    const id = "67db1307330a765af9d93e4a";
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
            return res
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
            .status(statusCodes_1.default.serverError)
            .json(new ApiResponse_1.default(statusCodes_1.default.serverError, null, "Internal server error"));
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
