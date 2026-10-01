"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type User = { id: number; name: string; email: string; role: string };

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [activePanel, setActivePanel] = useState<"none" | "name" | "password">("none");

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

  async function handleLogout() {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      const data = await response.json();
      if (data.success) {
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F7F5EF] flex items-center justify-center p-4">
        <p className="text-[#6B6650] font-bold text-sm sm:text-base">Loading account...</p>
      </main>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen bg-[#F7F5EF] text-[#3D3A2E]">
      <Navbar />

      <section className="mx-auto max-w-2xl px-4 sm:px-6 py-6 sm:py-8">

        {/* Profile Header Card */}
        <div className="rounded-3xl bg-[#6B7256] p-5 sm:p-6 text-white shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-full bg-white/15 text-xl sm:text-2xl font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl font-bold font-[family-name:var(--font-poppins)] truncate">
                {user.name}
              </h1>
              <p className="mt-0.5 text-xs sm:text-sm text-white/75 truncate">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Settings List */}
        <div className="mt-6 rounded-2xl border border-[#DDD3BC] bg-white overflow-hidden shadow-sm">

          <SettingsRow
            label="Edit Name"
            active={activePanel === "name"}
            onClick={() => setActivePanel(activePanel === "name" ? "none" : "name")}
          />

          {activePanel === "name" && (
            <div className="px-4 sm:px-5 pb-5 bg-[#F7F5EF] border-t border-[#EDE6D6]">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter full name"
                className="mt-4 w-full rounded-xl border border-[#DDD3BC] bg-white px-4 py-3 text-base sm:text-sm text-[#3D3A2E] outline-none focus:border-[#6B7256] focus:ring-2 focus:ring-[#6B7256]/20 transition"
              />
              {nameMessage && (
                <p className="mt-2 text-xs font-medium text-[#6B6650]">{nameMessage}</p>
              )}
              <button
                onClick={handleUpdateName}
                disabled={savingName}
                className="mt-3 w-full sm:w-auto rounded-full bg-[#6B7256] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#5a6047] active:scale-[0.98] disabled:opacity-50 transition touch-manipulation"
              >
                {savingName ? "Saving..." : "Save Name"}
              </button>
            </div>
          )}

          <SettingsRow
            label="Change Password"
            active={activePanel === "password"}
            onClick={() => setActivePanel(activePanel === "password" ? "none" : "password")}
          />

          {activePanel === "password" && (
            <div className="px-4 sm:px-5 pb-5 bg-[#F7F5EF] border-t border-[#EDE6D6] space-y-3">
              <input
                type="password"
                placeholder="Current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoCapitalize="none"
                autoCorrect="off"
                className="mt-4 w-full rounded-xl border border-[#DDD3BC] bg-white px-4 py-3 text-base sm:text-sm text-[#3D3A2E] outline-none focus:border-[#6B7256] focus:ring-2 focus:ring-[#6B7256]/20 transition"
              />
              <input
                type="password"
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoCapitalize="none"
                autoCorrect="off"
                className="w-full rounded-xl border border-[#DDD3BC] bg-white px-4 py-3 text-base sm:text-sm text-[#3D3A2E] outline-none focus:border-[#6B7256] focus:ring-2 focus:ring-[#6B7256]/20 transition"
              />
              {passwordMessage && (
                <p className="text-xs font-medium text-[#6B6650]">{passwordMessage}</p>
              )}
              <button
                onClick={handleChangePassword}
                disabled={savingPassword}
                className="w-full sm:w-auto rounded-full bg-[#8B7355] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#7a6549] active:scale-[0.98] disabled:opacity-50 transition touch-manipulation"
              >
                {savingPassword ? "Saving..." : "Update Password"}
              </button>
            </div>
          )}

          <Link href="/orders" className="block">
            <SettingsRow label="My Orders" isLink />
          </Link>

          <Link href="/my-prescriptions" className="block">
            <SettingsRow label="My Prescriptions" isLink />
          </Link>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="mt-6 w-full rounded-2xl bg-red-500 py-3.5 sm:py-4 text-xs sm:text-sm font-bold text-white hover:bg-red-600 active:scale-[0.98] transition touch-manipulation shadow-sm"
        >
          Log Out
        </button>
      </section>

      <Footer />
    </main>
  );
}

function SettingsRow({
  label,
  active,
  isLink,
  onClick,
}: {
  label: string;
  active?: boolean;
  isLink?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between px-4 sm:px-5 py-4 text-left border-b border-[#EDE6D6] last:border-0 transition touch-manipulation active:bg-[#F7F5EF] ${
        active ? "bg-[#6B7256]/5" : "hover:bg-[#F7F5EF]"
      }`}
    >
      <span className="text-xs sm:text-sm font-semibold text-[#3D3A2E]">{label}</span>
      <span className="text-[#8B8570] text-sm">{isLink ? "→" : active ? "▾" : "›"}</span>
    </button>
  );
}