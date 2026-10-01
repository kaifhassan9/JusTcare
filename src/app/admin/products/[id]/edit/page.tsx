"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [form, setForm] = useState({
    name: "",
    category: "",
    price: "",
    image: "",
    requiresPrescription: false,
    stockCount: "",
    description: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const response = await fetch(`/api/admin/products/${productId}`);
        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Failed to load product.");
          return;
        }

        const p = data.product;
        setForm({
          name: p.name,
          category: p.category,
          price: String(p.price),
          image: p.image,
          requiresPrescription: p.requiresPrescription,
          stockCount: String(p.stockCount),
          description: p.description || "",
        });
      } catch (err) {
        console.error("Fetch product error:", err);
        setError("Something went wrong while loading the product.");
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [productId]);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/products/upload-image", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Image upload failed.");
        return;
      }

      setForm((current) => ({ ...current, image: data.imageUrl }));
    } catch (error) {
      console.error("Image upload error:", error);
      alert("Something went wrong uploading the image.");
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          category: form.category,
          price: Number(form.price),
          image: form.image,
          requiresPrescription: form.requiresPrescription,
          stockCount: Number(form.stockCount || 0),
          description: form.description,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to update product.");
        setSaving(false);
        return;
      }

      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      console.error("Update product error:", err);
      setError("Something went wrong. Please try again.");
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F7F5EF] flex items-center justify-center">
        <p className="text-[#6B6650] font-bold">Loading product...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F5EF] text-[#3D3A2E]">
      <section className="mx-auto max-w-2xl px-4 sm:px-6 py-8">
        <Link href="/admin/products" className="text-sm font-semibold text-[#6B7256] hover:underline">
          ← Back to Products
        </Link>

        <div className="mt-4 rounded-2xl border border-[#DDD3BC] bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-extrabold text-[#3D3A2E]">Edit Product</h1>

          {error && (
            <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </p>
          )}

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <input
              type="text"
              placeholder="Product name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="rounded-xl border border-[#DDD3BC] bg-[#F7F5EF] px-4 py-3 text-sm"
            />

            <input
              type="text"
              placeholder="Category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="rounded-xl border border-[#DDD3BC] bg-[#F7F5EF] px-4 py-3 text-sm"
            />

            <input
              type="number"
              placeholder="Price"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="rounded-xl border border-[#DDD3BC] bg-[#F7F5EF] px-4 py-3 text-sm"
            />

            <input
              type="number"
              placeholder="Stock"
              value={form.stockCount}
              onChange={(e) => setForm({ ...form, stockCount: e.target.value })}
              className="rounded-xl border border-[#DDD3BC] bg-[#F7F5EF] px-4 py-3 text-sm"
            />

            <textarea
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="rounded-xl border border-[#DDD3BC] bg-[#F7F5EF] px-4 py-3 text-sm sm:col-span-2"
            />

            {/* Product Image — file upload, replacing the old plain URL text field */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#6B6650] mb-1.5">
                Product Image
              </label>

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageUpload}
                disabled={uploadingImage}
                className="rounded-xl border border-[#DDD3BC] bg-[#F7F5EF] px-4 py-3 w-full text-sm"
              />

              {uploadingImage && (
                <p className="mt-2 text-xs font-semibold text-[#6B7256]">Uploading...</p>
              )}

              {form.image && form.image.startsWith("http") && (
                <div className="mt-3 flex items-center gap-3">
                  <img src={form.image} alt="Preview" className="h-16 w-16 rounded-lg object-contain border border-[#DDD3BC]" />
                  <span className="text-xs text-[#6B6650]">Current image ✓</span>
                </div>
              )}

              {form.image && !form.image.startsWith("http") && (
                <div className="mt-3 flex items-center gap-2 text-sm">
                  <span className="text-2xl">{form.image}</span>
                  <span className="text-xs text-[#6B6650]">Current: emoji icon</span>
                </div>
              )}

              <p className="mt-2 text-[11px] text-[#8B8570]">
                Or type an emoji instead:
                <input
                  type="text"
                  placeholder="💊"
                  value={form.image?.startsWith("http") ? "" : form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  className="ml-2 w-16 rounded-lg border border-[#DDD3BC] px-2 py-1 text-sm"
                />
              </p>
            </div>
          </div>

          <label className="mt-5 flex items-center gap-3">
            <input
              type="checkbox"
              checked={form.requiresPrescription}
              onChange={(e) => setForm({ ...form, requiresPrescription: e.target.checked })}
              className="accent-[#6B7256]"
            />
            <span className="text-sm font-bold text-[#3D3A2E]">Requires Prescription</span>
          </label>

          <div className="mt-6 flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-full bg-[#6B7256] px-5 py-3 font-bold text-white hover:bg-[#5a6047] disabled:opacity-50 transition"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>

            <Link
              href="/admin/products"
              className="rounded-full bg-[#EDE6D6] px-5 py-3 font-bold text-[#3D3A2E] hover:bg-[#DDD3BC] transition"
            >
              Cancel
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}