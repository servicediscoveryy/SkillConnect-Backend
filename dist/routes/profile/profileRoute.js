"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const profileController_1 = require("../../controller/profile/profileController");
const authMiddleware_1 = require("../../middleware/authMiddleware");
const profileRouter = express_1.default.Router();
// @ts-ignore
profileRouter.get("/user/profile", authMiddleware_1.authuser, profileController_1.getProfileController);
exports.default = profileRouter;
