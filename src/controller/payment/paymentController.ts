import { Request, Response } from "express";
import Payment from "../../models/paymentModel";
import Razorpay from "razorpay";
import { RequestWithUser } from "../../types/RequestWithUser";
import Service from "../../models/serviceModel";
import Booking from "../../models/bookingModel";

const razorpay = new Razorpay({
  key_id: process.env.razorpay_ID, // Replace with your Razorpay Key ID
  key_secret: process.env.razorpaySecret, // Replace with your Razorpay Key Secret
});

// export const createOrder = async (req: RequestWithUser, res: Response) => {
//   const { service } = req.body;
//   const userId = req.user._id;

//   // book the each service for user
//   // then calculate the amount and make the order if the
//   // order is cod no razorpay
//   // if order method is online craete the razorpay order only

//   try {

//     const order = await razorpay.orders.create({
//       amount: 50000 * 100, // Convert to paise
//       currency: "INR",
//       notes: {
//        userId: req.user._id,
//       },
//       payment_capture: true,
//     });

//     if (!order) {
//       res.status(500).json({ message: "Error creating Razorpay order" });
//       return;
//     }

//     res.status(200).json({
//       order,
//       keyId: process.env.razorpay_ID,
//     });
//     return;
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       message: "Error in creating Razorpay order",
//       //   error: error.message,
//     });
//     return;
//   }
// };

export const createOrder = async (req: any, res: Response) => {
  const { service, method } = req.body;
  const userId = req.user._id;
  const addressId = req.body.address; // you should set this before calling this controller

  try {
    const services = await Service.find({ _id: { $in: service } });
    if (!services.length) {
      res.status(400).json({ message: "Invalid service(s)" });
      return;
    }

    const totalAmount = services.reduce((acc, s) => acc + s.price, 0) * 100; // paise

    // Pre-book all services
    const bookings = await Promise.all(
      service.map((serviceId: String) =>
        Booking.create({
          orderId: `INIT-${Date.now()}`, // temporary
          amount: totalAmount / service.length,
          userId,
          addressId,
          serviceId,
          paymentMethod: method,
          orderStatus: "pending",
          paymentStatus: method === "online" ? "created" : "pending",
        })
      )
    );

    const bookingIds = bookings.map((b) => b._id.toString());

    if (method === "online") {
      const order = await razorpay.orders.create({
        amount: totalAmount,
        currency: "INR",
        notes: {
          userId: userId.toString(),
          bookingIds: bookingIds.join(","),
        },
        payment_capture: true,
      });

      // Update bookings with orderId
      await Booking.updateMany(
        { _id: { $in: bookingIds } },
        { $set: { orderId: order.id } }
      );

      res.status(200).json({
        order,
        keyId: process.env.razorpay_ID,
        bookingIds,
      });
      return;
    }

    res.status(200).json({
      message: "Booking created with COD",
      bookings,
    });
    return;
  } catch (error) {
    console.error("❌ Order error:", error);
    res.status(500).json({ message: "Server error in creating order" });
  }
};
