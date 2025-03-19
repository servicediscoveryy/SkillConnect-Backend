import express from "express";
import {
  createCategory,
  deleteCategory,
  getCategories,
} from "../../controller/category/CategoryController";
import { authuser } from "../../middleware/authMiddleware";
import { isAdminCheck } from "../../middleware/adminCheckMiddleware";

const categoryRouter = express.Router();

categoryRouter.get("/", getCategories);
categoryRouter.post("/", authuser, isAdminCheck, createCategory);
categoryRouter.delete("/:categoryId", authuser, isAdminCheck, deleteCategory);

export default categoryRouter;
