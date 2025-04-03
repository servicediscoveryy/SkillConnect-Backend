"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const serviceProviderController_1 = require("../../controller/serviceProvider/serviceProviderController");
const authMiddleware_1 = require("../../middleware/authMiddleware");
const providerCheckMiddleware_1 = require("../../middleware/providerCheckMiddleware");
const serviceProviderRouter = express_1.default.Router();
serviceProviderRouter.get("/users", authMiddleware_1.authuser, serviceProviderController_1.getUsersForProviderBookings);
// Fetch all services
serviceProviderRouter.get("/", authMiddleware_1.authuser, providerCheckMiddleware_1.isServiceProvider, serviceProviderController_1.getProviderServices);
serviceProviderRouter.get("/:id", authMiddleware_1.authuser, providerCheckMiddleware_1.isServiceProvider, serviceProviderController_1.getProviderServiceById);
// Create a new service
serviceProviderRouter.post("/", authMiddleware_1.authuser, providerCheckMiddleware_1.isServiceProvider, serviceProviderController_1.createService);
// Update a service
serviceProviderRouter.patch("/:serviceId", authMiddleware_1.authuser, providerCheckMiddleware_1.isServiceProvider, serviceProviderController_1.updateService);
serviceProviderRouter.delete("/:serviceId", authMiddleware_1.authuser, providerCheckMiddleware_1.isServiceProvider, serviceProviderController_1.deleteService);
// Rate a service
serviceProviderRouter.post("/rating/:serviceId", authMiddleware_1.authuser, serviceProviderController_1.rateService);
exports.default = serviceProviderRouter;
