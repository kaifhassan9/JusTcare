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

      <section className="mx-auto max-w-xl px-4 sm:px-6 py-12">
        <div className="rounded-2xl border border-[#DDD3BC] bg-white p-8 shadow-sm text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#8B7355]/15 text-3xl">
            📄
          </div>

          <h1 className="mt-5 text-2xl font-extrabold text-[#3D3A2E]">Upload Prescription</h1>
          <p className="mt-2 text-sm text-[#6B6650]">
            Upload a valid prescription from your doctor. Our pharmacy team will verify it before your order is processed.
          </p>

          {!success ? (
            <div className="mt-8">
              <label
                htmlFor="prescription-file"
                className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#DDD3BC] bg-[#F7F5EF] px-6 py-10 cursor-pointer hover:border-[#6B7256] transition"
              >
                <span className="text-3xl mb-2">📎</span>
                <span className="text-sm font-semibold text-[#3D3A2E]">
                  {file ? file.name : "Click to select a file"}
                </span>
                <span className="mt-1 text-xs text-[#8B8570]">JPG, PNG, or PDF — max 5MB</span>
              </label>

              <input
                id="prescription-file"
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleFileChange}
                className="hidden"
              />

              {message && (
                <p className="mt-4 text-sm font-semibold text-red-600">{message}</p>
              )}

              <button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="mt-6 w-full rounded-full bg-[#6B7256] py-3.5 text-sm font-bold text-white hover:bg-[#5a6047] disabled:opacity-50 transition"
              >
                {uploading ? "Uploading..." : "Upload Prescription"}
              </button>
            </div>
          ) : (
            <div className="mt-8">
              <p className="rounded-xl bg-[#6B7256]/10 text-[#6B7256] font-semibold text-sm p-4">
                ✓ {message}
              </p>
              <button
                onClick={() => router.push("/")}
                className="mt-6 w-full rounded-full bg-[#8B7355] py-3.5 text-sm font-bold text-white hover:bg-[#7a6549] transition"
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