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

// Login controller
export const userLoginController = asyncHandler(
  async (req: Request, res: Response): ResponseReturnType => {
    const { email, password } = req.body;

    validateRequest(signinSchema, req.body);

    // Check if user exists in the database
    const user = await User.findOne({ email });

    if (!user) {
      const response = new ApiError(404, "User does not exist");
      return res.status(response.statusCode).json(response.toJSON()); // Return here
    }

    // Ensure user's password exists
    if (!user.password) {
      const response = new ApiError(
        500,
        "User's password not found in the database"
      );
      return res.status(response.statusCode).json(response.toJSON()); // Return here
    }

    // Validate password
    // @ts-ignore
    const isPasswordValid = await user.comparePassword(password); // Assuming comparePassword is defined in the User model

    if (!isPasswordValid) {
      const response = new ApiError(401, "Invalid Credentials");
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

    const jwtToken = jwt.sign(payload, process.env.JWT_SECRET as string, {
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
      .json(
        new ApiResponse(
          200,
          { data: payload, token: jwtToken },
          "Login successful"
        )
      );
  }
);

export const userSignupController = asyncHandler(
  async (req: Request, res: Response): ResponseReturnType => {
    const { firstName, lastName, phone, email, password } = req.body;

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

export const providerSignupController = asyncHandler(
  async (req: Request, res: Response): ResponseReturnType => {
    const { firstName, lastName, phone, email, password } = req.body;

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
      password,
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
    const user = req.user._id;
    const profile = await User.findOne({ _id: user }).select("-password");

    if (!profile) {
      throw new ApiError(STATUS.internalServerError, "Session Expired");
    }

    const response = new ApiResponse(
      STATUS.ok,
      { data: profile },
      "Fetch User Data Successfully"
    );

    res.status(STATUS.ok).json(response);
  }
);

export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const { firstName, lastName, phone, profilePicture } = req.body;
    // @ts-ignore
    const userId = req.user._id;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { firstName, lastName, phone, profilePicture },
      { new: true }
    );

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
  } catch (error: any) {
    // @ts-ignore
    res
      .status(500)
      .json({ message: error.message, error: true, success: false });
  }
};
