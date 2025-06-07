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
exports.integrateRatings = void 0;
const ratingModel_1 = __importDefault(require("../../models/ratingModel"));
const integrateRatings = (services) => __awaiter(void 0, void 0, void 0, function* () {
    if (!services.length)
        return [];
    const serviceIds = services.map((service) => service._id);
    // Fetch ratings using MongoDB aggregation
    const ratingsData = yield ratingModel_1.default.aggregate([
        {
            $match: { serviceId: { $in: serviceIds } },
        },
        {
            $group: {
                _id: "$serviceId",
                avgRating: { $avg: "$rating" },
                ratingCount: { $sum: 1 },
            },
        },
    ]);
    // Convert rating data into an object for quick lookup
    const ratingsMap = ratingsData.reduce((acc, rating) => {
        acc[rating._id.toString()] = {
            avgRating: parseFloat(rating.avgRating.toFixed(1)) || 0, // ✅ Default to 0
            ratingCount: rating.ratingCount || 0,
        };
        return acc;
    }, {});
    // Merge ratings with services
    return services.map((service) => {
        const rating = ratingsMap[service._id.toString()] || {
            avgRating: 0,
            ratingCount: 0,
        };
        return Object.assign(Object.assign({}, service.toObject()), { avgRating: rating.avgRating, ratingCount: rating.ratingCount });
    });
});
exports.integrateRatings = integrateRatings;
