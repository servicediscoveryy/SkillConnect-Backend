"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const paymentController_1 = require("../../controller/payment/paymentController");
const authMiddleware_1 = require("../../middleware/authMiddleware");
const paymentRouter = express_1.default.Router();
paymentRouter.post("/check", authMiddleware_1.authuser, paymentController_1.createOrder);
exports.default = paymentRouter;
