import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    // Get all users except logged in user
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");

    // ✅ Đếm số tin nhắn chưa đọc cho mỗi user
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
    // get values of dynamic params and rename parameter "id" to "userToCharId"
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
// ✅ THÊM: Hàm cập nhật trạng thái tin nhắn thành đã đọc
export const markMessagesAsRead = async (req, res) => {
  try {
    // senderId trong route này chính là ID của người gửi tin nhắn (Người A)
    const { id: senderId } = req.params; // ID của người nhận (người đang đăng nhập, người xem tin nhắn - Người B)
    const receiverId = req.user._id; // 1. Cập nhật TẤT CẢ tin nhắn chưa đọc thành read: true trong DB

    await Message.updateMany(
      {
        senderId: senderId,
        receiverId: receiverId,
        read: false, // Chỉ cập nhật những tin nhắn chưa đọc
      },
      { read: true }
    ); // 2. Socket.io Emit để thông báo cho người gửi (A) biết B đã đọc

    const senderSocketId = getReceiverSocketId(senderId);

    if (senderSocketId) {
      // Gửi sự kiện message_seen_update chỉ đến người gửi (A)
      io.to(senderSocketId).emit("message_seen_update", {
        senderId: senderId,
        receiverId: receiverId, // Không cần gửi danh sách messages, Frontend sẽ tự cập nhật.
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
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      // upload base64 image to Cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }
    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });
    await newMessage.save();
    console.log("newMessage: ", newMessage);
    // gửi message đến bên nhật theo thời gian thực
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      // chỉ có receiverSocketId mới nhận được thông điệp
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage: ", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
