import express from "express";
import { authuser } from "../../middleware/authMiddleware";
import {
  createBooking,
  getBookingById,
  getProviderBookings,
  getUserBookings,
  updateBookingStatus,
} from "../../controller/booking/bookingController";
import { isServiceProvider } from "../../middleware/providerCheckMiddleware";

const bookingRouter = express.Router();

bookingRouter.post("/", authuser, createBooking);
bookingRouter.get(
  "/provider",
  authuser,
  isServiceProvider,
  getProviderBookings
);
bookingRouter.get("/:bookingId", authuser, getBookingById);
bookingRouter.get("/", authuser, getUserBookings);
bookingRouter.put("/:bookingId", authuser, updateBookingStatus);

export default bookingRouter;
