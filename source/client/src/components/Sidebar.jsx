import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useGroupStore } from "../store/useGroupStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users, UsersRound, Plus } from "lucide-react";
import CreateGroupModal from "./CreateGroupModal";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } =
    useChatStore();
  const { 
    groups, 
    getGroups, 
    selectedGroup, 
    setSelectedGroup, 
    isGroupsLoading,
    subscribeToGroupMessages,
    unsubscribeFromGroupMessages
  } = useGroupStore();
  const { onlineUsers } = useAuthStore();

  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [activeTab, setActiveTab] = useState("users"); // "users" or "groups"
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);

  useEffect(() => {
    getUsers();
    getGroups();
    subscribeToGroupMessages();
    
    return () => unsubscribeFromGroupMessages();
  }, [getUsers, getGroups, subscribeToGroupMessages, unsubscribeFromGroupMessages]);

  const filteredUsers = showOnlineOnly
    ? users.filter((u) => onlineUsers.includes(u._id))
    : users;

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <>
      <aside
        className="h-full w-20 lg:w-72 flex flex-col bg-[#FFE55E]
        border-r-4 border-black p-3 transition-all duration-200"
      >
        {/* Tab Switcher */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => {
              setActiveTab("users");
              setSelectedGroup(null);
            }}
            className={`flex-1 px-4 py-2 border-3 border-black rounded-lg font-bold transition-all shadow-[2px_2px_0_#000] hover:translate-y-[1px] hover:shadow-none ${
              activeTab === "users"
                ? "bg-[#74C0FC] text-black"
                : "bg-white text-black"
            }`}
          >
            <Users className="size-5 mx-auto lg:hidden" />
            <span className="hidden lg:inline">Chats</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("groups");
              setSelectedUser(null);
            }}
            className={`flex-1 px-4 py-2 border-3 border-black rounded-lg font-bold transition-all shadow-[2px_2px_0_#000] hover:translate-y-[1px] hover:shadow-none ${
              activeTab === "groups"
                ? "bg-[#74C0FC] text-black"
                : "bg-white text-black"
            }`}
          >
            <UsersRound className="size-5 mx-auto lg:hidden" />
            <span className="hidden lg:inline">Groups</span>
          </button>
        </div>

        {/* Users Tab */}
        {activeTab === "users" && (
          <>
            {/* Header */}
            <div
              className="border-b-4 border-black pb-3 mb-3 flex flex-col gap-2
              bg-white rounded-lg p-3 shadow-[3px_3px_0_#000]"
            >
              <div className="flex items-center gap-2">
                <Users className="size-6 text-black" />
                <span className="font-extrabold hidden lg:block text-black uppercase">
                  Contacts
                </span>
              </div>

              {/* Toggle */}
              <div className="hidden lg:flex items-center gap-2">
                <label className="cursor-pointer flex items-center gap-2 text-sm text-black">
                  <input
                    type="checkbox"
                    checked={showOnlineOnly}
                    onChange={(e) => setShowOnlineOnly(e.target.checked)}
                    className="accent-black size-4"
                  />
                  <span>Online only</span>
                </label>
                <span className="text-xs font-semibold">
                  ({Math.max(onlineUsers.length - 1, 0)} online)
                </span>
              </div>
            </div>

            {/* User list */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-2">
              {filteredUsers.map((user) => (
                <button
                  key={user._id}
                  onClick={() => setSelectedUser(user)}
                  className={`flex items-center justify-center lg:justify-start gap-3 w-full text-left 
          border-2 border-black rounded-lg px-2 py-2 bg-white shadow-[2px_2px_0_#000]
          hover:translate-y-[1px] hover:shadow-none transition-all
          ${selectedUser?._id === user._id ? "bg-blue-200" : "hover:bg-[#FFF2AC]"}`}
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={user.profilePic || "/statics/10.jpg"}
                      alt={user.name}
                      className="size-10 object-cover rounded-full border-2 border-black"
                    />
                    {onlineUsers.includes(user._id) && (
                      <span className="absolute bottom-0 right-0 size-3 bg-green-500 border-2 border-black rounded-full" />
                    )}
                  </div>

                  {/* Hiển thị chấm đỏ nếu có tin nhắn chưa đọc */}
                  <div className="hidden lg:block min-w-0 overflow-hidden flex-1">
                    <div className="font-bold truncate text-black flex justify-between items-center">
                      {user.fullName}
                      {(user.unreadCount || 0) > 0 && (
                        <span className="text-xs font-extrabold text-white bg-red-600 rounded-full size-5 flex items-center justify-center border-2 border-black">
                          {user.unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="text-xs">
                      {onlineUsers.includes(user._id) ? "Online" : "Offline"}
                    </div>
                  </div>
                </button>
              ))}

              {filteredUsers.length === 0 && (
                <div className="text-center font-semibold text-gray-600 py-4">
                  No online users
                </div>
              )}
            </div>
          </>
        )}

        {/* Groups Tab */}
        {activeTab === "groups" && (
          <>
            {/* Header */}
            <div
              className="border-b-4 border-black pb-3 mb-3 flex flex-col gap-2
              bg-white rounded-lg p-3 shadow-[3px_3px_0_#000]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UsersRound className="size-6 text-black" />
                  <span className="font-extrabold hidden lg:block text-black uppercase">
                    Groups
                  </span>
                </div>
                <button
                  onClick={() => setIsCreateGroupModalOpen(true)}
                  className="w-8 h-8 bg-[#74C0FC] border-2 border-black rounded-lg flex items-center justify-center shadow-[2px_2px_0_#000] hover:translate-y-[1px] hover:shadow-none transition-all"
                  title="Create Group"
                >
                  <Plus size={20} className="text-black" />
                </button>
              </div>
            </div>

            {/* Group list */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-2">
              {isGroupsLoading ? (
                <div className="text-center py-4">Loading groups...</div>
              ) : groups.length === 0 ? (
                <div className="text-center font-semibold text-gray-600 py-4">
                  <p>No groups yet</p>
                  <button
                    onClick={() => setIsCreateGroupModalOpen(true)}
                    className="mt-2 px-4 py-2 bg-[#74C0FC] border-2 border-black rounded-lg font-bold shadow-[2px_2px_0_#000] hover:translate-y-[1px] hover:shadow-none transition-all"
                  >
                    Create your first group
                  </button>
                </div>
              ) : (
                groups.map((group) => (
                  <button
                    key={group._id}
                    onClick={() => setSelectedGroup(group)}
                    className={`flex items-center justify-center lg:justify-start gap-3 w-full text-left 
            border-2 border-black rounded-lg px-2 py-2 bg-white shadow-[2px_2px_0_#000]
            hover:translate-y-[1px] hover:shadow-none transition-all
            ${selectedGroup?._id === group._id ? "bg-blue-200" : "hover:bg-[#FFF2AC]"}`}
                  >
                    <div className="relative flex-shrink-0">
                      <div className="size-10 rounded-full border-2 border-black bg-[#FFD43B] flex items-center justify-center overflow-hidden">
                        {group.groupPic ? (
                          <img
                            src={group.groupPic}
                            alt={group.name}
                            className="size-full object-cover"
                          />
                        ) : (
                          <UsersRound size={20} className="text-black" />
                        )}
                      </div>
                    </div>

                    <div className="hidden lg:block min-w-0 overflow-hidden flex-1">
                      <div className="font-bold truncate text-black flex justify-between items-center">
                        {group.name}
                        {(group.unreadCount || 0) > 0 && (
                          <span className="text-xs font-extrabold text-white bg-red-600 rounded-full size-5 flex items-center justify-center border-2 border-black">
                            {group.unreadCount}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-600">
                        {group.members?.length || 0} members
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </>
        )}
      </aside>

      {/* Create Group Modal */}
      <CreateGroupModal
        isOpen={isCreateGroupModalOpen}
        onClose={() => setIsCreateGroupModalOpen(false)}
      />
    </>
  );
};

export default Sidebar;