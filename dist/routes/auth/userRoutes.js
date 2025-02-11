"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../../controller/user/userController");
const userRouter = express_1.default.Router();
// @ts-ignore
userRouter.post('/login', userController_1.userLoginController);
//@ts-ignore
userRouter.post('/signup', userController_1.userSignupController);
// @ts-ignore
userRouter.get('/logout', userController_1.userLogoutController);
exports.default = userRouter;
