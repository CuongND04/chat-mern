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
  
  // ✅ THÊM: State cho typing indicator
  typingUsers: new Set(), // Lưu danh sách userId đang typing

  // call api to get all users
  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users"); // call api
      console.log("res:", res.data);
      set({ users: res.data }); // response contains list of users
    } catch (error) {
      toast.error(error.response.data.message); // display the notification
    } finally {
      set({ isUsersLoading: false }); // process is done
    }
  },

  // call api to get conversation of userID
  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response.data.message); // display the notification
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      // Đối tượng messageData sẽ được gửi trong phần body của request.
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData
      );
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response.data.message); // display the notification
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;
    
    const socket = useAuthStore.getState().socket;

    // Subscribe to new messages
    socket.on("newMessage", (newMessage) => {
      // tránh hiển thị tin nhắn nhận bên những user khác
      // tin nhắn có được gửi từ selected user hay không
      if (newMessage.senderId !== selectedUser._id) return;

      // đây là spread, dùng để thêm phần tử mới nối tiếp vào mảng cũ
      set({ messages: [...get().messages, newMessage] });
    });

    // ✅ THÊM: Subscribe to typing events
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
    
    // ✅ THÊM: Unsubscribe from typing events
    socket.off("user-typing");
  },

  // ✅ THÊM: Action để set user đang typing
  setUserTyping: (userId) => {
    set((state) => {
      const newTypingUsers = new Set(state.typingUsers);
      newTypingUsers.add(userId);
      return { typingUsers: newTypingUsers };
    });
  },

  // ✅ THÊM: Action để set user dừng typing
  setUserStoppedTyping: (userId) => {
    set((state) => {
      const newTypingUsers = new Set(state.typingUsers);
      newTypingUsers.delete(userId);
      return { typingUsers: newTypingUsers };
    });
  },

  setSelectedUser: (selectedUser) => {
    // ✅ THÊM: Clear typing users khi chuyển chat
    set({ selectedUser, typingUsers: new Set() });
  },
}));