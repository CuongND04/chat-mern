import React, { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, Loader2 } from "lucide-react";
import Panel from "../components/ui/Panel";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile, changePassword } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);
  const [formData, setFormData] = useState({
    fullName: authUser?.fullName || "",
    email: authUser?.email || "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
      await updateProfile({ profilePic: base64Image });
    };
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    await updateProfile({
      fullName: formData.fullName,
      email: formData.email,
    });
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      setIsChangingPassword(true);
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      console.error("Error changing password:", err);
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="min-h-screen px-4 pb-6 pt-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--text-faint)]">
            Account settings
          </p>
          <h1 className="mt-2 text-[24px] font-semibold leading-8 text-[color:var(--text-strong)]">
            Manage your profile
          </h1>
          <p className="mt-2 text-[13px] leading-6 text-[color:var(--text-muted)]">
            Update your identity, avatar, and password without leaving the application workspace.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          <Panel elevated className="p-6 sm:p-8">
            <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-left">
              <div className="relative">
                <img
                  src={selectedImg || authUser.profilePic || "/statics/10.jpg"}
                  alt="Profile"
                  className="h-28 w-28 rounded-full object-cover"
                />
                <label
                  htmlFor="avatar-upload"
                  className={`secondary-button absolute bottom-0 right-0 h-10 w-10 rounded-full p-0 ${
                    isUpdatingProfile ? "pointer-events-none opacity-60" : ""
                  }`}
                >
                  <Camera className="h-4 w-4" />
                  <input
                    type="file"
                    id="avatar-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUpdatingProfile}
                  />
                </label>
              </div>

              <div>
                <h2 className="text-[18px] font-semibold text-[color:var(--text-strong)]">
                  {authUser?.fullName}
                </h2>
                <p className="mt-2 text-sm leading-6 text-[color:var(--text-muted)]">
                  {isUpdatingProfile
                    ? "Uploading your new avatar..."
                    : "Use a clear profile photo and accurate contact details for a more polished workspace."}
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="mt-8 space-y-5">
              <div>
                <label className="mb-2 block text-[12px] font-medium text-[color:var(--text-strong)]">Full name</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Enter your full name"
                  className="input-base text-[13px]"
                />
              </div>

              <div>
                <label className="mb-2 block text-[12px] font-medium text-[color:var(--text-strong)]">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="you@example.com"
                  className="input-base text-[13px]"
                />
              </div>

              <button
                type="submit"
                disabled={isUpdatingProfile}
                className="primary-button min-h-10 px-4 text-[12px] font-medium disabled:cursor-not-allowed disabled:opacity-45"
              >
                {isUpdatingProfile ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save profile"
                )}
              </button>
            </form>
          </Panel>

          <Panel elevated className="p-6 sm:p-8">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[color:var(--text-faint)]">
                Security
              </p>
              <h2 className="mt-2 text-[18px] font-semibold text-[color:var(--text-strong)]">
                Change password
              </h2>
              <p className="mt-2 text-[13px] leading-6 text-[color:var(--text-muted)]">
                Keep your account secure with a new password whenever needed.
              </p>
            </div>

            <form onSubmit={handleChangePassword} className="mt-8 space-y-5">
              <div>
                <label className="mb-2 block text-[12px] font-medium text-[color:var(--text-strong)]">Current password</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  placeholder="Enter current password"
                  className="input-base text-[13px]"
                />
              </div>

              <div>
                <label className="mb-2 block text-[12px] font-medium text-[color:var(--text-strong)]">New password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  placeholder="Enter new password"
                  className="input-base text-[13px]"
                />
              </div>

              <div>
                <label className="mb-2 block text-[12px] font-medium text-[color:var(--text-strong)]">Confirm password</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  placeholder="Confirm new password"
                  className="input-base text-[13px]"
                />
              </div>

              <button
                type="submit"
                disabled={isChangingPassword}
                className="primary-button min-h-10 px-4 text-[12px] font-medium disabled:cursor-not-allowed disabled:opacity-45"
              >
                {isChangingPassword ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update password"
                )}
              </button>
            </form>
          </Panel>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
