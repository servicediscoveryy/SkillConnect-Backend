import mongoose from "mongoose";

const CartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // 🔹 Ensures one cart per user
    },
    items: {
      type: [
        {
          serviceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Service",
            required: true,
          },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

const Cart = mongoose.model("Cart", CartSchema);
export default Cart;
