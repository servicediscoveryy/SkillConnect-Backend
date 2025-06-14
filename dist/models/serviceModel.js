"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const serviceSchema = new mongoose_1.default.Schema({
    providerId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    title: {
        type: String,
        required: true,
        set: (value) => (value ? value.toLowerCase() : ""),
    },
    description: {
        type: String,
        required: true,
        set: (value) => (value ? value.toLowerCase() : ""),
    },
    category: {
        type: mongoose_1.default.Schema.Types.ObjectId,
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
        set: (value) => (value ? value.toLowerCase() : ""),
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
        set: (tags) => tags ? tags.map((tag) => tag.toLowerCase()) : [],
    },
}, { timestamps: true });
// Add the 2dsphere index required for geospatial queries
serviceSchema.index({ geoLocation: "2dsphere" });
const Service = mongoose_1.default.model("Service", serviceSchema);
exports.default = Service;
