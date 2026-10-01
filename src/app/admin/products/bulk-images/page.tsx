"use client";

import { useState } from "react";
import Link from "next/link";

type Product = { id: number; name: string; image: string };

type Result = {
  fileName: string;
  matched: boolean;
  productId: number | null;
  productName: string | null;
  imageUrl: string | null;
  error: string | null;
};

export default function BulkImageUploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<Result[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [assigning, setAssigning] = useState<Record<string, number>>({});

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files || []);
    setFiles(selected);
  }

  async function handleUpload() {
    if (files.length === 0) return;

    setUploading(true);

    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));

      const response = await fetch("/api/admin/products/bulk-images", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Upload failed.");
        return;
      }

      setResults(data.results);
      setAllProducts(data.allProducts);
    } catch (error) {
      console.error("Bulk upload error:", error);
      alert("Something went wrong.");
    } finally {
      setUploading(false);
    }
  }

  async function handleManualAssign(fileName: string, imageUrl: string) {
    const productId = assigning[fileName];
    if (!productId) return;

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageUrl }),
      });

      // Note: your existing PATCH route requires all fields — if it rejects
      // a partial update, we'll need to fetch the full product first.
      // Flagging this here rather than guessing your exact validation.

      if (!response.ok) {
        alert("Failed to assign image — see note in code about partial updates.");
        return;
      }

      setResults((current) =>
        current.map((r) =>
          r.fileName === fileName
            ? { ...r, matched: true, productId, productName: allProducts.find((p) => p.id === productId)?.name || "" }
            : r
        )
      );
    } catch (error) {
      console.error("Manual assign error:", error);
      alert("Something went wrong.");
    }
  }

  const matchedCount = results.filter((r) => r.matched).length;
  const unmatchedResults = results.filter((r) => !r.matched && !r.error);

  return (
    <main className="min-h-screen bg-[#F7F5EF] text-[#3D3A2E]">
      <section className="mx-auto max-w-4xl px-4 sm:px-6 py-10">
        <Link href="/admin/products" className="text-sm font-semibold text-[#6B7256] hover:underline">
          ← Back to Products
        </Link>

        <h1 className="mt-4 text-3xl font-extrabold">Bulk Image Upload</h1>
        <p className="mt-1 text-sm text-[#6B6650]">
          Upload multiple product photos at once. Files are auto-matched to products by filename —
          name your photo files to match product names exactly (e.g. "Aspirin 500mg.jpg" for a product
          named "Aspirin 500mg").
        </p>

        <div className="mt-8 rounded-2xl border border-[#DDD3BC] bg-white p-6 shadow-sm">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleFileSelect}
            className="block w-full rounded-xl border border-[#DDD3BC] bg-[#F7F5EF] px-3.5 py-3 text-sm"
          />

          {files.length > 0 && (
            <p className="mt-2 text-sm text-[#6B6650]">{files.length} file(s) selected</p>
          )}

          <button
            onClick={handleUpload}
            disabled={files.length === 0 || uploading}
            className="mt-4 rounded-full bg-[#6B7256] px-6 py-3 text-sm font-bold text-white hover:bg-[#5a6047] disabled:opacity-50 transition"
          >
            {uploading ? "Uploading..." : `Upload ${files.length || ""} Photos`}
          </button>
        </div>

        {results.length > 0 && (
          <div className="mt-6 rounded-2xl border border-[#DDD3BC] bg-white p-6 shadow-sm">
            <p className="font-bold text-[#3D3A2E]">
              {matchedCount} of {results.length} photos matched automatically
            </p>

            <div className="mt-4 space-y-3">
              {results.map((r) => (
                <div
                  key={r.fileName}
                  className={`flex items-center gap-4 rounded-xl border p-3 ${
                    r.error ? "border-red-200 bg-red-50" : r.matched ? "border-[#6B7256]/30 bg-[#6B7256]/5" : "border-amber-200 bg-amber-50"
                  }`}
                >
                  {r.imageUrl && (
                    <img src={r.imageUrl} alt={r.fileName} className="h-14 w-14 rounded-lg object-cover" />
                  )}

                  <div className="flex-1">
                    <p className="text-sm font-bold text-[#3D3A2E]">{r.fileName}</p>

                    {r.error && <p className="text-xs text-red-600">{r.error}</p>}

                    {r.matched && (
                      <p className="text-xs text-[#6B7256] font-semibold">
                        ✓ Matched to "{r.productName}"
                      </p>
                    )}

                    {!r.matched && !r.error && (
                      <div className="mt-2 flex items-center gap-2">
                        <select
                          value={assigning[r.fileName] || ""}
                          onChange={(e) =>
                            setAssigning((current) => ({ ...current, [r.fileName]: Number(e.target.value) }))
                          }
                          className="rounded-lg border border-[#DDD3BC] px-2 py-1.5 text-xs"
                        >
                          <option value="">No automatic match — assign manually</option>
                          {allProducts.map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>

                        <button
                          onClick={() => handleManualAssign(r.fileName, r.imageUrl!)}
                          disabled={!assigning[r.fileName]}
                          className="rounded-full bg-[#8B7355] px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50"
                        >
                          Assign
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}