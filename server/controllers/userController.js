import bcrypt from 'bcrypt';
import User from '../models/userModel.js';
import OTP from '../models/otpModel.js';
import { sendOtp } from '../services/otpService.js';

// Helper to set auth cookie
const setAuthCookie = (res, userId) => {
  res.cookie("token", userId, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    signed: true,
  });
};

export const sendOtpToEmail = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required." });

  try {
    await sendOtp(email);
    res.json({ success: true, message: "OTP sent to email." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send OTP." });
  }
};

export const registerUser = async (req, res) => {
  const { email, password, otp } = req.body;
  if (!email || !password || !otp)
    return res.status(400).json({ error: "All fields are required." });

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: "User already exists." });

    const validOtp = await OTP.findOne({ email, otp });
    if (!validOtp) return res.status(400).json({ error: "Invalid OTP." });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword });

    await OTP.deleteOne({ email, otp });

    setAuthCookie(res, user._id);
    res.json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Registration failed." });
  }
};

export const loginWithPassword = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email and password required." });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid credentials." });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Invalid credentials." });

    setAuthCookie(res, user._id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed." });
  }
};

export const sendOtpLogin = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email required." });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found." });

    await sendOtp(email);
    res.json({ success: true, message: "OTP sent to email." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send OTP." });
  }
};

export const verifyOtpLogin = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp)
    return res.status(400).json({ error: "Email and OTP required." });

  try {
    const validOtp = await OTP.findOne({ email, otp });
    if (!validOtp) return res.status(400).json({ error: "Invalid OTP." });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found." });

    await OTP.deleteOne({ email, otp });

    setAuthCookie(res, user._id);
    return res.json({ success: true, message: "Login successful." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "OTP login failed." });
  }
};

export const authCheck = (req, res) => {
  const token = req.signedCookies.token;
  if (!token) return res.status(401).json({ auth: false });

  res.json({ auth: true, userId: token });
};

export const logoutUser = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    signed: true
  });
  res.json({ message: "Logged out successfully." });
};
