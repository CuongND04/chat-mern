import React, { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, Mail, User, Lock, Loader2 } from "lucide-react";

const ProfilePage = () => {
  const {
    authUser,
    isUpdatingProfile,
    updateProfile,
    changePassword, // ✅ lấy thêm hàm riêng
  } = useAuthStore();

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

  // =============================
  // Upload Avatar
  // =============================
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

  // =============================
  // Save Profile Info
  // =============================
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    await updateProfile({
      fullName: formData.fullName,
      email: formData.email,
    });
  };

  // =============================
  // Change Password (dùng store riêng)
  // =============================
  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("❌ Passwords do not match!");
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
    <div className="min-h-screen bg-[#FDFCF5] text-black flex items-center justify-center py-10 pt-20">
      <div
        className="
          w-[1000px] h-[550px] bg-white border-4 border-black rounded-2xl 
          shadow-[5px_5px_0_#000] flex overflow-hidden
        "
      >
        {/* LEFT SIDE */}
        <div className="w-1/2 flex flex-col items-center justify-center bg-[#FFF2AC] border-r-4 border-black p-6">
          {/* Avatar */}
          <div className="relative mb-4">
            <img
              src={selectedImg || authUser.profilePic || "/statics/10.jpg"}
              alt="Profile"
              className="w-36 h-36 rounded-full object-cover border-4 border-black shadow-[3px_3px_0_#000]"
            />
            <label
              htmlFor="avatar-upload"
              className={`
                absolute bottom-0 right-0 bg-yellow-300 border-2 border-black 
                p-2 rounded-full cursor-pointer shadow-[2px_2px_0_#000]
                hover:translate-y-[1px] hover:shadow-none transition-all
                ${isUpdatingProfile ? "animate-pulse pointer-events-none" : ""}
              `}
            >
              <Camera className="w-5 h-5 text-black" />
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

          <h1 className="text-2xl font-extrabold uppercase mb-2">PROFILE</h1>
          <p className="text-gray-700 text-sm font-medium text-center w-4/5 mb-4">
            {isUpdatingProfile
              ? "Uploading..."
              : "Click the camera to change your avatar"}
          </p>

          {/* Profile Form */}
          <form
            onSubmit={handleSaveProfile}
            className="w-full max-w-sm space-y-3"
          >
            <div>
              <label className="block font-bold text-sm mb-1 flex items-center gap-2">
                <User className="w-4 h-4" /> Full Name
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                placeholder="Enter your full name"
                className="
                  w-full px-4 py-2.5 bg-[#FFF2AC] border-2 border-black rounded-lg 
                  shadow-[3px_3px_0_#000] focus:outline-none 
                  focus:translate-y-[1px] focus:shadow-none transition-all
                "
              />
            </div>

            <div>
              <label className="block font-bold text-sm mb-1 flex items-center gap-2">
                <Mail className="w-4 h-4" /> Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="you@example.com"
                className="
                  w-full px-4 py-2.5 bg-[#B9E6C9] border-2 border-black rounded-lg 
                  shadow-[3px_3px_0_#000] focus:outline-none
                  focus:translate-y-[1px] focus:shadow-none transition-all
                "
              />
            </div>

            <button
              type="submit"
              disabled={isUpdatingProfile}
              className="
                w-full mt-2 bg-blue-400 border-2 border-black text-black font-bold 
                px-6 py-2.5 rounded-lg shadow-[3px_3px_0_#000]
                hover:translate-y-[2px] hover:shadow-none transition-all
              "
            >
              {isUpdatingProfile ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                  Saving...
                </>
              ) : (
                "Save Profile"
              )}
            </button>
          </form>
        </div>

        {/* RIGHT SIDE */}
        <div className="w-1/2 flex flex-col justify-center bg-[#A7E0F2] p-8">
          <div
            className="
              bg-white border-4 border-black rounded-xl p-6 
              shadow-[4px_4px_0_#000]
            "
          >
            <h2 className="text-xl font-extrabold border-b-2 border-black pb-2 mb-4">
              Change Password
            </h2>

            <form onSubmit={handleChangePassword} className="space-y-3">
              <div>
                <label className="block font-bold text-sm mb-1 flex items-center gap-2">
                  <Lock className="w-4 h-4" /> Current Password
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      currentPassword: e.target.value,
                    })
                  }
                  placeholder="Enter current password"
                  className="
                    w-full px-4 py-2.5 bg-[#FFF2AC] border-2 border-black rounded-lg 
                    shadow-[3px_3px_0_#000] focus:outline-none
                    focus:translate-y-[1px] focus:shadow-none transition-all
                  "
                />
              </div>

              <div>
                <label className="block font-bold text-sm mb-1 flex items-center gap-2">
                  <Lock className="w-4 h-4" /> New Password
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                  placeholder="Enter new password"
                  className="
                    w-full px-4 py-2.5 bg-[#B9E6C9] border-2 border-black rounded-lg 
                    shadow-[3px_3px_0_#000] focus:outline-none
                    focus:translate-y-[1px] focus:shadow-none transition-all
                  "
                />
              </div>

              <div>
                <label className="block font-bold text-sm mb-1 flex items-center gap-2">
                  <Lock className="w-4 h-4" /> Confirm Password
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value,
                    })
                  }
                  placeholder="Re-enter new password"
                  className="
                    w-full px-4 py-2.5 bg-[#A7E0F2] border-2 border-black rounded-lg 
                    shadow-[3px_3px_0_#000] focus:outline-none
                    focus:translate-y-[1px] focus:shadow-none transition-all
                  "
                />
              </div>

              <button
                type="submit"
                disabled={isChangingPassword}
                className="
                  w-full mt-3 bg-green-400 border-2 border-black text-black font-bold 
                  px-6 py-2.5 rounded-lg shadow-[3px_3px_0_#000]
                  hover:translate-y-[2px] hover:shadow-none transition-all
                "
              >
                {isChangingPassword ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                    Updating...
                  </>
                ) : (
                  "Change Password"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
