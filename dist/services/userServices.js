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
exports.getUsersWhoBookedProviderServices = void 0;
const statusCodes_1 = __importDefault(require("../data/statusCodes"));
const bookingModel_1 = __importDefault(require("../models/bookingModel"));
const serviceModel_1 = __importDefault(require("../models/serviceModel"));
const ApiError_1 = __importDefault(require("../utils/response/ApiError"));
// export const getUsersWhoBookedProviderServices = async (providerId: string, page: number, limit: number) => {
//     if (!providerId) throw new ApiError(STATUS.unauthorized, "Unauthorized");
//     // Get provider's services
//     const providerServices = await Service.find({ providerId }).select("_id");
//     if (providerServices.length === 0) return { users: [], totalUsers: 0 };
//     // Extract service IDs
//     const serviceIds = providerServices.map((service) => service._id);
//     // Find distinct users who booked the provider's services
//     const userIds = await Booking.distinct("userId", { serviceId: { $in: serviceIds } });
//     // Paginate users
//     const users = await User.find({ _id: { $in: userIds } })
//       .select("_id name email profilePicture")
//       .skip((page - 1) * limit)
//       .limit(limit);
//     // Total users count
//     const totalUsers = userIds.length;
//     return { users, totalUsers };
//   };
const getUsersWhoBookedProviderServices = (providerId, page, limit) => __awaiter(void 0, void 0, void 0, function* () {
    if (!providerId)
        throw new ApiError_1.default(statusCodes_1.default.unauthorized, "Unauthorized");
    // Get provider's services
    const providerServices = yield serviceModel_1.default.find({ providerId }).select("_id");
    if (providerServices.length === 0)
        return { users: [], totalUsers: 0 };
    // Extract service IDs
    const serviceIds = providerServices.map((service) => service._id);
    // Find users who booked the provider's services and populate the service details
    const bookings = yield bookingModel_1.default.find({ serviceId: { $in: serviceIds } })
        .populate("userId", "_id firstName lastName email profilePicture") // Populate user details
        .populate("serviceId", "_id title category price createdAt") // Populate service details
        .sort({ createdAt: -1 }) // Sort by latest bookings
        .skip((page - 1) * limit)
        .limit(limit);
    // Format the response
    const users = bookings.map((booking) => ({
        user: {
            _id: booking.userId._id,
            firstName: booking.userId.firstName,
            lastName: booking.userId.lastName,
            email: booking.userId.email,
            profilePicture: booking.userId.profilePicture,
        },
        service: {
            _id: booking.serviceId._id,
            title: booking.serviceId.title,
            category: booking.serviceId.category,
            price: booking.serviceId.price,
            date: booking.serviceId.createdAt,
            status: (booking.orderStatus)
        },
    }));
    // Get the total count of distinct users
    const totalUsers = yield bookingModel_1.default.distinct("userId", { serviceId: { $in: serviceIds } }).countDocuments();
    return { users, totalUsers };
});
exports.getUsersWhoBookedProviderServices = getUsersWhoBookedProviderServices;
