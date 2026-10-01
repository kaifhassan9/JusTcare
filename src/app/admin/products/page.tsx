"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
  requiresPrescription: boolean;
  stockCount: number;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const [form, setForm] = useState({
    name: "",
    category: "",
    price: "",
    image: "",
    requiresPrescription: false,
    stockCount: "",
    description: "",
  });

  const [addingProduct, setAddingProduct] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/products");
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to load products.");
        return;
      }

      setProducts(data.products);
    } catch (error) {
      console.error("Fetch admin products error:", error);
      setError("Something went wrong while loading products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const deleteProduct = async (productId: number, productName: string) => {
    if (!confirm(`Delete "${productName}"? This cannot be undone.`)) return;

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to delete product.");
        return;
      }

      setProducts((current) => current.filter((p) => p.id !== productId));
    } catch (error) {
      console.error("Delete product error:", error);
      alert("Something went wrong.");
    }
  };

  const addProduct = async () => {
    try {
      setAddingProduct(true);

      const response = await fetch("/api/admin/products", {
        method: "POST",
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
        alert(data.error || "Failed to add product");
        return;
      }

      setProducts((currentProducts) => [data.product, ...currentProducts]);

      setForm({
        name: "",
        category: "",
        price: "",
        image: "",
        requiresPrescription: false,
        stockCount: "",
        description: "",
      });

      setShowAddForm(false);
      alert("Product added successfully!");
    } catch (error) {
      console.error("Add product error:", error);
      alert("Something went wrong.");
    } finally {
      setAddingProduct(false);
    }
  };

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

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F7F5EF]">
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="text-4xl animate-spin">⏳</div>
            <p className="mt-4 font-bold text-[#3D3A2E]">Loading products...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#F7F5EF]">
        <div className="flex min-h-screen items-center justify-center px-4">
          <div className="text-center">
            <div className="text-5xl">❌</div>
            <h1 className="mt-4 text-2xl font-extrabold text-[#3D3A2E]">Unable to Load Products</h1>
            <p className="mt-2 text-[#6B6650]">{error}</p>
            <button
              onClick={fetchProducts}
              className="mt-6 rounded-full bg-[#6B7256] px-6 py-3 font-bold text-white hover:bg-[#5a6047] transition"
            >
              Try Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  const totalProducts = products.length;
  const prescriptionProducts = products.filter((p) => p.requiresPrescription).length;
  const outOfStockProducts = products.filter((p) => p.stockCount === 0).length;
  const lowStockProducts = products.filter((p) => p.stockCount > 0 && p.stockCount <= 5).length;

  return (
    <main className="min-h-screen bg-[#F7F5EF] text-[#3D3A2E]">

      {/* Header */}
      <section className="border-b border-[#DDD3BC] bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
          <h1 className="text-3xl font-extrabold text-[#3D3A2E]">Admin Products</h1>
          <p className="mt-1 text-sm text-[#6B6650]">Manage medicines and products in your pharmacy.</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-8">

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowAddForm(true)}
            className="rounded-full bg-[#6B7256] px-5 py-3 text-sm font-bold text-white hover:bg-[#5a6047] transition"
          >
            + Add Product
          </button>

          <Link
            href="/admin/products/bulk"
            className="rounded-full border border-[#6B7256] px-5 py-3 text-center text-sm font-bold text-[#6B7256] hover:bg-[#6B7256]/10 transition"
          >
            📥 Bulk Upload (CSV)
          </Link>

          <Link
            href="/admin/products/bulk-images"
            className="rounded-full border border-[#8B7355] px-5 py-3 text-center text-sm font-bold text-[#8B7355] hover:bg-[#8B7355]/10 transition"
          >
            🖼️ Bulk Images
          </Link>
        </div>

        {/* Add Product Form */}
        {showAddForm && (
          <div className="mt-6 rounded-2xl border border-[#DDD3BC] bg-white p-6 shadow-sm">
            <h2 className="text-xl font-extrabold text-[#3D3A2E]">Add New Product</h2>

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
                    <span className="text-xs text-[#6B6650]">Image uploaded ✓</span>
                  </div>
                )}

                <p className="mt-2 text-[11px] text-[#8B8570]">
                  Or leave blank and type an emoji instead:
                  <input
                    type="text"
                    placeholder="💊"
                    value={form.image?.startsWith("http") ? "" : form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                    className="ml-2 w-16 rounded-lg border border-[#DDD3BC] px-2 py-1 text-sm"
                  />
                </p>
              </div>

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
                className="rounded-xl border border-[#DDD3BC] bg-[#F7F5EF] px-4 py-3 text-sm"
              />
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
                onClick={addProduct}
                disabled={addingProduct}
                className="rounded-full bg-[#6B7256] px-5 py-3 font-bold text-white hover:bg-[#5a6047] disabled:opacity-50 transition"
              >
                {addingProduct ? "Adding..." : "Add Product"}
              </button>

              <button
                onClick={() => setShowAddForm(false)}
                className="rounded-full bg-[#EDE6D6] px-5 py-3 font-bold text-[#3D3A2E] hover:bg-[#DDD3BC] transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Statistics */}
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Products" value={totalProducts} icon="📦" />
          <StatCard title="Prescription" value={prescriptionProducts} icon="💊" />
          <StatCard title="Low Stock" value={lowStockProducts} icon="⚠️" />
          <StatCard title="Out of Stock" value={outOfStockProducts} icon="❌" />
        </div>

        {/* Product Table */}
        <div className="mt-8 overflow-hidden rounded-2xl border border-[#DDD3BC] bg-white shadow-sm">
          <div className="border-b border-[#EDE6D6] px-6 py-5">
            <h2 className="text-xl font-extrabold text-[#3D3A2E]">All Products</h2>
            <p className="mt-1 text-xs text-[#8B8570]">
              {products.length} product{products.length !== 1 ? "s" : ""}
            </p>
          </div>

          {products.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="text-5xl">📦</div>
              <h3 className="mt-4 text-lg font-bold text-[#3D3A2E]">No Products Yet</h3>
              <p className="mt-1 text-sm text-[#6B6650]">Add your first product to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px]">
                <thead>
                  <tr className="border-b border-[#EDE6D6] bg-[#F7F5EF]">
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase text-[#8B8570]">Product</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase text-[#8B8570]">Category</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase text-[#8B8570]">Price</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase text-[#8B8570]">Stock</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase text-[#8B8570]">Prescription</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase text-[#8B8570]">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b border-[#F0EBE0] last:border-0 hover:bg-[#F7F5EF] transition">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-[#DDD3BC] bg-[#F7F5EF]">
                            {product.image ? (
                              <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-xl">💊</div>
                            )}
                          </div>
                          <div>
                            <p className="font-extrabold text-[#3D3A2E]">{product.name}</p>
                            <p className="mt-1 text-xs text-[#8B8570]">ID: {product.id}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <span className="inline-flex rounded-full bg-[#EDE6D6] px-3 py-1.5 text-xs font-bold text-[#3D3A2E]">
                          {product.category}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <p className="font-extrabold text-[#3D3A2E]">₹{product.price}</p>
                      </td>

                      <td className="px-6 py-5">
                        <StockBadge stock={product.stockCount} />
                      </td>

                      <td className="px-6 py-5">
                        {product.requiresPrescription ? (
                          <span className="inline-flex rounded-full bg-[#8B7355]/15 px-3 py-1.5 text-xs font-extrabold text-[#8B7355]">
                            Required
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-[#6B7256]/15 px-3 py-1.5 text-xs font-extrabold text-[#6B7256]">
                            Not Required
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-2">
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="rounded-full bg-[#6B7256]/10 px-3 py-2 text-center text-xs font-bold text-[#6B7256] hover:bg-[#6B7256]/20 transition"
                          >
                            Edit
                          </Link>

                          <button
                            onClick={() => deleteProduct(product.id, product.name)}
                            className="rounded-full bg-red-50 px-3 py-2 text-center text-xs font-bold text-red-600 hover:bg-red-100 transition"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function StatCard({ title, value, icon }: { title: string; value: number; icon: string }) {
  return (
    <div className="rounded-2xl border border-[#DDD3BC] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#8B8570]">{title}</p>
          <p className="mt-2 text-3xl font-extrabold text-[#3D3A2E]">{value}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#6B7256]/10 text-2xl">
          {icon}
        </div>
      </div>
    </div>
  );
}

function StockBadge({ stock }: { stock: number }) {
  if (stock === 0) {
    return (
      <span className="inline-flex rounded-full bg-red-50 px-3 py-1.5 text-xs font-extrabold text-red-600">
        Out of Stock
      </span>
    );
  }

  if (stock <= 5) {
    return (
      <span className="inline-flex rounded-full bg-amber-100 px-3 py-1.5 text-xs font-extrabold text-amber-700">
        Low: {stock}
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full bg-[#6B7256]/15 px-3 py-1.5 text-xs font-extrabold text-[#6B7256]">
      {stock}
    </span>
  );
}