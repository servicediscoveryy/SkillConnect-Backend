import express from "express";
import {
  addToCart,
  getAllCart,
  getCartCount,
  removeCartItem,
} from "../../controller/cart/cartController";
import { authuser } from "../../middleware/authMiddleware";

const cartRouter = express.Router();

cartRouter.post("/", authuser, addToCart);

cartRouter.get("/", authuser, getAllCart);

cartRouter.get("/count", authuser, getCartCount);

cartRouter.patch("/", authuser, removeCartItem);

export default cartRouter;
