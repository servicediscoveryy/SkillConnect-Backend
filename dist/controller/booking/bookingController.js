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
exports.cancelBooking = exports.updateBookingStatus = exports.getUserBookings = exports.getBookingById = exports.initiatePayment = exports.createBooking = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const asyncHandler_1 = __importDefault(require("../../utils/asyncHandler"));
const ApiError_1 = __importDefault(require("../../utils/response/ApiError"));
const ApiResponse_1 = __importDefault(require("../../utils/response/ApiResponse"));
const bookingModel_1 = __importDefault(require("../../models/bookingModel"));
const statusCodes_1 = __importDefault(require("../../data/statusCodes"));
const paymentModel_1 = __importDefault(require("../../models/paymentModel"));
const serviceModel_1 = __importDefault(require("../../models/serviceModel"));
// Create a Booking
exports.createBooking = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { serviceId } = req.body;
    if (!mongoose_1.default.Types.ObjectId.isValid(serviceId)) {
        throw new ApiError_1.default(statusCodes_1.default.badRequest, "Invalid service ID format");
    }
    const service = yield serviceModel_1.default.findById(serviceId);
    if (!service) {
        throw new ApiError_1.default(statusCodes_1.default.notFound, "Service is not found");
    }
    if (!req.user)
        throw new ApiError_1.default(statusCodes_1.default.unauthorized, "Unauthorized");
    const amount = service.price;
    const newBooking = new bookingModel_1.default({
        amount,
        userId: req.user._id,
        serviceId,
    });
    const savedBooking = yield newBooking.save();
    res
        .status(201)
        .json(new ApiResponse_1.default(201, savedBooking, "Booking created successfully"));
}));
exports.initiatePayment = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { bookingId, paymentMethod } = req.body;
    const booking = yield bookingModel_1.default.findById(bookingId);
    if (!booking)
        throw new ApiError_1.default(statusCodes_1.default.notFound, "Booking not found");
    if (booking.paymentMethod !== paymentMethod) {
        throw new ApiError_1.default(statusCodes_1.default.badRequest, "Payment method mismatch");
    }
    if (paymentMethod === "online") {
        // Integrate Razorpay or similar service to create an order and get payment details
        // Example: Call to Razorpay API here
        // Once payment is initiated, create a payment record
        const newPayment = new paymentModel_1.default({
            orderId: booking.orderId,
            amount: booking.amount,
            bookingId: booking._id,
            status: "created", // Change status to 'created' until payment is captured
        });
        yield newPayment.save();
        // Update the booking payment status
        booking.paymentMethod = "online";
        booking.paymentStatus = "created";
        yield booking.save();
        res
            .status(statusCodes_1.default.ok)
            .json(new ApiResponse_1.default(statusCodes_1.default.ok, { payment: newPayment }, "Payment initiated"));
    }
    else {
        // If COD, just update payment status
        booking.paymentMethod = "cod";
        booking.paymentStatus = "pending";
        yield booking.save();
        res
            .status(statusCodes_1.default.ok)
            .json(new ApiResponse_1.default(statusCodes_1.default.ok, booking, "COD payment initiated"));
    }
}));
// Capture Payment (Online Payment Success/Failure)
// webhooks payment
// writing webhook
// Get a Booking by ID
exports.getBookingById = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { bookingId } = req.params;
    if (!mongoose_1.default.Types.ObjectId.isValid(bookingId)) {
        throw new ApiError_1.default(statusCodes_1.default.badRequest, "Invalid booking ID format");
    }
    const booking = yield bookingModel_1.default.findById(bookingId)
        .populate("userId", "name email") // Populate user details
        .populate("serviceId", "title category price"); // Populate service details
    if (!booking)
        throw new ApiError_1.default(statusCodes_1.default.notFound, "Booking not found");
    res
        .status(statusCodes_1.default.ok)
        .json(new ApiResponse_1.default(statusCodes_1.default.ok, booking, "Booking details fetched"));
}));
// Get all Bookings of a User
exports.getUserBookings = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user)
        throw new ApiError_1.default(statusCodes_1.default.unauthorized, "Unauthorized");
    const bookings = yield bookingModel_1.default.find({ userId: req.user._id })
        .populate("serviceId", "title category price")
        .sort({ createdAt: -1 });
    res
        .status(statusCodes_1.default.ok)
        .json(new ApiResponse_1.default(statusCodes_1.default.ok, bookings, "User bookings fetched"));
}));
// Update Booking Status
exports.updateBookingStatus = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { bookingId } = req.params;
    const { status } = req.body;
    const validStatuses = ["pending", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
        throw new ApiError_1.default(statusCodes_1.default.badRequest, "Invalid status value");
    }
    const updatedBooking = yield bookingModel_1.default.findByIdAndUpdate(bookingId, { orderStatus: status }, { new: true });
    if (!updatedBooking)
        throw new ApiError_1.default(statusCodes_1.default.notFound, "Booking not found");
    res
        .status(statusCodes_1.default.ok)
        .json(new ApiResponse_1.default(statusCodes_1.default.ok, updatedBooking, "Booking status updated"));
}));
// cancel a Booking
exports.cancelBooking = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { bookingId } = req.params;
    const booking = yield bookingModel_1.default.findById(bookingId);
    if (!booking)
        throw new ApiError_1.default(statusCodes_1.default.notFound, "Booking not found");
    booking.orderStatus = "cancelled";
    booking.paymentStatus = "failed"; // Only if the payment was initiated
    yield booking.save();
    res
        .status(statusCodes_1.default.ok)
        .json(new ApiResponse_1.default(statusCodes_1.default.ok, {}, "Booking cancelled successfully"));
}));
