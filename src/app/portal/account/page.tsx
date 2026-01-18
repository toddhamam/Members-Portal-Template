"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";

export default function AccountPage() {
  const { user, profile, refreshProfile, updatePassword } = useAuth();
  const supabase = createClient();

  // Profile state
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState("");

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState("");

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
