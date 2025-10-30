import express from "express";
import cookieParser from "cookie-parser"
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import dotenv from "dotenv";
import { connectDB } from "./lib/db.js";
dotenv.config();
const PORT = process.env.PORT;

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes)
app.listen(5001, () => {
  console.log("server is running on port 5001!!");
});

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}!!`);
  connectDB();
});


