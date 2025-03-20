import express from "express";
import {
  getCategroyWiseServices,
  getServiceById,
  getServices,
  getTopServices,
} from "../../controller/services/servicesController";

const servicesRouter = express.Router();

servicesRouter.get("/", getServices);

servicesRouter.get("/top", getTopServices);

servicesRouter.get("/categroy-wise-services", getCategroyWiseServices);

servicesRouter.get("/:serviceId", getServiceById);

export default servicesRouter;
