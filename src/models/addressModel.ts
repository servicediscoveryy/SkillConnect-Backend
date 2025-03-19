import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    street: {
      type: String,
      required: true,
      set: (value: string) => value.toLowerCase(),
    },
    area: {
      type: String,
      set: (value: string) => value.toLowerCase(),
    },
    city: {
      type: String,
      required: true,
      set: (value: string) => value.toLowerCase(),
    },
    state: {
      type: String,
      required: true,
      set: (value: string) => value.toLowerCase(),
    },
    country: {
      type: String,
      required: true,
      set: (value: string) => value.toLowerCase(),
    },
    pincode: {
      type: String,
      required: true, // Keep as string to support leading zeros
    },
    landmark: {
      type: String,
      set: (value: string) => value.toLowerCase(),
    },
  },
  { timestamps: true }
);

const Address = mongoose.model("Address", addressSchema);

export default Address;
