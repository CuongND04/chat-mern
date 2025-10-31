import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [], // chứa tin nhắn cập nhật thời gian thực
  users: [],
  selectedUser: null, // show conversation between myUser with that user
  isUsersLoading: false, // show skeleton
  isMessagesLoading: false, // show skeleton
  typingUsers: new Set(), // Lưu danh sách userId đang typing

  // call api to get all users
  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      console.log("res:", res.data);
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  // call api to get conversation of userID
  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData
      );
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  // ✅ Hàm đánh dấu tin nhắn là đã đọc
  markMessagesAsRead: async (senderId) => {
    try {
      // ✅ 1. CẬP NHẬT STATE TRƯỚC (Optimistic UI Update)
      set(state => ({
        messages: state.messages.map(msg => {
          if (msg.senderId === senderId && !msg.read) {
            return { ...msg, read: true };
          }
          return msg;
        }),
        users: state.users.map(user => {
          if (user._id === senderId && user.unreadCount) {
            return { ...user, unreadCount: 0 };
          }
          return user;
        })
      }));

      // ✅ 2. SAU ĐÓ GỌI API (Server sẽ emit socket cho người gửi)
      await axiosInstance.put(`/messages/read/${senderId}`);

    } catch (error) {
      console.error("Failed to mark messages as read:", error);
      toast.error("Không thể đánh dấu đã đọc.");
      
      // ✅ 3. Rollback nếu API thất bại
      set(state => ({
        messages: state.messages.map(msg => {
          if (msg.senderId === senderId) {
            return { ...msg, read: false };
          }
          return msg;
        })
      }));
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;
    
    const socket = useAuthStore.getState().socket;

    // ✅ Subscribe to new messages
    socket.on("newMessage", (newMessage) => {
      const currentSelectedUser = get().selectedUser;
      const isMessageInCurrentChat = newMessage.senderId === currentSelectedUser?._id;
      
      // ✅ CẬP NHẬT UNREAD COUNT TRƯỚC
      if (!isMessageInCurrentChat) {
        // Tin nhắn từ người KHÔNG phải đang chat -> Tăng unreadCount
        set(state => ({
          users: state.users.map(user => {
            if (user._id === newMessage.senderId) {
              return { ...user, unreadCount: (user.unreadCount || 0) + 1 };
            }
            return user;
          })
        }));
        return; // Không thêm vào messages vì không phải chat hiện tại
      }

      // ✅ Nếu tin nhắn từ người đang chat
      // 1. Thêm tin nhắn vào messages
      set({ messages: [...get().messages, newMessage] });
      
      // 2. Đánh dấu đã đọc NGAY LẬP TỨC
      get().markMessagesAsRead(newMessage.senderId);
    });

    // ✅ Subscribe to update read status (Khi người khác đọc tin nhắn của mình)
    socket.on("message_seen_update", ({ senderId, receiverId }) => {
      const myUserId = useAuthStore.getState().authUser._id;
      const currentSelectedUser = get().selectedUser;
      
      // Chỉ cập nhật nếu người gửi (A) đang xem cuộc trò chuyện với người nhận (B)
      if (myUserId === senderId && receiverId === currentSelectedUser?._id) {
        set(state => ({
          messages: state.messages.map(msg => {
            // Cập nhật tất cả tin nhắn gửi đi trong chat hiện tại thành đã đọc
            if (msg.senderId === myUserId && !msg.read) {
              return { ...msg, read: true };
            }
            return msg;
          })
        }));
      }
    });
    
    // ✅ Subscribe to typing events
    socket.on("user-typing", ({ userId, isTyping }) => {
      const { setUserTyping, setUserStoppedTyping } = get();
      
      if (isTyping) {
        setUserTyping(userId);
      } else {
        setUserStoppedTyping(userId);
      }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
    socket.off("user-typing");
    socket.off("message_seen_update");
  },

  // ✅ Action để set user đang typing
  setUserTyping: (userId) => {
    set((state) => {
      const newTypingUsers = new Set(state.typingUsers);
      newTypingUsers.add(userId);
      return { typingUsers: newTypingUsers };
    });
  },

  // ✅ Action để set user dừng typing
  setUserStoppedTyping: (userId) => {
    set((state) => {
      const newTypingUsers = new Set(state.typingUsers);
      newTypingUsers.delete(userId);
      return { typingUsers: newTypingUsers };
    });
  },

  setSelectedUser: (selectedUser) => {
    // Clear typing users khi chuyển chat
    set({ selectedUser, typingUsers: new Set() });

    // ✅ Đánh dấu đã đọc khi mở cuộc trò chuyện
    if (selectedUser && selectedUser._id) {
      get().markMessagesAsRead(selectedUser._id);
    }
  },
}));