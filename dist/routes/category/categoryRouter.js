"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const CategoryController_1 = require("../../controller/category/CategoryController");
const authMiddleware_1 = require("../../middleware/authMiddleware");
const adminCheckMiddleware_1 = require("../../middleware/adminCheckMiddleware");
const categoryRouter = express_1.default.Router();
categoryRouter.get("/", CategoryController_1.getCategories);
categoryRouter.post("/", authMiddleware_1.authuser, adminCheckMiddleware_1.isAdminCheck, CategoryController_1.createCategory);
categoryRouter.delete("/:categoryId", authMiddleware_1.authuser, adminCheckMiddleware_1.isAdminCheck, CategoryController_1.deleteCategory);
exports.default = categoryRouter;
