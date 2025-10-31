import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: { // be a reference to the user model
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: { // be a reference to the user model
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
    },
    image: {
      type: String,
    },
    read: {
      type: Boolean,
      default: false, // Mặc định tin nhắn mới là chưa đọc
    },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

export default Message; 