import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");

    const usersWithUnreadCount = await Promise.all(
      filteredUsers.map(async (user) => {
        const unreadCount = await Message.countDocuments({
          senderId: user._id,
          receiverId: loggedInUserId,
          read: false,
        });

        return {
          ...user.toObject(),
          unreadCount,
        };
      })
    );

    res.status(200).json(usersWithUnreadCount);
  } catch (error) {
    console.log("Error in getUsersForSidebar", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });
    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages: ", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const markMessagesAsRead = async (req, res) => {
  try {
    const { id: senderId } = req.params;
    const receiverId = req.user._id;

    await Message.updateMany(
      {
        senderId: senderId,
        receiverId: receiverId,
        read: false,
      },
      { read: true }
    );

    const senderSocketId = getReceiverSocketId(senderId);

    if (senderSocketId) {
      io.to(senderSocketId).emit("message_seen_update", {
        senderId: senderId,
        receiverId: receiverId,
      });
    }

    res.status(200).json({ message: "Messages marked as read successfully" });
  } catch (error) {
    console.log("Error in markMessagesAsRead: ", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image, file } = req.body; // ✅ THÊM: file
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    let fileData;

    // Upload image nếu có
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    // ✅ THÊM: Upload file nếu có
    if (file) {
  try {
    const uploadResponse = await cloudinary.uploader.upload(file.base64, {
      resource_type: "raw",
      folder: "chat_files",
      public_id: file.name.split('.')[0], // Tên file không có extension
      // ✅ THÊM: Format để giữ extension
      format: file.name.split('.').pop(), // Lấy extension
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
      receiverId,
      text,
      image: imageUrl,
      file: fileData, // ✅ THÊM
    });
    
    await newMessage.save();
    console.log("newMessage: ", newMessage);

    // Gửi message đến người nhận theo thời gian thực
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage: ", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};