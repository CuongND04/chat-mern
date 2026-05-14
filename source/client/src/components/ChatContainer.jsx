import React, { useEffect, useMemo, useRef } from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import MessageBubble from "./chat/MessageBubble";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { formatDayLabel, groupMessagesByDay } from "../lib/utils";

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
  const { authUser } = useAuthStore();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    getMessages(selectedUser._id);
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, typingUsers, selectedUser]);

  const groupedMessages = useMemo(() => groupMessagesByDay(messages), [messages]);
  const lastMessageIndex = messages.length > 0 ? messages.length - 1 : -1;

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

  if (isMessagesLoading) {
    return (
      <div className="flex min-w-0 flex-1 flex-col bg-[color:var(--surface-1)]">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col bg-[color:var(--surface-1)]">
      <ChatHeader />

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
                const absoluteIndex = messages.findIndex((item) => item._id === message._id);
                const senderId =
                  typeof message.senderId === "object"
                    ? message.senderId?._id?.toString()
                    : message.senderId?.toString();
                const isOwn = senderId === authUser?._id?.toString();
                const isLastOutgoingMessage = isOwn && absoluteIndex === lastMessageIndex;
                const previousMessage = dayMessages[index - 1];
                const previousSenderId =
                  typeof previousMessage?.senderId === "object"
                    ? previousMessage?.senderId?._id?.toString()
                    : previousMessage?.senderId?.toString();
                const shouldShowAvatar = previousSenderId !== senderId;

                return (
                  <MessageBubble
                    key={message._id}
                    message={message}
                    isOwn={isOwn}
                    avatar={
                      isOwn
                        ? authUser?.profilePic || "/statics/10.jpg"
                        : selectedUser?.profilePic || "/statics/10.jpg"
                    }
                    senderName={isOwn ? authUser?.fullName : selectedUser?.fullName}
                    showSeen={isLastOutgoingMessage && message.read}
                    seenLabel="Seen"
                    onDownload={() => handleDownload(message.file)}
                    showAvatar={shouldShowAvatar}
                  />
                );
              })}
            </div>
          ))}

          {typingUsers.has(selectedUser?._id) && (
            <div className="flex w-full justify-start">
              <div className="flex max-w-[260px] items-end gap-3">
                <img
                  src={selectedUser?.profilePic || "/statics/10.jpg"}
                  alt={selectedUser?.fullName}
                  className="h-9 w-9 rounded-full object-cover"
                />
                <div>
                  <div className="rounded-[16px] rounded-bl-md border border-[color:var(--border-soft)] bg-[color:var(--surface-2)] px-3 py-2.5">
                    <div className="flex items-center gap-1.5" aria-label="Typing indicator">
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                    </div>
                  </div>
                  <p className="mt-1.5 px-1 text-[10px] font-medium text-[color:var(--text-faint)]">
                    Typing…
                  </p>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <MessageInput />
    </div>
  );
};

export default ChatContainer;
