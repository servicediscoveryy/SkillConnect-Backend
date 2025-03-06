"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../../controller/auth/authController");
const authMiddleware_1 = require("../../middleware/authMiddleware");
const userRouter = express_1.default.Router();
userRouter.post("/login", authController_1.userLoginController);
userRouter.post("/signup", authController_1.userSignupController);
userRouter.post("/provider-signup", authController_1.providerSignupController);
userRouter.get("/logout", authController_1.userLogoutController);
userRouter.get("/profile", authMiddleware_1.authuser, authController_1.getProfileController);
exports.default = userRouter;
