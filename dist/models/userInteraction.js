"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const UserInteractionSchema = new mongoose_1.default.Schema({
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
    categoryId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
    },
    actionType: {
        type: String,
        enum: ["view", "book", "cart", "review", "search"],
        required: true,
    },
    timestamp: { type: Date, default: Date.now },
}, { timestamps: true });
const UserInteraction = mongoose_1.default.model("UserInteraction", UserInteractionSchema);
exports.default = UserInteraction;
