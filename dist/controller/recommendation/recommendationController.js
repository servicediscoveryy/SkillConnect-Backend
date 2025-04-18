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
exports.recordInteraction = exports.viewService = void 0;
const ApiError_1 = __importDefault(require("../../utils/response/ApiError"));
const statusCodes_1 = __importDefault(require("../../data/statusCodes"));
const serviceModel_1 = __importDefault(require("../../models/serviceModel"));
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
