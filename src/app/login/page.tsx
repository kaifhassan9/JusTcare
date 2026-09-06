"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Login failed");
        return;
      }

      console.log("Logged in user:", data.user);

      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Login error:", error);
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F5F1E8] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-[#DDD3BC] bg-white p-8 shadow-xl">

        {/* Logo & Header */}
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#6B7256] text-white text-2xl shadow-sm mb-4">
            💊
          </div>
          <h1 className="text-2xl font-bold text-[#3D3A2E]">
            Welcome Back
          </h1>

          <p className="mt-1.5 text-xs font-medium text-[#8B8570]">
            Login to your account to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">

          {/* Email */}
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
              className="mt-2 w-full rounded-xl border border-[#DDD3BC] bg-[#F5F1E8]/50 px-4 py-3 text-sm text-[#3D3A2E] placeholder-[#8B8570] outline-none focus:border-[#6B7256] focus:bg-white transition"
            />
          </div>

          {/* Password */}
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
              className="mt-2 w-full rounded-xl border border-[#DDD3BC] bg-[#F5F1E8]/50 px-4 py-3 text-sm text-[#3D3A2E] placeholder-[#8B8570] outline-none focus:border-[#6B7256] focus:bg-white transition"
            />
          </div>

          {/* Message */}
          {message && (
            <p className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-xs font-semibold text-red-600">
              {message}
            </p>
          )}

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#6B7256] py-3.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#5a6047] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-[#8B8570]">
          Don't have an account?{" "}
          <Link
            href="/register"
            className="font-bold text-[#6B7256] hover:underline"
          >
            Create Account
          </Link>
        </p>

      </div>
    </main>
  );
}