import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useGroupStore = create((set, get) => ({
  groups: [],
  selectedGroup: null,
  groupMessages: [],
  isGroupsLoading: false,
  isGroupMessagesLoading: false,
  groupTypingUsers: {}, // { groupId: Set([userId1, userId2, ...]) }

  // Lấy danh sách groups
  getGroups: async () => {
    set({ isGroupsLoading: true });
    try {
      const res = await axiosInstance.get("/groups");
      set({ groups: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load groups");
    } finally {
      set({ isGroupsLoading: false });
    }
  },

  // Tạo group mới
  createGroup: async (groupData) => {
    try {
      const res = await axiosInstance.post("/groups/create", groupData);
      set((state) => ({ groups: [res.data, ...state.groups] }));
      toast.success("Group created successfully");
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create group");
      throw error;
    }
  },

  // Lấy messages của group
  getGroupMessages: async (groupId) => {
    set({ isGroupMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/groups/${groupId}/messages`);
      set({ groupMessages: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load messages");
    } finally {
      set({ isGroupMessagesLoading: false });
    }
  },

  // Gửi message trong group
  sendGroupMessage: async (groupId, messageData) => {
    try {
      const res = await axiosInstance.post(
        `/groups/${groupId}/send`,
        messageData
      );

      // ✅ Kiểm tra xem tin nhắn đã tồn tại chưa trước khi thêm
      const state = get();
      const messageExists = state.groupMessages.some(
        (msg) => msg._id === res.data._id
      );

      if (!messageExists) {
        set((state) => ({
          groupMessages: [...state.groupMessages, res.data],
        }));
        console.log("✅ Own group message added to state:", res.data._id);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  },

  // Đánh dấu đã đọc
  markGroupMessagesAsRead: async (groupId) => {
    try {
      // Update UI trước
      const userId = useAuthStore.getState().authUser._id;

      set((state) => ({
        groupMessages: state.groupMessages.map((msg) => {
          if (!msg.readBy.includes(userId)) {
            return { ...msg, readBy: [...msg.readBy, userId] };
          }
          return msg;
        }),
        groups: state.groups.map((group) => {
          if (group._id === groupId) {
            return { ...group, unreadCount: 0 };
          }
          return group;
        }),
      }));

      // Call API
      await axiosInstance.put(`/groups/${groupId}/read`);
    } catch (error) {
      console.error("Failed to mark messages as read:", error);
    }
  },

  // Subscribe to group messages
  subscribeToGroupMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    const { selectedGroup } = get();

    // ✅ QUAN TRỌNG: Unsubscribe trước để tránh duplicate listeners
    socket.off("newGroupMessage");
    socket.off("groupUserTyping");
    socket.off("newGroup");
    socket.off("groupUpdated");
    socket.off("removedFromGroup");
    socket.off("memberLeftGroup");

    // Listen for new group messages
    socket.on("newGroupMessage", ({ groupId, message }) => {
      const currentSelectedGroup = get().selectedGroup;
      const myUserId = useAuthStore.getState().authUser._id;

      // Nếu đang xem group này -> thêm message vào
      if (currentSelectedGroup && currentSelectedGroup._id === groupId) {
        // ✅ Kiểm tra xem tin nhắn đã tồn tại chưa (tránh duplicate)
        const messageExists = get().groupMessages.some(
          (msg) => msg._id === message._id
        );
        if (messageExists) {
          console.log(
            "⚠️ Group message already exists, skipping:",
            message._id
          );
          return;
        }

        // ✅ Nếu là tin nhắn của chính mình từ socket, skip (vì đã thêm từ API response)
        if (
          message.senderId._id === myUserId ||
          message.senderId === myUserId
        ) {
          console.log("⚠️ Own message from socket, skipping:", message._id);
          return;
        }

        set((state) => ({
          groupMessages: [...state.groupMessages, message],
        }));

        // Auto mark as read
        get().markGroupMessagesAsRead(groupId);
      } else {
        // Không xem group này -> tăng unread count
        set((state) => ({
          groups: state.groups.map((group) => {
            if (group._id === groupId) {
              return {
                ...group,
                unreadCount: (group.unreadCount || 0) + 1,
                lastMessage: message,
              };
            }
            return group;
          }),
        }));
      }
    });

    // ✅ THÊM: Listen for group typing events
    socket.on("groupUserTyping", ({ groupId, userId, isTyping }) => {
      console.log("👥 Group user typing event:", { groupId, userId, isTyping });
      const currentSelectedGroup = get().selectedGroup;
      const myUserId = useAuthStore.getState().authUser._id;

      // Chỉ cập nhật nếu đang xem group này và không phải chính mình
      if (currentSelectedGroup?._id === groupId && userId !== myUserId) {
        if (isTyping) {
          get().setGroupUserTyping(groupId, userId);
        } else {
          get().setGroupUserStoppedTyping(groupId, userId);
        }
      }
    });

    // Listen for new group created
    socket.on("newGroup", (newGroup) => {
      set((state) => ({
        groups: [newGroup, ...state.groups],
      }));
      toast.success(`You've been added to group: ${newGroup.name}`);
    });

    // Listen for group updates
    socket.on("groupUpdated", (updatedGroup) => {
      set((state) => ({
        groups: state.groups.map((g) =>
          g._id === updatedGroup._id ? updatedGroup : g
        ),
      }));

      // Update selected group if it's the one being updated
      if (get().selectedGroup?._id === updatedGroup._id) {
        set({ selectedGroup: updatedGroup });
      }
    });

    // Listen for being removed from group
    socket.on("removedFromGroup", (groupId) => {
      set((state) => ({
        groups: state.groups.filter((g) => g._id !== groupId),
      }));

      if (get().selectedGroup?._id === groupId) {
        set({ selectedGroup: null, groupMessages: [] });
      }

      toast.error("You've been removed from a group");
    });

    // Listen for member leaving
    socket.on("memberLeftGroup", ({ groupId, userId }) => {
      // Update group members list
      set((state) => ({
        groups: state.groups.map((g) => {
          if (g._id === groupId) {
            return {
              ...g,
              members: g.members.filter((m) => m._id !== userId),
            };
          }
          return g;
        }),
      }));
    });
  },

  unsubscribeFromGroupMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newGroupMessage");
    socket.off("groupUserTyping");
    socket.off("newGroup");
    socket.off("groupUpdated");
    socket.off("removedFromGroup");
    socket.off("memberLeftGroup");
  },

  // ✅ THÊM: Set user typing in group
  setGroupUserTyping: (groupId, userId) => {
    set((state) => {
      const newGroupTypingUsers = { ...state.groupTypingUsers };
      if (!newGroupTypingUsers[groupId]) {
        newGroupTypingUsers[groupId] = new Set();
      }
      newGroupTypingUsers[groupId].add(userId);
      return { groupTypingUsers: newGroupTypingUsers };
    });
  },

  // ✅ THÊM: Set user stopped typing in group
  setGroupUserStoppedTyping: (groupId, userId) => {
    set((state) => {
      const newGroupTypingUsers = { ...state.groupTypingUsers };
      if (newGroupTypingUsers[groupId]) {
        newGroupTypingUsers[groupId].delete(userId);
      }
      return { groupTypingUsers: newGroupTypingUsers };
    });
  },

  // Set selected group
  setSelectedGroup: (group) => {
    set({ selectedGroup: group, groupMessages: [] });

    // Clear typing users cho group cũ
    if (get().selectedGroup) {
      const oldGroupId = get().selectedGroup._id;
      set((state) => {
        const newGroupTypingUsers = { ...state.groupTypingUsers };
        delete newGroupTypingUsers[oldGroupId];
        return { groupTypingUsers: newGroupTypingUsers };
      });
    }

    if (group) {
      get().markGroupMessagesAsRead(group._id);
    }
  },

  // Add members to group
  addMembersToGroup: async (groupId, memberIds) => {
    try {
      const res = await axiosInstance.post(`/groups/${groupId}/members`, {
        memberIds,
      });

      set((state) => ({
        groups: state.groups.map((g) => (g._id === groupId ? res.data : g)),
      }));

      if (get().selectedGroup?._id === groupId) {
        set({ selectedGroup: res.data });
      }

      // toast.success("Members added successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add members");
    }
  },

  // Remove member from group
  removeMemberFromGroup: async (groupId, memberId) => {
    try {
      const res = await axiosInstance.delete(
        `/groups/${groupId}/members/${memberId}`
      );

      set((state) => ({
        groups: state.groups.map((g) => (g._id === groupId ? res.data : g)),
      }));

      if (get().selectedGroup?._id === groupId) {
        set({ selectedGroup: res.data });
      }

      // toast.success("Member removed successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove member");
    }
  },

  // Update group info
  updateGroupInfo: async (groupId, data) => {
    try {
      const res = await axiosInstance.put(`/groups/${groupId}`, data);

      set((state) => ({
        groups: state.groups.map((g) => (g._id === groupId ? res.data : g)),
      }));

      if (get().selectedGroup?._id === groupId) {
        set({ selectedGroup: res.data });
      }

      toast.success("Group updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update group");
    }
  },

  // Leave group
  leaveGroup: async (groupId) => {
    try {
      await axiosInstance.post(`/groups/${groupId}/leave`);

      set((state) => ({
        groups: state.groups.filter((g) => g._id !== groupId),
      }));

      if (get().selectedGroup?._id === groupId) {
        set({ selectedGroup: null, groupMessages: [] });
      }

      toast.success("Left group successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to leave group");
    }
  },
}));
