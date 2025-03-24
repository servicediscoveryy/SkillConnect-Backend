import { Request, Response } from "express";
import mongoose from "mongoose";
import asyncHandler from "../../utils/asyncHandler";
import ApiError from "../../utils/response/ApiError";
import ApiResponse from "../../utils/response/ApiResponse";
import Booking from "../../models/bookingModel";
import { RequestWithUser } from "../../types/RequestWithUser";
import STATUS from "../../data/statusCodes";
import Payment from "../../models/paymentModel";
import Service from "../../models/serviceModel";
import Address from "../../models/addressModel";

// Create a Booking
export const createBooking = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    const { serviceId, addressId } = req.body;
    if (!req.user) throw new ApiError(STATUS.unauthorized, "Unauthorized");

    if (
      !mongoose.Types.ObjectId.isValid(serviceId) ||
      !mongoose.Types.ObjectId.isValid(addressId)
    ) {
      throw new ApiError(STATUS.badRequest, "Invalid Fields");
    }

    // check the user has already booked the service

    const isBookingExist = await Booking.findOne({
      addressId: addressId,
      serviceId: serviceId,
    });

    if (isBookingExist) {
      throw new ApiError(STATUS.found, "Service is Already Booked");
    }
    const service = await Service.findById(serviceId);

    if (!service) {
      throw new ApiError(STATUS.notFound, "Service is not found");
    }

    const address = await Address.findById(addressId);

    if (!address) {
      throw new ApiError(STATUS.notFound, "address is not found");
    }

    const amount = service.price;

    const newBooking = new Booking({
      amount,
      addressId,
      userId: req.user._id,
      serviceId,
    });

    const savedBooking = await newBooking.save();

    res
      .status(201)
      .json(new ApiResponse(201, savedBooking, "Booking created successfully"));
  }
);

export const initiatePayment = asyncHandler(async (req, res) => {
  const { bookingId, paymentMethod } = req.body;

  const booking = await Booking.findById(bookingId);
  if (!booking) throw new ApiError(STATUS.notFound, "Booking not found");

  if (booking.paymentMethod !== paymentMethod) {
    throw new ApiError(STATUS.badRequest, "Payment method mismatch");
  }
  if (paymentMethod === "online") {
    // Integrate Razorpay or similar service to create an order and get payment details
    // Example: Call to Razorpay API here

    // Once payment is initiated, create a payment record
    const newPayment = new Payment({
      orderId: booking.orderId,
      amount: booking.amount,
      bookingId: booking._id,
      status: "created", // Change status to 'created' until payment is captured
    });
    await newPayment.save();

    // Update the booking payment status
    booking.paymentMethod = "online";
    booking.paymentStatus = "created";
    await booking.save();

    res
      .status(STATUS.ok)
      .json(
        new ApiResponse(STATUS.ok, { payment: newPayment }, "Payment initiated")
      );
  } else {
    // If COD, just update payment status
    booking.paymentMethod = "cod";
    booking.paymentStatus = "pending";

    await booking.save();
    res
      .status(STATUS.ok)
      .json(new ApiResponse(STATUS.ok, booking, "COD payment initiated"));
  }
});

// Capture Payment (Online Payment Success/Failure)
// webhooks payment
// writing webhook

// Get a Booking by ID
export const getBookingById = asyncHandler(
  async (req: Request, res: Response) => {
    const { bookingId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      throw new ApiError(STATUS.badRequest, "Invalid booking ID format");
    }

    const booking = await Booking.findById(bookingId)
      .populate("userId", "name email") // Populate user details
      .populate("serviceId", "title category price"); // Populate service details

    if (!booking) throw new ApiError(STATUS.notFound, "Booking not found");

    res
      .status(STATUS.ok)
      .json(new ApiResponse(STATUS.ok, booking, "Booking details fetched"));
  }
);

// Get all Bookings of a User
export const getUserBookings = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    if (!req.user) throw new ApiError(STATUS.unauthorized, "Unauthorized");

    const bookings = await Booking.find({ userId: req.user._id })
      .populate("serviceId", "title category price")
      .populate("addressId") // Populating address details

      .sort({ createdAt: -1 });

    res
      .status(STATUS.ok)
      .json(new ApiResponse(STATUS.ok, bookings, "User bookings fetched"));
  }
);

// Update Booking Status
export const updateBookingStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const { bookingId } = req.params;
    const { orderStatus, paymentStatus } = req.body;

    const validOrderStatuses = ["pending", "completed", "cancelled"];
    const validPaymentStatuses = ["created", "captured", "failed", "pending"];

    const booking = await Booking.findById(bookingId);
    if (!booking) throw new ApiError(STATUS.notFound, "Booking not found");

    // Validate order status
    if (orderStatus && !validOrderStatuses.includes(orderStatus)) {
      throw new ApiError(STATUS.badRequest, "Invalid order status value");
    }

    // Validate payment status
    if (paymentStatus && !validPaymentStatuses.includes(paymentStatus)) {
      throw new ApiError(STATUS.badRequest, "Invalid payment status value");
    }

    // ❌ Prevent marking order as "completed" if payment isn't captured
    if (orderStatus === "completed" && booking.paymentStatus !== "captured") {
      throw new ApiError(
        STATUS.badRequest,
        "Order cannot be marked as completed until payment is captured"
      );
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

    await booking.save();

    res
      .status(STATUS.ok)
      .json(new ApiResponse(STATUS.ok, booking, "Booking status updated"));
  }
);

// cancel a Booking
export const cancelBooking = asyncHandler(
  async (req: Request, res: Response) => {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);
    if (!booking) throw new ApiError(STATUS.notFound, "Booking not found");

    booking.orderStatus = "cancelled";
    booking.paymentStatus = "failed"; // Only if the payment was initiated
    await booking.save();

    res
      .status(STATUS.ok)
      .json(new ApiResponse(STATUS.ok, {}, "Booking cancelled successfully"));
  }
);

// providers booking

export const getProviderBookings = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    if (!req.user) throw new ApiError(STATUS.unauthorized, "Unauthorized");

    // Get all services offered by the provider
    const providerServices = await Service.find({ providerId: req.user._id });

    // Extract service IDs
    const serviceIds = providerServices.map((service) => service._id);

    // Find bookings for those services
    const bookings = await Booking.find({ serviceId: { $in: serviceIds } })
      .populate("serviceId", "title category price")
      .populate("userId", "name email") // Populate user info
      .populate("addressId") // Populate address details
      .sort({ createdAt: -1 });

    res
      .status(STATUS.ok)
      .json(new ApiResponse(STATUS.ok, bookings, "Provider bookings fetched"));
  }
);
