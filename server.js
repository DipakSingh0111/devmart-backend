import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/database.js";
import authRouter from "./routes/auth.routes.js";

// ✅ Sabse pehle dotenv
dotenv.config();

const app = express();

// middleware
app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);

// routes
app.use("/api/auth", authRouter);
app.get("/", (req, res) => {
  res.send("Welcome to Dev Clothes API");
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  connectDB();
  console.log(`Server running on PORT ${PORT}`);
});

// ✅ Vercel ke liye export karo
export default app;
