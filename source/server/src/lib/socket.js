import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});

const userSocketMap = {}; // {userId : socketId}

io.on("connection", (socket) => {
  console.log("✅ A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  console.log("👤 User ID from handshake:", userId);
  
  if (userId) userSocketMap[userId] = socket.id;
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // ✅ THÊM: Xử lý sự kiện typing
  socket.on("typing", ({ receiverId }) => {
    console.log(`⌨️ Typing event from ${userId} to ${receiverId}`);
    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("user-typing", {
        userId: userId,
        isTyping: true,
      });
      console.log(`✅ Sent typing event to ${receiverId}`);
    } else {
      console.log(`❌ Receiver ${receiverId} not found`);
    }
  });

  // ✅ THÊM: Xử lý sự kiện stop typing
  socket.on("stop-typing", ({ receiverId }) => {
    console.log(`⏹️ Stop typing event from ${userId} to ${receiverId}`);
    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("user-typing", {
        userId: userId,
        isTyping: false,
      });
      console.log(`✅ Sent stop typing event to ${receiverId}`);
    }
  });

  // ✅ THÊM: Xử lý sự kiện group typing
  socket.on("groupTyping", ({ groupId, isTyping }) => {
    console.log(`👥 Group typing event from ${userId} to group ${groupId}, isTyping: ${isTyping}`);
    // Broadcast tới tất cả members trong group (trừ chính mình)
    socket.to(groupId).emit("groupUserTyping", {
      groupId,
      userId,
      isTyping,
    });
    console.log(`✅ Broadcasted group typing to group ${groupId}`);
  });

  // ✅ THÊM: Join group room
  socket.on("joinGroup", ({ groupId }) => {
    socket.join(groupId);
    console.log(`✅ User ${userId} joined group ${groupId}`);
  });

  // ✅ THÊM: Leave group room
  socket.on("leaveGroup", ({ groupId }) => {
    socket.leave(groupId);
    console.log(`✅ User ${userId} left group ${groupId}`);
  });

  socket.on("disconnect", () => {
    console.log("❌ A user disconnected", socket.id, "User ID:", userId);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

export { io, app, server };