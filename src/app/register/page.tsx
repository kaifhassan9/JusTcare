"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Registration failed");
        return;
      }

      setMessage("Registration successful!");

      setTimeout(() => {
        router.push("/login");
      }, 1000);
    } catch (error) {
      console.error("Registration error:", error);
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#FAF8F5] dark:bg-[#1E2319] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-[#D5CDBF] dark:border-[#3D4734] bg-white dark:bg-[#252B1F] p-8 shadow-xl">

        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-[#2C3325] dark:text-[#F5F2EB]">
            Create Account
          </h1>

          <p className="mt-2 text-sm text-[#5A564A] dark:text-[#C5BAA2]">
            Create your account to start ordering healthcare products.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">

          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-[#2C3325] dark:text-[#EBE5D8]">
              Full Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
              className="mt-2 w-full rounded-xl border border-[#D5CDBF] dark:border-[#3D4734] bg-[#FAF8F5] dark:bg-[#1E2319] px-4 py-3 text-sm text-[#2C3325] dark:text-[#F5F2EB] outline-none focus:border-[#556244] focus:ring-1 focus:ring-[#556244]"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-[#2C3325] dark:text-[#EBE5D8]">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="mt-2 w-full rounded-xl border border-[#D5CDBF] dark:border-[#3D4734] bg-[#FAF8F5] dark:bg-[#1E2319] px-4 py-3 text-sm text-[#2C3325] dark:text-[#F5F2EB] outline-none focus:border-[#556244] focus:ring-1 focus:ring-[#556244]"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-[#2C3325] dark:text-[#EBE5D8]">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              required
              minLength={6}
              className="mt-2 w-full rounded-xl border border-[#D5CDBF] dark:border-[#3D4734] bg-[#FAF8F5] dark:bg-[#1E2319] px-4 py-3 text-sm text-[#2C3325] dark:text-[#F5F2EB] outline-none focus:border-[#556244] focus:ring-1 focus:ring-[#556244]"
            />
          </div>

          {/* Message */}
          {message && (
            <p className="rounded-lg bg-[#E8ECE1] dark:bg-[#1E2319] border border-[#D5CDBF] dark:border-[#3D4734] px-4 py-3 text-sm font-medium text-[#2C3325] dark:text-[#C5BAA2]">
              {message}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-[#556244] to-[#6B7256] py-3.5 text-sm font-bold text-[#F5F2EB] shadow-lg shadow-[#556244]/20 transition-all hover:from-[#455037] hover:to-[#586045] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#5A564A] dark:text-[#C5BAA2]">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-bold text-[#556244] hover:text-[#455037] dark:text-[#C5BAA2] dark:hover:text-[#F5F2EB]"
          >
            Login
          </Link>
        </p>

      </div>
    </main>
  );
}