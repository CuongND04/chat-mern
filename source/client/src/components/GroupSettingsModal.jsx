import React, { useRef, useState } from "react";
import { Camera, Crown, Edit3, LogOut, UserMinus, UserPlus, Users } from "lucide-react";
import { useGroupStore } from "../store/useGroupStore";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import toast from "react-hot-toast";
import ModalShell from "./ui/ModalShell";
import Panel from "./ui/Panel";
import EmptyState from "./ui/EmptyState";

const GroupSettingsModal = ({ isOpen, onClose, group }) => {
  const { authUser } = useAuthStore();
  const { users } = useChatStore();
  const { addMembersToGroup, removeMemberFromGroup, leaveGroup, updateGroupInfo } = useGroupStore();

  const [showAddMembers, setShowAddMembers] = useState(false);
  const [selectedNewMembers, setSelectedNewMembers] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editImage, setEditImage] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen || !group) return null;

  const isAdmin = group.admin._id === authUser._id;
  const availableUsers = users.filter((user) => !group.members.some((member) => member._id === user._id));

  const toggleNewMember = (userId) => {
    setSelectedNewMembers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleAddMembers = async () => {
    if (selectedNewMembers.length === 0) {
      toast.error("Please select at least one member");
      return;
    }

    setIsAdding(true);
    try {
      await addMembersToGroup(group._id, selectedNewMembers);
      setSelectedNewMembers([]);
      setShowAddMembers(false);
      toast.success(`Added ${selectedNewMembers.length} member(s)`);
    } catch (error) {
      console.error("Failed to add members:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const confirmToast = ({ title, description, confirmLabel, confirmClassName, onConfirm }) => {
    toast.custom((t) => (
      <div className="w-[min(92vw,360px)] rounded-[24px] border border-[color:var(--border-soft)] bg-white p-4 shadow-[var(--shadow-lg)]">
        <p className="text-[15px] font-semibold text-[color:var(--text-strong)]">{title}</p>
        <p className="mt-2 text-[13px] leading-6 text-[color:var(--text-muted)]">{description}</p>
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => toast.dismiss(t.id)}
            className="secondary-button min-h-10 px-4 text-sm font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={async () => {
              toast.dismiss(t.id);
              await onConfirm();
            }}
            className={`${confirmClassName} min-h-10 px-4 text-sm font-medium`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    ));
  };

  const handleRemoveMember = async (memberId, memberName) => {
    if (memberId === group.admin._id) {
      toast.error("Cannot remove admin from group");
      return;
    }

    confirmToast({
      title: "Remove member",
      description: `Remove ${memberName} from ${group.name}?`,
      confirmLabel: "Remove",
      confirmClassName: "danger-button",
      onConfirm: async () => {
        try {
          await removeMemberFromGroup(group._id, memberId);
          toast.success(`${memberName} has been removed`);
        } catch (error) {
          console.error("Failed to remove member:", error);
          toast.error("Failed to remove member");
        }
      },
    });
  };

  const handleLeaveGroup = async () => {
    if (isAdmin) {
      toast.error("Admin cannot leave the group. Transfer ownership first.");
      return;
    }

    confirmToast({
      title: "Leave group",
      description: `You will leave ${group.name} and stop receiving new messages from this room.`,
      confirmLabel: "Leave group",
      confirmClassName: "danger-button",
      onConfirm: async () => {
        try {
          await leaveGroup(group._id);
          onClose();
        } catch (error) {
          console.error("Failed to leave group:", error);
          toast.error("Failed to leave group");
        }
      },
    });
  };

  const handleStartEdit = () => {
    setEditName(group.name);
    setEditDescription(group.description || "");
    setEditImage(null);
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    setEditName("");
    setEditDescription("");
    setEditImage(null);
    setIsEditMode(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setEditImage(reader.result);
    reader.readAsDataURL(file);
  };

  const handleUpdateGroup = async () => {
    if (!editName.trim()) {
      toast.error("Group name is required");
      return;
    }

    setIsUpdating(true);
    try {
      await updateGroupInfo(group._id, {
        name: editName.trim(),
        description: editDescription.trim(),
        groupPic: editImage,
      });
      setIsEditMode(false);
      toast.success("Group updated successfully");
    } catch (error) {
      console.error("Failed to update group:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="Group settings"
      subtitle="Manage room details, members, and membership actions."
      icon={Users}
      className="max-w-4xl"
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <div>
            {!isAdmin && (
              <button
                type="button"
                onClick={handleLeaveGroup}
                className="danger-button min-h-10 px-4 text-[12px] font-medium"
              >
                <LogOut className="h-4 w-4" />
                Leave group
              </button>
            )}
          </div>
          <button type="button" onClick={onClose} className="secondary-button min-h-10 px-4 text-[12px] font-medium">
            Close
          </button>
        </div>
      }
    >
      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <Panel elevated className="p-5">
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-left">
            <div className="relative">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-[color:var(--surface-2)]">
                {isEditMode && editImage ? (
                  <img src={editImage} alt="Updated group" className="h-full w-full object-cover" />
                ) : group.groupPic ? (
                  <img src={group.groupPic} alt={group.name} className="h-full w-full object-cover" />
                ) : (
                  <Users className="h-8 w-8 text-[color:var(--text-muted)]" />
                )}
              </div>
              {isEditMode && (
                <>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="secondary-button absolute bottom-0 right-0 h-9 w-9 rounded-full p-0"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </>
              )}
            </div>

            <div className="min-w-0 flex-1">
              {isEditMode ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="input-base"
                    maxLength={50}
                  />
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="input-base min-h-[110px] resize-none"
                    maxLength={200}
                    placeholder="Describe the group"
                  />
                </div>
              ) : (
                <>
                  <h3 className="text-[18px] font-semibold leading-7 text-[color:var(--text-strong)]">{group.name}</h3>
                  <p className="mt-2 text-[13px] leading-6 text-[color:var(--text-muted)]">
                    {group.description || "No description added yet."}
                  </p>
                </>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-[color:var(--surface-2)] px-3 py-1 text-[12px] font-medium text-[color:var(--text-muted)]">
                  {group.members.length} members
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[color:var(--brand-50)] px-3 py-1 text-[12px] font-medium text-[color:var(--brand-500)]">
                  <Crown className="h-3.5 w-3.5" />
                  Admin: {group.admin.fullName}
                </span>
              </div>
            </div>
          </div>

          {isAdmin && (
            <div className="mt-5 border-t border-[color:var(--border-soft)] pt-5">
              {isEditMode ? (
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button type="button" onClick={handleCancelEdit} className="secondary-button min-h-10 px-4 text-[12px] font-medium">
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleUpdateGroup}
                    disabled={isUpdating}
                    className="primary-button min-h-10 px-4 text-[12px] font-medium disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    {isUpdating ? "Saving..." : "Save changes"}
                  </button>
                </div>
              ) : (
                <button type="button" onClick={handleStartEdit} className="secondary-button min-h-10 px-4 text-[12px] font-medium">
                  <Edit3 className="h-4 w-4" />
                  Edit group details
                </button>
              )}
            </div>
          )}
        </Panel>

        <div className="space-y-5">
          <Panel elevated className="p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h4 className="text-[15px] font-semibold text-[color:var(--text-strong)]">Members</h4>
                <p className="mt-1 text-[12px] text-[color:var(--text-muted)]">Review who is part of this room.</p>
              </div>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => setShowAddMembers((prev) => !prev)}
                  className="secondary-button min-h-9 px-3 text-[12px] font-medium"
                >
                  <UserPlus className="h-4 w-4" />
                  Add
                </button>
              )}
            </div>

            {showAddMembers && isAdmin && (
              <div className="mt-4 rounded-[var(--radius-lg)] bg-[color:var(--surface-2)] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-[12px] font-medium text-[color:var(--text-strong)]">Add new members</p>
                  <span className="text-[12px] text-[color:var(--text-muted)]">{selectedNewMembers.length} selected</span>
                </div>

                {availableUsers.length === 0 ? (
                  <EmptyState
                    compact
                    icon={Users}
                    title="No more members available"
                    description="Everyone in your contacts is already in this group."
                  />
                ) : (
                  <>
                    <div className="scrollbar-subtle max-h-48 space-y-2 overflow-y-auto">
                      {availableUsers.map((user) => {
                        const isSelected = selectedNewMembers.includes(user._id);
                        return (
                          <button
                            key={user._id}
                            type="button"
                            onClick={() => toggleNewMember(user._id)}
                            className={`flex w-full items-center gap-3 rounded-[var(--radius-md)] border px-3 py-3 text-left transition ${
                              isSelected
                                ? "border-[color:var(--brand-100)] bg-white"
                                : "border-transparent bg-white/70 hover:border-[color:var(--border-soft)]"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="h-4 w-4 rounded accent-[color:var(--brand-500)]"
                            />
                            <img
                              src={user.profilePic || "/statics/10.jpg"}
                              alt={user.fullName}
                              className="h-9 w-9 rounded-full object-cover"
                            />
                            <span className="min-w-0 flex-1 truncate text-sm font-medium text-[color:var(--text-strong)]">
                              {user.fullName}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    <div className="mt-4 flex gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddMembers(false);
                          setSelectedNewMembers([]);
                        }}
                        className="secondary-button min-h-10 px-4 text-[12px] font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleAddMembers}
                        disabled={selectedNewMembers.length === 0 || isAdding}
                        className="primary-button min-h-10 px-4 text-[12px] font-medium disabled:cursor-not-allowed disabled:opacity-45"
                      >
                        {isAdding ? "Adding..." : `Add ${selectedNewMembers.length || ""} member${selectedNewMembers.length === 1 ? "" : "s"}`}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="scrollbar-subtle mt-4 max-h-[340px] space-y-2 overflow-y-auto">
              {group.members.map((member) => (
                <div
                  key={member._id}
                  className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[color:var(--border-soft)] bg-[color:var(--surface-2)] px-3 py-3"
                >
                  <img
                    src={member.profilePic || "/statics/10.jpg"}
                    alt={member.fullName}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12px] font-medium text-[color:var(--text-strong)]">{member.fullName}</p>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {member._id === group.admin._id && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[color:var(--warning-500)]/12 px-2.5 py-1 text-[11px] font-medium text-[color:var(--warning-500)]">
                          <Crown className="h-3 w-3" />
                          Admin
                        </span>
                      )}
                      {member._id === authUser._id && (
                        <span className="rounded-full bg-[color:var(--brand-50)] px-2.5 py-1 text-[11px] font-medium text-[color:var(--brand-500)]">
                          You
                        </span>
                      )}
                    </div>
                  </div>
                  {isAdmin && member._id !== group.admin._id && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(member._id, member.fullName)}
                      className="icon-button ghost-button text-[color:var(--danger-500)]"
                      aria-label={`Remove ${member.fullName}`}
                    >
                      <UserMinus className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </ModalShell>
  );
};

export default GroupSettingsModal;
