import express, { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieparser from "cookie-parser";
import { dbconnect } from "./database/db";
import ApiError from "./utils/response/ApiError";
import STATUS from "./data/statusCodes";

import userRouter from "./routes/auth/userRoutes";
import serviceProviderRouter from "./routes/serviceProvider/serviceProviderRoutes";
import servicesRouter from "./routes/services/serviceRouter";
import bookingRouter from "./routes/booking/bookingRouter";
import addressRouter from "./routes/address/addressRouter";
import cartRouter from "./routes/cart/cartRouter";
import categoryRouter from "./routes/category/categoryRouter";
import { adminRouter } from "./routes/admin";
import recommendationRouter from "./routes/recommendation/recommendationRouter";
import paymentRouter from "./routes/payment/paymentRouter";

dotenv.config();

const app = express();

app.use(cookieparser());
app.use(express.json());

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  })
);

// authentication routes
app.use("/api/v1/auth", userRouter);

//service routes
app.use("/api/v1/services", servicesRouter);

// service-Provider routes
app.use("/api/v1/provider-services", serviceProviderRouter);

// booking routes
app.use("/api/v1/booking", bookingRouter);

//address routes
app.use("/api/v1/address", addressRouter);

//cart routes
app.use("/api/v1/cart", cartRouter);

// category Routes
app.use("/api/v1/category", categoryRouter);

// admin routes
app.use("/api/v1/admin", adminRouter);

// recommendation
app.use("/api/v1/recommend", recommendationRouter);

//payment
app.use("/api/v1/payment", paymentRouter);

app.get("/", (req, res) => {
  res.send("SERVER IS WORKING");
});

// Error handling middleware
app.use(
  // @ts-ignore
  (err: ApiError | any, req: Request, res: Response, next: NextFunction) => {
    console.log(err);
    if (err instanceof ApiError) {
      return res.status(err.statusCode).json({
        status: err.statusCode,
        message: err.message,
        errors: err.errors,
        success: false,
      });
    }

    // Default error handling if it's not an instance of ApiError
    return res.status(STATUS.internalServerError).json({
      status: err.statusCode,
      message: "Something went wrong. Please try again later.",
    });
  }
);

// dbconfig
const PORT = process.env.PORT || 3001;
dbconnect()
  .then(() => {
    console.log("db connected");
    app.listen(PORT, () => {
      console.log("server is running on port " + PORT);
    });
  })
  .catch((err) => {
    console.log(err.message);
  });
