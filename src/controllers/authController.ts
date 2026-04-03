import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import User from "../models/User";
import { asyncHandler } from "../utils/AsyncHandler";
import { generateNewAccessToken, generateTokens } from "../utils/JWT";

// Register new user
export const register = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        errors: errors.array(),
      });
      return;
    }

    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: "An account with this email already exists", // ← Clear message
      });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = new User({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();

    // Generate JWT token

    const { accessToken, refreshToken } = generateTokens(user._id.toString());
    user.refreshToken = refreshToken;

    await user.save();

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      accessToken,
      refreshAccessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  },
);

// Login user
export const login = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        errors: errors.array(),
      });
      return;
    }

    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({
        // ← Changed from 400 to 404
        success: false,
        message: "No account found with this email address", // ← Specific message
      });
      return;
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({
        // ← Changed from 400 to 401 (Unauthorized)
        success: false,
        message: "Incorrect password. Please try again", // ← Specific message
      });
      return;
    }

    // Generate both tokens
    const { accessToken, refreshToken } = generateTokens(user._id.toString());

    // Save refresh token to database
    user.refreshToken = refreshToken;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Login successful",
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  },
);

// Refresh access token
export const refreshAccessToken = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(401).json({
        success: false,
        message: "Refresh token required",
      });
      return;
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET as string,
      ) as { userId: string };
    } catch (error) {
      res.status(403).json({
        success: false,
        message: "Invalid or expired refresh token",
      });
      return;
    }

    // Find user and check if refresh token matches
    const user = await User.findById(decoded.userId);
    if (!user || user.refreshToken !== refreshToken) {
      res.status(403).json({
        success: false,
        message: "Invalid refresh token",
      });
      return;
    }

    // Generate new access token
    const accessToken = generateNewAccessToken(user._id.toString());

    res.status(200).json({
      success: true,
      accessToken,
    });
  },
);

// Logout user
export const logout = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { refreshToken } = req.body;

    // Find user and clear refresh token
    const user = await User.findOne({ refreshToken });
    if (user) {
      user.refreshToken = null;
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  },
);
