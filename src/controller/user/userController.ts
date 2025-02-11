import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from "../../models/userModel"; // Assuming the User model is in models/User

// Login controller
export const userLoginController = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        // Validate the request body
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required", error: true , success: false});
        }

        // Check for user in the database
        const user = await User.findOne({ email });

        // User not found then throw error
        if (!user) {
            return res.status(404).json({ message: "User does not exist", error: true, success: false });
        }

        // Ensure user's password exists
        if (!user.password) {
            throw new Error("User's password not found in the database");
        }

        // Check if the password matches the hash
        // @ts-ignore
        const isPasswordValid = await user.comparePassword(password); // Assuming comparePassword method is defined in your User model

        // If password does not match, throw error
        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid Credentials",
                error: true,
                success: false,
            });
        }

        // Generate the token for the user
        const payload = {
            userId: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            role: user.role,
        };

        const jwtToken = jwt.sign({ user: payload }, process.env.JWT_SECRET as string, {
            expiresIn: "1d", // Token will expire in 1 day
        });

        // Cookie options
        const CookiesOption = {
            maxAge: 24 * 60 * 60 * 1000, // Token valid for 1 day
            sameSite: "None", // Ensures cookies are sent with cross-site requests
            secure: true, // Cookie is only sent over HTTPS
            httpOnly: true, // Cookie cannot be accessed via JavaScript
        };

        // Send JWT token as a cookie and include user data and token in the response 
        // @ts-ignore
        res.cookie("token", jwtToken, CookiesOption).status(200).json({
            message: "Login successful",
            user: payload, // User data to return
            token: jwtToken, // Return the JWT token
            error: false,
            success: true,
        });
    } catch (error: any) {
        console.error("Error:", error.message);
        res.status(500).json({
            error: true,
            success: false,
            message: error.message,
        });
    }
};


export const userSignupController = async (req: Request, res: Response) => {
    try {
        // Validate the signup input
        // ValidatesignupInput(req);

        const { firstName, lastName, phone, email, password } = req.body;

        // Check if email or phone already exists
        const existingUser = await User.findOne({
            $or: [{ email }, { phone }],
        });

        // Prepare error messages based on existing fields
        const errors = [];
        if (existingUser) {
            if (existingUser.email === email) {
                errors.push("Email already registered");
            }
            if (existingUser.phone === phone) {
                errors.push("Phone number already registered");
            }
        }

        // If any errors exist, return them
        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: errors.join(", "),
                error: true,
            });
        }

        // Create a new user instance with the hashed password
        const user = new User({
            firstName,
            lastName,
            phone,
            email,
            password,
        });

        // Save the new user to the database
        const newUser = await user.save();

        // Generate the JWT token for the new user
        const payload = {
            userId: newUser._id,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            email: newUser.email,
            phone: newUser.phone,
            role: newUser.role,
        };

        const jwtToken = jwt.sign({ user: payload }, process.env.JWT_SECRET as string, {
            expiresIn: "1d",
        });

        // Cookie options for storing JWT token
        const CookiesOption = {
            maxAge: 24 * 60 * 60 * 1000, // Token valid for 1 day
            sameSite: "None",
            secure: true,
            httpOnly: true,
        };

        // Set cookie with the JWT token and respond with success
        // @ts-ignore
        res.cookie("token", jwtToken, CookiesOption).status(200).json({
            message: "Signup successful",
            user: payload, // Return the user data
            token: jwtToken, // Return the token
            error: false,
            success: true,
        });

    } catch (error: any) {
        // Handle any errors
        res.status(500).json({
            message: error.message,
            error: true,
            success: false,
        });
    }
};


export const userLogoutController = (req: Request, res: Response) => {
    try {
        res.cookie("token", null, {
            expires: new Date(Date.now()),
        })
            .json({ message: "logout successfull", error: false, success: true });
    } catch (error: any) {
        res.status(404).json({ message: error.message, error: true, success: false });
    }
};