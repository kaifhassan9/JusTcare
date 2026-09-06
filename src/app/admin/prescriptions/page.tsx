"use client";

import { useEffect, useState } from "react";

type Prescription = {
  id: number;
  imageUrl: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reviewNote: string | null;
  createdAt: string;
  user: { id: number; name: string; email: string } | null;
  order: { id: number; orderNumber: string } | null;
};

export default function AdminPrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("PENDING");

  async function fetchPrescriptions() {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/prescriptions");
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to load prescriptions.");
        return;
      }

      setPrescriptions(data.prescriptions);
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

  async function handleReview(id: number, status: "APPROVED" | "REJECTED") {
    const reviewNote = status === "REJECTED"
      ? prompt("Reason for rejection (shown to admin only, optional):") || ""
      : "";

    try {
      const response = await fetch(`/api/admin/prescriptions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, reviewNote }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to update.");
        return;
      }

      setPrescriptions((current) =>
        current.map((p) => (p.id === id ? { ...p, status, reviewNote } : p))
      );
    } catch (err) {
      console.error("Review error:", err);
      alert("Something went wrong.");
    }
  }

  const filtered = filter === "ALL" ? prescriptions : prescriptions.filter((p) => p.status === filter);

  const isPdf = (url: string) => url.toLowerCase().endsWith(".pdf");

  return (
    <main className="min-h-screen bg-[#F7F5EF] text-[#3D3A2E]">
      <header className="border-b border-[#DDD3BC] bg-white">
        <div className="mx-auto max-w-7xl px-6 py-5">
          <h1 className="text-2xl font-extrabold">Prescription Review</h1>
          <p className="mt-1 text-sm text-[#6B6650]">Verify customer-uploaded prescriptions before fulfilling orders.</p>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-8">

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          {(["PENDING", "APPROVED", "REJECTED", "ALL"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                filter === f ? "bg-[#6B7256] text-white" : "bg-white border border-[#DDD3BC] text-[#6B6650]"
              }`}
            >
              {f.charAt(0) + f.slice(1).toLowerCase()}
              {f === "PENDING" && ` (${prescriptions.filter((p) => p.status === "PENDING").length})`}
            </button>
          ))}
        </div>

        {loading && <p className="text-[#6B6650]">Loading prescriptions...</p>}
        {error && <p className="text-red-600 font-semibold">{error}</p>}

        {!loading && !error && filtered.length === 0 && (
          <div className="rounded-2xl border border-[#DDD3BC] bg-white p-16 text-center">
            <p className="text-4xl mb-3">📄</p>
            <p className="font-semibold text-[#6B6650]">No prescriptions in this category.</p>
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <div key={p.id} className="rounded-2xl border border-[#DDD3BC] bg-white overflow-hidden shadow-sm">

              {/* Preview */}
              <div className="h-56 bg-[#F7F5EF] flex items-center justify-center">
                {isPdf(p.imageUrl) ? (
                  
                  <a  href={p.imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-2 text-[#6B7256] font-bold"
                  >
                    <span className="text-5xl">📄</span>
                    <span className="text-sm underline">View PDF</span>
                  </a>
                ) : (
                  <a href={p.imageUrl} target="_blank" rel="noopener noreferrer">
                    <img src={p.imageUrl} alt="Prescription" className="h-56 w-full object-contain" />
                  </a>
                )}
              </div>

              <div className="p-4">
                <p className="font-bold text-sm">{p.user?.name || "Unknown user"}</p>
                <p className="text-xs text-[#8B8570]">{p.user?.email}</p>

                {p.order && (
                  <p className="mt-1 text-xs text-[#6B7256] font-semibold">
                    Order #{p.order.orderNumber}
                  </p>
                )}

                <p className="mt-2 text-xs text-[#8B8570]">
                  Uploaded {new Date(p.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                </p>

                <span className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-bold ${
                  p.status === "PENDING" ? "bg-amber-100 text-amber-700"
                  : p.status === "APPROVED" ? "bg-[#6B7256]/15 text-[#6B7256]"
                  : "bg-red-100 text-red-600"
                }`}>
                  {p.status}
                </span>

                {p.reviewNote && (
                  <p className="mt-2 text-xs text-[#8B8570] italic">Note: {p.reviewNote}</p>
                )}

                {p.status === "PENDING" && (
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => handleReview(p.id, "APPROVED")}
                      className="flex-1 rounded-full bg-[#6B7256] py-2 text-xs font-bold text-white hover:bg-[#5a6047] transition"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReview(p.id, "REJECTED")}
                      className="flex-1 rounded-full border border-red-300 text-red-600 py-2 text-xs font-bold hover:bg-red-50 transition"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}