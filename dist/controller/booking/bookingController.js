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
exports.getProviderBookings = exports.cancelBooking = exports.updateBookingStatus = exports.getUserBookings = exports.getBookingById = exports.initiatePayment = exports.createBooking = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const asyncHandler_1 = __importDefault(require("../../utils/asyncHandler"));
const ApiError_1 = __importDefault(require("../../utils/response/ApiError"));
const ApiResponse_1 = __importDefault(require("../../utils/response/ApiResponse"));
const bookingModel_1 = __importDefault(require("../../models/bookingModel"));
const statusCodes_1 = __importDefault(require("../../data/statusCodes"));
const paymentModel_1 = __importDefault(require("../../models/paymentModel"));
const serviceModel_1 = __importDefault(require("../../models/serviceModel"));
const addressModel_1 = __importDefault(require("../../models/addressModel"));
// Create a Booking
exports.createBooking = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { serviceId, addressId } = req.body;
    if (!req.user)
        throw new ApiError_1.default(statusCodes_1.default.unauthorized, "Unauthorized");
    if (!mongoose_1.default.Types.ObjectId.isValid(serviceId) ||
        !mongoose_1.default.Types.ObjectId.isValid(addressId)) {
        throw new ApiError_1.default(statusCodes_1.default.badRequest, "Invalid Fields");
    }
    // check the user has already booked the service
    const isBookingExist = yield bookingModel_1.default.findOne({
        addressId: addressId,
        serviceId: serviceId,
    });
    if (isBookingExist) {
        throw new ApiError_1.default(statusCodes_1.default.found, "Service is Already Booked");
    }
    const service = yield serviceModel_1.default.findById(serviceId);
    if (!service) {
        throw new ApiError_1.default(statusCodes_1.default.notFound, "Service is not found");
    }
    const address = yield addressModel_1.default.findById(addressId);
    if (!address) {
        throw new ApiError_1.default(statusCodes_1.default.notFound, "address is not found");
    }
    const amount = service.price;
    const newBooking = new bookingModel_1.default({
        amount,
        addressId,
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
        .populate("addressId") // Populating address details
        .sort({ createdAt: -1 });
    res
        .status(statusCodes_1.default.ok)
        .json(new ApiResponse_1.default(statusCodes_1.default.ok, bookings, "User bookings fetched"));
}));
// Update Booking Status
exports.updateBookingStatus = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { bookingId } = req.params;
    const { orderStatus, paymentStatus } = req.body;
    const validOrderStatuses = ["pending", "completed", "cancelled"];
    const validPaymentStatuses = ["created", "captured", "failed", "pending"];
    const booking = yield bookingModel_1.default.findById(bookingId);
    if (!booking)
        throw new ApiError_1.default(statusCodes_1.default.notFound, "Booking not found");
    // Validate order status
    if (orderStatus && !validOrderStatuses.includes(orderStatus)) {
        throw new ApiError_1.default(statusCodes_1.default.badRequest, "Invalid order status value");
    }
    // Validate payment status
    if (paymentStatus && !validPaymentStatuses.includes(paymentStatus)) {
        throw new ApiError_1.default(statusCodes_1.default.badRequest, "Invalid payment status value");
    }
    // ❌ Prevent marking order as "completed" if payment isn't captured
    if (orderStatus === "completed" && booking.paymentStatus !== "captured") {
        throw new ApiError_1.default(statusCodes_1.default.badRequest, "Order cannot be marked as completed until payment is captured");
    }
    // ✅ If payment is captured, order can be completed
    if (paymentStatus === "captured") {
        booking.paymentStatus = "captured";
        if (booking.orderStatus === "pending") {
            booking.orderStatus = "completed";
        }
    }
    // ✅ If payment failed, order should remain pending or be cancelled
    if (paymentStatus === "failed") {
        booking.paymentStatus = "failed";
        booking.orderStatus = "pending"; // Don't complete if payment failed
    }
    // ✅ Allow updating order status if valid
    if (orderStatus) {
        booking.orderStatus = orderStatus;
    }
    yield booking.save();
    res
        .status(statusCodes_1.default.ok)
        .json(new ApiResponse_1.default(statusCodes_1.default.ok, booking, "Booking status updated"));
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
// providers booking
exports.getProviderBookings = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user)
        throw new ApiError_1.default(statusCodes_1.default.unauthorized, "Unauthorized");
    // Get all services offered by the provider
    const providerServices = yield serviceModel_1.default.find({ providerId: req.user._id });
    // Extract service IDs
    const serviceIds = providerServices.map((service) => service._id);
    // Find bookings for those services
    const bookings = yield bookingModel_1.default.find({ serviceId: { $in: serviceIds } })
        .populate("serviceId", "title category price")
        .populate("userId", "name email") // Populate user info
        .populate("addressId") // Populate address details
        .sort({ createdAt: -1 });
    res
        .status(statusCodes_1.default.ok)
        .json(new ApiResponse_1.default(statusCodes_1.default.ok, bookings, "Provider bookings fetched"));
}));
