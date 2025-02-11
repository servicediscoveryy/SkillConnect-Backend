"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const ratingSchema = new mongoose_1.default.Schema({
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    serviceId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Service', required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    description: { type: String }
}, { timestamps: true });
const Rating = mongoose_1.default.model('Rating', ratingSchema);
exports.default = Rating;
