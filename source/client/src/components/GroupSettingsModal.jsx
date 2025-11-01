import React, { useState, useRef } from "react";
import {
  X,
  Users,
  Crown,
  UserPlus,
  LogOut,
  Edit,
  UserMinus,
  Camera,
} from "lucide-react";
import { useGroupStore } from "../store/useGroupStore";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import toast from "react-hot-toast";

const GroupSettingsModal = ({ isOpen, onClose, group }) => {
  const { authUser } = useAuthStore();
  const { users } = useChatStore();
  const {
    addMembersToGroup,
    removeMemberFromGroup,
    leaveGroup,
    updateGroupInfo,
  } = useGroupStore();

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

  // Lấy danh sách users chưa có trong group
  const availableUsers = users.filter(
    (user) => !group.members.some((member) => member._id === user._id)
  );

  // Toggle select new member
  const toggleNewMember = (userId) => {
    setSelectedNewMembers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  // Thêm members
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

  // Xóa member
  // import toast from "react-hot-toast";

  const handleRemoveMember = async (memberId, memberName) => {
    if (memberId === group.admin._id) {
      toast.error("Cannot remove admin from group");
      return;
    }

    toast.custom((t) => (
      <div className="bg-white border-4 border-black rounded-xl px-4 py-3 shadow-[3px_3px_0_#000]">
        <p className="font-bold mb-2 text-sm text-black">
          Remove <span className="text-red-600">{memberName}</span> from this
          group?
        </p>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await removeMemberFromGroup(group._id, memberId);
                toast.success(`${memberName} has been removed`);
              } catch (error) {
                console.error("Failed to remove member:", error);
                toast.error("Failed to remove member");
              }
            }}
            className="bg-[#FF6B6B] text-white border-2 border-black rounded-lg px-3 py-1 font-bold hover:translate-y-[1px] hover:shadow-none shadow-[2px_2px_0_#000]"
          >
            Remove
          </button>

          <button
            onClick={() => toast.dismiss(t.id)}
            className="bg-white border-2 border-black rounded-lg px-3 py-1 font-bold hover:translate-y-[1px] hover:shadow-none shadow-[2px_2px_0_#000]"
          >
            Cancel
          </button>
        </div>
      </div>
    ));
  };

  // Rời khỏi group
  // Rời khỏi group
  const handleLeaveGroup = async () => {
    if (isAdmin) {
      toast.error(
        "Admin cannot leave the group. Please transfer admin role first or delete the group."
      );
      return;
    }

    toast.custom((t) => (
      <div className="bg-white border-4 border-black rounded-xl px-4 py-3 shadow-[3px_3px_0_#000]">
        <p className="font-bold mb-2 text-sm text-black">
          Leave group <span className="text-blue-600">"{group.name}"</span>?
        </p>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await leaveGroup(group._id);
                onClose();
                // toast.success("You have left the group");
              } catch (error) {
                console.error("Failed to leave group:", error);
                toast.error("Failed to leave group");
              }
            }}
            className="bg-[#FF6B6B] text-white border-2 border-black rounded-lg px-3 py-1 font-bold hover:translate-y-[1px] hover:shadow-none shadow-[2px_2px_0_#000]"
          >
            Leave
          </button>

          <button
            onClick={() => toast.dismiss(t.id)}
            className="bg-white border-2 border-black rounded-lg px-3 py-1 font-bold hover:translate-y-[1px] hover:shadow-none shadow-[2px_2px_0_#000]"
          >
            Cancel
          </button>
        </div>
      </div>
    ));
  };

  // Bật chế độ edit
  const handleStartEdit = () => {
    setEditName(group.name);
    setEditDescription(group.description || "");
    setEditImage(null);
    setIsEditMode(true);
  };

  // Hủy edit
  const handleCancelEdit = () => {
    setEditName("");
    setEditDescription("");
    setEditImage(null);
    setIsEditMode(false);
  };

  // Xử lý chọn ảnh mới
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

  // Cập nhật thông tin group
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
    <div className="fixed inset-0 bg-black/50 z-[10000] flex items-start justify-center px-4 pt-20 pb-8">
      <div className="bg-[#FDFCF5] border-4 border-black rounded-2xl shadow-[8px_8px_0_#000] max-w-lg w-full max-h-[85vh] overflow-y-scroll scrollbar-hide relative">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-4 border-black bg-[#FFD43B]">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#74C0FC] border-3 border-black rounded-full flex items-center justify-center">
              <Users size={20} className="text-black" />
            </div>
            <h2 className="text-xl font-black text-black">Group Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-red-500 border-3 border-black rounded-lg flex items-center justify-center shadow-[2px_2px_0_#000] hover:translate-y-[1px] hover:shadow-none transition-all"
          >
            <X size={16} className="text-white" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          {/* Group Info Section */}
          <div className="bg-white border-2 border-black rounded-lg p-4 shadow-[2px_2px_0_#000]">
            {/* Edit Mode Header */}
            {isEditMode && (
              <div className="mb-3 p-2 bg-blue-100 border-2 border-blue-500 rounded-lg">
                <p className="text-xs font-bold text-blue-700">
                  ✏️ Edit Mode - Update group information
                </p>
              </div>
            )}

            {/* Group Picture */}
            <div className="flex flex-col items-center gap-3 mb-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-3 border-black bg-[#FFD43B] overflow-hidden shadow-[3px_3px_0_#000]">
                  {isEditMode && editImage ? (
                    <img
                      src={editImage}
                      alt="New group pic"
                      className="w-full h-full object-cover"
                    />
                  ) : group.groupPic ? (
                    <img
                      src={group.groupPic}
                      alt={group.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Users size={36} className="text-black" />
                    </div>
                  )}
                </div>
                {/* Change picture button (chỉ khi edit mode) */}
                {isEditMode && (
                  <>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 w-8 h-8 bg-[#74C0FC] border-2 border-black rounded-full flex items-center justify-center shadow-[2px_2px_0_#000] hover:translate-y-[1px] hover:shadow-[1px_1px_0_#000] transition-all"
                    >
                      <Camera size={16} className="text-black" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </>
                )}
              </div>
            </div>

            {/* Group Name */}
            <div className="mb-3">
              <label className="block text-xs font-bold text-gray-600 mb-1">
                GROUP NAME
              </label>
              {isEditMode ? (
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-black rounded-lg shadow-[2px_2px_0_#000] focus:outline-none font-bold text-base"
                  maxLength={50}
                />
              ) : (
                <p className="text-lg font-black text-black">{group.name}</p>
              )}
            </div>

            {/* Group Description */}
            <div className="mb-3">
              <label className="block text-xs font-bold text-gray-600 mb-1">
                DESCRIPTION
              </label>
              {isEditMode ? (
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-black rounded-lg shadow-[2px_2px_0_#000] focus:outline-none font-medium text-sm resize-none"
                  rows={2}
                  maxLength={200}
                  placeholder="Add a description..."
                />
              ) : (
                <p className="text-sm font-medium text-gray-700">
                  {group.description || "No description"}
                </p>
              )}
            </div>

            {/* Created by */}
            <div className="mb-3">
              <label className="block text-xs font-bold text-gray-600 mb-1">
                CREATED BY
              </label>
              <div className="flex items-center gap-2">
                <img
                  src={group.admin.profilePic || "/statics/10.jpg"}
                  alt={group.admin.fullName}
                  className="w-8 h-8 rounded-full border-2 border-black object-cover"
                />
                <span className="font-bold text-black text-sm">
                  {group.admin.fullName}
                </span>
                <Crown size={16} className="text-yellow-500" />
              </div>
            </div>

            {/* Member Count */}
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">
                MEMBERS ({group.members.length})
              </label>
            </div>

            {/* Edit/Update Buttons for Admin */}
            {isAdmin && (
              <div className="mt-4 pt-4 border-t-2 border-gray-200">
                {isEditMode ? (
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancelEdit}
                      className="flex-1 px-3 py-2 bg-gray-300 border-2 border-black rounded-lg font-bold text-sm shadow-[2px_2px_0_#000] hover:translate-y-[1px] hover:shadow-none transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpdateGroup}
                      disabled={isUpdating}
                      className="flex-1 px-3 py-2 bg-[#74C0FC] border-2 border-black rounded-lg font-bold text-sm shadow-[2px_2px_0_#000] hover:translate-y-[1px] hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUpdating ? "Updating..." : "Save Changes"}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleStartEdit}
                    className="w-full px-3 py-2 bg-[#FFD43B] border-2 border-black rounded-lg font-bold text-sm shadow-[2px_2px_0_#000] hover:translate-y-[1px] hover:shadow-none transition-all flex items-center justify-center gap-2"
                  >
                    <Edit size={16} />
                    Edit Group Info
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Members List */}
          <div className="bg-white border-2 border-black rounded-lg shadow-[2px_2px_0_#000]">
            <div className="p-3 border-b-2 border-black bg-[#FFF2AC] flex items-center justify-between">
              <h3 className="font-bold text-sm text-black">
                All Members ({group.members.length})
              </h3>
              {isAdmin && !showAddMembers && (
                <button
                  onClick={() => setShowAddMembers(true)}
                  className="px-3 py-1 bg-[#74C0FC] border-2 border-black rounded-lg font-bold text-xs shadow-[2px_2px_0_#000] hover:translate-y-[1px] hover:shadow-none transition-all flex items-center gap-1"
                >
                  <UserPlus size={14} />
                  Add
                </button>
              )}
            </div>

            {/* Add Members Section */}
            {showAddMembers && isAdmin && (
              <div className="p-3 border-b-2 border-black bg-blue-50">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-gray-700">
                    Select members to add ({selectedNewMembers.length} selected)
                  </p>
                  <button
                    onClick={() => {
                      setShowAddMembers(false);
                      setSelectedNewMembers([]);
                    }}
                    className="text-xs font-bold text-red-600 hover:underline"
                  >
                    Cancel
                  </button>
                </div>

                {availableUsers.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-2">
                    No more users to add
                  </p>
                ) : (
                  <>
                    <div className="max-h-32 overflow-y-auto space-y-1 mb-2">
                      {availableUsers.map((user) => (
                        <div
                          key={user._id}
                          onClick={() => toggleNewMember(user._id)}
                          className={`flex items-center gap-2 p-2 rounded-lg border-2 border-black cursor-pointer transition-all ${
                            selectedNewMembers.includes(user._id)
                              ? "bg-[#74C0FC] shadow-[1px_1px_0_#000]"
                              : "bg-white hover:bg-gray-50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedNewMembers.includes(user._id)}
                            onChange={() => {}}
                            className="w-4 h-4 border-2 border-black rounded"
                          />
                          <img
                            src={user.profilePic || "/statics/10.jpg"}
                            alt={user.fullName}
                            className="w-6 h-6 rounded-full border-2 border-black object-cover"
                          />
                          <span className="font-semibold text-black text-xs flex-1">
                            {user.fullName}
                          </span>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={handleAddMembers}
                      disabled={selectedNewMembers.length === 0 || isAdding}
                      className="w-full px-3 py-2 bg-[#74C0FC] border-2 border-black rounded-lg font-bold text-sm shadow-[2px_2px_0_#000] hover:translate-y-[1px] hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isAdding
                        ? "Adding..."
                        : `Add ${selectedNewMembers.length} Member(s)`}
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Current Members List */}
            <div className="max-h-48 overflow-y-auto p-2 space-y-1">
              {group.members.map((member) => (
                <div
                  key={member._id}
                  className="flex items-center gap-2 p-2 rounded-lg border-2 border-black bg-white hover:bg-gray-50 transition-all"
                >
                  <img
                    src={member.profilePic || "/statics/10.jpg"}
                    alt={member.fullName}
                    className="w-8 h-8 rounded-full border-2 border-black object-cover"
                  />
                  <span className="font-semibold text-black flex-1 text-sm">
                    {member.fullName}
                  </span>
                  {member._id === group.admin._id && (
                    <span className="text-xs font-bold bg-yellow-400 border-2 border-black px-2 py-1 rounded flex items-center gap-1">
                      <Crown size={12} />
                      Admin
                    </span>
                  )}
                  {member._id === authUser._id && (
                    <span className="text-xs font-bold bg-blue-400 border-2 border-black px-2 py-1 rounded">
                      You
                    </span>
                  )}
                  {/* Remove button (chỉ admin mới thấy và không thể remove chính mình nếu là admin) */}
                  {isAdmin && member._id !== group.admin._id && (
                    <button
                      onClick={() =>
                        handleRemoveMember(member._id, member.fullName)
                      }
                      className="w-7 h-7 bg-red-500 border-2 border-black rounded flex items-center justify-center shadow-[1px_1px_0_#000] hover:translate-y-[1px] hover:shadow-none transition-all"
                      title="Remove member"
                    >
                      <UserMinus size={14} className="text-white" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            {/* Leave Group Button (không hiển thị cho admin) */}
            {!isAdmin && (
              <button
                onClick={handleLeaveGroup}
                className="w-full px-4 py-2 bg-red-500 border-2 border-black rounded-lg font-bold text-white text-sm shadow-[3px_3px_0_#000] hover:translate-y-[1px] hover:shadow-[2px_2px_0_#000] transition-all flex items-center justify-center gap-2"
              >
                <LogOut size={16} />
                Leave Group
              </button>
            )}

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-gray-300 border-2 border-black rounded-lg font-bold text-black text-sm shadow-[3px_3px_0_#000] hover:translate-y-[1px] hover:shadow-[2px_2px_0_#000] transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupSettingsModal;
