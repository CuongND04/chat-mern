import React, { useEffect, useRef } from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import { useChatStore } from "../store/useChatStore";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();

  const { authUser } = useAuthStore();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    getMessages(selectedUser._id);
    subscribeToMessages();
    // Đây là một hàm được gọi khi:
    // -Component bị hủy (unmount).
    // -Dependencies thay đổi và useEffect chạy lại.
    return () => unsubscribeFromMessages();
  }, [
    selectedUser._id,
    getMessages,
    subscribeToMessages,
    unsubscribeFromMessages,
  ]);

  // cuộn đến cuối danh sách tin nhắn mỗi khi danh sách tin nhắn change
  useEffect(() => {
    // Truy cập trực tiếp DOM node mà ref trỏ đến.
    if (messagesEndRef.current && messages) {
      // Là một phương thức DOM dùng để cuộn một phần tử vào vùng hiển thị của trình duyệt.
      // Tùy chọn để cuộn mượt mà thay vì cuộn ngay lập tức.
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
    console.log(("messages: ", messages));
  }, [messages]);

  if (isMessagesLoading)
    return (
      <div className="flex-1 flex flex-col overflow-auto bg-[#FDFCF5]">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );

  return (
    <div className="flex-1 flex flex-col overflow-auto bg-[#FDFCF5]">
      <ChatHeader />

      {/* Khung tin nhắn */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const senderId =
            typeof message.senderId === "object"
              ? message.senderId?._id?.toString()
              : message.senderId?.toString();
          const isOwn = senderId === authUser?._id?.toString();

          return (
            <div
              key={message._id}
              className={`flex w-full ${
                isOwn ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`flex items-end gap-2 ${
                  isOwn ? "flex-row-reverse" : ""
                }`}
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full border-2 border-black bg-white overflow-hidden shrink-0">
                  <img
                    src={
                      isOwn
                        ? authUser?.profilePic || "/statics/10.jpg"
                        : selectedUser?.profilePic || "/statics/10.jpg"
                    }
                    alt="profile"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Nội dung */}
                <div
                  className={`flex flex-col ${
                    isOwn ? "items-end" : "items-start"
                  }`}
                >
                  {/* Thời gian */}
                  <div className="text-xs font-semibold opacity-60 mb-1">
                    {formatMessageTime(message.createdAt)}
                  </div>

                  {/* Bubble */}
                  <div
                    className={`inline-block px-4 py-2 rounded-xl border-2 border-black shadow-[2px_2px_0_#000] ${
                      isOwn
                        ? "bg-[#74C0FC] text-black rounded-br-none"
                        : "bg-[#FFF2AC] text-black rounded-bl-none"
                    }`}
                    style={{
                      width: "fit-content",
                      whiteSpace: "normal",
                      wordBreak: "break-word",
                    }}
                  >
                    {/* Ảnh đính kèm */}
                    {message.image && (
                      <img
                        src={message.image}
                        alt="Attachment"
                        className="rounded-lg mb-2 border-2 border-black max-w-full max-h-80 object-contain"
                        loading="lazy"
                      />
                    )}

                    {/* Văn bản */}
                    {message.text && (
                      <p className="font-medium text-[15px] leading-snug">
                        {message.text}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      <MessageInput />
    </div>
  );
};

export default ChatContainer;
