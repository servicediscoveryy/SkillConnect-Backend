import User from "../models/userModel"; // Ensure you are importing the User model
import jwt from 'jsonwebtoken';

import { Request, Response, NextFunction } from 'express';

export const authuser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Get token from cookie or authorization header
        let token = req?.cookies?.token || req?.headers["authorization"]?.split(" ")[1];
        console.log(token)
        console.log(req.cookies)
        if (!token) {
            return res.status(401).json({ message: "Please Login" });
        }

        // Verify the token
        const decodedObj = jwt.verify(token, process.env.JWT_SECRET as string);

        // If the token is invalid or cannot be decoded
        if (!decodedObj) {
            return res.status(401).json({ message: "Invalid token" });
        }

        // Extract userId from the decoded token
        // @ts-ignore
        const { userId } = decodedObj.user;

        // Find user by userId and exclude password field from the result
        const user = await User.findById(userId).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Attach the user to the request object for further processing in the next middleware or route handler
        // @ts-ignore
        req.user = user;
        next();
    } catch (error: any) {
        console.error(error);
        res.status(400).json({ message: "ERROR: " + error.message });
    }
};



