"use strict";
// ratingUtils.js
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
    const serviceIds = services.map((service) => service._id);
    // Fetch ratings data for the given serviceIds
    const topServices = yield ratingModel_1.default.aggregate([
        {
            $match: {
                serviceId: { $in: serviceIds },
            },
        },
        {
            $group: {
                _id: "$serviceId",
                avgRating: { $avg: "$rating" },
                ratingCount: { $sum: 1 },
            },
        },
    ]);
    // Merge the ratings data with the services
    return services.map((service) => {
        const topService = topServices.find((topService) => topService._id.toString() === service._id.toString());
        return Object.assign(Object.assign({}, service.toObject()), { avgRating: topService ? topService.avgRating : null, ratingCount: topService ? topService.ratingCount : 0 });
    });
});
exports.integrateRatings = integrateRatings;
