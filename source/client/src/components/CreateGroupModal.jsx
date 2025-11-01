import React, { useState, useRef } from "react";
import { X, Camera, Users } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useGroupStore } from "../store/useGroupStore";
import toast from "react-hot-toast";

const CreateGroupModal = ({ isOpen, onClose }) => {
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const fileInputRef = useRef(null);

  const { users } = useChatStore();
  const { createGroup } = useGroupStore();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const toggleMember = (userId) => {
    setSelectedMembers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!groupName.trim()) {
      toast.error("Group name is required");
      return;
    }

    if (selectedMembers.length === 0) {
      toast.error("Please select at least one member");
      return;
    }

    try {
      await createGroup({
        name: groupName,
        description: groupDescription,
        memberIds: selectedMembers,
        groupPic: selectedImage,
      });

      // Reset form
      setGroupName("");
      setGroupDescription("");
      setSelectedImage(null);
      setSelectedMembers([]);
      onClose();
    } catch (error) {
      console.error("Failed to create group:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[10000] flex items-start justify-center px-4 pt-20 pb-8">
      <div className="bg-[#FDFCF5] border-4 border-black rounded-2xl shadow-[8px_8px_0_#000] max-w-lg w-full max-h-[85vh] overflow-y-auto relative">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b-4 border-black bg-[#FFD43B]">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-[#74C0FC] border-3 border-black rounded-full flex items-center justify-center">
              <Users size={18} className="text-black" />
            </div>
            <h2 className="text-lg font-black text-black">Create New Group</h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 bg-red-500 border-3 border-black rounded-lg flex items-center justify-center shadow-[2px_2px_0_#000] hover:translate-y-[1px] hover:shadow-none transition-all"
          >
            <X size={14} className="text-white" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Group Picture */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-3 border-black bg-[#FFD43B] overflow-hidden shadow-[3px_3px_0_#000]">
                {selectedImage ? (
                  <img
                    src={selectedImage}
                    alt="Group"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Users size={36} className="text-black" />
                  </div>
                )}
              </div>
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
            </div>
          </div>

          {/* Group Name */}
          <div>
            <label className="block text-xs font-bold text-black mb-1">
              Group Name *
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name"
              className="w-full px-3 py-2 border-2 border-black rounded-lg shadow-[2px_2px_0_#000] focus:outline-none focus:translate-y-[1px] focus:shadow-[1px_1px_0_#000] transition-all font-medium text-sm"
              maxLength={50}
            />
          </div>

          {/* Group Description */}
          <div>
            <label className="block text-xs font-bold text-black mb-1">
              Description (Optional)
            </label>
            <textarea
              value={groupDescription}
              onChange={(e) => setGroupDescription(e.target.value)}
              placeholder="What's this group about?"
              className="w-full px-3 py-2 border-2 border-black rounded-lg shadow-[2px_2px_0_#000] focus:outline-none focus:translate-y-[1px] focus:shadow-[1px_1px_0_#000] transition-all font-medium resize-none text-sm"
              rows={2}
              maxLength={200}
            />
          </div>

          {/* Select Members */}
          <div>
            <label className="block text-xs font-bold text-black mb-2">
              Add Members * ({selectedMembers.length} selected)
            </label>
            <div className="max-h-48 overflow-y-auto border-2 border-black rounded-lg bg-white p-2 space-y-1">
              {users.map((user) => (
                <div
                  key={user._id}
                  onClick={() => toggleMember(user._id)}
                  className={`flex items-center gap-2 p-2 rounded-lg border-2 border-black cursor-pointer transition-all ${
                    selectedMembers.includes(user._id)
                      ? "bg-[#74C0FC] shadow-[1px_1px_0_#000]"
                      : "bg-white hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedMembers.includes(user._id)}
                    onChange={() => {}}
                    className="w-4 h-4 border-2 border-black rounded"
                  />
                  <img
                    src={user.profilePic || "/statics/10.jpg"}
                    alt={user.fullName}
                    className="w-8 h-8 rounded-full border-2 border-black object-cover"
                  />
                  <span className="font-semibold text-black flex-1 text-sm">
                    {user.fullName}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-300 border-2 border-black rounded-lg font-bold text-black text-sm shadow-[3px_3px_0_#000] hover:translate-y-[1px] hover:shadow-[2px_2px_0_#000] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-[#74C0FC] border-2 border-black rounded-lg font-bold text-black text-sm shadow-[3px_3px_0_#000] hover:translate-y-[1px] hover:shadow-[2px_2px_0_#000] transition-all"
            >
              Create Group
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupModal;
