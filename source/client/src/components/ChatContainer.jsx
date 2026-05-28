import React, { useEffect, useRef } from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import { useChatStore } from "../store/useChatStore";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import { File, Download } from "lucide-react";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    typingUsers,
  } = useChatStore();

  const { authUser, onlineUsers } = useAuthStore();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    getMessages(selectedUser._id);
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [
    selectedUser._id,
    getMessages,
    subscribeToMessages,
    unsubscribeFromMessages,
  ]);

  useEffect(() => {
    if (messagesEndRef.current && messages) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
    console.log("messages: ", messages);
  }, [messages]);

  // ✅ THÊM: Auto scroll khi có typing indicator
  useEffect(() => {
    if (messagesEndRef.current && typingUsers.has(selectedUser?._id)) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [typingUsers, selectedUser]);

  const lastMessageIndex = messages.length > 0 ? messages.length - 1 : -1;

  // ✅ THÊM: Helper functions cho file
  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (type) => {
    if (!type) return '📎';
    if (type.includes('pdf')) return '📄';
    if (type.includes('word') || type.includes('document')) return '📝';
    if (type.includes('excel') || type.includes('sheet')) return '📊';
    if (type.includes('zip')) return '🗜️';
    if (type.includes('text')) return '📃';
    return '📎';
  };

  const handleDownload = async (file) => {
    try {
      // Fetch file từ Cloudinary
      const response = await fetch(file.url);
      const blob = await response.blob();
      
      // Tạo URL từ blob
      const blobUrl = window.URL.createObjectURL(blob);
      
      // Tạo link download
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = file.name; // Đặt tên file với extension đúng
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback: Mở file trong tab mới
      window.open(file.url, '_blank');
    }
  };

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

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => {
          const senderId =
            typeof message.senderId === "object"
              ? message.senderId?._id?.toString()
              : message.senderId?.toString();
          const isOwn = senderId === authUser?._id?.toString();
          const isLastOutgoingMessage = isOwn && (index === lastMessageIndex);

          return (
            <div key={message._id}>
              <div
                className={`flex w-full ${
                  isOwn ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex items-end gap-2 ${
                    isOwn ? "flex-row-reverse" : ""
                  }`}
                >
                  {/* Avatar với online status */}
                  <div className="relative w-10 h-10 rounded-full border-2 border-black bg-white overflow-hidden shrink-0">
                    <img
                      src={
                        isOwn
                          ? authUser?.profilePic || "/statics/10.jpg"
                          : selectedUser?.profilePic || "/statics/10.jpg"
                      }
                      alt="profile"
                      className="w-full h-full object-cover"
                    />
                    {/* ✅ THÊM: Dấu xanh online cho người gửi */}
                    {!isOwn && onlineUsers.includes(selectedUser?._id) && (
                      <span className="absolute bottom-0 right-0 size-3 bg-green-500 border-2 border-black rounded-full" />
                    )}
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

                      {/* ✅ THÊM: File đính kèm */}
                      {message.file && (
                        <div className="border-2 border-black rounded-lg bg-white p-3 mb-2 max-w-xs">
                          <div className="flex items-center gap-3">
                            {/* File Icon */}
                            <div className="w-12 h-12 bg-[#FFD43B] border-2 border-black rounded flex items-center justify-center text-2xl shrink-0">
                              {getFileIcon(message.file.type)}
                            </div>

                            {/* File Info */}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate text-black">
                                {message.file.name}
                              </p>
                              <p className="text-xs text-gray-600">
                                {formatFileSize(message.file.size)}
                              </p>
                            </div>

                            {/* Download Button */}
                            <button
                              onClick={() => handleDownload(message.file)}
                              className="w-9 h-9 flex items-center justify-center rounded-md border-2 border-black bg-[#74C0FC] shadow-[2px_2px_0_#000] hover:translate-y-[1px] hover:shadow-none transition-all shrink-0"
                            >
                              <Download size={16} />
                            </button>
                          </div>
                        </div>
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

                {/* Logic hiển thị Đã Xem */}
                {isLastOutgoingMessage && message.read && (
                  <div className="text-xs font-semibold text-gray-500 mt-1 self-end">
                    Đã xem
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* ✅ THÊM: Typing Indicator - Hiển thị khi người dùng đang gõ */}
        {typingUsers.has(selectedUser?._id) && (
          <div className="flex w-full justify-start">
            <div className="flex items-end gap-2">
              {/* Avatar với online status */}
              <div className="relative w-10 h-10 rounded-full border-2 border-black bg-white overflow-hidden shrink-0">
                <img
                  src={selectedUser?.profilePic || "/statics/10.jpg"}
                  alt="profile"
                  className="w-full h-full object-cover"
                />
                {/* ✅ THÊM: Dấu xanh online */}
                {onlineUsers.includes(selectedUser?._id) && (
                  <span className="absolute bottom-0 right-0 size-3 bg-green-500 border-2 border-black rounded-full" />
                )}
              </div>

              {/* Typing bubble với animation */}
              <div className="flex flex-col items-start">
                <div className="text-xs font-semibold opacity-60 mb-1">
                  Đang gõ...
                </div>
                <div className="inline-flex items-center gap-1 px-4 py-3 rounded-xl border-2 border-black shadow-[2px_2px_0_#000] bg-[#FFF2AC] text-black rounded-bl-none">
                  {/* 3 dots animation giống Messenger */}
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-[#74C0FC] border border-black rounded-full animate-bounce" style={{ animationDelay: '0ms', animationDuration: '1s' }}></span>
                    <span className="w-2 h-2 bg-[#74C0FC] border border-black rounded-full animate-bounce" style={{ animationDelay: '150ms', animationDuration: '1s' }}></span>
                    <span className="w-2 h-2 bg-[#74C0FC] border border-black rounded-full animate-bounce" style={{ animationDelay: '300ms', animationDuration: '1s' }}></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <MessageInput />
    </div>
  );
};

export default ChatContainer;