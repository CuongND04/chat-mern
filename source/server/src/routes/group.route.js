import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  createGroup,
  getUserGroups,
  getGroupMessages,
  sendGroupMessage,
  markGroupMessagesAsRead,
  addMembersToGroup,
  removeMemberFromGroup,
  updateGroupInfo,
  leaveGroup,
} from "../controllers/group.controller.js";

const router = express.Router();

// Tạo group mới
router.post("/create", protectRoute, createGroup);

// Lấy danh sách groups
router.get("/", protectRoute, getUserGroups);

// Lấy messages của group
router.get("/:groupId/messages", protectRoute, getGroupMessages);

// Gửi message trong group
router.post("/:groupId/send", protectRoute, sendGroupMessage);

// Đánh dấu đã đọc
router.put("/:groupId/read", protectRoute, markGroupMessagesAsRead);

// Thêm members
router.post("/:groupId/members", protectRoute, addMembersToGroup);

// Remove member
router.delete("/:groupId/members/:memberId", protectRoute, removeMemberFromGroup);

// Update group info
router.put("/:groupId", protectRoute, updateGroupInfo);

// Leave group
router.post("/:groupId/leave", protectRoute, leaveGroup);

export default router;
