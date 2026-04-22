import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import genToken from "../utils/token.js";
import { sendOtpMail } from "../utils/mail.js";

// REGISTER CONTROLLER
// ===========================

export const signUp = async (req, res) => {
  try {
    const { fullName, email, password, mobile } = req.body;

    // check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    // validations
    if (!password || password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    if (!mobile || mobile.length < 10) {
      return res.status(400).json({
        message: "Mobile number must be at least 10 digits",
      });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ❗ FIX: role manually set
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      mobile,
      role: "user", // 🔥 always user
    });

    await newUser.save();

    // token generate AFTER save
    const token = await genToken(newUser._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // production me true
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        _id: newUser._id,
        email: newUser.email,
        role: newUser.role,
        token,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// LOGIN CONTROLLER
// ===========================

export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    // normalize email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(400).json({ message: "User does not exist" });
    }

    // check password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // token
    const token = await genToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // 👉 production me true
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // ✅ Safe response
    res.status(200).json({
      message: "User logged in successfully",
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role, // 🔥 important
      },
      token, // 👉 agar frontend localStorage use kare
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// LOGOUT CONTROLLER
// ===========================

export const signOut = async (req, res) => {
  try {
    res.clearCookie("token");
    res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// sendOtp
// =============================
export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    // check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User does not exist" });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetOtp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000;
    user.isOtpVerify = false;
    await user.save();
    await sendOtpMail({ to: email, otp });
    res.status(200).json({ message: "OTP sent to email" });
  } catch (error) {
    console.log("SEND OTP ERROR:", error); // 🔥 MUST
    res.status(500).json({ message: error.message });
  }
};

// verifyOtp
// =============================
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // check find email
    const user = await User.findOne({ email });
    if (!user || user.resetOtp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "invalid/expired otp" });
    }
    user.isOtpVerify = true;
    user.resetOtp = undefined;
    user.otpExpires = undefined;
    await user.save();
    res.status(200).json({ message: "OTP Verify successfully!" });
  } catch (error) {
    console.log("SEND OTP ERROR:", error); // 🔥 MUST
    res.status(500).json({ message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    // check find email
    const user = await User.findOne({ email });
    if (!user || !user.isOtpVerify) {
      return res.status(400).json({ message: "otp verification required!" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.isOtpVerify = false;
    await user.save();
    res.status(200).json({ message: "password reset successfully!" });
  } catch (error) {
    console.log("SEND OTP ERROR:", error); // 🔥 MUST
    res.status(500).json({ message: error.message });
  }
};
