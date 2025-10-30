import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users } from "lucide-react";

const Sidebar = () => {
    const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } =
        useChatStore();
    const { onlineUsers } = useAuthStore();

    const [showOnlineOnly, setShowOnlineOnly] = useState(false);

    useEffect(() => {
        getUsers();
    }, [getUsers]);

    const filteredUsers = showOnlineOnly
        ? users.filter((user) => onlineUsers.includes(user._id))
        : users;

    if (isUsersLoading) return <SidebarSkeleton />;

    return (
        <aside className="h-full w-20 lg:w-72 border-r border-gray-200 bg-white flex flex-col transition-all duration-200">
            {/* Header */}
            <div className="border-b border-gray-200 w-full p-5">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-semibold text-gray-900 hidden lg:block">Contacts</span>
                </div>

                {/* Online filter toggle */}
                <div className="mt-4 hidden lg:flex items-center justify-between">
                    <label className="cursor-pointer flex items-center gap-2 group">
                        <div className="relative">
                            <input
                                type="checkbox"
                                checked={showOnlineOnly}
                                onChange={(e) => setShowOnlineOnly(e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-500 transition-colors"></div>
                            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
                        </div>
                        <span className="text-sm text-gray-700 font-medium">Show online only</span>
                    </label>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {onlineUsers.length - 1} online
                    </span>
                </div>
            </div>

            {/* Contacts List */}
            <div className="overflow-y-auto w-full py-2">
                {filteredUsers.map((user) => (
                    <button
                        key={user._id}
                        onClick={() => setSelectedUser(user)}
                        className={`
              w-full p-3 flex items-center gap-3
              hover:bg-gray-50 transition-all duration-200
              ${selectedUser?._id === user._id
                                ? "bg-blue-50 border-l-4 border-blue-500"
                                : "border-l-4 border-transparent"
                            }
            `}
                    >
                        <div className="relative mx-auto lg:mx-0">
                            <img
                                src={user.profilePic || "/statics/10.jpg"}
                                alt={user.name}
                                className="w-12 h-12 object-cover rounded-full ring-2 ring-gray-100"
                                onError={(e) => {
                                    e.target.src = "/statics/10.jpg";
                                }}
                            />
                            {onlineUsers.includes(user._id) && (
                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white"></span>
                            )}
                        </div>

                        {/* User info - only visible on larger screens */}
                        <div className="hidden lg:block text-left min-w-0 flex-1">
                            <div className="font-semibold text-gray-900 truncate">{user.fullName}</div>
                            <div className="text-sm flex items-center gap-1.5 mt-0.5">
                                <span className={`w-2 h-2 rounded-full ${onlineUsers.includes(user._id) ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                                <span className={onlineUsers.includes(user._id) ? 'text-green-600' : 'text-gray-500'}>
                                    {onlineUsers.includes(user._id) ? "Online" : "Offline"}
                                </span>
                            </div>
                        </div>
                    </button>
                ))}

                {filteredUsers.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                        <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-sm font-medium">No online users</p>
                    </div>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;