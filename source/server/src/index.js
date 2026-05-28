import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import { env } from "./config/env.js";
import { connectDB } from "./lib/db.js";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import groupRoutes from "./routes/group.route.js";
import { app, server } from "./lib/socket.js";
import {
  apiLimiter,
  corsOptions,
  securityHeaders,
} from "./middleware/security.middleware.js";
import { errorHandler, notFound } from "./middleware/error.middleware.js";

const PORT = env.PORT;

app.disable("x-powered-by");

app.use(securityHeaders);
app.use(cors(corsOptions));
app.use(apiLimiter);
app.use(express.json({ limit: env.JSON_BODY_LIMIT })); // Tăng giới hạn để xử lý file lớn
app.use(cookieParser()); // it allow parse the cookies so can grab the values out of it

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/groups", groupRoutes);

app.use(notFound);
app.use(errorHandler);

// HTTP server này sẽ được dùng bởi cả Express (cho các request HTTP) và Socket.IO (cho giao tiếp WebSocket).
server.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server is running on port ${PORT}`);
  connectDB();
});

