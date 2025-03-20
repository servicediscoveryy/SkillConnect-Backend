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
exports.getCategroyWiseServices = exports.getServiceById = exports.getTopServices = exports.getServices = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const statusCodes_1 = __importDefault(require("../../data/statusCodes"));
const ratingModel_1 = __importDefault(require("../../models/ratingModel"));
const serviceModel_1 = __importDefault(require("../../models/serviceModel"));
const asyncHandler_1 = __importDefault(require("../../utils/asyncHandler"));
const ApiError_1 = __importDefault(require("../../utils/response/ApiError"));
const ApiResponse_1 = __importDefault(require("../../utils/response/ApiResponse"));
const integrateRatings_1 = require("../../utils/rating/integrateRatings");
const categoryModel_1 = __importDefault(require("../../models/categoryModel"));
exports.getServices = (0, asyncHandler_1.default)((0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { category, query } = req.query; // Using query params for both category and search query
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filter = { status: "active" }; // Default filter by status
    // Add category filter if category is provided in the query
    if (category) {
        const categoryDoc = yield categoryModel_1.default.findOne({
            category: { $regex: category, $options: "i" }, // ✅ Partial match (case-insensitive)
        });
        if (!categoryDoc) {
            throw new ApiError_1.default(404, "Category not found");
        }
        filter.category = categoryDoc._id;
    }
    // Add search filter if query is provided in the query
    if (query) {
        filter.$or = [
            { title: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } },
            { location: { $regex: query, $options: "i" } },
            { tags: { $regex: query, $options: "i" } },
        ];
    }
    const totalServices = yield serviceModel_1.default.countDocuments(filter); // Get total count based on filters
    // Fetch paginated services based on the filter
    const services = yield serviceModel_1.default.find(filter)
        .populate("category", "category")
        .skip((page - 1) * limit)
        .limit(limit);
    const servicesWithRatings = yield (0, integrateRatings_1.integrateRatings)(services);
    // Send the response with pagination info
    res.status(statusCodes_1.default.ok).json(new ApiResponse_1.default(statusCodes_1.default.ok, servicesWithRatings, "Services fetched successfully", {
        totalPages: Math.ceil(totalServices / limit),
        currentPage: page,
        pageSize: limit,
        totalItems: totalServices,
    }));
})));
exports.getTopServices = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { limit = 10, location, category, status } = req.query;
        const filter = {}; // Dynamic filter object
        if (location)
            filter.location = location;
        if (category)
            filter.category = category;
        if (status)
            filter.status = status;
        const topServices = yield ratingModel_1.default.aggregate([
            {
                $group: {
                    _id: "$serviceId",
                    avgRating: { $avg: "$rating" },
                    ratingCount: { $sum: 1 },
                },
            },
            { $sort: { avgRating: -1, ratingCount: -1 } },
            { $limit: parseInt(limit) },
        ]);
        const serviceIds = topServices.map((service) => service._id);
        // Fetch services that match filters and are in the top-rated list
        const services = yield serviceModel_1.default.find(Object.assign({ _id: { $in: serviceIds } }, filter));
        const servicesWithRatings = yield (0, integrateRatings_1.integrateRatings)(services);
        res
            .status(statusCodes_1.default.ok)
            .json(new ApiResponse_1.default(statusCodes_1.default.ok, servicesWithRatings, "Fetched top services"));
    }
    catch (error) {
        res
            .status(statusCodes_1.default.internalServerError)
            .json(new ApiResponse_1.default(statusCodes_1.default.internalServerError, null, "Server Error"));
    }
}));
exports.getServiceById = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { serviceId } = req.params;
    const limitRating = parseInt(req.query.limitRating) || 10;
    if (!mongoose_1.default.Types.ObjectId.isValid(serviceId)) {
        throw new ApiError_1.default(400, "Invalid service ID");
    }
    const service = yield serviceModel_1.default.findById(serviceId)
        .populate({
        path: "providerId", // Populating service provider details
        select: "name email",
    })
        .lean();
    if (!service) {
        throw new ApiError_1.default(404, "Service not found");
    }
    const ratingAvg = yield ratingModel_1.default.aggregate([
        { $match: { serviceId: new mongoose_1.default.Types.ObjectId(serviceId) } },
        {
            $group: {
                _id: "$serviceId",
                avgRating: { $avg: "$rating" },
                totalRating: { $sum: 1 },
            },
        },
    ]);
    const ratings = yield ratingModel_1.default.find({ serviceId })
        .populate({
        path: "userId",
        select: "name email profilePicture",
    })
        .limit(limitRating);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, Object.assign(Object.assign({}, service), { ratings, ratingAvg }), "Service details fetched"));
}));
exports.getCategroyWiseServices = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield categoryModel_1.default.find({});
        const categoryWithServices = yield Promise.all(categories.map((cat) => __awaiter(void 0, void 0, void 0, function* () {
            const services = yield serviceModel_1.default.find({ category: cat.id })
                .sort({ view: -1, createdAt: -1 }) // Prioritize most viewed & recent
                .limit(10)
                .populate("category");
            const servicesWithRating = yield (0, integrateRatings_1.integrateRatings)(services);
            return Object.assign(Object.assign({}, cat.toObject()), { services: servicesWithRating });
        })));
        res
            .status(statusCodes_1.default.ok)
            .json(new ApiResponse_1.default(statusCodes_1.default.ok, categoryWithServices, "Fetched successfully"));
    }
    catch (error) {
        res
            .status(statusCodes_1.default.notFound)
            .json(new ApiResponse_1.default(statusCodes_1.default.badGateway, null, "Error"));
    }
}));
