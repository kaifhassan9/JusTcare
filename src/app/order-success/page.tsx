"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const orderStatuses = [
  {
    key: "PENDING",
    title: "Order Received",
    description: "Your order has been received.",
  },
  {
    key: "VERIFYING_PRESCRIPTION",
    title: "Pharmacy Verification",
    description: "Our pharmacy team will verify your order.",
  },
  {
    key: "PREPARING",
    title: "Preparing Order",
    description: "Your medicines are being prepared.",
  },
  {
    key: "OUT_FOR_DELIVERY",
    title: "Out for Delivery",
    description: "Your order is on the way.",
  },
  {
    key: "DELIVERED",
    title: "Delivered",
    description: "Your order has been delivered.",
  },
];

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber");

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderNumber) {
      setError("Order number is missing.");
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${orderNumber}`);
        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Failed to load order.");
          return;
        }

        setOrder(data.order);
      } catch (error) {
        console.error("Fetch order error:", error);
        setError("Something went wrong while loading your order.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderNumber]);

  const currentStatusIndex = order
    ? orderStatuses.findIndex((status) => status.key === order.status)
    : -1;

  const isCancelled = order?.status === "CANCELLED";

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FAF8F5]">
        <Navbar />

        <section className="flex min-h-[75vh] items-center justify-center">
          <div className="text-center">
            <div className="text-4xl animate-spin">⏳</div>

            <p className="mt-4 font-bold text-[#2C3325]">
              Loading your order...
            </p>
          </div>
        </section>

        <Footer />
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="min-h-screen bg-[#FAF8F5]">
        <Navbar />

        <section className="flex min-h-[75vh] items-center justify-center px-4">
          <div className="text-center">
            <div className="text-5xl">❌</div>

            <h1 className="mt-4 text-2xl font-bold text-[#2C3325]">
              Order Not Found
            </h1>

            <p className="mt-2 text-[#5A564A]">
              {error || "We couldn't find this order."}
            </p>

            <Link
              href="/products"
              className="mt-6 inline-block rounded-xl bg-[#556244] hover:bg-[#455037] px-6 py-3 font-bold text-[#F5F2EB]"
            >
              Continue Shopping
            </Link>
          </div>
        </section>

        <Footer />
      </main>
    );
  }

  if (isCancelled) {
    return (
      <main className="min-h-screen bg-[#FAF8F5] text-[#2C3325]">
        <Navbar />

        <section className="flex min-h-[75vh] items-center justify-center px-4 sm:px-6 py-12">
          <div className="relative w-full max-w-2xl rounded-3xl border border-[#3D4734] bg-[#22291E] p-8 sm:p-12 text-center shadow-xl overflow-hidden">

            {/* Cancelled Icon */}
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20 text-red-400">
              <span className="text-4xl font-black">✕</span>
            </div>

            {/* Heading */}
            <h1 className="mt-6 text-3xl font-extrabold text-[#F5F2EB]">
              Order Cancelled
            </h1>

            <p className="mt-2 text-base text-[#D5CDBF]">
              Your order has been cancelled successfully.
            </p>

            {/* Order ID */}
            <div className="mt-8 rounded-2xl border border-red-500/30 bg-red-950/40 p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-red-300">
                Order ID
              </p>

              <p className="mt-1 text-2xl font-extrabold tracking-wider text-red-400">
                #{order.orderNumber}
              </p>
            </div>

            {/* Message */}
            <div className="mt-6 rounded-2xl border border-[#3D4734] bg-[#252B1F] p-5 text-left">
              <h2 className="text-lg font-extrabold text-[#F5F2EB]">
                Order Status
              </h2>

              <div className="mt-5 flex items-center gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-500 text-white font-bold">
                  ✕
                </div>

                <div>
                  <p className="font-bold text-red-400">Order Cancelled</p>

                  <p className="text-xs text-[#D5CDBF]">
                    This order will not be processed or delivered.
                  </p>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/products"
                className="rounded-xl bg-[#556244] hover:bg-[#455037] px-7 py-3.5 text-sm font-bold text-[#F5F2EB]"
              >
                Continue Shopping
              </Link>

              <Link
                href="/"
                className="rounded-xl border border-[#D5CDBF] bg-[#FAF8F5] px-7 py-3.5 text-sm font-bold text-[#2C3325] hover:bg-[#EBE5D8]"
              >
                Back to Home
              </Link>
            </div>

          </div>
        </section>

        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF8F5] text-[#2C3325]">
      <Navbar />

      <section className="flex min-h-[75vh] items-center justify-center px-4 sm:px-6 py-12">
        <div className="relative w-full max-w-2xl rounded-3xl border border-[#3D4734] bg-[#22291E] p-8 sm:p-12 text-center shadow-xl overflow-hidden">

          {/* Background Ambient Glow */}
          <div className="absolute top-0 right-1/3 -mt-16 h-64 w-64 rounded-full bg-[#556244]/20 blur-3xl pointer-events-none" />

          {/* Success Icon */}
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#556244] text-[#F5F2EB] shadow-lg shadow-[#556244]/30 animate-bounce">
            <span className="text-4xl font-black">✓</span>
          </div>

          {/* Heading */}
          <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-[#F5F2EB]">
            Order Placed Successfully!
          </h1>

          <p className="mt-2 text-base text-[#D5CDBF]">
            Thank you for ordering from MediCare.
            Your order has been received successfully.
          </p>

          {/* Order ID Box */}
          <div className="mt-8 rounded-2xl border border-[#D5CDBF] bg-[#FAF8F5] p-5 text-left shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-[#6B6650]">
              Your Order ID
            </p>

            <p className="mt-1 text-2xl font-extrabold tracking-wider text-[#2C3325]">
              #{order.orderNumber}
            </p>
          </div>

          {/* Order Items */}
          <div className="mt-6 rounded-2xl border border-[#D5CDBF] bg-[#FAF8F5] p-5 text-left shadow-sm">
            <h2 className="text-lg font-extrabold text-[#2C3325]">
              Order Items
            </h2>

            <div className="mt-4 space-y-4">
              {order.items.map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4"
                >
                  <div>
                    <p className="font-bold text-[#2C3325]">
                      {item.product.name}
                    </p>

                    <p className="text-xs text-[#5A564A]">
                      Quantity: {item.quantity}
                    </p>
                  </div>

                  <p className="font-extrabold text-[#2C3325]">
                    ₹{item.price * item.quantity}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5 border-t border-[#D5CDBF] pt-4 flex justify-between text-[#2C3325]">
              <span className="font-bold">Total</span>
              <span className="text-xl font-extrabold">
                ₹{order.totalAmount}
              </span>
            </div>
          </div>

          {/* Order Status Stepper */}
          <div className="mt-8 text-left border-t border-[#3D4734] pt-6">
            <h2 className="text-lg font-extrabold text-[#F5F2EB]">
              Order Status
            </h2>

            <div className="mt-5 space-y-5 relative">
              {/* Connecting Line */}
              <div className="absolute left-[17px] top-3 bottom-3 w-0.5 bg-[#3D4734]" />

              {orderStatuses.map((status, index) => {
                const isCompleted = index < currentStatusIndex;
                const isCurrent = index === currentStatusIndex;

                return (
                  <div
                    key={status.key}
                    className="relative z-10 flex items-start gap-4"
                  >
                    {/* Circle */}
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-bold text-sm transition-all ${
                        isCompleted || isCurrent
                          ? "bg-[#556244] text-[#F5F2EB] shadow-md shadow-[#556244]/20"
                          : "bg-[#252B1F] border border-[#3D4734] text-[#D5CDBF]"
                      }`}
                    >
                      {isCompleted || isCurrent ? "✓" : index + 1}
                    </div>

                    {/* Text */}
                    <div>
                      <p
                        className={`font-bold text-sm ${
                          isCompleted || isCurrent
                            ? "text-[#F5F2EB]"
                            : "text-[#D5CDBF]"
                        }`}
                      >
                        {status.title}
                      </p>

                      <p className="text-xs text-[#D5CDBF]">
                        {status.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Prescription Notice */}
          <div className="mt-8 rounded-2xl border border-amber-500/30 bg-amber-950/40 p-4 sm:p-5 text-left">
            <p className="font-bold text-amber-200 text-sm flex items-center gap-1.5">
              <span>💊</span> Pharmacy Verification
            </p>

            <p className="mt-1 text-xs leading-relaxed text-amber-200">
              If your order contains prescription medicines,
              our pharmacy team will verify the prescription
              before processing the order.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/products"
              className="rounded-xl bg-[#556244] hover:bg-[#455037] px-7 py-3.5 text-sm font-bold text-[#F5F2EB] shadow-lg transition-all"
            >
              Continue Shopping
            </Link>

            <Link
              href="/"
              className="rounded-xl border border-[#D5CDBF] bg-[#FAF8F5] px-7 py-3.5 text-sm font-bold text-[#2C3325] hover:bg-[#EBE5D8] transition-all"
            >
              Back to Home
            </Link>
          </div>

        </div>
      </section>

      <Footer />
    </main>
  );
}