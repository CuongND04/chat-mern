import { useEffect, useMemo, useState } from "react";
import { MessageSquareText, Plus, Search, Users, UsersRound } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useGroupStore } from "../store/useGroupStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import CreateGroupModal from "./CreateGroupModal";
import Panel from "./ui/Panel";
import EmptyState from "./ui/EmptyState";
import ConversationItem from "./chat/ConversationItem";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } = useChatStore();
  const {
    groups,
    getGroups,
    selectedGroup,
    setSelectedGroup,
    isGroupsLoading,
    subscribeToGroupMessages,
    unsubscribeFromGroupMessages,
  } = useGroupStore();
  const { onlineUsers } = useAuthStore();

  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [activeTab, setActiveTab] = useState("users");
  const [query, setQuery] = useState("");
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);

  useEffect(() => {
    getUsers();
    getGroups();
    subscribeToGroupMessages();
    return () => unsubscribeFromGroupMessages();
  }, [getUsers, getGroups, subscribeToGroupMessages, unsubscribeFromGroupMessages]);

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const base = showOnlineOnly ? users.filter((u) => onlineUsers.includes(u._id)) : users;
    if (!normalizedQuery) return base;
    return base.filter((user) => user.fullName.toLowerCase().includes(normalizedQuery));
  }, [users, query, showOnlineOnly, onlineUsers]);

  const filteredGroups = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return groups;
    return groups.filter((group) => group.name.toLowerCase().includes(normalizedQuery));
  }, [groups, query]);

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <>
      <aside className="flex h-full flex-col bg-[color:var(--surface-2)] px-3 py-3">
        <div className="space-y-3 border-b border-[color:var(--border-soft)] px-1 pb-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[color:var(--text-faint)]">
                Workspace
              </p>
              <h2 className="mt-1 text-[16px] font-semibold leading-6 text-[color:var(--text-strong)]">
                Messages
              </h2>
            </div>
            {activeTab === "groups" && (
              <button
                type="button"
                onClick={() => setIsCreateGroupModalOpen(true)}
                className="icon-button secondary-button"
                aria-label="Create group"
              >
                <Plus className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-1 rounded-[var(--radius-md)] bg-[color:var(--surface-3)] p-1">
            <button
              type="button"
              onClick={() => {
                setActiveTab("users");
                setSelectedGroup(null);
              }}
              className={`rounded-[10px] px-3 py-1.5 text-[12px] font-medium transition ${
                activeTab === "users"
                  ? "bg-[color:var(--surface-1)] text-[color:var(--text-strong)]"
                  : "text-[color:var(--text-muted)]"
              }`}
            >
              Chats
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("groups");
                setSelectedUser(null);
              }}
              className={`rounded-[10px] px-3 py-1.5 text-[12px] font-medium transition ${
                activeTab === "groups"
                  ? "bg-[color:var(--surface-1)] text-[color:var(--text-strong)]"
                  : "text-[color:var(--text-muted)]"
              }`}
            >
              Groups
            </button>
          </div>

          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[color:var(--text-faint)]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={activeTab === "users" ? "Search people" : "Search groups"}
              className="input-base pl-9 text-[13px]"
            />
          </label>

          {activeTab === "users" ? (
            <div className="flex items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[color:var(--border-soft)] bg-[color:var(--surface-1)] px-3 py-2.5">
              <div>
                <p className="text-[12px] font-medium text-[color:var(--text-strong)]">Online</p>
                <p className="text-[11px] text-[color:var(--text-muted)]">
                  {Math.max(onlineUsers.length - 1, 0)} available now
                </p>
              </div>
              <label className="inline-flex cursor-pointer items-center gap-2 text-[11px] font-medium text-[color:var(--text-muted)]">
                <input
                  type="checkbox"
                  checked={showOnlineOnly}
                  onChange={(e) => setShowOnlineOnly(e.target.checked)}
                  className="h-4 w-4 rounded accent-[color:var(--brand-500)]"
                />
                Online only
              </label>
            </div>
          ) : (
            <div className="rounded-[var(--radius-md)] border border-[color:var(--border-soft)] bg-[color:var(--surface-1)] px-3 py-2.5">
              <p className="text-[12px] font-medium text-[color:var(--text-strong)]">Group spaces</p>
              <p className="text-[11px] text-[color:var(--text-muted)]">
                Shared rooms for teams, study groups, and projects.
              </p>
            </div>
          )}
        </div>

        <div className="scrollbar-subtle flex-1 overflow-y-auto py-3 pr-1">
          <div className="space-y-1">
            {activeTab === "users" &&
              filteredUsers.map((user) => (
                <ConversationItem
                  key={user._id}
                  title={user.fullName}
                  subtitle={onlineUsers.includes(user._id) ? "Online now" : "Offline"}
                  unreadCount={user.unreadCount || 0}
                  active={selectedUser?._id === user._id}
                  avatar={user.profilePic || "/statics/10.jpg"}
                  isOnline={onlineUsers.includes(user._id)}
                  onClick={() => setSelectedUser(user)}
                />
              ))}

            {activeTab === "groups" &&
              filteredGroups.map((group) => (
                <ConversationItem
                  key={group._id}
                  title={group.name}
                  subtitle={`${group.members?.length || 0} members`}
                  unreadCount={group.unreadCount || 0}
                  active={selectedGroup?._id === group._id}
                  avatar={group.groupPic}
                  isGroup
                  onClick={() => setSelectedGroup(group)}
                />
              ))}

            {activeTab === "users" && filteredUsers.length === 0 && (
              <Panel className="bg-white/80">
                <EmptyState
                  icon={Users}
                  compact
                  title={showOnlineOnly ? "No one is online" : "No contacts found"}
                  description={
                    showOnlineOnly
                      ? "Disable the filter or wait for your contacts to come back."
                      : "Try a different name or create another account for testing."
                  }
                />
              </Panel>
            )}

            {activeTab === "groups" && !isGroupsLoading && filteredGroups.length === 0 && (
              <Panel className="bg-white/80">
                <EmptyState
                  icon={UsersRound}
                  compact
                  title="No groups yet"
                  description="Create a group to collaborate with multiple people."
                  action={
                    <button
                      type="button"
                      onClick={() => setIsCreateGroupModalOpen(true)}
                      className="primary-button min-h-9 px-3.5 text-[12px] font-medium"
                    >
                      <Plus className="h-4 w-4" />
                      Create group
                    </button>
                  }
                />
              </Panel>
            )}
          </div>
        </div>

        <div className="border-t border-[color:var(--border-soft)] pt-3">
          <Panel className="bg-white/80 p-3">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[color:var(--surface-3)] text-[color:var(--text-muted)]">
                <MessageSquareText className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[12px] font-medium text-[color:var(--text-strong)]">Realtime workspace</p>
                <p className="mt-1 text-[11px] leading-5 text-[color:var(--text-muted)]">
                  Presence, unread state and attachments stay visible without adding noise.
                </p>
              </div>
            </div>
          </Panel>
        </div>
      </aside>

      <CreateGroupModal
        isOpen={isCreateGroupModalOpen}
        onClose={() => setIsCreateGroupModalOpen(false)}
      />
    </>
  );
};

export default Sidebar;
