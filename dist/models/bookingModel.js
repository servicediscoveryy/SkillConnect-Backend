"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const bookingSchema = new mongoose_1.default.Schema({
    orderId: { type: String },
    amount: { type: Number, required: true },
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    serviceId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
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
}, { timestamps: true });
const Booking = mongoose_1.default.model("Booking", bookingSchema);
exports.default = Booking;
