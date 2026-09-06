"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type OrderStatus =
  | "PENDING"
  | "VERIFYING_PRESCRIPTION"
  | "PREPARING"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED";

type OrderItem = {
  id: number;
  quantity: number;
  price: number;
  product: {
    name: string;
    image: string | null;
  };
};

type Order = {
  id: number;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: string;
  createdAt: string;
  items: OrderItem[];
};

const statusLabels: Record<OrderStatus, string> = {
  PENDING: "Pending",
  VERIFYING_PRESCRIPTION: "Verifying Prescription",
  PREPARING: "Preparing",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/orders");
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to load orders.");
        return;
      }

      setOrders(data.orders || []);
    } catch (error) {
      console.error("Fetch user orders error:", error);
      setError("Something went wrong while loading your orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F7F5EF]">
        <Navbar />
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <div className="animate-spin text-4xl">⏳</div>
            <p className="mt-4 font-bold text-[#6B6650]">Loading your orders...</p>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#F7F5EF]">
        <Navbar />
        <div className="flex min-h-[60vh] items-center justify-center px-4">
          <div className="text-center">
            <div className="text-5xl">❌</div>
            <h1 className="mt-4 text-2xl font-extrabold text-[#3D3A2E]">Unable to Load Orders</h1>
            <p className="mt-2 text-[#6B6650]">{error}</p>
            <button
              onClick={fetchOrders}
              className="mt-6 rounded-full bg-[#6B7256] px-6 py-3 font-bold text-white hover:bg-[#5a6047] transition"
            >
              Try Again
            </button>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F5EF] text-[#3D3A2E]">
      <Navbar />

      {/* Header */}
      <section className="border-b border-[#DDD3BC] bg-[#EDE6D6]">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
          <h1 className="text-3xl font-extrabold text-[#3D3A2E]">My Orders</h1>
          <p className="mt-1 text-sm text-[#6B6650]">View and track your orders.</p>
        </div>
      </section>

      {/* Orders */}
      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6">

        {orders.length === 0 ? (
          <div className="rounded-2xl border border-[#DDD3BC] bg-white px-6 py-16 text-center shadow-sm">
            <div className="text-6xl">📦</div>
            <h2 className="mt-5 text-2xl font-extrabold text-[#3D3A2E]">No Orders Yet</h2>
            <p className="mt-2 text-sm text-[#6B6650]">You haven't placed any orders yet.</p>
            <Link
              href="/"
              className="mt-6 inline-block rounded-full bg-[#6B7256] px-6 py-3 font-bold text-white hover:bg-[#5a6047] transition"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="overflow-hidden rounded-2xl border border-[#DDD3BC] bg-white shadow-sm"
              >
                {/* Order Header */}
                <div className="flex flex-col gap-4 border-b border-[#EDE6D6] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#8B8570]">Order</p>
                    <p className="mt-1 font-extrabold text-[#6B7256]">#{order.orderNumber}</p>
                    <p className="mt-1 text-xs text-[#8B8570]">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <StatusBadge status={order.status} />
                </div>

                {/* Products */}
                <div className="divide-y divide-[#F0EBE0]">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 px-6 py-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#F7F5EF] text-2xl">
                        {item.product?.image?.startsWith("http") ? (
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          item.product?.image || "💊"
                        )}
                      </div>

                      <div className="flex-1">
                        <p className="font-bold text-[#3D3A2E]">{item.product?.name || "Product"}</p>
                        <p className="mt-1 text-sm text-[#8B8570]">₹{item.price} × {item.quantity}</p>
                      </div>

                      <p className="font-extrabold text-[#3D3A2E]">₹{item.price * item.quantity}</p>
                    </div>
                  ))}
                </div>

                {/* Order Footer */}
                <div className="flex flex-col gap-3 border-t border-[#EDE6D6] px-6 py-5 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs text-[#8B8570]">Payment</p>
                    <p className="font-bold text-[#3D3A2E]">{order.paymentMethod}</p>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="text-xs text-[#8B8570]">Total Amount</p>
                    <p className="text-xl font-extrabold text-[#3D3A2E]">₹{order.totalAmount}</p>

                    <div className="mt-4">
                      <Link
                        href={`/orders/${order.id}`}
                        className="block w-full rounded-full bg-[#F7F5EF] border border-[#DDD3BC] px-4 py-2.5 text-center text-sm font-bold text-[#3D3A2E] transition hover:bg-white hover:border-[#6B7256]"
                      >
                        View Order Details
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const styles: Record<OrderStatus, string> = {
    PENDING: "bg-amber-100 text-amber-700",
    VERIFYING_PRESCRIPTION: "bg-[#8B7355]/15 text-[#8B7355]",
    PREPARING: "bg-blue-100 text-blue-700",
    OUT_FOR_DELIVERY: "bg-purple-100 text-purple-700",
    DELIVERED: "bg-[#6B7256]/15 text-[#6B7256]",
    CANCELLED: "bg-red-100 text-red-600",
  };

  return (
    <span className={`inline-flex rounded-full px-3 py-1.5 text-xs font-extrabold ${styles[status]}`}>
      {statusLabels[status]}
    </span>
  );
}