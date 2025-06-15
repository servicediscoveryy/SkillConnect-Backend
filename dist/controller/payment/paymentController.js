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
exports.createOrder = void 0;
const razorpay_1 = __importDefault(require("razorpay"));
const serviceModel_1 = __importDefault(require("../../models/serviceModel"));
const bookingModel_1 = __importDefault(require("../../models/bookingModel"));
const razorpay = new razorpay_1.default({
    key_id: process.env.razorpay_ID,
    key_secret: process.env.razorpaySecret, // Replace with your Razorpay Key Secret
});
// export const createOrder = async (req: RequestWithUser, res: Response) => {
//   const { service } = req.body;
//   const userId = req.user._id;
//   // book the each service for user
//   // then calculate the amount and make the order if the
//   // order is cod no razorpay
//   // if order method is online craete the razorpay order only
//   try {
//     const order = await razorpay.orders.create({
//       amount: 50000 * 100, // Convert to paise
//       currency: "INR",
//       notes: {
//        userId: req.user._id,
//       },
//       payment_capture: true,
//     });
//     if (!order) {
//       res.status(500).json({ message: "Error creating Razorpay order" });
//       return;
//     }
//     res.status(200).json({
//       order,
//       keyId: process.env.razorpay_ID,
//     });
//     return;
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       message: "Error in creating Razorpay order",
//       //   error: error.message,
//     });
//     return;
//   }
// };
const createOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { service, method } = req.body;
    const userId = req.user._id;
    const addressId = req.body.address; // you should set this before calling this controller
    try {
        const services = yield serviceModel_1.default.find({ _id: { $in: service } });
        if (!services.length) {
            res.status(400).json({ message: "Invalid service(s)" });
            return;
        }
        const totalAmount = services.reduce((acc, s) => acc + s.price, 0) * 100; // paise
        // Pre-book all services
        const bookings = yield Promise.all(service.map((serviceId) => bookingModel_1.default.create({
            orderId: `INIT-${Date.now()}`,
            amount: totalAmount / service.length,
            userId,
            addressId,
            serviceId,
            paymentMethod: method,
            orderStatus: "pending",
            paymentStatus: method === "online" ? "created" : "pending",
        })));
        const bookingIds = bookings.map((b) => b._id.toString());
        if (method === "online") {
            const order = yield razorpay.orders.create({
                amount: totalAmount,
                currency: "INR",
                notes: {
                    userId: userId.toString(),
                    bookingIds: bookingIds.join(","),
                },
                payment_capture: true,
            });
            // Update bookings with orderId
            yield bookingModel_1.default.updateMany({ _id: { $in: bookingIds } }, { $set: { orderId: order.id } });
            res.status(200).json({
                order,
                keyId: process.env.razorpay_ID,
                bookingIds,
            });
            return;
        }
        res.status(200).json({
            message: "Booking created with COD",
            bookings,
        });
        return;
    }
    catch (error) {
        console.error("❌ Order error:", error);
        res.status(500).json({ message: "Server error in creating order" });
    }
});
exports.createOrder = createOrder;
