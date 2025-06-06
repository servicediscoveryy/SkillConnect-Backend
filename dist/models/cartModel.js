"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const CartSchema = new mongoose_1.default.Schema({
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true, // 🔹 Ensures one cart per user
    },
    items: {
        type: [
            {
                serviceId: {
                    type: mongoose_1.default.Schema.Types.ObjectId,
                    ref: "Service",
                    required: true,
                },
            },
        ],
        default: [],
    },
}, { timestamps: true });
const Cart = mongoose_1.default.model("Cart", CartSchema);
exports.default = Cart;
