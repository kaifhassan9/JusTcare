"use client";

import { useEffect, useRef } from "react";
import { DotLottie } from "@lottiefiles/dotlottie-web";

export default function WellnessBanner() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let dotLottieInstance: DotLottie | null = null;
    let animationFrameId: number;

    animationFrameId = requestAnimationFrame(() => {
      if (canvasRef.current) {
        dotLottieInstance = new DotLottie({
          canvas: canvasRef.current,
          src: "/wellness-animation.lottie",
          autoplay: true,
          loop: true,
          layout: { fit: "contain" }, // Ensures proper aspect ratio fit
        });
      }
    });

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (dotLottieInstance) {
        try {
          dotLottieInstance.destroy();
        } catch {
          // Suppress unmount aborts
        }
      }
    };
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-16">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#EDE6D6] via-[#E4E8DC] to-[#D9E0D0] min-h-[280px] sm:min-h-[320px] flex items-center justify-between">
        
        {/* Left Side: Content */}
        <div className="relative z-10 p-8 sm:p-12 max-w-xl">
          <p className="text-xs font-bold uppercase tracking-widest text-[#3D3A2E]/80 mb-2">
            JusTCare
          </p>
          <h2 className="font-[family-name:var(--font-poppins)] text-3xl sm:text-4xl font-bold text-[#3D3A2E]">
            Health &amp; Wellness
          </h2>
          <p className="mt-2 text-sm text-[#3D3A2E]/80 max-w-md leading-relaxed">
            Everything you need for a healthier, happier you — genuine products, trusted delivery.
          </p>
        </div>

        {/* Right Side: Animation Container */}
        <div className="absolute right-0 top-0 bottom-0 w-full sm:w-1/2 md:w-5/12 h-full flex items-center justify-center p-4 pointer-events-none opacity-80 sm:opacity-100">
          <canvas
            ref={canvasRef}
            className="w-full h-full object-contain"
          />
        </div>

      </div>
    </section>
  );
}