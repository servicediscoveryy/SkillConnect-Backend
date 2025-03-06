import express from "express";
import {
  createService,
  deleteService,
  getProviderServices,
  rateService,
  updateService,
} from "../../controller/serviceProvider/serviceProviderController";
import { authuser } from "../../middleware/authMiddleware";
import { isServiceProvider } from "../../middleware/providerCheckMiddleware";

const serviceProviderRouter = express.Router();

// Fetch all services
serviceProviderRouter.get(
  "/",
  authuser,
  isServiceProvider,
  getProviderServices
);

// Create a new service
serviceProviderRouter.post("/", authuser, isServiceProvider, createService);

// Update a service
serviceProviderRouter.patch(
  "/:serviceId",
  authuser,
  isServiceProvider,
  updateService
);

serviceProviderRouter.delete(
  "/serviceId",
  authuser,
  isServiceProvider,
  deleteService
);

// Rate a service
serviceProviderRouter.post("/rating/:serviceId", authuser, rateService);

export default serviceProviderRouter;
