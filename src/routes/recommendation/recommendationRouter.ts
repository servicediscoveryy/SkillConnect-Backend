import express from "express";
import {
  getRecommendedByUser,
  getRelatedRecommendation,
  recordInteraction,
  viewService,
} from "../../controller/recommendation/recommendationController";
import { authuser } from "../../middleware/authMiddleware";

const recommendationRouter = express.Router();

recommendationRouter.patch("/view/:serviceId", viewService);

recommendationRouter.post("/record", authuser, recordInteraction);

recommendationRouter.get("/recommended", authuser, getRecommendedByUser);

recommendationRouter.get("/related/:service", getRelatedRecommendation);

export default recommendationRouter;
