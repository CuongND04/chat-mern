import { X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser, typingUsers } = useChatStore();
  const { onlineUsers } = useAuthStore();

  // ✅ THÊM: Kiểm tra user đang gõ
  const isUserTyping = typingUsers.has(selectedUser._id);

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="relative">
            <img
              src={selectedUser.profilePic || "/statics/10.jpg"}
              alt={selectedUser.fullName}
              className="w-10 h-10 object-cover rounded-full border-2 border-black"
            />
            {onlineUsers.includes(selectedUser._id) && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-black rounded-full" />
            )}
          </div>

          {/* User info */}
          <div>
            <h3 className="font-medium">{selectedUser.fullName}</h3>
            {/* ✅ THÊM: Hiển thị typing hoặc online status */}
            <p className="text-sm text-base-content/70">
              {isUserTyping ? (
                <span className="text-blue-500 font-semibold flex items-center gap-1">
                  <span className="animate-pulse">đang gõ</span>
                  <span className="flex gap-0.5">
                    <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"></span>
                    <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                  </span>
                </span>
              ) : onlineUsers.includes(selectedUser._id) ? (
                "Online"
              ) : (
                "Offline"
              )}
            </p>
          </div>
        </div>

        {/* Close button */}
        <button onClick={() => setSelectedUser(null)}>
          <X />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;