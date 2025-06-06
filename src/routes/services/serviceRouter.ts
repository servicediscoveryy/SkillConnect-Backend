import express from "express";
import {
  getCategroyWiseServices,
  getSearchSuggestions,
  getServiceById,
  getServices,
  getTopServices,
} from "../../controller/services/servicesController";
import { getRecommendedByUser } from "../../controller/recommendation/recommendationController";

const servicesRouter = express.Router();

servicesRouter.get("/", getServices);

servicesRouter.get("/top", getTopServices);

servicesRouter.get("/categroy-wise-services", getCategroyWiseServices);

servicesRouter.get("/search-suggestion", getSearchSuggestions);

servicesRouter.get("/recommended", getRecommendedByUser); 
servicesRouter.get("/:serviceId", getServiceById);

export default servicesRouter;
