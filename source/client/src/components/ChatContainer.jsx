import React, { useEffect, useRef } from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import { useChatStore } from "../store/useChatStore";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";

const ChatContainer = () => {
  const { messages, getMessages, isMessagesLoading, selectedUser } =
    useChatStore();
  const { authUser } = useAuthStore();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (selectedUser?._id) getMessages(selectedUser._id);
  }, [selectedUser?._id, getMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
              className={`chat ${isOwn ? "chat-end" : "chat-start"}`}
            >
              <div className="chat-image avatar">
                <div className="size-10 rounded-full border-2 border-black bg-white">
                  <img
                    src={
                      isOwn
                        ? authUser.profilePic || "/statics/10.jpg"
                        : selectedUser.profilePic || "/statics/10.jpg"
                    }
                    alt="profile"
                    className="rounded-full"
                  />
                </div>
              </div>

              <div className="chat-header mb-1 text-xs font-semibold opacity-60">
                {formatMessageTime(message.createdAt)}
              </div>

              <div
                className={`chat-bubble px-4 py-2 rounded-xl border-2 border-black shadow-[2px_2px_0_#000] max-w-[70%] ${
                  isOwn
                    ? "bg-[#74C0FC] text-black rounded-br-none"
                    : "bg-[#FFF2AC] text-black rounded-bl-none"
                }`}
              >
                {message.image && (
                  <img
                    src={message.image}
                    alt="Attachment"
                    className="rounded-lg mb-2 border-2 border-black max-w-[250px]"
                  />
                )}
                {message.text && <p className="font-medium">{message.text}</p>}
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef}></div>
      </div>

      <MessageInput />
    </div>
  );
};

export default ChatContainer;
