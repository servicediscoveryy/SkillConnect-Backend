import express from "express";
import { authuser } from "../../middleware/authMiddleware";
import {
  CompleteBooking,
  createBooking,
  GenerateOtpBookingComplete,
  getBookingById,
  getProviderBookings,
  getUserBookings,
  updateBookingStatus,
} from "../../controller/booking/bookingController";
import { isServiceProvider } from "../../middleware/providerCheckMiddleware";

const bookingRouter = express.Router();

bookingRouter.put("/:bookingId", authuser, updateBookingStatus);
bookingRouter.post("/", authuser, createBooking);
bookingRouter.get(
  "/provider",
  authuser,
  isServiceProvider,
  getProviderBookings
);
bookingRouter.get("/:bookingId", authuser, getBookingById);
bookingRouter.get("/", authuser, getUserBookings);

bookingRouter.post("/booking-otp", GenerateOtpBookingComplete);
bookingRouter.post("/booking-otp/verify", CompleteBooking);

export default bookingRouter;
