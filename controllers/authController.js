import { z } from "zod";
import User from "../models/userModels.js";
import asyncHandler from "express-async-handler";
import { generateToken } from "../utils/generateToken.js";

// Zod schemas
const signupSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  email: z.string().email("Invalid email address"),
});

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
export const signup = asyncHandler(async (req, res) => {
  const validatedData = signupSchema.parse(req.body);
  const { username, password, email } = validatedData;

  const userExists = await User.findOne({ username });

  if (userExists) {
    res.status(409);
    throw new Error("User already exists");
  }

  const user = await User.create({ username, password, email });
  if (user) {
    res.status(201).json({
      message: "User created successfully",
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
  const validatedData = loginSchema.parse(req.body);
  const { username, password } = validatedData;

  const user = await User.findOne({ username });
  if (user && (await user.matchPassword(password))) {
    res.json({
      message: "Login successful",
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: "Invalid username or password" });
  }
});
