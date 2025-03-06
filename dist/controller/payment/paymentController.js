"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processPayment = void 0;
const paymentModel_1 = __importDefault(require("../../models/paymentModel"));
// @ts-ignore
const processPayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // @ts-ignore
        const { bookingId, paymentId, amount } = req.body;
        // @ts-ignore
        const payment = new paymentModel_1.default({
            paymentId,
            bookingId,
            amount,
            status: 'captured'
        });
        const savedPayment = yield payment.save();
        // @ts-ignore
        res.status(201).json({ message: "Payment processed", data: savedPayment, success: true, error: false });
    }
    catch (error) {
        // @ts-ignore
        res.status(500).json({ message: error.message, error: true, success: false });
    }
});
exports.processPayment = processPayment;
