"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
  requiresPrescription: boolean;
};

const MAIN_CATEGORIES = [
  { name: "All", icon: "📦" },
  { name: "Medicines", icon: "💊" },
  { name: "Skin Care", icon: "🧴" },
  { name: "Baby Care", icon: "🍼" },
  { name: "Healthcare Devices", icon: "🩺" },
];

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const searchQuery = searchParams.get("search") || "";
  const categoryParam = searchParams.get("category") || "All";

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20; // 4 columns * 5 rows

  // Reset pagination to page 1 whenever category or search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryParam]);

  // Fetch products from API whenever URL parameters change
  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const query = new URLSearchParams();
        if (searchQuery) query.set("search", searchQuery);
        if (categoryParam && categoryParam !== "All") {
          query.set("category", categoryParam);
        }

        const url = query.toString() ? `/api/products?${query}` : "/api/products";
        const response = await fetch(url);
        const data = await response.json();

        if (data.products) {
          setProducts(data.products);
        }
      } catch (error) {
        console.error("Failed to load products:", error);
      } {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [searchQuery, categoryParam]);

  // Handler to change active category and update URL
  const handleCategorySelect = (categoryName: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (categoryName === "All") {
      params.delete("category");
    } else {
      params.set("category", categoryName);
    }
    router.push(`/products?${params.toString()}`);
  };

  // Calculate slice range for 20 items per page
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProducts = products.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Helper for generating pagination buttons with ellipsis (...)
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, "...", totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }
    return pages;
  };

  if (loading) {
    return (
      <section className="flex min-h-[60vh] items-center justify-center bg-[#FAF8F5]">
        <p className="text-lg font-semibold text-[#5A564A]">
          Loading products...
        </p>
      </section>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF8F5] text-[#2C3325] font-sans">
      <Navbar />

      {/* Page Header */}
      <section className="border-b border-[#D5CDBF] bg-[#EBE5D8] py-8 sm:py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-[#556244] uppercase">
            <span>HOME</span>
            <span className="text-[#9E9584]">/</span>
            <span>PRODUCTS</span>
          </div>

          <h1 className="mt-3 font-[family-name:var(--font-poppins)] text-3xl sm:text-4xl font-bold tracking-tight text-[#2C3325]">
            Medicines & Healthcare Products
          </h1>

          <p className="mt-2 text-sm sm:text-base text-[#5A564A] max-w-2xl">
            Find medicines and healthcare products from our pharmacy.
          </p>
        </div>
      </section>

      {/* Products Area */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid gap-8 lg:grid-cols-[260px_1fr] items-start">

          {/* Filters Sidebar */}
          <aside className="hidden rounded-2xl border border-[#D5CDBF] bg-white p-6 shadow-sm lg:block sticky top-28">
            <div className="flex items-center justify-between pb-4 border-b border-[#EBE5D8]">
              <h2 className="font-bold text-lg text-[#2C3325] flex items-center gap-2">
                <span>⚡</span> Filters
              </h2>
            </div>

            <div className="mt-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#9E9584]">
                Category
              </h3>

              <div className="mt-4 flex flex-col gap-2">
                {MAIN_CATEGORIES.map((category) => (
                  <button
                    key={category.name}
                    onClick={() => handleCategorySelect(category.name)}
                    className={`flex items-center gap-3 w-full text-left p-3 rounded-xl transition ${
                      categoryParam === category.name
                        ? "bg-[#6B7256] text-white font-semibold"
                        : "bg-[#F5F1E8] hover:bg-[#EDE6D6] text-[#2C3325]"
                    }`}
                  >
                    <span>{category.icon}</span>
                    <span className="text-sm font-medium">{category.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Products Content Area */}
          <div>
            {/* Category Filter Pills (Mobile / Quick Filter) */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
              {MAIN_CATEGORIES.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => handleCategorySelect(cat.name)}
                  className={`shrink-0 rounded-full px-4 py-2 text-xs sm:text-sm font-semibold transition ${
                    categoryParam === cat.name
                      ? "bg-[#6B7256] text-white shadow-sm"
                      : "bg-white border border-[#D5CDBF] text-[#5A564A] hover:bg-[#EDE6D6]"
                  }`}
                >
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>

            {searchQuery && (
              <p className="mb-4 text-sm text-[#5A564A]">
                Showing results for <span className="font-bold text-[#2C3325]">"{searchQuery}"</span>
              </p>
            )}

            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#D5CDBF] bg-white p-4 shadow-sm">
              <p className="text-sm font-medium text-[#5A564A] flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#6B7256]"></span>
                <span className="font-bold text-[#2C3325]">{products.length}</span> products available
              </p>

              <div className="relative">
                <select className="appearance-none rounded-full border border-[#D5CDBF] bg-[#FAF8F5] pl-4 pr-9 py-2 text-xs sm:text-sm font-semibold text-[#2C3325] outline-none focus:border-[#6B7256] transition-all cursor-pointer">
                  <option>Sort: Popular</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Newest</option>
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#9E9584]">▼</div>
              </div>
            </div>

            {/* Empty or Loaded state */}
            {products.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-[#D5CDBF] bg-white p-16 text-center shadow-sm">
                <p className="text-4xl mb-3">📦</p>
                <p className="font-semibold text-[#5A564A]">No products found.</p>
              </div>
            ) : (
              <>
                {/* 4 Products per row grid layout (5 rows = 20 products per page) */}
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {currentProducts.map((product) => (
                    <ProductCard key={product.id} {...product} />
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-1.5 mt-10 py-4">
                    {/* Previous Button */}
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#D5CDBF] text-[#5A564A] hover:border-[#6B7256] hover:text-[#6B7256] disabled:opacity-40 disabled:hover:border-[#D5CDBF] disabled:hover:text-[#5A564A] transition-colors"
                      aria-label="Previous Page"
                    >
                      ‹
                    </button>

                    {/* Page Numbers */}
                    {getPageNumbers().map((page, index) => (
                      <React.Fragment key={index}>
                        {page === "..." ? (
                          <span className="w-9 h-9 flex items-center justify-center text-[#9E9584] font-medium">
                            ...
                          </span>
                        ) : (
                          <button
                            onClick={() => handlePageChange(Number(page))}
                            className={`w-9 h-9 flex items-center justify-center text-sm font-semibold rounded-lg transition-colors ${
                              currentPage === page
                                ? "border-2 border-[#6B7256] text-[#6B7256] bg-white shadow-xs"
                                : "border border-[#D5CDBF] text-[#2C3325] hover:border-[#6B7256] hover:text-[#6B7256] bg-white"
                            }`}
                          >
                            {page}
                          </button>
                        )}
                      </React.Fragment>
                    ))}

                    {/* Next Button */}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#D5CDBF] text-[#5A564A] hover:border-[#6B7256] hover:text-[#6B7256] disabled:opacity-40 disabled:hover:border-[#D5CDBF] disabled:hover:text-[#5A564A] transition-colors"
                      aria-label="Next Page"
                    >
                      ›
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#FAF8F5] text-[#5A564A]">
          Loading...
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}