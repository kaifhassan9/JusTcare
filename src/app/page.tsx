"use client";
import Navbar from "@/components/Navbar";
import WhyChooseUs from "@/components/WhyChooseUs";
import Footer from "@/components/Footer";
import Link from "next/link";
import { useEffect, useState } from "react";
import ProductRow from "@/components/productRow";
import { useRouter } from "next/navigation";
import AboutSection from "@/components/AboutSection";
import FAQSection from "@/components/FAQSection";
import BrandsSection from "@/components/BrandsSection";
import WellnessBanner from "@/components/WellnessBanner";

type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
  requiresPrescription: boolean;
};

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [heroSearch, setHeroSearch] = useState("");  

  function handleHeroSearch(e: React.FormEvent) {
    e.preventDefault();
    if (heroSearch.trim()) {
      router.push(`/products?search=${encodeURIComponent(heroSearch.trim())}`);
    }
  }

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch("/api/products");
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
  }, []);

  const under100 = products.filter((p) => p.price < 100);

  const newest = [...products]
    .sort((a, b) => b.id - a.id)
    .slice(0, 8);

  const categories = Array.from(new Set(products.map((p) => p.category)));

  const categoryRows = categories.map((cat) => ({
    category: cat,
    items: products.filter((p) => p.category === cat).slice(0, 8),
  }));

  return (
    <main className="min-h-screen bg-[#F7F9FC]">
      <Navbar />

      {/* Hero */}
      <section
        className="w-full bg-[#6B7256] bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/pharmacy full image.png')" }}
      >
        <div className="bg-[#6B7256]/60 w-full">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-14">
            <div className="max-w-xl space-y-5 text-center lg:text-left">
              <h1 className="font-[family-name:var(--font-poppins)] text-2xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
                TRUSTED HEALTHCARE,<br />
                DELIVERED TO YOU.
              </h1>

              <div className="max-w-md mx-auto lg:mx-0 pt-2">
                <form onSubmit={handleHeroSearch} className="max-w-md mx-auto lg:mx-0 pt-2">
                  <div className="flex items-center rounded-full bg-white px-5 py-3 shadow-md">
                    <svg className="h-5 w-5 text-[#8B8570] mr-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      value={heroSearch}
                      onChange={(e) => setHeroSearch(e.target.value)}
                      placeholder="Search medicines..."
                      className="w-full bg-transparent text-sm outline-none placeholder-[#8B8570] text-[#3D3A2E]"
                    />
                    <button type="submit" className="rounded-full bg-[#6B7256] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#5a6047] transition shrink-0">
                      Search
                    </button>
                  </div>
                </form>
              </div>

              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-full bg-[#F5F1E8] px-7 py-3 text-sm font-bold text-[#3D3A2E] hover:bg-white transition"
              >
                Shop Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Promo Cards Row */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">

          {/* Upload Prescription */}
          <Link
            href="/prescription"
            className="flex items-center justify-between rounded-2xl bg-[#E4E7DC] p-4 cursor-pointer hover:shadow-md transition"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-lg">
                <i className="fa-regular fa-file text-black"></i>
              </span>
              <div>
                <p className="text-sm font-bold text-[#3D3A2E]">Upload</p>
                <p className="text-xs text-[#6B7256] font-semibold">Prescription</p>
              </div>
            </div>
            <span className="text-[#6B7256] text-lg"><i className="fa-solid fa-circle-arrow-right"></i></span>
          </Link>

          {/* Doctor Appointment */}
          <div className="flex items-center justify-between rounded-2xl bg-[#E4DEEF] p-4 opacity-70 cursor-not-allowed">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-lg">
                <i className="fa-solid fa-user-doctor text-blue-500"></i>
              </span>
              <div>
                <p className="text-sm font-bold text-[#3D3A2E]">Doctor</p>
                <p className="text-xs text-[#7B6F8F] font-semibold">Appointment</p>
              </div>
            </div>
            <span className="rounded-full bg-white/70 px-2 py-0.5 text-[9px] font-bold text-[#7B6F8F]">
              SOON
            </span>
          </div>

          {/* Health Insurance */}
          <div className="flex items-center justify-between rounded-2xl bg-[#F0E6D2] p-4 opacity-70 cursor-not-allowed">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-lg">
                <i className="fa-solid fa-shield-halved text-green-500"></i>
              </span>
              <div>
                <p className="text-sm font-bold text-[#3D3A2E]">Health</p>
                <p className="text-xs text-[#8B7355] font-semibold">Insurance</p>
              </div>
            </div>
            <span className="rounded-full bg-white/70 px-2 py-0.5 text-[9px] font-bold text-[#8B7355]">
              SOON
            </span>
          </div>

          {/* Lab Tests */}
          <div className="flex items-center justify-between rounded-2xl bg-[#F3DEDE] p-4 opacity-70 cursor-not-allowed">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-lg">
                <i className="fa-solid fa-microscope text-red-500"></i>
              </span>
              <div>
                <p className="text-sm font-bold text-[#3D3A2E]">Lab Tests</p>
                <p className="text-xs text-[#B06868] font-semibold">At Home</p>
              </div>
            </div>
            <span className="rounded-full bg-white/70 px-2 py-0.5 text-[9px] font-bold text-[#B06868]">
              SOON
            </span>
          </div>

        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-16">
        <h2 className="font-[family-name:var(--font-poppins)] text-2xl font-bold text-slate-800">
          Shop by Category
        </h2>

        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { name: "Medicines", icon: "💊" },
            { name: "Skin Care", icon: "🧴" },
            { name: "Baby Care", icon: "🍼" },
            { name: "Healthcare Devices", icon: "🩺" },
          ].map((category) => (
            <Link
              key={category.name}
              href={`/products?category=${encodeURIComponent(category.name)}`}
              className="cursor-pointer rounded-2xl bg-[#EDE6D6] border border-[#DDD3BC] p-6 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md block"
            >
              <div className="text-3xl">{category.icon}</div>
              <h3 className="mt-3 font-semibold text-slate-700 text-sm">
                {category.name}
              </h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Product Rows */}
      {!loading && (
        <>
          <ProductRow
            title="Popular Products"
            subtitle="Frequently purchased healthcare products"
            products={products.slice(0, 8)}
            viewAllHref="/products"
          />

          <ProductRow
            title="Under ₹100"
            subtitle="Everyday essentials at great value"
            products={under100}
            viewAllHref="/products"
          />

          <ProductRow
            title="New Arrivals"
            subtitle="Recently added to our pharmacy"
            products={newest}
            viewAllHref="/products"
          />
        </>
      )}

      <BrandsSection />
      <WellnessBanner />
      <WhyChooseUs />
      <AboutSection />
      <FAQSection />
      <Footer />
    </main>
  );
}