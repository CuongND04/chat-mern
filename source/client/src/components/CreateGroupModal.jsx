import React, { useRef, useState } from "react";
import { Camera, Users } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useGroupStore } from "../store/useGroupStore";
import toast from "react-hot-toast";
import ModalShell from "./ui/ModalShell";
import Panel from "./ui/Panel";

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
    reader.onloadend = () => setSelectedImage(reader.result);
    reader.readAsDataURL(file);
  };

  const toggleMember = (userId) => {
    setSelectedMembers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const resetForm = () => {
    setGroupName("");
    setGroupDescription("");
    setSelectedImage(null);
    setSelectedMembers([]);
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
      resetForm();
      onClose();
    } catch (error) {
      console.error("Failed to create group:", error);
    }
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={() => {
        resetForm();
        onClose();
      }}
      title="Create group"
      subtitle="Start a shared conversation space for projects, classes, or teams."
      icon={Users}
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="secondary-button min-h-10 px-4 text-[12px] font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="create-group-form"
            className="primary-button min-h-10 px-4 text-[12px] font-medium"
          >
            Create group
          </button>
        </div>
      }
    >
      <form id="create-group-form" onSubmit={handleSubmit} className="space-y-5">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-[color:var(--surface-2)]">
              {selectedImage ? (
                <img src={selectedImage} alt="Group preview" className="h-full w-full object-cover" />
              ) : (
                <Users className="h-8 w-8 text-[color:var(--text-muted)]" />
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="secondary-button absolute bottom-0 right-0 h-9 w-9 rounded-full p-0"
              aria-label="Upload group picture"
            >
              <Camera className="h-4 w-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>
          <p className="text-[12px] font-medium text-[color:var(--text-muted)]">Optional group cover</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-[12px] font-medium text-[color:var(--text-strong)]">
              Group name
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Design review team"
              className="input-base"
              maxLength={50}
            />
          </div>

          <div>
            <label className="mb-2 block text-[12px] font-medium text-[color:var(--text-strong)]">
              Description
            </label>
            <textarea
              value={groupDescription}
              onChange={(e) => setGroupDescription(e.target.value)}
              placeholder="Context or purpose for this room"
              className="input-base min-h-[110px] resize-none"
              maxLength={200}
            />
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <label className="text-[12px] font-medium text-[color:var(--text-strong)]">Members</label>
            <span className="text-[12px] text-[color:var(--text-muted)]">{selectedMembers.length} selected</span>
          </div>
          <Panel className="scrollbar-subtle max-h-72 space-y-2 overflow-y-auto bg-[color:var(--surface-2)] p-2">
            {users.map((user) => {
              const isSelected = selectedMembers.includes(user._id);
              return (
                <button
                  key={user._id}
                  type="button"
                  onClick={() => toggleMember(user._id)}
                  className={`flex w-full items-center gap-3 rounded-[var(--radius-md)] border px-3 py-3 text-left transition ${
                    isSelected
                      ? "border-[color:var(--brand-100)] bg-[color:var(--brand-50)]"
                      : "border-transparent bg-white hover:border-[color:var(--border-soft)]"
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
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-[color:var(--text-strong)]">
                    {user.fullName}
                  </span>
                </button>
              );
            })}
          </Panel>
        </div>
      </form>
    </ModalShell>
  );
};

export default CreateGroupModal;
