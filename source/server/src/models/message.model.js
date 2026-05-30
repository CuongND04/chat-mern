import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    // ✅ THÊM: Field cho group chat
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
    },
    text: {
      type: String,
    },
    image: {
      type: String,
    },
    // ✅ THÊM: Field cho file
    file: {
      url: { type: String },
      name: { type: String },
      size: { type: Number },
      type: { type: String },
    },
    read: {
      type: Boolean,
      default: false,
    },
    // ✅ THÊM: Tracking users đã đọc (cho group chat)
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

messageSchema.index({ senderId: 1, receiverId: 1, createdAt: 1 });
messageSchema.index({ receiverId: 1, senderId: 1, read: 1 });
messageSchema.index({ groupId: 1, createdAt: 1 });
messageSchema.index({ groupId: 1, senderId: 1, readBy: 1 });

const Message = mongoose.model("Message", messageSchema);

export default Message;
