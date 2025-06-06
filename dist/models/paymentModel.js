"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const paymentSchema = new mongoose_1.default.Schema({
    orderId: { type: String, required: true },
    paymentId: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    bookingId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Booking",
        required: true,
    },
    status: {
        type: String,
        enum: ["created", "captured", "failed"],
        default: "created",
    }, // Payment status
}, { timestamps: true });
const Payment = mongoose_1.default.model("Payment", paymentSchema);
exports.default = Payment;
