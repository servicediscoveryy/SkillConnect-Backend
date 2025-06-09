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
exports.getProviderOrderStats = exports.CompleteBooking = exports.GenerateOtpBookingComplete = exports.getProviderBookings = exports.cancelBookingByUser = exports.cancelBooking = exports.AceeptBookings = exports.updateBookingStatus = exports.getUserBookings = exports.getBookingById = exports.initiatePayment = exports.createBooking = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const asyncHandler_1 = __importDefault(require("../../utils/asyncHandler"));
const ApiError_1 = __importDefault(require("../../utils/response/ApiError"));
const ApiResponse_1 = __importDefault(require("../../utils/response/ApiResponse"));
const bookingModel_1 = __importDefault(require("../../models/bookingModel"));
const statusCodes_1 = __importDefault(require("../../data/statusCodes"));
const paymentModel_1 = __importDefault(require("../../models/paymentModel"));
const serviceModel_1 = __importDefault(require("../../models/serviceModel"));
const addressModel_1 = __importDefault(require("../../models/addressModel"));
const email_1 = require("../../utils/notification/email");
const otp_1 = require("../../utils/notification/otp");
// Create a Booking
exports.createBooking = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { serviceId, addressId } = req.body;
    if (!req.user)
        throw new ApiError_1.default(statusCodes_1.default.unauthorized, "Unauthorized");
    console.log(serviceId);
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
        userId: "67dd5c5d726e64ceb0b30617",
        serviceId,
    });
    const savedBooking = yield newBooking.save();
    // const emptyCart = await Cart.findByIdAndUpdate
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
        .populate("addressId")
        .sort({ createdAt: -1 });
    console.log(bookings);
    // Group bookings by orderId
    const groupedBookings = {};
    bookings.forEach((booking) => {
        const orderId = booking === null || booking === void 0 ? void 0 : booking.orderId;
        // Only group by orderId if it's a non-empty string
        if (typeof orderId === "string" && orderId.trim() !== "") {
            if (!groupedBookings[orderId]) {
                groupedBookings[orderId] = {
                    orderId: booking.orderId,
                    amount: booking.amount,
                    userId: booking.userId,
                    paymentMethod: booking.paymentMethod,
                    orderStatus: booking.orderStatus,
                    paymentStatus: booking.paymentStatus,
                    createdAt: booking.createdAt,
                    updatedAt: booking.updatedAt,
                    address: booking.addressId,
                    services: [],
                };
            }
            groupedBookings[orderId].services.push({
                _id: booking.serviceId._id,
                //@ts-expect-error
                title: booking.serviceId.title,
                //@ts-expect-error
                category: booking.serviceId.category,
                //@ts-expect-error
                price: booking.serviceId.price,
            });
        }
    });
    const result = Object.values(groupedBookings); // Convert to array
    res
        .status(statusCodes_1.default.ok)
        .json(new ApiResponse_1.default(statusCodes_1.default.ok, result, "Grouped bookings fetched"));
}));
// Update Booking Status
exports.updateBookingStatus = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    const { bookingId } = req.params;
    const { orderStatus, paymentStatus } = req.body;
    console.log("inside the booking");
    const validOrderStatuses = [
        "accepted",
        "pending",
        "completed",
        "cancelled",
    ];
    const validPaymentStatuses = ["created", "captured", "failed", "pending"];
    const booking = yield bookingModel_1.default.findById(bookingId)
        .populate("userId")
        .populate({
        path: "serviceId", // Populating service information
        populate: {
            path: "providerId",
        },
    });
    if (!booking)
        throw new ApiError_1.default(statusCodes_1.default.notFound, "Booking not found");
    console.log(booking);
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
    if (orderStatus === "accepted") {
        booking.orderStatus = orderStatus;
        (0, email_1.sendEmail)("sangammunde3@gmail.com", "Booking Accepted – Next Steps Inside!", "Your service provider has accepted your request. Please find the details below.", `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Booking Accepted</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
        .email-container {
          width: 100%;
          background-color: #ffffff;
          padding: 20px;
          max-width: 600px;
          margin: 0 auto;
          border-radius: 10px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        .email-header {
          text-align: center;
          margin-bottom: 20px;
        }
        .email-header img {
          width: 80px;
          border-radius: 50%;
          margin-bottom: 10px;
        }
        .email-header h1 {
          font-size: 22px;
          color: #333333;
        }
        .email-body {
          font-size: 16px;
          color: #555555;
          line-height: 1.6;
        }
        .email-body p {
          margin: 10px 0;
        }
        .email-footer {
          text-align: center;
          font-size: 14px;
          color: #888888;
          margin-top: 30px;
        }
        .btn {
          display: inline-block;
          background-color: #007bff;
          color: #ffffff;
          padding: 12px 20px;
          text-align: center;
          border-radius: 5px;
          text-decoration: none;
          font-size: 16px;
          margin-top: 20px;
        }
        .btn:hover {
          background-color: #0056b3;
        }
        ul {
          padding-left: 20px;
        }
        ul li {
          margin-bottom: 8px;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="email-header">
          <img src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png" alt="Profile Picture">
          <h1>Booking Confirmed!</h1>
        </div>
        <div class="email-body">
        
          <p>Hi ${((_a = booking === null || booking === void 0 ? void 0 : booking.userId) === null || _a === void 0 ? void 0 : _a.firstName) || "Customer"} ${(_b = booking.userId) === null || _b === void 0 ? void 0 : _b.lastName},</p>
          <p>Your booking has been successfully accepted! Below are the details:</p>
          <ul>
            <li><strong>Service:</strong> ${((_c = booking.serviceId) === null || _c === void 0 ? void 0 : _c.title) || "N/A"}</li>
            <li><strong>Provider:</strong> ${((_e = (_d = booking.serviceId) === null || _d === void 0 ? void 0 : _d.providerId) === null || _e === void 0 ? void 0 : _e.email) || "N/A"}</li>
            <li><strong>Provider Phone:</strong> ${((_g = (_f = booking.serviceId) === null || _f === void 0 ? void 0 : _f.providerId) === null || _g === void 0 ? void 0 : _g.phone) || "+91 1212121212"}</li>
            <li><strong>Amount:</strong> ₹${((_h = booking.serviceId) === null || _h === void 0 ? void 0 : _h.price) || "N/A"}</li>
            <li><strong>Location:</strong> ${((_j = booking.serviceId) === null || _j === void 0 ? void 0 : _j.location) || "N/A"}</li>
            <li><strong>Order Status:</strong> ${booking.orderStatus || "N/A"}</li>
            <li><strong>Payment Status:</strong> ${booking.paymentStatus || "N/A"}</li>
          </ul>
          <p>To proceed, please contact your service provider using the details above.</p>
          <a href="#" class="btn">Contact Provider</a>
        </div>
        <div class="email-footer">
          <p>Thank you for choosing SkillConnect.</p>
          <p>Best regards, <br> SkillConnect Team</p>
        </div>
      </div>
    </body>
    </html>`);
    }
    else {
        booking.orderStatus = orderStatus;
    }
    yield booking.save();
    res
        .status(statusCodes_1.default.ok)
        .json(new ApiResponse_1.default(statusCodes_1.default.ok, booking, "Booking status updated"));
}));
exports.AceeptBookings = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { bookingId } = req.params;
    const { orderStatus, paymentStatus } = req.body;
    const validOrderStatuses = ["pending", "completed", "cancelled"];
    const booking = yield bookingModel_1.default.findById(bookingId);
    if (!booking)
        throw new ApiError_1.default(statusCodes_1.default.notFound, "Booking not found");
    // Validate order status
    if (orderStatus && !validOrderStatuses.includes(orderStatus)) {
        throw new ApiError_1.default(statusCodes_1.default.badRequest, "Invalid order status value");
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
exports.cancelBookingByUser = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { orderId } = req.params;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    if (!orderId) {
        throw new ApiError_1.default(statusCodes_1.default.badRequest, "Order ID is required");
    }
    // Find all bookings matching orderId and userId
    const bookings = yield bookingModel_1.default.find({ orderId, userId });
    if (!bookings || bookings.length === 0) {
        throw new ApiError_1.default(statusCodes_1.default.notFound, "Booking not found or unauthorized");
    }
    // Update orderStatus to "cancelled" for all
    yield Promise.all(bookings.map((booking) => bookingModel_1.default.findByIdAndUpdate(booking._id, { orderStatus: "cancelled", paymentStatus: "failed" }, { new: true })));
    res
        .status(statusCodes_1.default.ok)
        .json(new ApiResponse_1.default(statusCodes_1.default.ok, null, "Booking cancelled successfully"));
}));
// // providers booking
// export const getProviderBookings = asyncHandler(
//   async (req: RequestWithUser, res: Response) => {
//     if (!req.user) throw new ApiError(STATUS.unauthorized, "Unauthorized");
//     // Get all services offered by the provider
//     const providerServices = await Service.find({ providerId: req.user._id });
//     console.log(providerServices);
//     // Extract service IDs
//     const serviceIds = providerServices.map((service) => service._id);
//     console.log(serviceIds);
//     // Find bookings for those services
//     const bookings = await Booking.find({ serviceId: { $in: serviceIds } })
//       .populate("serviceId", "title category price")
//       .populate("userId", "name email") // Populate user info
//       .populate("addressId") // Populate address details
//       .sort({ createdAt: -1 });
//     res
//       .status(STATUS.ok)
//       .json(new ApiResponse(STATUS.ok, bookings, "Provider bookings fetched"));
//   }
// );
exports.getProviderBookings = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user)
        throw new ApiError_1.default(statusCodes_1.default.unauthorized, "Unauthorized");
    // Get all services offered by the provider
    const providerServices = yield serviceModel_1.default.find({ providerId: req.user._id });
    // Extract service IDs
    const serviceIds = providerServices.map((service) => service._id);
    console.log(serviceIds);
    // Find bookings for those services where orderStatus is NOT "completed"
    const bookings = yield bookingModel_1.default.find({
        serviceId: { $in: serviceIds },
        orderStatus: { $ne: "completed" }, // Fetch only non-completed orders
    })
        .populate("serviceId", "title category price")
        .populate("userId", "firstName lastName email") // Populate user info
        .populate("addressId") // Populate address details
        .sort({ createdAt: -1 });
    res
        .status(statusCodes_1.default.ok)
        .json(new ApiResponse_1.default(statusCodes_1.default.ok, bookings, "Non-completed provider bookings fetched"));
}));
exports.GenerateOtpBookingComplete = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { bookingId } = req.body;
    const booking = yield bookingModel_1.default.findById(bookingId).populate("userId");
    // @ts-ignore
    if ((booking === null || booking === void 0 ? void 0 : booking.orderStatus) === "completed") {
        throw new ApiError_1.default(statusCodes_1.default.badRequest, "Invalid Operation");
    }
    if (!booking)
        throw new ApiError_1.default(statusCodes_1.default.notFound, "Booking not found");
    const otp = yield (0, otp_1.storeOTP)(bookingId);
    // @ts-ignore
    (0, email_1.sendEmail)(booking.userId.email, "Otp Verification", otp);
    console.log(`OTP for ${bookingId}: ${otp}`);
    res
        .status(statusCodes_1.default.ok)
        .json(new ApiResponse_1.default(statusCodes_1.default.ok, "Otp Sent SuccessFully To user"));
}));
exports.CompleteBooking = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { bookingId, otp } = req.body;
    const booking = yield bookingModel_1.default.findById(bookingId).populate("userId");
    if (!booking)
        throw new ApiError_1.default(statusCodes_1.default.notFound, "Booking not found");
    const storedOtp = yield (0, otp_1.verifyOTP)(bookingId, otp);
    if (!storedOtp) {
        res.status(401).json(new ApiError_1.default(401, "Invalid or expired OTP"));
        return;
    }
    if (storedOtp) {
        booking.paymentStatus = "captured";
        booking.orderStatus = "completed";
        (0, email_1.sendEmail)(
        // @ts-ignore
        booking.userId.email, "Your Booking Has Completed Please share the feedBack on services", otp);
        yield booking.save();
    }
    res
        .status(statusCodes_1.default.ok)
        .json(new ApiResponse_1.default(statusCodes_1.default.ok, booking, "Booking status updated"));
}));
exports.getProviderOrderStats = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // @ts-ignore
    const providerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id; // Make sure `req.user` is populated via auth middleware
    if (!mongoose_1.default.Types.ObjectId.isValid(providerId)) {
        throw new ApiError_1.default(statusCodes_1.default.badRequest, "Invalid provider ID");
    }
    // Step 1: Get all bookings where the service's providerId = current user's _id
    const bookings = yield bookingModel_1.default.find().populate({
        path: "serviceId",
        select: "title providerId",
        match: { providerId: providerId }, // filter at population level
    });
    // Step 2: Filter out nulls where serviceId was not matched
    const filteredBookings = bookings.filter((b) => b.serviceId !== null);
    const totalOrders = filteredBookings.length;
    const completedOrders = filteredBookings.filter((b) => b.orderStatus === "completed");
    const pendingOrders = filteredBookings.filter((b) => b.orderStatus === "pending");
    const paidAmount = completedOrders
        .filter((b) => b.paymentStatus === "captured")
        .reduce((sum, b) => sum + (b.amount || 0), 0);
    const pendingAmount = filteredBookings
        .filter((b) => b.paymentStatus === "pending")
        .reduce((sum, b) => sum + (b.amount || 0), 0);
    const stats = {
        totalOrders,
        completedOrders: completedOrders.length,
        pendingOrders: pendingOrders.length,
        paidAmount,
        pendingAmount,
    };
    res
        .status(statusCodes_1.default.ok)
        .json(new ApiResponse_1.default(statusCodes_1.default.ok, stats, "Order stats fetched for provider"));
}));
