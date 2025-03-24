import { Request, response, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../../models/userModel"; // Assuming the User model is in models/User
import { RequestWithUser } from "../../types/RequestWithUser";
import asyncHandler from "../../utils/asyncHandler";
import ApiError from "../../utils/response/ApiError";
import ApiResponse from "../../utils/response/ApiResponse";
import { ResponseReturnType } from "../../types/ReturnController";
import { signinSchema, signupSchema, validateRequest } from "../../validation";
import STATUS from "../../data/statusCodes";
import Address from "../../models/addressModel";
import { sendEmail } from "../../utils/notification/email";
import { storeOTP, verifyOTP } from "../../utils/notification/otp";

// Login controller
export const sendOtpController = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });

    if (!user) {
      const response = new ApiError(404, "User does not exist");
      res.status(response.statusCode).json(response.toJSON());
      return;
    }

    // Generate and store OTP in Redis (valid for 5 minutes)
    const otp = await storeOTP(email);
    // TODO: Send OTP via email/SMS (use a service like Twilio or Nodemailer)
    sendEmail(email, "Otp Verification", otp);
    console.log(`OTP for ${email}: ${otp}`);

    res.json(new ApiResponse(200, { email }, "OTP sent successfully"));
    return;
  }
);

export const verifyOtpController = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    res.status(400).json(new ApiError(400, "Email and OTP are required"));
    return;
  }

  const storedOtp = await verifyOTP(email, otp);

  // if (!storedOtp) {
  //   res.status(401).json(new ApiError(401, "Invalid or expired OTP"));
  //   return;
  // }

  const user = await User.findOne({ email });

  if (!user) {
    res.status(404).json(new ApiError(404, "User Not Found"));
    return;
  }

  const payload = {
    userId: user._id,
    email: user.email,
    role: user.role,
  };

  const jwtToken = jwt.sign(payload, process.env.JWT_SECRET as string, {
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
    .json(
      new ApiResponse(
        200,
        { data: payload, token: jwtToken },
        "Login successful"
      )
    );
  return;
});

// signup user
export const userSignupController = asyncHandler(
  async (req: Request, res: Response): ResponseReturnType => {
    const { email } = req.body;

    if (!email) {
      throw new ApiError(STATUS.badRequest, "Email is Required");
    }

    // Check if email or phone already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log(existingUser);
      const response = new ApiError(
        STATUS.conflict,
        "User with this email already exists"
      );
      return res.status(response.statusCode).json(response.toJSON());
    }

    const otp = await storeOTP(email);
    // TODO: Send OTP via email/SMS (use a service like Twilio or Nodemailer)
    sendEmail(email, "Otp Verification", otp);

    res.json(new ApiResponse(200, { email }, "OTP sent successfully"));
    return;
  }
);

export const storeSignUpController = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    res.status(400).json(new ApiError(400, "Email and OTP are required"));
    return;
  }

  const storedOtp = await verifyOTP(email, otp);

  if (!storedOtp) {
    res.status(401).json(new ApiError(401, "Invalid or expired OTP"));
    return;
  }

  const user = new User({ email: email });

  await user.save();

  const payload = {
    userId: user._id,
    email: user.email,
    role: user.role,
  };

  const jwtToken = jwt.sign(payload, process.env.JWT_SECRET as string, {
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
    .json(
      new ApiResponse(
        200,
        { data: payload, token: jwtToken },
        "Sign Up Successful"
      )
    );
  return;
});

// signup provider
export const providerSignupController = asyncHandler(
  async (req: Request, res: Response): ResponseReturnType => {
    const { firstName, lastName, phone, email } = req.body;

    validateRequest(signupSchema, req.body);

    // Check if email or phone already exists
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });

    if (existingUser) {
      const response = new ApiError(
        STATUS.conflict,
        "User with this email or phone already exists"
      );
      return res.status(response.statusCode).json(response.toJSON());
    }

    // Create new user
    const newUser = await User.create({
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

    const jwtToken = jwt.sign(
      { user: payload },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" }
    );

    // Set cookie and send response
    res
      .cookie("token", jwtToken, {
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: "none",
        secure: true,
        httpOnly: true,
      })
      .status(STATUS.created)
      .json(
        new ApiResponse(
          STATUS.created,
          { data: payload, token: jwtToken },
          "Signup successful"
        )
      );
  }
);

export const userLogoutController = asyncHandler(
  (req: Request, res: Response) => {
    res
      .cookie("token", null, {
        expires: new Date(Date.now()),
      })
      .json(new ApiResponse(STATUS.ok, null, "Logout successfully..."));
  }
);

export const getProfileController = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    const userId = req.user._id;
    const profile = await User.findOne({ _id: userId }).select("-password");

    if (!profile) {
      throw new ApiError(STATUS.internalServerError, "Session Expired");
    }

    const address = await Address.find({ userId });

    const response = new ApiResponse(
      STATUS.ok,
      { profile, address },
      "Fetch User Data Successfully"
    );

    res.status(STATUS.ok).json(response);
  }
);

export const updateUserProfile = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    const { firstName, lastName, phone, profilePicture } = req.body;

    const userId = req.user._id;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { firstName, lastName, phone, profilePicture },
      { new: true }
    );

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
  } catch (error: any) {
    res
      .status(500)
      .json({ message: error.message, error: true, success: false });
  }
};
