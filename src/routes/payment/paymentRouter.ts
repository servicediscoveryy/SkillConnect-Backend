import express from "express";
import { createOrder } from "../../controller/payment/paymentController";
import { authuser } from "../../middleware/authMiddleware";

const paymentRouter = express.Router();

paymentRouter.post("/check", authuser, createOrder);

export default paymentRouter;
