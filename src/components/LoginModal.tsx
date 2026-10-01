"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  if (!isOpen) return null;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Login failed");
        return;
      }

      onClose();
      window.location.href = redirectTo;
    } catch (error) {
      console.error("Login error:", error);
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-opacity">
      {/* Container Box */}
      <div className="relative flex w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Floating Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-xl font-bold text-gray-500 hover:bg-gray-200 hover:text-black transition"
        >
          ✕
        </button>

        {/* Left Side Banner (Flipkart Style) */}
        <div className="hidden w-2/5 flex-col justify-between bg-[#6B7256] p-8 text-white sm:flex">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">Login</h2>
            <p className="mt-4 text-sm font-medium text-[#E3DEC3] leading-relaxed">
              Get access to your Orders, Wishlist and Recommendations
            </p>
          </div>
          <div className="flex justify-center pb-4 text-6xl">
            💊
          </div>
        </div>

        {/* Right Side Form Panel */}
        <div className="w-full p-8 sm:w-3/5">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-[#3D3A2E]">Log in to your account</h3>
            <p className="text-xs text-[#8B8570] mt-1">Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#3D3A2E]">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="mt-1.5 w-full rounded-xl border border-[#DDD3BC] bg-[#F5F1E8]/40 px-4 py-2.5 text-sm text-[#3D3A2E] placeholder-[#8B8570] outline-none focus:border-[#6B7256] focus:bg-white transition"
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#3D3A2E]">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="mt-1.5 w-full rounded-xl border border-[#DDD3BC] bg-[#F5F1E8]/40 px-4 py-2.5 text-sm text-[#3D3A2E] placeholder-[#8B8570] outline-none focus:border-[#6B7256] focus:bg-white transition"
              />
            </div>

            {/* Error Message */}
            {message && (
              <p className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs font-semibold text-red-600">
                {message}
              </p>
            )}

            <p className="text-[11px] text-[#8B8570]">
              By continuing, you agree to our Terms of Use and Privacy Policy.
            </p>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#6B7256] py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#5a6047] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Logging in..." : "Continue"}
            </button>
          </form>

          {/* Footer Link */}
          <p className="mt-6 text-center text-xs text-[#8B8570]">
            New user?{" "}
            <Link
              href="/register"
              onClick={onClose}
              className="font-bold text-[#6B7256] hover:underline"
            >
              Create an account
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}