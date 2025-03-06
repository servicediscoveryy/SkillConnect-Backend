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

// Create a Booking
export const createBooking = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    const { serviceId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(serviceId)) {
      throw new ApiError(STATUS.badRequest, "Invalid service ID format");
    }

    const service = await Service.findById(serviceId);

    if (!service) {
      throw new ApiError(STATUS.notFound, "Service is not found");
    }

    if (!req.user) throw new ApiError(STATUS.unauthorized, "Unauthorized");

    const amount = service.price;

    const newBooking = new Booking({
      amount,
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
    const { status } = req.body;

    const validStatuses = ["pending", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      throw new ApiError(STATUS.badRequest, "Invalid status value");
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      { orderStatus: status },
      { new: true }
    );

    if (!updatedBooking)
      throw new ApiError(STATUS.notFound, "Booking not found");

    res
      .status(STATUS.ok)
      .json(
        new ApiResponse(STATUS.ok, updatedBooking, "Booking status updated")
      );
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
