"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal, cartCount } = useCart();

  // Empty cart view
  if (cart.length === 0) {
    return (
      <main className="min-h-screen bg-[#F7F5EF] text-[#3D3A2E]">
        <Navbar />

        <section className="flex min-h-[65vh] items-center justify-center px-4 sm:px-6">
          <div className="max-w-md w-full rounded-3xl border border-[#DDD3BC] bg-white p-8 sm:p-10 text-center shadow-sm">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-[#F7F5EF] text-6xl border border-[#DDD3BC]">
              🛒
            </div>

            <h1 className="mt-6 text-2xl font-extrabold text-[#3D3A2E]">
              Your Cart is Empty
            </h1>

            <p className="mt-2 text-sm text-[#6B6650]">
              You haven't added any products yet.
            </p>

            <Link
              href="/products"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#6B7256] px-7 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-[#5a6047] transition-all"
            >
              Browse Products <span>→</span>
            </Link>
          </div>
        </section>

        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F5EF] text-[#3D3A2E]">
      <Navbar />

      {/* Header Banner */}
      <section className="border-b border-[#DDD3BC] bg-[#EDE6D6] py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-[#3D3A2E]">
            Shopping Cart
          </h1>
          <p className="mt-1 text-sm font-medium text-[#6B6650]">
            Review your items before checkout.
          </p>
        </div>
      </section>

      {/* Cart Container */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid gap-8 lg:grid-cols-3 items-start">

          {/* Cart Items List */}
          <div className="space-y-4 lg:col-span-2">

            {cart.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-[#DDD3BC] bg-white p-5 sm:p-6 shadow-sm transition-all hover:shadow-md"
              >
                <div className="flex flex-col sm:flex-row gap-5">

                  {/* Product Image */}
                  <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#F7F5EF] border border-[#DDD3BC] p-2">
                    {item.image?.startsWith("http") ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <span className="text-5xl">{item.image}</span>
                    )}
                  </div>

                  {/* Item Details */}
                  <div className="flex flex-1 flex-col justify-between">

                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-[#6B7256]">
                          {item.category}
                        </p>
                        <h2 className="mt-1 text-base sm:text-lg font-bold text-[#3D3A2E]">
                          {item.name}
                        </h2>
                        <p className="mt-1 text-xs font-medium text-[#8B8570]">
                          ₹{item.price} per unit
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="rounded-lg px-2.5 py-1 text-xs font-bold text-red-500 hover:bg-red-50 transition-colors"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="mt-4 flex flex-wrap items-end justify-between gap-4 pt-4 border-t border-[#EDE6D6]">

                      {/* Quantity Stepper */}
                      <div>
                        <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-[#8B8570]">
                          Quantity
                        </p>

                        <div className="flex h-9 items-center overflow-hidden rounded-full border border-[#DDD3BC] bg-[#F7F5EF] p-0.5">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="flex h-full w-9 items-center justify-center rounded-full text-base font-bold text-[#3D3A2E] hover:bg-white transition-all active:scale-95"
                          >
                            −
                          </button>

                          <span className="flex h-full w-10 items-center justify-center text-xs font-extrabold text-[#3D3A2E]">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="flex h-full w-9 items-center justify-center rounded-full text-base font-bold text-[#6B7256] hover:bg-white transition-all active:scale-95"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Item Total */}
                      <div className="text-right">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-[#8B8570]">
                          Item Total
                        </p>
                        <p className="mt-0.5 text-lg font-extrabold text-[#3D3A2E]">
                          ₹{item.price * item.quantity}
                        </p>
                      </div>

                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="pt-2">
              <Link
                href="/products"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-[#6B7256] hover:underline transition-colors"
              >
                ← Continue Shopping
              </Link>
            </div>

          </div>

          {/* Order Summary */}
          <div className="rounded-2xl border border-[#DDD3BC] bg-white p-6 shadow-sm sticky top-28">

            <h2 className="text-xl font-extrabold text-[#3D3A2E] flex items-center justify-between pb-4 border-b border-[#EDE6D6]">
              <span>Order Summary</span>
              <span className="text-xs font-semibold text-[#8B8570]">
                ({cartCount} items)
              </span>
            </h2>

            <div className="mt-6 space-y-3.5">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-[#6B6650]">Subtotal</span>
                <span className="font-bold text-[#3D3A2E]">₹{cartTotal}</span>
              </div>

              <div className="flex justify-between text-sm items-center">
                <span className="font-medium text-[#6B6650]">Delivery</span>
                <span className="rounded-full bg-[#6B7256]/15 px-2 py-0.5 text-xs font-extrabold text-[#6B7256]">
                  FREE
                </span>
              </div>

              <div className="border-t border-[#EDE6D6] pt-4">
                <div className="flex justify-between items-baseline">
                  <span className="text-base font-bold text-[#3D3A2E]">Total</span>
                  <span className="text-2xl font-extrabold text-[#3D3A2E]">₹{cartTotal}</span>
                </div>
              </div>
            </div>

            <Link
              href="/checkout"
              className="mt-6 block w-full rounded-full bg-[#8B7355] py-3.5 text-center text-sm font-bold text-white shadow-sm hover:bg-[#7a6549] transition-all"
            >
              Proceed to Checkout
            </Link>

            <p className="mt-4 text-center text-xs leading-relaxed text-[#6B6650] flex items-start justify-center gap-1.5">
              <span>🛡️</span>
              <span>Prescription medicines may require verification before your order can be fulfilled.</span>
            </p>

          </div>

        </div>
      </section>

      <Footer />
    </main>
  );
}