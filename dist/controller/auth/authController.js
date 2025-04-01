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
exports.updateUserProfile = exports.getProfileController = exports.userLogoutController = exports.providerSignupController = exports.storeSignUpController = exports.userSignupController = exports.verifyOtpController = exports.sendOtpController = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userModel_1 = __importDefault(require("../../models/userModel")); // Assuming the User model is in models/User
const asyncHandler_1 = __importDefault(require("../../utils/asyncHandler"));
const ApiError_1 = __importDefault(require("../../utils/response/ApiError"));
const ApiResponse_1 = __importDefault(require("../../utils/response/ApiResponse"));
const validation_1 = require("../../validation");
const statusCodes_1 = __importDefault(require("../../data/statusCodes"));
const addressModel_1 = __importDefault(require("../../models/addressModel"));
const email_1 = require("../../utils/notification/email");
const otp_1 = require("../../utils/notification/otp");
// Login controller
exports.sendOtpController = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    console.log(req.body);
    // Check if user exists
    const user = yield userModel_1.default.findOne({ email });
    if (!user) {
        const response = new ApiError_1.default(404, "User does not exist");
        res.status(response.statusCode).json(response.toJSON());
        return;
    }
    // Generate and store OTP in Redis (valid for 5 minutes)
    const otp = yield (0, otp_1.storeOTP)(email);
    // TODO: Send OTP via email/SMS (use a service like Twilio or Nodemailer)
    (0, email_1.sendEmail)(email, "Otp Verification", otp);
    console.log(`OTP for ${email}: ${otp}`);
    res.json(new ApiResponse_1.default(200, { email }, "OTP sent successfully"));
    return;
}));
exports.verifyOtpController = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, otp } = req.body;
    if (!email || !otp) {
        res.status(400).json(new ApiError_1.default(400, "Email and OTP are required"));
        return;
    }
    // const storedOtp = await verifyOTP(email, otp);
    // if (!storedOtp) {
    //   res.status(401).json(new ApiError(401, "Invalid or expired OTP"));
    //   return;
    // }
    const user = yield userModel_1.default.findOne({ email });
    if (!user) {
        res.status(404).json(new ApiError_1.default(404, "User Not Found"));
        return;
    }
    const payload = {
        userId: user._id,
        email: user.email,
        role: user.role,
        picture: user.profilePicture,
    };
    const jwtToken = jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "1d",
    });
    res
        .cookie("token", jwtToken, {
        maxAge: 24 * 60 * 60 * 1000, // Token valid for 1 day
        sameSite: "none",
        secure: true,
        httpOnly: true,
    })
        .status(200)
        .json(new ApiResponse_1.default(200, { data: payload, token: jwtToken }, "Login successful"));
    return;
}));
// signup user
exports.userSignupController = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    if (!email) {
        throw new ApiError_1.default(statusCodes_1.default.badRequest, "Email is Required");
    }
    // Check if email or phone already exists
    const existingUser = yield userModel_1.default.findOne({ email });
    if (existingUser) {
        console.log(existingUser);
        const response = new ApiError_1.default(statusCodes_1.default.conflict, "User with this email already exists");
        return res.status(response.statusCode).json(response.toJSON());
    }
    const otp = yield (0, otp_1.storeOTP)(email);
    // TODO: Send OTP via email/SMS (use a service like Twilio or Nodemailer)
    (0, email_1.sendEmail)(email, "Otp Verification", otp);
    res.json(new ApiResponse_1.default(200, { email }, "OTP sent successfully"));
    return;
}));
exports.storeSignUpController = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, otp } = req.body;
    if (!email || !otp) {
        res.status(400).json(new ApiError_1.default(400, "Email and OTP are required"));
        return;
    }
    const storedOtp = yield (0, otp_1.verifyOTP)(email, otp);
    if (!storedOtp) {
        res.status(401).json(new ApiError_1.default(401, "Invalid or expired OTP"));
        return;
    }
    const user = new userModel_1.default({ email: email });
    yield user.save();
    const payload = {
        userId: user._id,
        email: user.email,
        role: user.role,
    };
    const jwtToken = jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "1d",
    });
    res
        .cookie("token", jwtToken, {
        maxAge: 24 * 60 * 60 * 1000, // Token valid for 1 day
        sameSite: "none",
        secure: true,
        httpOnly: true,
    })
        .status(200)
        .json(new ApiResponse_1.default(200, { data: payload, token: jwtToken }, "Sign Up Successful"));
    return;
}));
// signup provider
exports.providerSignupController = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { firstName, lastName, phone, email } = req.body;
    (0, validation_1.validateRequest)(validation_1.signupSchema, req.body);
    // Check if email or phone already exists
    const existingUser = yield userModel_1.default.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
        const response = new ApiError_1.default(statusCodes_1.default.conflict, "User with this email or phone already exists");
        return res.status(response.statusCode).json(response.toJSON());
    }
    // Create new user
    const newUser = yield userModel_1.default.create({
        firstName,
        lastName,
        phone,
        email,
        role: "provider",
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
        .status(statusCodes_1.default.created)
        .json(new ApiResponse_1.default(statusCodes_1.default.created, { data: payload, token: jwtToken }, "Signup successful"));
}));
exports.userLogoutController = (0, asyncHandler_1.default)((req, res) => {
    res
        .cookie("token", null, {
        expires: new Date(Date.now()),
    })
        .json(new ApiResponse_1.default(statusCodes_1.default.ok, null, "Logout successfully..."));
});
exports.getProfileController = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user._id;
    const profile = yield userModel_1.default.findOne({ _id: userId }).select("-password");
    if (!profile) {
        throw new ApiError_1.default(statusCodes_1.default.internalServerError, "Session Expired");
    }
    const address = yield addressModel_1.default.find({ userId });
    const response = new ApiResponse_1.default(statusCodes_1.default.ok, { profile, address }, "Fetch User Data Successfully");
    res.status(statusCodes_1.default.ok).json(response);
}));
const updateUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { firstName, lastName, phone, profilePicture } = req.body;
        const userId = req.user._id;
        const updatedUser = yield userModel_1.default.findByIdAndUpdate(userId, { firstName, lastName, phone, profilePicture }, { new: true });
        if (!updatedUser) {
            res
                .status(404)
                .json({ message: "User not found", error: true, success: false });
            return;
        }
        res.status(200).json({
            message: "Profile updated",
            data: updatedUser,
            success: true,
            error: false,
        });
    }
    catch (error) {
        res
            .status(500)
            .json({ message: error.message, error: true, success: false });
    }
});
exports.updateUserProfile = updateUserProfile;
