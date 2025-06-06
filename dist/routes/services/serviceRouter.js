"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const servicesController_1 = require("../../controller/services/servicesController");
const servicesRouter = express_1.default.Router();
servicesRouter.get("/", servicesController_1.getServices);
servicesRouter.get("/top", servicesController_1.getTopServices);
servicesRouter.get("/categroy-wise-services", servicesController_1.getCategroyWiseServices);
servicesRouter.get("/search-suggestion", servicesController_1.getSearchSuggestions);
servicesRouter.get("/:serviceId", servicesController_1.getServiceById);
exports.default = servicesRouter;
