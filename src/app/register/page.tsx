"use client";

import { FormEvent, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DotLottie } from "@lottiefiles/dotlottie-web";

export default function RegisterPage() {
  const router = useRouter();

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // UI state for password visibility toggle
  const [showPassword, setShowPassword] = useState(false);

  // Single ref for the full-page background canvas
  const bgCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Initialize full-page background animation
  useEffect(() => {
    let bgInstance: DotLottie | null = null;
    let animationFrameId: number;

    animationFrameId = requestAnimationFrame(() => {
      if (bgCanvasRef.current) {
        bgInstance = new DotLottie({
          canvas: bgCanvasRef.current,
          src: "/animation2.lottie",
          autoplay: true,
          loop: true,
          layout: { fit: "cover" },
        });
      }
    });

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (bgInstance) {
        try {
          bgInstance.destroy();
        } catch {
          // Suppress unmount aborts
        }
      }
    };
  }, []);

  // Submit logic
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
    <main className="relative min-h-screen w-full flex items-center justify-center md:justify-end p-6 md:pr-20 overflow-hidden bg-[#EAE4D5]">
      
      {/* Crisp Full-Screen Background Animation */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-0">
        <canvas
          ref={bgCanvasRef}
          className="w-full h-full object-cover scale-100 transform-gpu"
        />
      </div>

      {/* Back to Website Floating Button */}
      <div className="absolute top-8 left-8 z-20">
        <Link
          href="/"
          className="rounded-full bg-white/70 hover:bg-white px-5 py-2.5 text-xs font-semibold text-[#3D3A2E] shadow-md backdrop-blur-md transition flex items-center gap-1.5 border border-[#DDD3BC]/50"
        >
          ← Back to website
        </Link>
      </div>

      {/* Floating 3D Registration Card Positioned on the Right */}
      <div className="relative z-10 w-full max-w-md rounded-[32px] bg-[#F5F1E8]/90 border border-white/80 p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.15)] backdrop-blur-xl transition-all">
        
        {/* Header Section */}
        <div className="text-left">
          <h1 className="text-3xl font-extrabold text-[#3D3A2E] tracking-tight">
            Create an account
          </h1>
          <p className="mt-2 text-xs font-medium text-[#8B8570]">
            Already have an account?{" "}
            <Link href="/login" className="text-[#5E644A] hover:underline font-bold">
              Log in
            </Link>
          </p>
        </div>

        {/* Form Controls */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          
          {/* Full Name */}
          <div>
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-2xl bg-white border border-[#DDD3BC] px-4 py-3.5 text-xs text-[#3D3A2E] placeholder-[#8B8570] outline-none focus:border-[#5E644A] focus:ring-2 focus:ring-[#5E644A]/20 transition shadow-sm"
            />
          </div>

          {/* Email */}
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-2xl bg-white border border-[#DDD3BC] px-4 py-3.5 text-xs text-[#3D3A2E] placeholder-[#8B8570] outline-none focus:border-[#5E644A] focus:ring-2 focus:ring-[#5E644A]/20 transition shadow-sm"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-2xl bg-white border border-[#DDD3BC] px-4 py-3.5 text-xs text-[#3D3A2E] placeholder-[#8B8570] outline-none focus:border-[#5E644A] focus:ring-2 focus:ring-[#5E644A]/20 transition pr-10 shadow-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-3.5 text-xs text-[#8B8570] hover:text-[#3D3A2E] transition"
            >
              <i className={`fa-regular ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
            </button>
          </div>

          {/* Terms & Conditions */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="terms"
              required
              className="h-4 w-4 rounded accent-[#5E644A] bg-white border-[#DDD3BC] cursor-pointer"
            />
            <label htmlFor="terms" className="text-[11px] font-medium text-[#8B8570] cursor-pointer">
              I agree to the{" "}
              <Link 
                href="/terms" 
                target="_blank" 
                className="underline text-[#3D3A2E] hover:text-[#5E644A] font-semibold transition"
              >
                Terms & Conditions
              </Link>
            </label>
          </div>

          {/* Feedback Message */}
          {message && (
            <p className="rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-xs font-semibold text-red-600">
              {message}
            </p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#5E644A] py-3.5 text-xs font-semibold text-white shadow-lg hover:bg-[#4E533D] transition disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? "Creating Account..." : "Create account"}
          </button>
        </form>
      </div>
    </main>
  );
}