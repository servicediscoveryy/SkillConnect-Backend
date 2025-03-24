"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRouter = void 0;
const express_1 = __importDefault(require("express"));
const adminCheckMiddleware_1 = require("../../middleware/adminCheckMiddleware");
const helperController_1 = require("../../controller/helper/helperController");
const authMiddleware_1 = require("../../middleware/authMiddleware");
const adminRouter = express_1.default.Router();
exports.adminRouter = adminRouter;
adminRouter.delete("/clear-database", authMiddleware_1.authuser, adminCheckMiddleware_1.isAdminCheck, helperController_1.clearDatabase);
