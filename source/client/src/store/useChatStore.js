import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";


export const useChatStore = create((set, get) => ({
  messages: [], // chứa tin nhắn cập nhật thời gian thực
  users: [],
  selectedUser: null, // show conversation between myUser with that user
  isUsersLoading: false, // show skeleton
  isMessagesLoading: false, // show skeleton
  // call api to get all users
  getUsers: async () => {
    set({ isUsersLoading: true })
    try {
      const res = await axiosInstance.get("/messages/users") // call api
      console.log("res:", res.data)
      set({ users: res.data }) // response contains list of users
    } catch (error) {
      toast.error(error.response.data.message) // display the notification
    } finally {
      set({ isUsersLoading: false }) // process is done
    }
  },
  
  setSelectedUser: (selectedUser) => set({ selectedUser }),
}))