import express from 'express';
import { getProfileController } from '../../controller/profile/profileController';
import { authuser } from '../../middleware/authMiddleware';

const profileRouter = express.Router();


// @ts-ignore
profileRouter.get('/user/profile', authuser, getProfileController);






export default profileRouter;