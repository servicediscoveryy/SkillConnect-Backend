"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const userRecommendedSchema = new mongoose_1.default.Schema({
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    serviceIds: [
        { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Service", required: true },
    ],
}, { timestamps: true });
const userRecommonded = mongoose_1.default.model("UserService", userRecommendedSchema);
exports.default = userRecommonded;
