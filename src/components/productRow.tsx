"use client";

import Link from "next/link";
import ProductCard from "@/components/ProductCard";

type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
  requiresPrescription: boolean;
};

export default function ProductRow({
  title,
  subtitle,
  products,
  viewAllHref,
}: {
  title: string;
  subtitle?: string;
  products: Product[];
  viewAllHref?: string;
}) {
  if (products.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-12">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-[family-name:var(--font-poppins)] text-2xl font-bold text-[#3D3A2E]">
            {title}
          </h2>
          {subtitle && <p className="mt-1 text-sm text-[#6B6650]">{subtitle}</p>}
        </div>

        {viewAllHref && (
          <Link href={viewAllHref} className="text-sm font-semibold text-[#6B7256] hover:underline shrink-0">
            View All →
          </Link>
        )}
      </div>

      <div className="flex gap-5 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-thin">
        {products.map((product) => (
          <div key={product.id} className="w-56 shrink-0">
            <ProductCard {...product} />
          </div>
        ))}
      </div>
    </section>
  );
}