"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const recommendationController_1 = require("../../controller/recommendation/recommendationController");
const authMiddleware_1 = require("../../middleware/authMiddleware");
const recommendationRouter = express_1.default.Router();
recommendationRouter.patch("/view/:serviceId", recommendationController_1.viewService);
recommendationRouter.post("/record", authMiddleware_1.authuser, recommendationController_1.recordInteraction);
recommendationRouter.get("/recommended", authMiddleware_1.authuser, recommendationController_1.getRecommendedByUser);
recommendationRouter.get("/related/:service", recommendationController_1.getRelatedRecommendation);
recommendationRouter.get("/near-services", recommendationController_1.getNearbyServices);
exports.default = recommendationRouter;
