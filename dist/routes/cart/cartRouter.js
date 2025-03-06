"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cartController_1 = require("../../controller/cart/cartController");
const authMiddleware_1 = require("../../middleware/authMiddleware");
const cartRouter = express_1.default.Router();
cartRouter.post("/", authMiddleware_1.authuser, cartController_1.addToCart);
cartRouter.get("/", authMiddleware_1.authuser, cartController_1.getAllCart);
cartRouter.get("/count", authMiddleware_1.authuser, cartController_1.getCartCount);
cartRouter.patch("/", authMiddleware_1.authuser, cartController_1.removeCartItem);
exports.default = cartRouter;
