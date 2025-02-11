import express from 'express';
import { userLoginController, userLogoutController, userSignupController, } from '../../controller/user/userController';


const userRouter = express.Router();

// @ts-ignore
userRouter.post('/login', userLoginController);


//@ts-ignore
userRouter.post('/signup', userSignupController);


// @ts-ignore
userRouter.get('/logout', userLogoutController);




export default userRouter;