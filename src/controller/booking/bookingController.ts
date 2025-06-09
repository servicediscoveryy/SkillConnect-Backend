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
import { sendEmail } from "../../utils/notification/email";
import { storeOTP, verifyOTP } from "../../utils/notification/otp";
import Cart from "../../models/cartModel";

// Create a Booking
export const createBooking = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    const { serviceId, addressId } = req.body;
    if (!req.user) throw new ApiError(STATUS.unauthorized, "Unauthorized");

    console.log(serviceId);
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
      userId: "67dd5c5d726e64ceb0b30617",
      serviceId,
    });

    const savedBooking = await newBooking.save();

    // const emptyCart = await Cart.findByIdAndUpdate

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
      .populate("addressId")
      .sort({ createdAt: -1 });

    console.log(bookings);
    // Group bookings by orderId
    const groupedBookings: Record<string, any> = {};

    bookings.forEach((booking) => {
      const orderId = booking?.orderId;

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
      .status(STATUS.ok)
      .json(new ApiResponse(STATUS.ok, result, "Grouped bookings fetched"));
  }
);

// Update Booking Status
export const updateBookingStatus = asyncHandler(
  async (req: Request, res: Response) => {
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

    const booking = await Booking.findById(bookingId)
      .populate("userId")
      .populate({
        path: "serviceId", // Populating service information
        populate: {
          path: "providerId",
        },
      });
    if (!booking) throw new ApiError(STATUS.notFound, "Booking not found");
    console.log(booking);
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
    if (orderStatus === "accepted") {
      booking.orderStatus = orderStatus;

      sendEmail(
        "sangammunde3@gmail.com",
        "Booking Accepted – Next Steps Inside!",
        "Your service provider has accepted your request. Please find the details below.",
        `<!DOCTYPE html>
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
        
          <p>Hi ${(booking?.userId as any)?.firstName || "Customer"} ${
          (booking.userId as any)?.lastName
        },</p>
          <p>Your booking has been successfully accepted! Below are the details:</p>
          <ul>
            <li><strong>Service:</strong> ${
              (booking.serviceId as any)?.title || "N/A"
            }</li>
            <li><strong>Provider:</strong> ${
              (booking.serviceId as any)?.providerId?.email || "N/A"
            }</li>
            <li><strong>Provider Phone:</strong> ${
              (booking.serviceId as any)?.providerId?.phone || "+91 1212121212"
            }</li>
            <li><strong>Amount:</strong> ₹${
              (booking.serviceId as any)?.price || "N/A"
            }</li>
            <li><strong>Location:</strong> ${
              (booking.serviceId as any)?.location || "N/A"
            }</li>
            <li><strong>Order Status:</strong> ${
              booking.orderStatus || "N/A"
            }</li>
            <li><strong>Payment Status:</strong> ${
              booking.paymentStatus || "N/A"
            }</li>
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
    </html>`
      );
    } else {
      booking.orderStatus = orderStatus;
    }

    await booking.save();

    res
      .status(STATUS.ok)
      .json(new ApiResponse(STATUS.ok, booking, "Booking status updated"));
  }
);

