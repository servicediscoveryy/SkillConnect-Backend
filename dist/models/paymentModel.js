"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const paymentSchema = new mongoose_1.default.Schema({
    paymentId: { type: mongoose_1.default.Schema.Types.ObjectId, required: true },
    orderId: { type: String, required: true },
    amount: { type: Number, required: true },
    bookingId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Booking', required: true },
    status: { type: String, enum: ['created', 'captured', 'failed'], default: 'created' }
}, { timestamps: true });
const Payment = mongoose_1.default.model('Payment', paymentSchema);
exports.default = Payment;
