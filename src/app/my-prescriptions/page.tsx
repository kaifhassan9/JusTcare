"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type Prescription = {
  id: number;
  imageUrl: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reviewNote: string | null;
  createdAt: string;
};

export default function MyPrescriptionsPage() {
  const router = useRouter();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [uploadingFor, setUploadingFor] = useState<number | null>(null);
  const [reUploadFile, setReUploadFile] = useState<File | null>(null);
  const [isSubmittingReupload, setIsSubmittingReupload] = useState(false);

  async function fetchPrescriptions() {
    try {
      setLoading(true);
      const response = await fetch("/api/prescriptions");
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login");
          return;
        }
        setError(data.error || "Failed to load prescriptions.");
        return;
      }

      setPrescriptions(data.prescriptions || []);
    } catch (err) {
      console.error("Fetch prescriptions error:", err);
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  async function handleReUpload(id: number) {
    if (!reUploadFile || isSubmittingReupload) return;

    setIsSubmittingReupload(true);

    try {
      const formData = new FormData();
      formData.append("file", reUploadFile);

      const response = await fetch("/api/prescriptions/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Upload failed.");
        return;
      }

      setUploadingFor(null);
      setReUploadFile(null);
      fetchPrescriptions();
    } catch (err) {
      console.error("Re-upload error:", err);
      alert("Something went wrong.");
    } finally {
      setIsSubmittingReupload(false);
    }
  }

  const isPdf = (url: string) => url.toLowerCase().includes(".pdf");

  const statusStyles = {
    PENDING: "bg-amber-100 text-amber-700",
    APPROVED: "bg-[#6B7256]/15 text-[#6B7256]",
    REJECTED: "bg-red-100 text-red-600",
  };

  const statusText = {
    PENDING: "Under Review",
    APPROVED: "Approved",
    REJECTED: "Rejected",
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F7F5EF]">
        <Navbar />
        <div className="flex min-h-[50vh] items-center justify-center p-4">
          <p className="text-[#6B6650] font-bold text-sm sm:text-base">Loading prescriptions...</p>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F5EF] text-[#3D3A2E]">
      <Navbar />

      <section className="border-b border-[#DDD3BC] bg-[#EDE6D6] py-6 sm:py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold">My Prescriptions</h1>
          <p className="mt-1 text-xs sm:text-sm text-[#6B6650]">
            Track the status of your uploaded prescriptions.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 sm:px-6 py-6 sm:py-8">
        {error && <p className="text-red-600 font-semibold mb-4 text-xs sm:text-sm">{error}</p>}

        {prescriptions.length === 0 ? (
          <div className="rounded-2xl border border-[#DDD3BC] bg-white p-8 sm:p-16 text-center shadow-sm">
            <p className="text-4xl sm:text-5xl mb-3">📄</p>
            <p className="font-bold text-[#3D3A2E] text-sm sm:text-base">No prescriptions uploaded yet</p>
            
            <a 
              href="/prescription"
              className="mt-6 inline-block rounded-full bg-[#6B7256] px-6 py-3 text-xs sm:text-sm font-bold text-white hover:bg-[#5a6047] active:scale-95 transition shadow-sm touch-manipulation"
            >
              Upload Prescription
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {prescriptions.map((p) => (
              <div key={p.id} className="rounded-2xl border border-[#DDD3BC] bg-white p-4 sm:p-5 shadow-sm">
                <div className="flex flex-col sm:flex-row gap-4 items-start">

                  {/* Preview Thumbnail */}
                  <div className="h-20 w-20 sm:h-24 sm:w-24 shrink-0 rounded-xl bg-[#F7F5EF] flex items-center justify-center overflow-hidden border border-[#DDD3BC]/50 mx-auto sm:mx-0">
                    {isPdf(p.imageUrl) ? (
                      <a href={p.imageUrl} target="_blank" rel="noopener noreferrer" className="text-3xl">📄</a>
                    ) : (
                      <a href={p.imageUrl} target="_blank" rel="noopener noreferrer" className="w-full h-full">
                        <img src={p.imageUrl} alt="Prescription" className="h-full w-full object-cover" />
                      </a>
                    )}
                  </div>

                  <div className="flex-1 w-full">
                    {/* Header Row: Date & Status */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs sm:text-sm text-[#8B8570]">
                        Uploaded {new Date(p.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </p>
                      <span className={`rounded-full px-3 py-1 text-[11px] sm:text-xs font-bold ${statusStyles[p.status]}`}>
                        {statusText[p.status]}
                      </span>
                    </div>

                    {/* Status Notice Boxes */}
                    {p.status === "REJECTED" && (
                      <div className="mt-3 rounded-xl bg-red-50 border border-red-200 p-3">
                        <p className="text-xs font-bold text-red-700">
                          This prescription was rejected.
                        </p>
                        {p.reviewNote && (
                          <p className="mt-1 text-xs text-red-600">Reason: {p.reviewNote}</p>
                        )}
                        <p className="mt-1 text-xs text-red-600">
                          Please upload a clearer or valid prescription below.
                        </p>
                      </div>
                    )}

                    {p.status === "PENDING" && (
                      <p className="mt-2 text-xs text-[#8B8570]">
                        Our pharmacy team is reviewing this. You'll be notified once it's verified.
                      </p>
                    )}

                    {p.status === "APPROVED" && (
                      <p className="mt-2 text-xs text-[#6B7256] font-semibold">
                        ✓ Verified — your order can proceed.
                      </p>
                    )}

                    {/* Re-upload flow for rejected prescriptions */}
                    {p.status === "REJECTED" && (
                      <div className="mt-3 pt-2 border-t border-[#DDD3BC]/40">
                        {uploadingFor === p.id ? (
                          <div className="flex flex-col gap-3">
                            <input
                              type="file"
                              accept=".jpg,.jpeg,.png,.pdf"
                              onChange={(e) => setReUploadFile(e.target.files?.[0] || null)}
                              className="text-xs text-[#3D3A2E] file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#6B7256]/10 file:text-[#6B7256] hover:file:bg-[#6B7256]/20 max-w-full"
                            />
                            <div className="flex flex-col sm:flex-row gap-2">
                              <button
                                onClick={() => handleReUpload(p.id)}
                                disabled={!reUploadFile || isSubmittingReupload}
                                className="w-full sm:w-auto rounded-full bg-[#6B7256] px-4 py-2 text-xs font-bold text-white disabled:opacity-50 active:scale-95 transition touch-manipulation"
                              >
                                {isSubmittingReupload ? "Uploading..." : "Submit New Prescription"}
                              </button>
                              <button
                                onClick={() => { setUploadingFor(null); setReUploadFile(null); }}
                                className="w-full sm:w-auto rounded-full border border-[#DDD3BC] px-4 py-2 text-xs font-bold text-[#6B6650] hover:bg-gray-50 active:scale-95 transition touch-manipulation"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setUploadingFor(p.id)}
                            className="w-full sm:w-auto rounded-full bg-[#8B7355] px-4 py-2 text-xs font-bold text-white hover:bg-[#7a6549] active:scale-95 transition touch-manipulation"
                          >
                            Upload New Prescription
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}