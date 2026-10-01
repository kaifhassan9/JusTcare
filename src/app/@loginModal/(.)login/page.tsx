"use client";

import { useRouter } from "next/navigation";
import LoginModal from "@/components/LoginModal";

export default function InterceptedLoginPage() {
  const router = useRouter();

  return (
    <LoginModal
      isOpen={true}
      onClose={() => router.back()} // Navigates back in history, returning URL to /
    />
  );
}