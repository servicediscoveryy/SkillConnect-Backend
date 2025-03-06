import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true }, // The Razorpay order ID
    paymentId: { type: String, required: true, unique: true }, // Razorpay payment ID for tracking payment status
    amount: { type: Number, required: true }, // Payment amount
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    }, // Reference to the booking
    status: {
      type: String,
      enum: ["created", "captured", "failed"],
      default: "created",
    }, // Payment status
  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
