"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const addressSchema = new mongoose_1.default.Schema({
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    street: {
        type: String,
        required: true,
        set: (value) => value.toLowerCase(),
    },
    area: {
        type: String,
        set: (value) => value.toLowerCase(),
    },
    city: {
        type: String,
        required: true,
        set: (value) => value.toLowerCase(),
    },
    state: {
        type: String,
        required: true,
        set: (value) => value.toLowerCase(),
    },
    country: {
        type: String,
        required: true,
        set: (value) => value.toLowerCase(),
    },
    pincode: {
        type: String,
        required: true, // Keep as string to support leading zeros
    },
    landmark: {
        type: String,
        set: (value) => value.toLowerCase(),
    },
}, { timestamps: true });
const Address = mongoose_1.default.model("Address", addressSchema);
exports.default = Address;
