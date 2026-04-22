import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true, // ✅ important
    },

    mobile: {
      type: String,
      required: true,
      trim: true,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user", // ✅ ye important fix
    },

    resetOtp: String,

    isOtpVerify: {
      type: Boolean,
      default: false,
    },

    otpExpires: Date,
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);
export default User;
