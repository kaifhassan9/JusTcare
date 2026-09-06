"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import QuantitySelector from "@/components/QuantitySelector";
import { useCart } from "@/context/CartContext";

type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
  requiresPrescription: boolean;
  stockCount: number;
  description: string | null;
};

export default function ProductDetailsPage() {
  const params = useParams();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const productId = params.id as string;

  useEffect(() => {
    async function fetchProduct() {
      try {
        const response = await fetch(`/api/products/${productId}`);
        const data = await response.json();

        if (data.product) {
          setProduct(data.product);
          setSimilarProducts(data.similarProducts || []);
        }
      } catch (error) {
        console.error("Failed to load product:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [productId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F7F5EF]">
        <Navbar />
        <section className="flex min-h-[60vh] items-center justify-center">
          <p className="text-lg font-semibold text-[#6B6650]">Loading product...</p>
            
        </section>
        <Footer />
      </main>
    );
  }
    if (!product) {
    return (
      <main className="min-h-screen bg-[#F7F5EF]">
        <Navbar />
        <section className="flex min-h-[60vh] items-center justify-center px-4 sm:px-6">
          <div className="rounded-3xl border border-[#DDD3BC] bg-white p-8 sm:p-12 text-center shadow-sm">
            <h1 className="text-2xl font-extrabold text-[#3D3A2E]">Product Not Found</h1>
            <Link
              href="/products"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-[#6B7256] hover:underline"
            >
              ← Back to Products
            </Link>
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  const totalPrice = product.price * quantity;

  const handleAddToCart = () => {
    addToCart(
      {
        id: product.id,
        name: product.name,
        category: product.category,
        price: product.price,
        image: product.image,
        requiresPrescription: product.requiresPrescription,
      },
      quantity
    );

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <main className="min-h-screen bg-[#F7F5EF]">
      <Navbar />

      {/* Breadcrumb */}
      <div className="bg-[#F7F5EF]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 text-xs sm:text-sm font-medium text-[#3D3A2E] flex items-center gap-2 overflow-x-auto">
          <Link href="/" className="hover:text-[#6B7256] transition-colors">Home</Link>
          <span className="text-[#8B8570]">/</span>
          <Link href="/products" className="hover:text-[#6B7256] transition-colors">Products</Link>
          <span className="text-[#8B8570]">/</span>
          <span className="font-bold text-[#3D3A2E] truncate">{product.name}</span>
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid gap-8 lg:gap-12 rounded-3xl border border-[#DDD3BC] bg-white p-6 sm:p-10 shadow-sm md:grid-cols-2 items-center">

          {/* Product Image */}
          <div className="relative flex min-h-[350px] sm:min-h-[420px] items-center justify-center rounded-2xl bg-[#F7F5EF] p-8 overflow-hidden group">
            {product.image?.startsWith("http") ? (
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <span className="text-8xl sm:text-9xl transition-transform duration-300 group-hover:scale-110">
                {product.image}
              </span>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col justify-center">
            <p className="text-xs font-bold uppercase tracking-wider text-[#6B7256]">
              {product.category}
            </p>

            <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#3D3A2E]">
              {product.name}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-2.5">
              {product.stockCount > 0 ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#6B7256]/15 border border-[#6B7256]/30 px-3 py-1 text-xs font-bold text-[#6B7256]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#6B7256]"></span>
                  ✓ In Stock
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 border border-red-200 px-3 py-1 text-xs font-bold text-red-600">
                  Out of Stock
                </span>
              )}

              {product.requiresPrescription && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#8B7355]/15 border border-[#8B7355]/30 px-3 py-1 text-xs font-bold text-[#8B7355]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#8B7355]"></span>
                  Prescription Required
                </span>
              )}
            </div>

            <div className="mt-6 rounded-2xl border border-[#DDD3BC] bg-[#F7F5EF] p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-[#8B8570]">Price</p>
              <p className="mt-1 text-3xl font-extrabold text-[#3D3A2E]">₹{product.price}</p>

              {quantity > 1 && (
                <p className="mt-1.5 text-xs font-medium text-[#6B6650]">
                  ₹{product.price} × {quantity} ={" "}
                  <span className="font-extrabold text-[#3D3A2E]">₹{totalPrice}</span>
                </p>
              )}
            </div>

            <p className="mt-6 text-sm leading-relaxed text-[#6B6650]">
              {product.description ||
                "This product is available from our pharmacy. Please check the product information and follow the appropriate instructions before use."}
            </p>

            <div className="mt-6">
              <QuantitySelector quantity={quantity} setQuantity={setQuantity} min={1} max={10} />
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={product.stockCount === 0}
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-bold text-white shadow-sm transition-all active:scale-[0.99] bg-[#8B7355] hover:bg-[#7a6549] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {added ? "✓ Added to Cart" : `🛒 Add ${quantity} to Cart`}
            </button>

            {product.requiresPrescription && (
              <div className="mt-4 rounded-2xl border border-[#8B7355]/30 bg-[#8B7355]/10 p-4 text-xs leading-relaxed text-[#3D3A2E] flex items-start gap-2">
                <span>⚠️</span>
                <span>A valid prescription may be required. Our pharmacy team will verify it before fulfilling the order.</span>
              </div>
            )}
          </div>
        </div>
      </section>
            {/* Similar Products */}
      {similarProducts.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-12">
          <h2 className="font-[family-name:var(--font-poppins)] text-2xl font-bold text-[#3D3A2E] mb-6">
            You May Also Like
          </h2>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {similarProducts.map((item) => (
              <Link
                key={item.id}
                href={`/products/${item.id}`}
                className="group rounded-2xl border border-[#DDD3BC] bg-white p-4 transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex h-40 w-full items-center justify-center overflow-hidden rounded-xl bg-[#F7F5EF]">
                  {item.image?.startsWith("http") ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-contain transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <span className="text-5xl">{item.image}</span>
                  )}
                </div>

                <p className="mt-3 text-[11px] font-bold uppercase tracking-wider text-[#6B7256]">
                  {item.category}
                </p>

                <h3 className="mt-1 line-clamp-2 text-sm font-bold text-[#3D3A2E] group-hover:text-[#6B7256] transition-colors">
                  {item.name}
                </h3>

                <p className="mt-2 text-lg font-extrabold text-[#3D3A2E]">
                  ₹{item.price}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <Footer />
    </main>
  );
}