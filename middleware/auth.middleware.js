// middleware/auth.middleware.js — YEH FILE BANAO

import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

// =============================================
// TOKEN VERIFY MIDDLEWARE
// =============================================
export const isAuthenticated = async (req, res, next) => {
  try {
    // Cookie se token lo (ya Authorization header se)
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Login karo pehle" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // DB se fresh user data lo (role check ke liye)
    // ✅ FIX: genToken mein {userId} use hua hai, isliye decoded.userId
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User nahi mila" });
    }

    req.user = user; // Agle middleware/controller mein available hoga
    next();
  } catch (error) {
    res.status(401).json({ message: "Token invalid ya expire ho gaya" });
  }
};

// =============================================
// ADMIN CHECK MIDDLEWARE
// =============================================
export const isAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Sirf admin access kar sakta hai" });
  }
  next();
};
