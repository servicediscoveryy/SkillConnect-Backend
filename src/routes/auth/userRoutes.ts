import express from "express";
import {
  getProfileController,
  providerSignupController,
  userLoginController,
  userLogoutController,
  userSignupController,
} from "../../controller/auth/authController";
import { authuser } from "../../middleware/authMiddleware";

const userRouter = express.Router();

userRouter.post("/login", userLoginController);

userRouter.post("/signup", userSignupController);

userRouter.post("/provider-signup", providerSignupController);

userRouter.get("/logout", userLogoutController);

userRouter.get("/profile", authuser, getProfileController);

export default userRouter;
