import express from "express";
import {
  getProfileController,
  providerSignupController,
  sendOtpController,
  storeSignUpController,
  userLogoutController,
  userSignupController,
  verifyOtpController,
} from "../../controller/auth/authController";
import { authuser } from "../../middleware/authMiddleware";

const userRouter = express.Router();

userRouter.post("/login", sendOtpController);

userRouter.post("/verify", verifyOtpController);

userRouter.post("/signup", userSignupController);

userRouter.post("/store-user", storeSignUpController);

userRouter.post("/provider-signup", providerSignupController);

userRouter.get("/logout", userLogoutController);

userRouter.get("/profile", authuser, getProfileController);

export default userRouter;
