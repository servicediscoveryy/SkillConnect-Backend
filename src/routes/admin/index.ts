import express from "express";
import { isAdminCheck } from "../../middleware/adminCheckMiddleware";
import { clearDatabase } from "../../controller/helper/helperController";
import { authuser } from "../../middleware/authMiddleware";

const adminRouter = express.Router();

adminRouter.delete("/clear-database", authuser, isAdminCheck, clearDatabase);

export { adminRouter };
