import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
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
import {
  addMembersSchema,
  createGroupSchema,
  groupIdParamSchema,
  memberParamSchema,
  sendGroupMessageSchema,
  updateGroupSchema,
} from "../schemas/group.schema.js";

const router = express.Router();

// Tạo group mới
router.post("/create", protectRoute, validate(createGroupSchema), createGroup);

// Lấy danh sách groups
router.get("/", protectRoute, getUserGroups);

// Lấy messages của group
router.get("/:groupId/messages", protectRoute, validate(groupIdParamSchema), getGroupMessages);

// Gửi message trong group
router.post("/:groupId/send", protectRoute, validate(sendGroupMessageSchema), sendGroupMessage);

// Đánh dấu đã đọc
router.put("/:groupId/read", protectRoute, validate(groupIdParamSchema), markGroupMessagesAsRead);

// Thêm members
router.post("/:groupId/members", protectRoute, validate(addMembersSchema), addMembersToGroup);

// Remove member
router.delete("/:groupId/members/:memberId", protectRoute, validate(memberParamSchema), removeMemberFromGroup);

// Update group info
router.put("/:groupId", protectRoute, validate(updateGroupSchema), updateGroupInfo);

// Leave group
router.post("/:groupId/leave", protectRoute, validate(groupIdParamSchema), leaveGroup);

export default router;
