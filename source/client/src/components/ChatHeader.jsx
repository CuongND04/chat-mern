import { X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser, typingUsers } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const isUserTyping = typingUsers.has(selectedUser._id);
  const isOnline = onlineUsers.includes(selectedUser._id);

  return (
    <div className="sticky top-0 z-10 border-b border-[color:var(--border-soft)] bg-white/96 px-4 py-3 backdrop-blur-md sm:px-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={selectedUser.profilePic || "/statics/10.jpg"}
              alt={selectedUser.fullName}
              className="h-11 w-11 rounded-full object-cover"
            />
            <span
              className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white ${
                isOnline ? "bg-[color:var(--success-500)]" : "bg-[color:var(--surface-3)]"
              }`}
            />
          </div>

          <div className="min-w-0">
            <h3 className="truncate text-[14px] font-semibold leading-5 text-[color:var(--text-strong)]">
              {selectedUser.fullName}
            </h3>
            <div className="flex min-h-4 items-center gap-2 text-[11px] font-medium text-[color:var(--text-muted)]">
              {isUserTyping ? (
                <>
                  <span className="text-[color:var(--brand-500)]">Typing</span>
                  <span className="flex items-center gap-1" aria-hidden="true">
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                  </span>
                </>
              ) : (
                <span>{isOnline ? "Online now" : "Offline"}</span>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={() => setSelectedUser(null)}
          className="icon-button ghost-button lg:hidden"
          aria-label="Close conversation"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
