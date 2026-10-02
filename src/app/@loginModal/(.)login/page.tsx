"use client";

import { Suspense } from "react";
import { useRouter } from "next/navigation";
import LoginModal from "@/components/LoginModal";

function InterceptedLoginContent() {
  const router = useRouter();

  return (
    <LoginModal
      isOpen={true}
      onClose={() => router.back()}
    />
  );
}

export default function InterceptedLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          Loading login...
        </div>
      }
    >
      <InterceptedLoginContent />
    </Suspense>
  );
}