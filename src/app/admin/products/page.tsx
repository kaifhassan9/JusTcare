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



  // Fetch products
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

      setError(
        "Something went wrong while loading products."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const deleteProduct = async (productId: number, productName: string) => {
  if (!confirm(`Delete "${productName}"? This cannot be undone.`)) {
    return;
  }

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
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: form.name,
        category: form.category,
        price: Number(form.price),
        image: form.image,
        requiresPrescription:
          form.requiresPrescription,
        stockCount: Number(form.stockCount || 0),
        description: form.description,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.error || "Failed to add product");
      return;
    }

    // Add new product to UI
    // setOrders; // REMOVE THIS LINE if you don't have it

    setProducts((currentProducts) => [
        data.product,
        ...currentProducts,
      ]);

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

  // Loading state
  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="text-4xl animate-spin">
              ⏳
            </div>

            <p className="mt-4 font-bold text-slate-700 dark:text-slate-300">
              Loading products...
            </p>
          </div>
        </div>
      </main>
    );
  }

  // Error state
  if (error) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="flex min-h-screen items-center justify-center px-4">
          <div className="text-center">
            <div className="text-5xl">
              ❌
            </div>

            <h1 className="mt-4 text-2xl font-extrabold text-slate-900 dark:text-white">
              Unable to Load Products
            </h1>

            <p className="mt-2 text-slate-500 dark:text-slate-400">
              {error}
            </p>

            <button
              onClick={fetchProducts}
              className="mt-6 rounded-xl bg-sky-600 px-6 py-3 font-bold text-white hover:bg-sky-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  // Statistics
  const totalProducts = products.length;

  const prescriptionProducts = products.filter(
    (product) => product.requiresPrescription
  ).length;

  const outOfStockProducts = products.filter(
    (product) => product.stockCount === 0
  ).length;

  const lowStockProducts = products.filter(
    (product) =>
      product.stockCount > 0 &&
      product.stockCount <= 5
  ).length;

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">

      {/* Header */}
      <section className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h1 className="text-3xl font-extrabold">
                Admin Products
              </h1>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Manage medicines and products in your pharmacy.
              </p>
            </div>

          

          </div>

        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-8">

           {/* ADD PRODUCT BUTTON */}
           <button
  onClick={() => setShowAddForm(true)}
  className="rounded-xl bg-gradient-to-r from-sky-600 to-teal-600 px-5 py-3 text-sm font-bold text-white shadow-lg hover:from-sky-700 hover:to-teal-700"
>
  + Add Product
