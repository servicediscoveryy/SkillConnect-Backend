"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const serviceController_1 = require("../../controller/service/serviceController");
const authMiddleware_1 = require("../../middleware/authMiddleware");
const adminMiddleware_1 = require("../../middleware/adminMiddleware");
const serviceRouter = express_1.default.Router();
// @ts-ignore
serviceRouter.get('/', authMiddleware_1.authuser, adminMiddleware_1.isServiceProvider, serviceController_1.getAllServices);
// @ts-ignore
serviceRouter.post('/', authMiddleware_1.authuser, adminMiddleware_1.isServiceProvider, serviceController_1.createService);
// @ts-ignore
serviceRouter.post('/update', authMiddleware_1.authuser, adminMiddleware_1.isServiceProvider, serviceController_1.updateService);
// @ts-ignore
serviceRouter.get('/:serviceId', authMiddleware_1.authuser, adminMiddleware_1.isServiceProvider, serviceController_1.getServiceById);
exports.default = serviceRouter;
