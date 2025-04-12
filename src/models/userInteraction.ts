import mongoose from "mongoose";

const UserInteractionSchema = new mongoose.Schema(
  {
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
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    actionType: {
      type: String,
      enum: ["view", "book", "cart", "review", "search"],
      required: true,
    },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const UserInteraction = mongoose.model(
  "UserInteraction",
  UserInteractionSchema
);
export default UserInteraction;
