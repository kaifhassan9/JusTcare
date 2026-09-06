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
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <p className="text-slate-500 font-bold">Loading product...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <section className="mx-auto max-w-2xl px-4 sm:px-6 py-8">
        <Link
          href="/admin/products"
          className="text-sm font-semibold text-sky-600 hover:underline"
        >
          ← Back to Products
        </Link>

        <div className="mt-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <h1 className="text-2xl font-extrabold">Edit Product</h1>

          {error && (
            <p className="mt-4 rounded-lg bg-red-50 dark:bg-red-950/30 px-4 py-3 text-sm font-semibold text-red-700 dark:text-red-400">
              {error}
            </p>
          )}

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <input
              type="text"
              placeholder="Product name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3"
            />

            <input
              type="text"
              placeholder="Category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3"
            />

            <input
              type="number"
              placeholder="Price"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3"
            />

                  <input
        type="text"
        placeholder="Image URL (https://...) or emoji like 💊"
        value={form.image}
        onChange={(e) => setForm({ ...form, image: e.target.value })}
        className="rounded-xl border px-4 py-3"
      />

            <input
              type="number"
              placeholder="Stock"
              value={form.stockCount}
              onChange={(e) => setForm({ ...form, stockCount: e.target.value })}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3"
            />

            <textarea
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 sm:col-span-2"
            />
          </div>

          <label className="mt-5 flex items-center gap-3">
            <input
              type="checkbox"
              checked={form.requiresPrescription}
              onChange={(e) =>
                setForm({ ...form, requiresPrescription: e.target.checked })
              }
            />
            <span className="text-sm font-bold">Requires Prescription</span>
          </label>

          <div className="mt-6 flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>

            <Link
              href="/admin/products"
              className="rounded-xl bg-slate-200 dark:bg-slate-800 px-5 py-3 font-bold text-slate-700 dark:text-slate-200"
            >
              Cancel
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}