</button>

    <Link
                 href="/admin/products/bulk"
               className="rounded-xl border border-[#6B7256] px-5 py-3 text-center text-sm
                font-bold text-[#6B7256] hover:bg-[#6B7256]/10 transition"
>
  📥 Bulk Upload
</Link>

 {/* ADD PRODUCT FORM */}

 {showAddForm && (
  <div className="mb-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">

    <h2 className="text-xl font-extrabold">
      Add New Product
    </h2>

    <div className="mt-6 grid gap-5 sm:grid-cols-2">

      <input
        type="text"
        placeholder="Product name"
        value={form.name}
        onChange={(e) =>
          setForm({
            ...form,
            name: e.target.value,
          })
        }
        className="rounded-xl border px-4 py-3"
      />

      <input
        type="text"
        placeholder="Category"
        value={form.category}
        onChange={(e) =>
          setForm({
            ...form,
            category: e.target.value,
          })
        }
        className="rounded-xl border px-4 py-3"
      />

      <input
        type="number"
        placeholder="Price"
        value={form.price}
        onChange={(e) =>
          setForm({
            ...form,
            price: e.target.value,
          })
        }
        className="rounded-xl border px-4 py-3"
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
        onChange={(e) =>
          setForm({
            ...form,
            stockCount: e.target.value,
          })
        }
        className="rounded-xl border px-4 py-3"
      />

      <textarea
        placeholder="Description"
        value={form.description}
        onChange={(e) =>
          setForm({
            ...form,
            description: e.target.value,
          })
        }
        className="rounded-xl border px-4 py-3"
      />

    </div>

    <label className="mt-5 flex items-center gap-3">
      <input
        type="checkbox"
        checked={form.requiresPrescription}
        onChange={(e) =>
          setForm({
            ...form,
            requiresPrescription: e.target.checked,
          })
        }
      />

      <span className="text-sm font-bold">
        Requires Prescription
      </span>
    </label>

    <div className="mt-6 flex gap-3">

      <button
        onClick={addProduct}
        disabled={addingProduct}
        className="rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white disabled:opacity-50"
      >
        {addingProduct
          ? "Adding..."
          : "Add Product"}
      </button>

      <button
        onClick={() => setShowAddForm(false)}
        className="rounded-xl bg-slate-200 px-5 py-3 font-bold text-slate-700"
      >
        Cancel
      </button>

    </div>

  </div>
)}

        {/* Statistics */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

          <StatCard
            title="Total Products"
            value={totalProducts}
            icon="📦"
          />

          <StatCard
            title="Prescription"
            value={prescriptionProducts}
            icon="💊"
          />

          <StatCard
            title="Low Stock"
            value={lowStockProducts}
            icon="⚠️"
          />

          <StatCard
            title="Out of Stock"
            value={outOfStockProducts}
            icon="❌"
          />

        </div>

        {/* Product Table */}
        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">

          {/* Table Header */}
          <div className="border-b border-slate-200 dark:border-slate-800 px-6 py-5">

            <h2 className="text-xl font-extrabold">
              All Products
            </h2>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {products.length} product
              {products.length !== 1 ? "s" : ""}
            </p>

          </div>

          {/* Empty State */}
          {products.length === 0 ? (
            <div className="px-6 py-16 text-center">

              <div className="text-5xl">
                📦
              </div>

              <h3 className="mt-4 text-lg font-bold">
                No Products Yet
              </h3>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Add your first product to get started.
              </p>

              <Link
                href="/admin/products/new"
                className="mt-6 inline-block rounded-xl bg-sky-600 px-6 py-3 font-bold text-white hover:bg-sky-700"
              >
                Add Product
              </Link>
          

            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full min-w-[1000px]">

                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Product
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Category
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Price
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Stock
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Prescription
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Action
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {products.map((product) => (
                    <tr
                      key={product.id}
                      className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
                    >

                      {/* Product */}
                      <td className="px-6 py-5">

                        <div className="flex items-center gap-4">

                          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">

                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-xl">
                                💊
                              </div>
                            )}

                          </div>

                          <div>
                            <p className="font-extrabold">
                              {product.name}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              ID: {product.id}
                            </p>
                          </div>

                        </div>

                      </td>

                      {/* Category */}
                      <td className="px-6 py-5">

                        <span className="inline-flex rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                          {product.category}
                        </span>

                      </td>

                      {/* Price */}
                      <td className="px-6 py-5">

                        <p className="font-extrabold">
                          ₹{product.price}
                        </p>

                      </td>

                      {/* Stock */}
                      <td className="px-6 py-5">

                        <StockBadge
                          stock={product.stockCount}
                        />

                      </td>

                      {/* Prescription */}
                      <td className="px-6 py-5">

                        {product.requiresPrescription ? (
                          <span className="inline-flex rounded-full bg-amber-500/10 px-3 py-1.5 text-xs font-extrabold text-amber-600 dark:text-amber-400">
                            Required
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                            Not Required
                          </span>
                        )}

                      </td>

                      {/* Action */}
                      <td className="px-6 py-5">
                      <div className="flex flex-col gap-2">
  <Link
    href={`/admin/products/${product.id}/edit`}
    className="rounded-lg bg-sky-500/10 px-3 py-2 text-center text-xs font-bold text-sky-600 dark:text-sky-400 hover:bg-sky-500/20"
  >
    Edit
  </Link>

  <button
    onClick={() => deleteProduct(product.id, product.name)}
    className="rounded-lg bg-red-500/10 px-3 py-2 text-center text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-500/20"
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


/* --------------------------------
   Statistics Card
--------------------------------- */

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-3xl font-extrabold">
            {value}
          </p>

        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/10 text-2xl">
          {icon}
        </div>

      </div>

    </div>
  );
}


/* --------------------------------
   Stock Badge
--------------------------------- */

function StockBadge({
  stock,
}: {
  stock: number;
}) {
  if (stock === 0) {
    return (
      <span className="inline-flex rounded-full bg-red-500/10 px-3 py-1.5 text-xs font-extrabold text-red-600 dark:text-red-400">
        Out of Stock
      </span>
    );
  }

  if (stock <= 5) {
    return (
      <span className="inline-flex rounded-full bg-amber-500/10 px-3 py-1.5 text-xs font-extrabold text-amber-600 dark:text-amber-400">
        Low: {stock}
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
      {stock}
    </span>
  );
}