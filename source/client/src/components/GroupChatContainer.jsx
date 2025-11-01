import React, { useEffect, useRef, useState } from "react";
import { useGroupStore } from "../store/useGroupStore";
import { useAuthStore } from "../store/useAuthStore";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import GroupSettingsModal from "./GroupSettingsModal";
import { formatMessageTime } from "../lib/utils";
import { UsersRound, Settings, Download, File } from "lucide-react";

const GroupChatContainer = () => {
  const {
    selectedGroup,
    groupMessages,
    getGroupMessages,
    isGroupMessagesLoading,
    sendGroupMessage,
    groupTypingUsers,
  } = useGroupStore();

  const { authUser, onlineUsers } = useAuthStore();
  const messagesEndRef = useRef(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    if (selectedGroup) {
      getGroupMessages(selectedGroup._id);
      
      // ✅ Join vào group room để nhận typing events
      const socket = useAuthStore.getState().socket;
      if (socket) {
        socket.emit("joinGroup", { groupId: selectedGroup._id });
      }

      // ✅ Cleanup: Leave group room khi unmount hoặc chuyển group
      return () => {
        if (socket) {
          socket.emit("leaveGroup", { groupId: selectedGroup._id });
        }
      };
    }
  }, [selectedGroup, getGroupMessages]);

  useEffect(() => {
    if (messagesEndRef.current && groupMessages) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [groupMessages]);

  // ✅ THÊM: Auto scroll khi có typing indicator trong group
  useEffect(() => {
    if (messagesEndRef.current && 
        selectedGroup && 
        groupTypingUsers[selectedGroup._id] && 
        groupTypingUsers[selectedGroup._id].size > 0) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [groupTypingUsers, selectedGroup]);

  const handleSendMessage = async (messageData) => {
    if (selectedGroup) {
      await sendGroupMessage(selectedGroup._id, messageData);
    }
  };

  // Helper functions cho file
  const formatFileSize = (bytes) => {
    if (!bytes) return "";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getFileIcon = (type) => {
    if (!type) return "📎";
    if (type.includes("pdf")) return "📄";
    if (type.includes("word") || type.includes("document")) return "📝";
    if (type.includes("excel") || type.includes("sheet")) return "📊";
    if (type.includes("zip")) return "🗜️";
    if (type.includes("text")) return "📃";
    return "📎";
  };

  const handleDownload = async (file) => {
    try {
      const response = await fetch(file.url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed:", error);
      window.open(file.url, "_blank");
    }
  };

  if (isGroupMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto bg-[#FDFCF5]">
        {/* Header */}
        <div className="border-b-4 border-black bg-[#FFD43B] p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full border-3 border-black bg-white flex items-center justify-center">
              {selectedGroup?.groupPic ? (
                <img
                  src={selectedGroup.groupPic}
                  alt={selectedGroup.name}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <UsersRound size={24} className="text-black" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-black text-xl text-black">
                {selectedGroup?.name}
              </h3>
              <p className="text-sm font-semibold text-gray-700">
                {selectedGroup?.members?.length || 0} members
              </p>
            </div>
          </div>
        </div>
        <MessageSkeleton />
        <MessageInput onSendMessage={handleSendMessage} />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto bg-[#FDFCF5]">
      {/* Header */}
      <div className="border-b-4 border-black bg-[#FFD43B] p-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full border-3 border-black bg-white overflow-hidden flex-shrink-0">
            {selectedGroup?.groupPic ? (
              <img
                src={selectedGroup.groupPic}
                alt={selectedGroup.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#74C0FC]">
                <UsersRound size={24} className="text-black" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-black text-xl text-black truncate">
              {selectedGroup?.name}
            </h3>
            <p className="text-sm font-semibold text-gray-700">
              {selectedGroup?.members?.length || 0} members
            </p>
          </div>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="w-10 h-10 bg-white border-3 border-black rounded-lg flex items-center justify-center shadow-[2px_2px_0_#000] hover:translate-y-[1px] hover:shadow-none transition-all"
            title="Group Settings"
          >
            <Settings size={20} className="text-black" />
          </button>
        </div>

        {/* Group Description */}
        {selectedGroup?.description && (
          <div className="mt-3 p-2 bg-white border-2 border-black rounded-lg">
            <p className="text-sm font-medium text-gray-700">
              {selectedGroup.description}
            </p>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {groupMessages.map((message) => {
          const isOwn = message.senderId._id === authUser?._id;

          return (
            <div key={message._id}>
              <div
                className={`flex w-full ${
                  isOwn ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex items-end gap-2 max-w-[70%] ${
                    isOwn ? "flex-row-reverse" : ""
                  }`}
                >
                  {/* Avatar với online status */}
                  <div className="relative w-10 h-10 rounded-full border-2 border-black bg-white overflow-hidden shrink-0">
                    <img
                      src={
                        message.senderId.profilePic || "/statics/10.jpg"
                      }
                      alt="profile"
                      className="w-full h-full object-cover"
                    />
                    {/* ✅ THÊM: Dấu xanh online */}
                    {onlineUsers.includes(message.senderId._id) && (
                      <span className="absolute bottom-0 right-0 size-3 bg-green-500 border-2 border-black rounded-full" />
                    )}
                  </div>

                  {/* Message Content */}
                  <div
                    className={`flex flex-col ${
                      isOwn ? "items-end" : "items-start"
                    }`}
                  >
                    {/* Sender name (nếu không phải mình) */}
                    {!isOwn && (
                      <span className="text-xs font-bold text-gray-600 mb-1">
                        {message.senderId.fullName}
                      </span>
                    )}

                    {/* Timestamp */}
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
                      {/* Image */}
                      {message.image && (
                        <img
                          src={message.image}
                          alt="Attachment"
                          className="rounded-lg mb-2 border-2 border-black max-w-full max-h-80 object-contain"
                          loading="lazy"
                        />
                      )}

                      {/* File */}
                      {message.file && (
                        <div className="border-2 border-black rounded-lg bg-white p-3 mb-2 max-w-xs">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-[#FFD43B] border-2 border-black rounded flex items-center justify-center text-2xl shrink-0">
                              {getFileIcon(message.file.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate text-black">
                                {message.file.name}
                              </p>
                              <p className="text-xs text-gray-600">
                                {formatFileSize(message.file.size)}
                              </p>
                            </div>
                            <button
                              onClick={() => handleDownload(message.file)}
                              className="w-9 h-9 flex items-center justify-center rounded-md border-2 border-black bg-[#74C0FC] shadow-[2px_2px_0_#000] hover:translate-y-[1px] hover:shadow-none transition-all shrink-0"
                            >
                              <Download size={16} />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Text */}
                      {message.text && (
                        <p className="font-medium text-[15px] leading-snug">
                          {message.text}
                        </p>
                      )}
                    </div>

                    {/* Read by count */}
                    {isOwn && message.readBy && message.readBy.length > 1 && (
                      <div className="text-xs font-semibold text-gray-500 mt-1">
                        Seen by {message.readBy.length - 1}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* ✅ THÊM: Group Typing Indicator */}
        {selectedGroup && 
         groupTypingUsers[selectedGroup._id] && 
         groupTypingUsers[selectedGroup._id].size > 0 && (
          <div className="flex w-full justify-start">
            <div className="flex items-end gap-2">
              {/* Avatar của người đầu tiên đang gõ */}
              {(() => {
                const typingUserIds = Array.from(groupTypingUsers[selectedGroup._id]);
                const firstTypingUser = selectedGroup.members.find(
                  m => typingUserIds.includes(m._id)
                );
                
                return (
                  <>
                    {/* Avatar với online status cho typing indicator */}
                    <div className="relative w-10 h-10 rounded-full border-2 border-black bg-white overflow-hidden shrink-0">
                      <img
                        src={firstTypingUser?.profilePic || "/statics/10.jpg"}
                        alt="profile"
                        className="w-full h-full object-cover"
                      />
                      {/* ✅ THÊM: Dấu xanh online */}
                      {firstTypingUser && onlineUsers.includes(firstTypingUser._id) && (
                        <span className="absolute bottom-0 right-0 size-3 bg-green-500 border-2 border-black rounded-full" />
                      )}
                    </div>

                    {/* Typing bubble với animation */}
                    <div className="flex flex-col items-start">
                      <div className="text-xs font-semibold opacity-60 mb-1">
                        {typingUserIds.length === 1 
                          ? `${firstTypingUser?.fullName || "Someone"} đang gõ...`
                          : `${typingUserIds.length} người đang gõ...`
                        }
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
                  </>
                );
              })()}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <MessageInput onSendMessage={handleSendMessage} />

      {/* Group Settings Modal */}
      <GroupSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        group={selectedGroup}
      />
    </div>
  );
};

export default GroupChatContainer;
