"use client";

import { useState, useRef } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { UserAvatar } from "@/components/shared/UserAvatar";

export default function AccountPage() {
  const { user, profile, refreshProfile, updatePassword } = useAuth();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile state
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState("");

  // Avatar state
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState("");

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  // Resize image to max dimensions and compress
  const resizeImage = (file: File, maxSize: number = 512): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;

        // Calculate new dimensions maintaining aspect ratio
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Could not create blob"));
            }
          },
          "image/jpeg",
          0.85 // 85% quality
        );
      };
      img.onerror = () => reject(new Error("Could not load image"));
      img.src = URL.createObjectURL(file);
    });
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setAvatarError("Please select an image file");
      return;
    }

    setIsUploadingAvatar(true);
    setAvatarError("");

    try {
      // Resize and compress the image
      const resizedBlob = await resizeImage(file, 512);

      const formData = new FormData();
      formData.append("file", resizedBlob, "avatar.jpg");

      const response = await fetch("/api/profile/avatar", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Upload failed");
      }

      await refreshProfile();
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveAvatar = async () => {
    if (!confirm("Remove your profile photo?")) return;

    setIsUploadingAvatar(true);
    setAvatarError("");

    try {
      const response = await fetch("/api/profile/avatar", {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to remove avatar");
      }

      await refreshProfile();
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : "Failed to remove");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileError("");
    setProfileSuccess(false);

    const [firstName, ...lastNameParts] = fullName.trim().split(" ");
    const lastName = lastNameParts.join(" ");

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName.trim(),
        first_name: firstName,
        last_name: lastName,
      })
      .eq("id", user?.id);

    if (error) {
      setProfileError(error.message);
    } else {
      setProfileSuccess(true);
      await refreshProfile();
      setTimeout(() => setProfileSuccess(false), 3000);
    }

    setIsSavingProfile(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess(false);

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }

    setIsSavingPassword(true);

    const { error } = await updatePassword(newPassword);

    if (error) {
      setPasswordError(error.message);
    } else {
      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(false), 3000);
    }

    setIsSavingPassword(false);
  };

  return (
    <div className="max-w-2xl space-y-8">
      <h1 className="text-2xl font-semibold text-[#222222] font-serif">Account Settings</h1>

      {/* Avatar Section */}
      <div className="bg-white border border-[#e5e7eb] rounded-xl p-6">
        <h2 className="text-lg font-semibold text-[#222222] mb-4 font-serif">Profile Photo</h2>

        <div className="flex items-center gap-6">
          <UserAvatar
            avatarUrl={profile?.avatar_url}
            name={profile?.full_name}
            userId={profile?.id}
            size="xl"
          />

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="px-4 py-2 bg-[#222222] hover:bg-black text-white font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {isUploadingAvatar ? "Uploading..." : "Upload Photo"}
              </button>

              {profile?.avatar_url && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  disabled={isUploadingAvatar}
                  className="px-4 py-2 text-red-600 hover:bg-red-50 font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  Remove
                </button>
              )}
            </div>

            <p className="text-xs text-[#6b7280]">
              PNG, JPEG, or WebP. Images are automatically resized.
              {!profile?.avatar_url && " A unique avatar is generated for you by default."}
            </p>

            {avatarError && (
              <p className="text-sm text-red-600">{avatarError}</p>
            )}
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleAvatarUpload}
          className="hidden"
        />
      </div>

      {/* Profile Section */}
      <div className="bg-white border border-[#e5e7eb] rounded-xl p-6">
        <h2 className="text-lg font-semibold text-[#222222] mb-4 font-serif">Profile Information</h2>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          {profileError && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
              {profileError}
            </div>
          )}

          {profileSuccess && (
            <div className="bg-green-50 text-green-600 text-sm p-3 rounded-lg">
              Profile updated successfully!
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#4b5563] mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={user?.email || ""}
              disabled
              className="w-full px-4 py-3 border border-[#e5e7eb] rounded-lg bg-[#f5f3ef] text-[#4b5563]"
            />
            <p className="text-xs text-[#6b7280] mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-[#4b5563] mb-1">
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 border border-[#e5e7eb] rounded-lg focus:ring-2 focus:ring-[#ee5d0b] focus:border-transparent outline-none transition"
              placeholder="Your full name"
            />
          </div>

          <button
            type="submit"
            disabled={isSavingProfile}
            className="bg-[#222222] hover:bg-black text-white font-medium px-6 py-3 rounded-lg transition-colors disabled:opacity-50"
          >
            {isSavingProfile ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>

      {/* Password Section */}
      <div className="bg-white border border-[#e5e7eb] rounded-xl p-6">
        <h2 className="text-lg font-semibold text-[#222222] mb-4 font-serif">Change Password</h2>

        <form onSubmit={handleChangePassword} className="space-y-4">
          {passwordError && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
              {passwordError}
            </div>
          )}

          {passwordSuccess && (
            <div className="bg-green-50 text-green-600 text-sm p-3 rounded-lg">
              Password changed successfully!
            </div>
          )}

          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-[#4b5563] mb-1">
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-4 py-3 border border-[#e5e7eb] rounded-lg focus:ring-2 focus:ring-[#ee5d0b] focus:border-transparent outline-none transition"
              placeholder="Minimum 8 characters"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#4b5563] mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-4 py-3 border border-[#e5e7eb] rounded-lg focus:ring-2 focus:ring-[#ee5d0b] focus:border-transparent outline-none transition"
              placeholder="Confirm new password"
            />
          </div>

          <button
            type="submit"
            disabled={isSavingPassword}
            className="bg-[#222222] hover:bg-black text-white font-medium px-6 py-3 rounded-lg transition-colors disabled:opacity-50"
          >
            {isSavingPassword ? "Changing..." : "Change Password"}
          </button>
        </form>
      </div>

      {/* Account Info */}
      <div className="bg-[#f5f3ef] border border-[#e5e7eb] rounded-xl p-6">
        <h2 className="text-lg font-semibold text-[#222222] mb-4 font-serif">Account Information</h2>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-[#6b7280]">Account ID</span>
            <span className="text-[#222222] font-mono text-xs">{user?.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#6b7280]">Member Since</span>
            <span className="text-[#222222]">
              {profile?.created_at
                ? new Date(profile.created_at).toLocaleDateString()
                : "—"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
