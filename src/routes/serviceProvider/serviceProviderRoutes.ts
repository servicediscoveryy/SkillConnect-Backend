import express from "express";
import {
  createService,
  deleteService,
  getProviderServiceById,
  getProviderServices,
  getUsersForProviderBookings,
  rateService,
  updateService,
} from "../../controller/serviceProvider/serviceProviderController";
import { authuser } from "../../middleware/authMiddleware";
import { isServiceProvider } from "../../middleware/providerCheckMiddleware";

const serviceProviderRouter = express.Router();

serviceProviderRouter.get("/users",authuser,getUsersForProviderBookings)
// Fetch all services
serviceProviderRouter.get(
  "/",
  authuser,
  isServiceProvider,
  getProviderServices
);
serviceProviderRouter.get(
  "/:id",
  authuser,
  isServiceProvider,
  getProviderServiceById
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
  "/:serviceId",
  authuser,
  isServiceProvider,
  deleteService
);


// Rate a service
serviceProviderRouter.post("/rating/:serviceId", authuser, rateService);

export default serviceProviderRouter;
