import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    orderId: { type: String },
    amount: { type: Number, required: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["online", "cod"],
    }, // Payment method
    orderStatus: {
      type: String,
      enum: ["pending", "completed", "cancelled"],
      default: "pending", // Reflects the status of the order
    },
    paymentStatus: {
      type: String,
      enum: ["created", "captured", "failed", "pending"],
      default: "pending", // Reflects the payment status
    },
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
