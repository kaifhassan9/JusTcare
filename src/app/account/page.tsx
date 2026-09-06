"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type User = { id: number; name: string; email: string; role: string };

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [nameMessage, setNameMessage] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch("/api/auth/me");
        const data = await response.json();

        if (!data.user) {
          router.push("/login");
          return;
        }

        setUser(data.user);
        setName(data.user.name);
      } catch (error) {
        console.error("Fetch user error:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [router]);

  async function handleUpdateName() {
    setSavingName(true);
    setNameMessage("");

    try {
      const response = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      const data = await response.json();

      if (!response.ok) {
        setNameMessage(data.error || "Failed to update name.");
        return;
      }

      setUser(data.user);
      setNameMessage("Name updated successfully.");
    } catch (error) {
      console.error("Update name error:", error);
      setNameMessage("Something went wrong.");
    } finally {
      setSavingName(false);
    }
  }

  async function handleChangePassword() {
    setSavingPassword(true);
    setPasswordMessage("");

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        setPasswordMessage(data.error || "Failed to change password.");
        return;
      }

      setPasswordMessage("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
    } catch (error) {
      console.error("Change password error:", error);
      setPasswordMessage("Something went wrong.");
    } finally {
      setSavingPassword(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F7F5EF] flex items-center justify-center">
        <p className="text-[#6B6650] font-bold">Loading account...</p>
      </main>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen bg-[#F7F5EF] text-[#3D3A2E]">
      <Navbar />

      <section className="mx-auto max-w-2xl px-4 sm:px-6 py-10">
        <h1 className="text-3xl font-extrabold text-[#3D3A2E]">My Account</h1>
        <p className="mt-1 text-sm text-[#6B6650]">Manage your account details.</p>

        {/* Profile Info */}
        <div className="mt-8 rounded-2xl border border-[#DDD3BC] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-extrabold text-[#3D3A2E]">Profile Information</h2>

          <div className="mt-5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#8B8570]">
              Email
            </label>
            <p className="mt-1 text-sm text-[#3D3A2E]">
              {user.email}
              <span className="ml-2 text-xs text-[#8B8570]">(cannot be changed)</span>
            </p>
          </div>

          <div className="mt-5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#8B8570]">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 w-full rounded-xl border border-[#DDD3BC] bg-[#F7F5EF] px-4 py-3 text-sm text-[#3D3A2E] outline-none focus:border-[#6B7256] focus:bg-white transition-all"
            />
          </div>

          {nameMessage && (
            <p className="mt-3 text-sm font-medium text-[#6B7256]">{nameMessage}</p>
          )}

          <button
            onClick={handleUpdateName}
            disabled={savingName}
            className="mt-4 rounded-full bg-[#6B7256] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#5a6047] disabled:opacity-50 transition"
          >
            {savingName ? "Saving..." : "Save Name"}
          </button>
        </div>

        {/* Change Password */}
        <div className="mt-6 rounded-2xl border border-[#DDD3BC] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-extrabold text-[#3D3A2E]">Change Password</h2>

          <div className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#8B8570]">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="mt-2 w-full rounded-xl border border-[#DDD3BC] bg-[#F7F5EF] px-4 py-3 text-sm text-[#3D3A2E] outline-none focus:border-[#6B7256] focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#8B8570]">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-2 w-full rounded-xl border border-[#DDD3BC] bg-[#F7F5EF] px-4 py-3 text-sm text-[#3D3A2E] outline-none focus:border-[#6B7256] focus:bg-white transition-all"
              />
            </div>
          </div>

          {passwordMessage && (
            <p className="mt-3 text-sm font-medium text-[#6B7256]">{passwordMessage}</p>
          )}

          <button
            onClick={handleChangePassword}
            disabled={savingPassword}
            className="mt-4 rounded-full bg-[#8B7355] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#7a6549] disabled:opacity-50 transition"
          >
            {savingPassword ? "Saving..." : "Change Password"}
          </button>
        </div>
      </section>

      <Footer />
    </main>
  );
}