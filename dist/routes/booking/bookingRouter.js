"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../../middleware/authMiddleware");
const bookingController_1 = require("../../controller/booking/bookingController");
const providerCheckMiddleware_1 = require("../../middleware/providerCheckMiddleware");
const bookingRouter = express_1.default.Router();
bookingRouter.post("/", authMiddleware_1.authuser, bookingController_1.createBooking);
bookingRouter.get("/provider", authMiddleware_1.authuser, providerCheckMiddleware_1.isServiceProvider, bookingController_1.getProviderBookings);
bookingRouter.get("/:bookingId", authMiddleware_1.authuser, bookingController_1.getBookingById);
bookingRouter.get("/", authMiddleware_1.authuser, bookingController_1.getUserBookings);
bookingRouter.put("/:bookingId", authMiddleware_1.authuser, bookingController_1.updateBookingStatus);
exports.default = bookingRouter;
