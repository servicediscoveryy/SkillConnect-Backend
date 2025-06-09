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
exports.getRelatedRecommendation = exports.getRecommendedByUser = exports.recordInteraction = exports.viewService = void 0;
const axios_1 = __importDefault(require("axios"));
const serviceModel_1 = __importDefault(require("../../models/serviceModel")); // Assuming this is your service model
const ApiError_1 = __importDefault(require("../../utils/response/ApiError"));
const statusCodes_1 = __importDefault(require("../../data/statusCodes"));
const ApiResponse_1 = __importDefault(require("../../utils/response/ApiResponse"));
const categoryModel_1 = __importDefault(require("../../models/categoryModel"));
const userInteraction_1 = __importDefault(require("../../models/userInteraction"));
const viewService = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { serviceId } = req.params;
        const service = yield serviceModel_1.default.findByIdAndUpdate(serviceId, {
            $inc: { views: 1 },
        }, { new: true });
        res.status(statusCodes_1.default.ok);
        return;
    }
    catch (error) {
        throw new ApiError_1.default(statusCodes_1.default.internalServerError, "something went wrong");
    }
});
exports.viewService = viewService;
const recordInteraction = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user._id;
        const { serviceId, actionType } = req.body;
        if (!serviceId || !actionType || !userId) {
            res
                .status(statusCodes_1.default.badRequest)
                .json(new ApiError_1.default(statusCodes_1.default.badRequest, "Service Id and Action Required"));
            return;
        }
        const validActions = ["view", "book", "cart", "review", "search"];
        if (!validActions.includes(actionType)) {
            res
                .status(statusCodes_1.default.badRequest)
                .json(new ApiError_1.default(statusCodes_1.default.badRequest, "Invalid action type"));
            return;
        }
        // Check if the service exists
        const service = yield serviceModel_1.default.findById(serviceId);
        if (!service) {
            res
                .status(statusCodes_1.default.notFound)
                .json(new ApiError_1.default(statusCodes_1.default.notFound, "Service Not Found"));
            return;
        }
        // Check if the category exists
        const category = yield categoryModel_1.default.findById(service.category);
        if (!category) {
            res
                .status(statusCodes_1.default.notFound)
                .json(new ApiError_1.default(statusCodes_1.default.notFound, "Category Not Found"));
            return;
        }
        // Prevent duplicate "view" interactions within a short timeframe (e.g., 5 minutes)
        if (actionType === "view") {
            const recentInteraction = yield userInteraction_1.default.findOne({
                userId,
                serviceId,
                actionType: "view",
                createdAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) }, // Last 5 minutes
            });
            if (recentInteraction) {
                res
                    .status(statusCodes_1.default.ok)
                    .json(new ApiResponse_1.default(statusCodes_1.default.ok, null, "View interaction already recorded recently"));
                return;
            }
        }
        // Create and save the interaction
        const interaction = new userInteraction_1.default({
            userId,
            serviceId,
            categoryId: category._id,
            actionType,
        });
        yield interaction.save();
        res
            .status(statusCodes_1.default.ok)
            .json(new ApiResponse_1.default(statusCodes_1.default.ok, interaction, "Interaction recorded successfully"));
    }
    catch (error) {
        console.error("Error recording interaction:", error);
        res
            .status(statusCodes_1.default.internalServerError)
            .json(new ApiError_1.default(statusCodes_1.default.internalServerError, "Something went wrong"));
        return;
    }
});
exports.recordInteraction = recordInteraction;
const getRecommendedByUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // @ts-ignore
        const userId = req.user._id;
        console.log(userId);
        // Call external recommendation system
        const response = yield axios_1.default.get(`https://recommondedsys.onrender.com/recommend/${userId}`);
        console.log(response);
        const recommendedServiceIds = (_a = response === null || response === void 0 ? void 0 : response.data) === null || _a === void 0 ? void 0 : _a.map((service) => service.id);
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
        const recommendedServices = yield serviceModel_1.default.find({
            _id: { $in: recommendedServiceIds },
        });
        console.log(recommendedServices);
        res.status(200).json({
            data: recommendedServices,
            success: true,
            error: false,
            message: "Recommended services fetched successfully.",
        });
    }
    catch (error) {
        console.error("Error fetching recommendations:", error.message);
        res.status(500).json({
            message: error.message || "Server error",
            error: true,
            success: false,
        });
    }
});
exports.getRecommendedByUser = getRecommendedByUser;
const getRelatedRecommendation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { service } = req.params;
        console.log(service);
        // 1. fetch the list of recommended titles from your Python service
        const response = yield axios_1.default.get(`http://localhost:5000/recommendations?service=${encodeURIComponent(service)}`);
        console.log(response);
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
        const services = yield serviceModel_1.default.aggregate([
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
                    from: "ratings",
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
    }
    catch (error) {
        console.error("Error fetching related recommendations:", error);
        res.status(500).json({
            message: error.message || "Internal Server Error",
        });
        return;
    }
});
exports.getRelatedRecommendation = getRelatedRecommendation;
