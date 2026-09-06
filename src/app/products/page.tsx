"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
  requiresPrescription: boolean;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState("All");
    const searchParams = useSearchParams();
const searchQuery = searchParams.get("search") || "";

  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts =
    activeCategory === "All"
      ? products
      : products.filter((p) => p.category === activeCategory);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const url = searchQuery
        ? `/api/products?search=${encodeURIComponent(searchQuery)}`
        : "/api/products";
      const response = await fetch(url);
      const data = await response.json();

        if (data.products) {
          setProducts(data.products);
        }
      } catch (error) {
        console.error("Failed to load products:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [searchQuery]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FAF8F5] dark:bg-[#1E2319]">
        <Navbar />
        <section className="flex min-h-[60vh] items-center justify-center">
          <p className="text-lg font-semibold text-[#5A564A] dark:text-[#C5BAA2]">
            Loading products...
          </p>
        </section>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF8F5] dark:bg-[#1E2319] text-[#2C3325] dark:text-[#F5F2EB] font-sans">
      <Navbar />

      {/* Page Header */}
      <section className="border-b border-[#D5CDBF] dark:border-[#3D4734] bg-[#EBE5D8] dark:bg-[#252B1F] py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-[#556244] dark:text-[#C5BAA2] uppercase">
            <span>HOME</span>
            <span className="text-[#9E9584] dark:text-[#5A564A]">/</span>
            <span>PRODUCTS</span>
          </div>

          <h1 className="mt-3 font-[family-name:var(--font-poppins)] text-3xl sm:text-4xl font-bold tracking-tight text-[#2C3325] dark:text-[#F5F2EB]">
            Medicines & Healthcare Products
          </h1>

          <p className="mt-2 text-base text-[#5A564A] dark:text-[#C5BAA2] max-w-2xl">
            Find medicines and healthcare products from our pharmacy.
          </p>
        </div>
      </section>

      {/* Products Area */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid gap-8 lg:grid-cols-[260px_1fr] items-start">

          {/* Filters Sidebar */}
          <aside className="hidden rounded-2xl border border-[#D5CDBF] dark:border-[#3D4734] bg-white dark:bg-[#252B1F] p-6 shadow-sm lg:block sticky top-28">
            <div className="flex items-center justify-between pb-4 border-b border-[#EBE5D8] dark:border-[#3D4734]">
              <h2 className="font-bold text-lg text-[#2C3325] dark:text-[#F5F2EB] flex items-center gap-2">
                <span>⚡</span> Filters
              </h2>
            </div>

            <div className="mt-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#9E9584] dark:text-[#C5BAA2]">
                Category
              </h3>

              <div className="mt-4 space-y-3 text-sm font-medium text-[#2C3325] dark:text-[#EBE5D8]">
                {["Medicines", "Vitamins & Supplements", "Personal Care", "Baby Care", "Healthcare Devices"].map((cat) => (
                  <label key={cat} className="flex items-center gap-3 cursor-pointer hover:text-[#556244] dark:hover:text-[#C5BAA2] transition-colors">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-[#D5CDBF] dark:border-[#3D4734] accent-[#556244]"
                    />
                    {cat}
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-6 border-t border-[#EBE5D8] dark:border-[#3D4734] pt-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#9E9584] dark:text-[#C5BAA2]">
                Availability
              </h3>

              <label className="mt-4 flex items-center gap-3 text-sm font-medium text-[#2C3325] dark:text-[#EBE5D8] cursor-pointer hover:text-[#556244] dark:hover:text-[#C5BAA2] transition-colors">
                <input type="checkbox" className="h-4 w-4 rounded border-[#D5CDBF] dark:border-[#3D4734] accent-[#556244]" />
                In Stock
              </label>
            </div>
          </aside>

          {/* Products Content */}
          <div>
                        {/* Category Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                    activeCategory === cat
                      ? "bg-[#6B7256] text-white"
                      : "bg-white border border-[#DDD3BC] text-[#6B6650] hover:bg-[#EDE6D6]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            {searchQuery && (
  <p className="mb-4 text-sm text-[#6B6650]">
    Showing results for <span className="font-bold text-[#3D3A2E]">"{searchQuery}"</span>
  </p>
)}
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#D5CDBF] dark:border-[#3D4734] bg-white dark:bg-[#252B1F] p-4 shadow-sm">
              <p className="text-sm font-medium text-[#5A564A] dark:text-[#C5BAA2] flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#556244] dark:bg-[#8B976B]"></span>
                <span className="font-semibold text-[#2C3325] dark:text-[#F5F2EB]">{products.length}</span> products available
              </p>

              <div className="relative">
                <select className="appearance-none rounded-full border border-[#D5CDBF] dark:border-[#3D4734] bg-[#FAF8F5] dark:bg-[#1E2319] pl-4 pr-8 py-2 text-sm font-semibold text-[#2C3325] dark:text-[#F5F2EB] outline-none focus:border-[#556244] transition-all">
                  <option>Sort: Popular</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Newest</option>
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#9E9584] dark:text-[#C5BAA2]">▼</div>
              </div>
            </div>

            {/* Empty state */}
                       {filteredProducts.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-[#DDD3BC] bg-white p-16 text-center">
                <p className="text-4xl mb-3">📦</p>
                <p className="font-semibold text-[#6B6650]">No products found.</p>
              </div>
            ) : (
              <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} {...product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}