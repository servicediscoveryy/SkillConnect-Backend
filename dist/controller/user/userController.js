"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userLogoutController = exports.userSignupController = exports.userLoginController = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userModel_1 = __importDefault(require("../../models/userModel")); // Assuming the User model is in models/User
// Login controller
const userLoginController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        // Validate the request body
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required", error: true, success: false });
        }
        // Check for user in the database
        const user = yield userModel_1.default.findOne({ email });
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
        const isPasswordValid = yield user.comparePassword(password); // Assuming comparePassword method is defined in your User model
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
        const jwtToken = jsonwebtoken_1.default.sign({ user: payload }, process.env.JWT_SECRET, {
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
    }
    catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({
            error: true,
            success: false,
            message: error.message,
        });
    }
});
exports.userLoginController = userLoginController;
const userSignupController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Validate the signup input
        // ValidatesignupInput(req);
        const { firstName, lastName, phone, email, password } = req.body;
        // Check if email or phone already exists
        const existingUser = yield userModel_1.default.findOne({
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
        const user = new userModel_1.default({
            firstName,
            lastName,
            phone,
            email,
            password,
        });
        // Save the new user to the database
        const newUser = yield user.save();
        // Generate the JWT token for the new user
        const payload = {
            userId: newUser._id,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            email: newUser.email,
            phone: newUser.phone,
            role: newUser.role,
        };
        const jwtToken = jsonwebtoken_1.default.sign({ user: payload }, process.env.JWT_SECRET, {
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
    }
    catch (error) {
        // Handle any errors
        res.status(500).json({
            message: error.message,
            error: true,
            success: false,
        });
    }
});
exports.userSignupController = userSignupController;
const userLogoutController = (req, res) => {
    try {
        res.cookie("token", null, {
            expires: new Date(Date.now()),
        })
            .json({ message: "logout successfull", error: false, success: true });
    }
    catch (error) {
        res.status(404).json({ message: error.message, error: true, success: false });
    }
};
exports.userLogoutController = userLogoutController;