export const AceeptBookings = asyncHandler(
  async (req: Request, res: Response) => {
    const { bookingId } = req.params;
    const { orderStatus, paymentStatus } = req.body;

    const validOrderStatuses = ["pending", "completed", "cancelled"];

    const booking = await Booking.findById(bookingId);
    if (!booking) throw new ApiError(STATUS.notFound, "Booking not found");

    // Validate order status
    if (orderStatus && !validOrderStatuses.includes(orderStatus)) {
      throw new ApiError(STATUS.badRequest, "Invalid order status value");
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

export const cancelBookingByUser = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    const { orderId } = req.params;
    const userId = req.user?._id;

    if (!orderId) {
      throw new ApiError(STATUS.badRequest, "Order ID is required");
    }

    // Find all bookings matching orderId and userId
    const bookings = await Booking.find({ orderId, userId });

    if (!bookings || bookings.length === 0) {
      throw new ApiError(STATUS.notFound, "Booking not found or unauthorized");
    }

    // Update orderStatus to "cancelled" for all
    await Promise.all(
      bookings.map((booking) =>
        Booking.findByIdAndUpdate(
          booking._id,
          { orderStatus: "cancelled", paymentStatus: "failed" },
          { new: true }
        )
      )
    );

    res
      .status(STATUS.ok)
      .json(new ApiResponse(STATUS.ok, null, "Booking cancelled successfully"));
  }
);

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
export const getProviderBookings = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    if (!req.user) throw new ApiError(STATUS.unauthorized, "Unauthorized");

    // Get all services offered by the provider
    const providerServices = await Service.find({ providerId: req.user._id });

    // Extract service IDs
    const serviceIds = providerServices.map((service) => service._id);

    console.log(serviceIds);

    // Find bookings for those services where orderStatus is NOT "completed"
    const bookings = await Booking.find({
      serviceId: { $in: serviceIds },
      orderStatus: { $ne: "completed" }, // Fetch only non-completed orders
    })
      .populate("serviceId", "title category price")
      .populate("userId", "firstName lastName email") // Populate user info
      .populate("addressId") // Populate address details
      .sort({ createdAt: -1 });

    res
      .status(STATUS.ok)
      .json(
        new ApiResponse(
          STATUS.ok,
          bookings,
          "Non-completed provider bookings fetched"
        )
      );
  }
);

export const GenerateOtpBookingComplete = asyncHandler(
  async (req: Request, res: Response) => {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId).populate("userId");
    // @ts-ignore
    if (booking?.orderStatus === "completed") {
      throw new ApiError(STATUS.badRequest, "Invalid Operation");
    }
    if (!booking) throw new ApiError(STATUS.notFound, "Booking not found");
    const otp = await storeOTP(bookingId);
    // @ts-ignore
    sendEmail(booking.userId.email, "Otp Verification", otp);
    console.log(`OTP for ${bookingId}: ${otp}`);

    res
      .status(STATUS.ok)
      .json(new ApiResponse(STATUS.ok, "Otp Sent SuccessFully To user"));
  }
);

export const CompleteBooking = asyncHandler(
  async (req: Request, res: Response) => {
    const { bookingId, otp } = req.body;

    const booking = await Booking.findById(bookingId).populate("userId");
    if (!booking) throw new ApiError(STATUS.notFound, "Booking not found");
    const storedOtp = await verifyOTP(bookingId, otp);

    if (!storedOtp) {
      res.status(401).json(new ApiError(401, "Invalid or expired OTP"));
      return;
    }

    if (storedOtp) {
      booking.paymentStatus = "captured";
      booking.orderStatus = "completed";
      sendEmail(
        // @ts-ignore
        booking.userId.email,
        "Your Booking Has Completed Please share the feedBack on services",
        otp
      );
      await booking.save();
    }

    res
      .status(STATUS.ok)
      .json(new ApiResponse(STATUS.ok, booking, "Booking status updated"));
  }
);

export const getProviderOrderStats = asyncHandler(
  async (req: Request, res: Response) => {
    // @ts-ignore
    const providerId = req.user?._id; // Make sure `req.user` is populated via auth middleware

    if (!mongoose.Types.ObjectId.isValid(providerId)) {
      throw new ApiError(STATUS.badRequest, "Invalid provider ID");
    }

    // Step 1: Get all bookings where the service's providerId = current user's _id
    const bookings = await Booking.find().populate({
      path: "serviceId",
      select: "title providerId",
      match: { providerId: providerId }, // filter at population level
    });

    // Step 2: Filter out nulls where serviceId was not matched
    const filteredBookings = bookings.filter((b) => b.serviceId !== null);

    const totalOrders = filteredBookings.length;
    const completedOrders = filteredBookings.filter(
      (b) => b.orderStatus === "completed"
    );
    const pendingOrders = filteredBookings.filter(
      (b) => b.orderStatus === "pending"
    );

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
      .status(STATUS.ok)
      .json(
        new ApiResponse(STATUS.ok, stats, "Order stats fetched for provider")
      );
  }
);
