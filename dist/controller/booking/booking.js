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
exports.getUserBookings = exports.bookService = void 0;
const bookingModel_1 = __importDefault(require("../../models/bookingModel"));
const bookService = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // @ts-ignore
        const { serviceId, amount } = req.body;
        // @ts-ignore
        const userId = req.user._id;
        // @ts-ignore
        const newBooking = new bookingModel_1.default({
            userId,
            serviceId,
            amount,
            status: 'pending',
            orderId: `ORD-${Date.now()}`
        });
        const savedBooking = yield newBooking.save();
        // @ts-ignore
        res.status(201).json({ message: "Service booked", data: savedBooking, success: true, error: false });
    }
    catch (error) {
        // @ts-ignore
        res.status(500).json({ message: error.message, error: true, success: false });
    }
});
exports.bookService = bookService;
const getUserBookings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // @ts-ignore
        const bookings = yield bookingModel_1.default.find({ userId: req.user._id }).populate('serviceId');
        // @ts-ignore
        res.status(200).json({ data: bookings, success: true, error: false });
    }
    catch (error) {
        // @ts-ignore
        res.status(500).json({ message: error.message, error: true, success: false });
    }
});
exports.getUserBookings = getUserBookings;
