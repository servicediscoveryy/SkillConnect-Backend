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
exports.updateUserProfile = exports.getProfileController = exports.userLogoutController = exports.userSignupController = exports.userLoginController = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userModel_1 = __importDefault(require("../../models/userModel")); // Assuming the User model is in models/User
const asyncHandler_1 = __importDefault(require("../../utils/asyncHandler"));
const ApiError_1 = __importDefault(require("../../utils/ApiError"));
const ApiResponse_1 = __importDefault(require("../../utils/ApiResponse"));
const validation_1 = require("../../validation");
// Login controller
exports.userLoginController = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    // Validate the request body
    if (!email || !password) {
        const response = new ApiError_1.default(400, "Email and password are required");
        return res.status(response.statusCode).json(response.toJSON()); // Return here to avoid further execution
    }
    // Check if user exists in the database
    const user = yield userModel_1.default.findOne({ email });
    if (!user) {
        const response = new ApiError_1.default(404, "User does not exist");
        return res.status(response.statusCode).json(response.toJSON()); // Return here
    }
    // Ensure user's password exists
    if (!user.password) {
        const response = new ApiError_1.default(500, "User's password not found in the database");
        return res.status(response.statusCode).json(response.toJSON()); // Return here
    }
    // Validate password
    // @ts-ignore
    const isPasswordValid = yield user.comparePassword(password); // Assuming comparePassword is defined in the User model
    if (!isPasswordValid) {
        const response = new ApiError_1.default(401, "Invalid Credentials");
        return res.status(response.statusCode).json(response.toJSON()); // Return here
    }
    // Generate JWT Token
    const payload = {
        userId: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
    };
    const jwtToken = jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "1d",
    });
    // Send JWT token as a cookie and return response
    return res
        .cookie("token", jwtToken, {
        maxAge: 24 * 60 * 60 * 1000, // Token valid for 1 day
        sameSite: "none",
        secure: true,
        httpOnly: true,
    })
        .status(200)
        .json(new ApiResponse_1.default(200, { data: payload, token: jwtToken }, "Login successful"));
}));
exports.userSignupController = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { firstName, lastName, phone, email, password } = req.body;
    const { error } = validation_1.signupSchema.validate(req.body, { abortEarly: true });
    if (error) {
        const response = new ApiError_1.default(400, "All Fields are required", error.details.map((err) => err.message));
        return res.status(response.statusCode).json(response.toJSON());
    }
    // Check if email or phone already exists
    const existingUser = yield userModel_1.default.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
        const response = new ApiError_1.default(400, "User with this email or phone already exists");
        return res.status(response.statusCode).json(response.toJSON());
    }
    // Create new user
    const newUser = yield userModel_1.default.create({
        firstName,
        lastName,
        phone,
        email,
        password,
    });
    // Generate JWT Token
    const payload = {
        userId: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
    };
    const jwtToken = jsonwebtoken_1.default.sign({ user: payload }, process.env.JWT_SECRET, { expiresIn: "1d" });
    // Set cookie and send response
    res
        .cookie("token", jwtToken, {
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: "none",
        secure: true,
        httpOnly: true,
    })
        .status(201)
        .json(new ApiResponse_1.default(201, { data: payload, token: jwtToken }, "Signup successful"));
}));
exports.userLogoutController = (0, asyncHandler_1.default)((req, res) => {
    res
        .cookie("token", null, {
        expires: new Date(Date.now()),
    })
        .json(new ApiResponse_1.default(200, null, "Logout successfully..."));
});
exports.getProfileController = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user._id;
    const profile = yield userModel_1.default.findOne({ _id: user }).select("-password");
    if (!profile) {
        throw new ApiError_1.default(500, "Session Expired");
    }
    const response = new ApiResponse_1.default(200, { data: profile }, "Fetch User Data Successfully");
    res.status(200).json(response);
}));
const updateUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // @ts-ignore
        const { firstName, lastName, phone, profilePicture } = req.body;
        // @ts-ignore
        const userId = req.user._id;
        const updatedUser = yield userModel_1.default.findByIdAndUpdate(userId, { firstName, lastName, phone, profilePicture }, { new: true });
        if (!updatedUser) {
            // @ts-ignore
            return res
                .status(404)
                .json({ message: "User not found", error: true, success: false });
        }
        // @ts-ignore
        res.status(200).json({
            message: "Profile updated",
            data: updatedUser,
            success: true,
            error: false,
        });
    }
    catch (error) {
        // @ts-ignore
        res
            .status(500)
            .json({ message: error.message, error: true, success: false });
    }
});
exports.updateUserProfile = updateUserProfile;
