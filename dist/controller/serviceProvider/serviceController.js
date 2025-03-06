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
exports.rateService = exports.searchServices = exports.getServicesByCategory = exports.getAllServices = exports.deleteService = exports.updateService = exports.getServiceById = exports.createService = void 0;
const asyncHandler_1 = __importDefault(require("../../utils/asyncHandler"));
const ApiError_1 = __importDefault(require("../../utils/ApiError"));
const ApiResponse_1 = __importDefault(require("../../utils/ApiResponse"));
const ratingModel_1 = __importDefault(require("../../models/ratingModel"));
const serviceModel_1 = __importDefault(require("../../models/serviceModel"));
// Create a new service
exports.createService = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user)
        throw new ApiError_1.default(401, "Unauthorized user");
    const { title, description, category, image, price, tags } = req.body;
    const newService = new serviceModel_1.default({
        providerId: req.user._id,
        title,
        description,
        category,
        image,
        price,
        status: "active",
        tags,
    });
    const savedService = yield newService.save();
    res
        .status(201)
        .json(new ApiResponse_1.default(201, savedService, "Service created successfully"));
}));
// Get service by ID
exports.getServiceById = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const service = yield serviceModel_1.default.findById(req.params.serviceId);
    if (!service)
        throw new ApiError_1.default(404, "Service not found");
    res
        .status(200)
        .json(new ApiResponse_1.default(200, service, "Service fetched successfully"));
}));
// Update service
exports.updateService = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, description, category, image, price, tags } = req.body;
    const updatedService = yield serviceModel_1.default.findByIdAndUpdate(req.params.serviceId, { title, description, category, image, price, tags }, { new: true });
    if (!updatedService)
        throw new ApiError_1.default(404, "Service not found");
    res
        .status(200)
        .json(new ApiResponse_1.default(200, updatedService, "Service updated successfully"));
}));
// Delete service
exports.deleteService = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const deletedService = yield serviceModel_1.default.findByIdAndDelete(req.params.serviceId);
    if (!deletedService)
        throw new ApiError_1.default(404, "Service not found");
    res
        .status(200)
        .json(new ApiResponse_1.default(200, {}, "Service deleted successfully"));
}));
// Get all services
exports.getAllServices = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const services = yield serviceModel_1.default.find();
    res
        .status(200)
        .json(new ApiResponse_1.default(200, services, "All services fetched successfully"));
}));
// Get services by category
exports.getServicesByCategory = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { category } = req.params;
    const services = yield serviceModel_1.default.find({ category, status: "active" });
    res
        .status(200)
        .json(new ApiResponse_1.default(200, services, "Services fetched by category"));
}));
// Search services
exports.searchServices = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { query } = req.query;
    if (!query || typeof query !== "string")
        throw new ApiError_1.default(400, "Query parameter is required");
    const services = yield serviceModel_1.default.find({
        $or: [
            { title: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } },
            { tags: { $regex: query, $options: "i" } },
        ],
        status: "active",
    });
    res.status(200).json(new ApiResponse_1.default(200, services, "Search results"));
}));
// Rate a service
exports.rateService = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user)
        throw new ApiError_1.default(401, "Unauthorized user");
    const { serviceId } = req.params;
    const { rating, description } = req.body;
    const newRating = new ratingModel_1.default({
        userId: req.user._id,
        serviceId,
        rating,
        description,
    });
    yield newRating.save();
    res
        .status(201)
        .json(new ApiResponse_1.default(201, newRating, "Service rated successfully"));
}));
