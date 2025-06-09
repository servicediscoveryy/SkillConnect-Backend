import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      set: (value: string | undefined) => (value ? value.toLowerCase() : ""),
    },
    description: {
      type: String,
      required: true,
      set: (value: string | undefined) => (value ? value.toLowerCase() : ""),
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    image: { type: [String], default: [] },
    price: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      required: true,
    },
    views: { type: Number, default: 0, min: 0 },
    location: {
      type: String,
      required: true,
      set: (value: string | undefined) => (value ? value.toLowerCase() : ""),
    },
    geoLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    tags: {
      type: [String],
      set: (tags: string[] | undefined) =>
        tags ? tags.map((tag) => tag.toLowerCase()) : [],
    },
  },
  { timestamps: true }
);

const Service = mongoose.model("Service", serviceSchema);
export default Service;
