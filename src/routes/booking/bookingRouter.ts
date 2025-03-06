import express from "express";
import { authuser } from "../../middleware/authMiddleware";
import {
  createBooking,
  getBookingById,
  getUserBookings,
  updateBookingStatus,
} from "../../controller/booking/bookingController";

const bookingRouter = express.Router();

bookingRouter.post("/", authuser, createBooking);
bookingRouter.get("/:bookingId", authuser, getBookingById);
bookingRouter.get("/", authuser, getUserBookings);
bookingRouter.put("/:bookingId", authuser, updateBookingStatus);

export default bookingRouter;
