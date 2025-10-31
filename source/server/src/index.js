import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import { connectDB } from "./lib/db.js";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { app, server } from "./lib/socket.js";

dotenv.config();

const PORT = process.env.PORT;

app.use(express.json()); // req.body to get data from req.body
app.use(cookieParser()); // it allow parse the cookies so can grab the values out of it
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
// HTTP server này sẽ được dùng bởi cả Express (cho các request HTTP) và Socket.IO (cho giao tiếp WebSocket).
server.listen(PORT, () => {
  console.log(`server is running on port ${PORT}!!`);
  connectDB();
});
