"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PrescriptionUploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;

    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (!allowedTypes.includes(selected.type)) {
      setMessage("Please upload a JPG, PNG, or PDF file.");
      setFile(null);
      return;
    }

    if (selected.size > 5 * 1024 * 1024) {
      setMessage("File must be smaller than 5MB.");
      setFile(null);
      return;
    }

    setMessage("");
    setFile(selected);
  }

  async function handleUpload() {
    if (!file) return;

    setUploading(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/prescriptions/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Upload failed.");
        return;
      }

      setSuccess(true);
      setMessage("Prescription uploaded successfully! Our pharmacy team will review it shortly.");
      setFile(null);
    } catch (error) {
      console.error("Upload error:", error);
      setMessage("Something went wrong. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F7F5EF] text-[#3D3A2E]">
      <Navbar />

      <section className="mx-auto max-w-xl px-4 sm:px-6 py-8 sm:py-12">
        <div className="rounded-2xl border border-[#DDD3BC] bg-white p-6 sm:p-8 shadow-sm text-center">
          <div className="mx-auto flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-[#8B7355]/15 text-2xl sm:text-3xl">
            📄
          </div>

          <h1 className="mt-4 sm:mt-5 text-xl sm:text-2xl font-extrabold text-[#3D3A2E]">
            Upload Prescription
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-[#6B6650]">
            Upload a valid prescription from your doctor. Our pharmacy team will verify it before your order is processed.
          </p>

          {!success ? (
            <div className="mt-6 sm:mt-8">
              <label
                htmlFor="prescription-file"
                className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#DDD3BC] bg-[#F7F5EF] px-4 sm:px-6 py-8 sm:py-10 cursor-pointer hover:border-[#6B7256] active:bg-[#EDE6D6]/50 transition touch-manipulation"
              >
                <span className="text-3xl mb-2">📎</span>
                <span className="text-xs sm:text-sm font-semibold text-[#3D3A2E] truncate max-w-full px-2">
                  {file ? file.name : "Tap to choose photo or document"}
                </span>
                <span className="mt-1 text-[11px] sm:text-xs text-[#8B8570]">
                  JPG, PNG, or PDF — max 5MB
                </span>
              </label>

              <input
                id="prescription-file"
                type="file"
                accept=".jpg,.jpeg,.png,.pdf,image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {message && (
                <p className="mt-4 text-xs sm:text-sm font-semibold text-red-600">{message}</p>
              )}

              <button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="mt-6 w-full rounded-full bg-[#6B7256] py-3.5 text-xs sm:text-sm font-bold text-white hover:bg-[#5a6047] active:scale-[0.98] disabled:opacity-50 transition touch-manipulation shadow-sm"
              >
                {uploading ? "Uploading..." : "Upload Prescription"}
              </button>
            </div>
          ) : (
            <div className="mt-6 sm:mt-8">
              <p className="rounded-xl bg-[#6B7256]/10 text-[#6B7256] font-semibold text-xs sm:text-sm p-4 leading-relaxed">
                ✓ {message}
              </p>
              <button
                onClick={() => router.push("/")}
                className="mt-6 w-full rounded-full bg-[#8B7355] py-3.5 text-xs sm:text-sm font-bold text-white hover:bg-[#7a6549] active:scale-[0.98] transition touch-manipulation shadow-sm"
              >
                Back to Home
              </button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}