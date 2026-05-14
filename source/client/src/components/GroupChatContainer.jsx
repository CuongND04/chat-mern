import React, { useEffect, useMemo, useRef, useState } from "react";
import { useGroupStore } from "../store/useGroupStore";
import { useAuthStore } from "../store/useAuthStore";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import GroupSettingsModal from "./GroupSettingsModal";
import GroupChatHeader from "./GroupChatHeader";
import MessageBubble from "./chat/MessageBubble";
import { formatDayLabel, groupMessagesByDay } from "../lib/utils";

const GroupChatContainer = () => {
  const {
    selectedGroup,
    groupMessages,
    getGroupMessages,
    isGroupMessagesLoading,
    sendGroupMessage,
    groupTypingUsers,
  } = useGroupStore();
  const { authUser } = useAuthStore();
  const messagesEndRef = useRef(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    if (selectedGroup) {
      getGroupMessages(selectedGroup._id);
      const socket = useAuthStore.getState().socket;
      if (socket) {
        socket.emit("joinGroup", { groupId: selectedGroup._id });
      }

      return () => {
        if (socket) {
          socket.emit("leaveGroup", { groupId: selectedGroup._id });
        }
      };
    }
  }, [selectedGroup, getGroupMessages]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [groupMessages, groupTypingUsers, selectedGroup]);

  const handleSendMessage = async (messageData) => {
    if (selectedGroup) {
      await sendGroupMessage(selectedGroup._id, messageData);
    }
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

  const groupedMessages = useMemo(() => groupMessagesByDay(groupMessages), [groupMessages]);
  const typingUserIds = selectedGroup ? Array.from(groupTypingUsers[selectedGroup._id] || []) : [];
  const firstTypingUser = selectedGroup?.members?.find((member) => typingUserIds.includes(member._id));
  const typingLabel =
    typingUserIds.length === 0
      ? null
      : typingUserIds.length === 1
        ? `${firstTypingUser?.fullName || "Someone"} is typing`
        : `${typingUserIds.length} people are typing`;

  if (isGroupMessagesLoading) {
    return (
      <div className="flex min-w-0 flex-1 flex-col bg-[color:var(--surface-1)]">
        <GroupChatHeader onOpenSettings={() => setIsSettingsOpen(true)} typingLabel={typingLabel} />
        <MessageSkeleton />
        <MessageInput onSendMessage={handleSendMessage} />
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col bg-[color:var(--surface-1)]">
      <GroupChatHeader onOpenSettings={() => setIsSettingsOpen(true)} typingLabel={typingLabel} />

      <div className="scrollbar-subtle flex-1 overflow-y-auto bg-[color:var(--surface-1)] px-4 py-4 sm:px-5">
        <div className="space-y-5">
          {Object.entries(groupedMessages).map(([dayKey, dayMessages]) => (
            <div key={dayKey} className="space-y-3">
              <div className="flex justify-center">
                <span className="rounded-full border border-[color:var(--border-soft)] bg-[color:var(--surface-2)] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.08em] text-[color:var(--text-faint)]">
                  {formatDayLabel(dayMessages[0].createdAt)}
                </span>
              </div>

              {dayMessages.map((message, index) => {
                const senderId = message.senderId._id;
                const isOwn = senderId === authUser?._id;
                const previousMessage = dayMessages[index - 1];
                const previousSenderId = previousMessage?.senderId?._id;
                const showAvatar = previousSenderId !== senderId;

                return (
                  <MessageBubble
                    key={message._id}
                    message={message}
                    isOwn={isOwn}
                    avatar={message.senderId.profilePic || "/statics/10.jpg"}
                    senderName={message.senderId.fullName}
                    showSender={!isOwn && showAvatar}
                    showAvatar={showAvatar}
                    showSeen={isOwn && message.readBy && message.readBy.length > 1}
                    seenLabel={`Seen by ${message.readBy.length - 1}`}
                    onDownload={() => handleDownload(message.file)}
                  />
                );
              })}
            </div>
          ))}

          {typingUserIds.length > 0 && (
            <div className="flex w-full justify-start">
              <div className="flex max-w-[320px] items-end gap-3">
                <img
                  src={firstTypingUser?.profilePic || "/statics/10.jpg"}
                  alt={firstTypingUser?.fullName || "Typing user"}
                  className="h-9 w-9 rounded-full object-cover"
                />
                <div>
                  <div className="rounded-[16px] rounded-bl-md border border-[color:var(--border-soft)] bg-[color:var(--surface-2)] px-3 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                    </div>
                  </div>
                  <p className="mt-1.5 px-1 text-[10px] font-medium text-[color:var(--text-faint)]">
                    {typingLabel}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <MessageInput onSendMessage={handleSendMessage} />

      <GroupSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        group={selectedGroup}
      />
    </div>
  );
};

export default GroupChatContainer;
