import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/database.js";
import authRouter from "./routes/auth.routes.js";

dotenv.config();

// ✅ Pehle DB connect karo
connectDB();

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "https://devmart-sigma.vercel.app",
    credentials: true,
  }),
);

app.use("/api/auth", authRouter);

const PORT = process.env.PORT || 4000;

// ✅ Vercel ke liye conditional listen
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server running on PORT ${PORT}`);
  });
}

export default app;
