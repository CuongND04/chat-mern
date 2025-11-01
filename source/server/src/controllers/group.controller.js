import cloudinary from "../lib/cloudinary.js";
import Group from "../models/group.model.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

// Tạo group mới
export const createGroup = async (req, res) => {
  try {
    const { name, description, memberIds, groupPic } = req.body;
    const adminId = req.user._id;

    if (!name || !memberIds || memberIds.length === 0) {
      return res.status(400).json({ message: "Name and members are required" });
    }

    // Upload group pic nếu có
    let groupPicUrl = "";
    if (groupPic) {
      const uploadResponse = await cloudinary.uploader.upload(groupPic);
      groupPicUrl = uploadResponse.secure_url;
    }

    // Tạo group với admin + members
    const members = [adminId, ...memberIds.filter(id => id !== adminId.toString())];

    const newGroup = new Group({
      name,
      description,
      groupPic: groupPicUrl,
      admin: adminId,
      members,
    });

    await newGroup.save();

    // Populate thông tin members
    const populatedGroup = await Group.findById(newGroup._id)
      .populate("members", "-password")
      .populate("admin", "-password");

    // Emit socket cho tất cả members
    members.forEach((memberId) => {
      const socketId = getReceiverSocketId(memberId.toString());
      if (socketId) {
        io.to(socketId).emit("newGroup", populatedGroup);
      }
    });

    res.status(201).json(populatedGroup);
  } catch (error) {
    console.log("Error in createGroup: ", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Lấy danh sách groups của user
export const getUserGroups = async (req, res) => {
  try {
    const userId = req.user._id;

    const groups = await Group.find({ members: userId })
      .populate("members", "-password")
      .populate("admin", "-password")
      .populate({
        path: "lastMessage",
        populate: {
          path: "senderId",
          select: "fullName profilePic",
        },
      })
      .sort({ updatedAt: -1 });

    // Thêm unread count cho mỗi group
    const groupsWithUnreadCount = await Promise.all(
      groups.map(async (group) => {
        const unreadCount = await Message.countDocuments({
          groupId: group._id,
          senderId: { $ne: userId },
          readBy: { $ne: userId },
        });

        return {
          ...group.toObject(),
          unreadCount,
        };
      })
    );

    res.status(200).json(groupsWithUnreadCount);
  } catch (error) {
    console.log("Error in getUserGroups: ", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Lấy messages của group
export const getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;

    // Kiểm tra user có phải member không
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (!group.members.includes(userId)) {
      return res.status(403).json({ message: "You are not a member of this group" });
    }

    const messages = await Message.find({ groupId })
      .populate("senderId", "fullName profilePic")
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getGroupMessages: ", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Gửi message trong group
export const sendGroupMessage = async (req, res) => {
  try {
    const { text, image, file } = req.body;
    const { groupId } = req.params;
    const senderId = req.user._id;

    // Kiểm tra group tồn tại và user là member
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (!group.members.includes(senderId)) {
      return res.status(403).json({ message: "You are not a member of this group" });
    }

    let imageUrl;
    let fileData;

    // Upload image nếu có
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    // Upload file nếu có
    if (file) {
      try {
        const uploadResponse = await cloudinary.uploader.upload(file.base64, {
          resource_type: "raw",
          folder: "chat_files",
          public_id: file.name.split('.')[0],
          format: file.name.split('.').pop(),
        });

        fileData = {
          url: uploadResponse.secure_url,
          name: file.name,
          size: file.size,
          type: file.type,
        };
      } catch (uploadError) {
        console.log("Error uploading file to Cloudinary:", uploadError.message);
        return res.status(500).json({ message: "Failed to upload file" });
      }
    }

    const newMessage = new Message({
      senderId,
      groupId,
      text,
      image: imageUrl,
      file: fileData,
      readBy: [senderId], // Người gửi tự động đã đọc
    });

    await newMessage.save();

    // Populate sender info
    await newMessage.populate("senderId", "fullName profilePic");

    // Update lastMessage của group
    group.lastMessage = newMessage._id;
    await group.save();

    // Emit socket cho tất cả members
    group.members.forEach((memberId) => {
      const socketId = getReceiverSocketId(memberId.toString());
      if (socketId) {
        io.to(socketId).emit("newGroupMessage", {
          groupId: group._id,
          message: newMessage,
        });
      }
    });

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendGroupMessage: ", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Đánh dấu messages đã đọc trong group
export const markGroupMessagesAsRead = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;

    await Message.updateMany(
      {
        groupId: groupId,
        senderId: { $ne: userId },
        readBy: { $ne: userId },
      },
      { $addToSet: { readBy: userId } }
    );

    res.status(200).json({ message: "Messages marked as read" });
  } catch (error) {
    console.log("Error in markGroupMessagesAsRead: ", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Thêm members vào group
export const addMembersToGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { memberIds } = req.body;
    const userId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Chỉ admin mới được thêm members
    if (group.admin.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only admin can add members" });
    }

    // Lọc ra những user chưa có trong group
    const newMembers = memberIds.filter(
      (id) => !group.members.some((m) => m.toString() === id)
    );

    group.members.push(...newMembers);
    await group.save();

    const updatedGroup = await Group.findById(groupId)
      .populate("members", "-password")
      .populate("admin", "-password");

    // Emit socket cho tất cả members (cũ + mới)
    updatedGroup.members.forEach((member) => {
      const socketId = getReceiverSocketId(member._id.toString());
      if (socketId) {
        io.to(socketId).emit("groupUpdated", updatedGroup);
      }
    });

    res.status(200).json(updatedGroup);
  } catch (error) {
    console.log("Error in addMembersToGroup: ", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Remove member khỏi group
export const removeMemberFromGroup = async (req, res) => {
  try {
    const { groupId, memberId } = req.params;
    const userId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Chỉ admin mới được remove members (hoặc user tự rời)
    if (group.admin.toString() !== userId.toString() && userId.toString() !== memberId) {
      return res.status(403).json({ message: "Only admin can remove members" });
    }

    // Không cho phép remove admin
    if (group.admin.toString() === memberId) {
      return res.status(400).json({ message: "Cannot remove admin from group" });
    }

    group.members = group.members.filter((m) => m.toString() !== memberId);
    await group.save();

    const updatedGroup = await Group.findById(groupId)
      .populate("members", "-password")
      .populate("admin", "-password");

    // Emit socket
    const memberSocketId = getReceiverSocketId(memberId);
    if (memberSocketId) {
      io.to(memberSocketId).emit("removedFromGroup", groupId);
    }

    group.members.forEach((member) => {
      const socketId = getReceiverSocketId(member._id.toString());
      if (socketId) {
        io.to(socketId).emit("groupUpdated", updatedGroup);
      }
    });

    res.status(200).json(updatedGroup);
  } catch (error) {
    console.log("Error in removeMemberFromGroup: ", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update group info
export const updateGroupInfo = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { name, description, groupPic } = req.body;
    const userId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Chỉ admin mới được update
    if (group.admin.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only admin can update group info" });
    }

    if (name) group.name = name;
    if (description) group.description = description;

    if (groupPic) {
      const uploadResponse = await cloudinary.uploader.upload(groupPic);
      group.groupPic = uploadResponse.secure_url;
    }

    await group.save();

    const updatedGroup = await Group.findById(groupId)
      .populate("members", "-password")
      .populate("admin", "-password");

    // Emit socket
    group.members.forEach((member) => {
      const socketId = getReceiverSocketId(member._id.toString());
      if (socketId) {
        io.to(socketId).emit("groupUpdated", updatedGroup);
      }
    });

    res.status(200).json(updatedGroup);
  } catch (error) {
    console.log("Error in updateGroupInfo: ", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Leave group
export const leaveGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Admin không thể tự rời, phải transfer admin trước
    if (group.admin.toString() === userId.toString()) {
      return res.status(400).json({ 
        message: "Admin cannot leave. Please transfer admin role first or delete the group" 
      });
    }

    group.members = group.members.filter((m) => m.toString() !== userId.toString());
    await group.save();

    // Emit socket
    group.members.forEach((member) => {
      const socketId = getReceiverSocketId(member._id.toString());
      if (socketId) {
        io.to(socketId).emit("memberLeftGroup", { groupId, userId });
      }
    });

    res.status(200).json({ message: "Left group successfully" });
  } catch (error) {
    console.log("Error in leaveGroup: ", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
