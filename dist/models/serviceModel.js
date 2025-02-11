"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const serviceSchema = new mongoose_1.default.Schema({
    providerId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    image: { type: String },
    price: { type: Number, required: true },
    status: { type: String, enum: ['active', 'inactive'], required: true },
    view: { type: Number, default: 0 },
    tags: { type: [String] }
}, { timestamps: true });
const Service = mongoose_1.default.model('Service', serviceSchema);
exports.default = Service;
