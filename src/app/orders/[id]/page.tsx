import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/currentUser";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CancelOrderButton from "@/components/CancelOrderButton";

interface PageProps {
  params: Promise<{ id: string }>;
}

const statusLabels: Record<string, string> = {
  PENDING: "Order Received",
  VERIFYING_PRESCRIPTION: "Verifying Prescription",
  PREPARING: "Preparing",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

function OrderTracker({ status }: { status: string }) {
  const steps = [
    { key: "PENDING", label: "Order Placed" },
    { key: "VERIFYING_PRESCRIPTION", label: "Prescription Verified" },
    { key: "PREPARING", label: "Preparing" },
    { key: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
    { key: "DELIVERED", label: "Delivered" },
  ];

  if (status === "CANCELLED") {
    return (
      <div className="mt-6 rounded-xl bg-red-50 border border-red-200 px-4 py-3">
        <p className="text-sm font-bold text-red-600">❌ This order was cancelled</p>
      </div>
    );
  }

  const currentIndex = steps.findIndex((s) => s.key === status);

  return (
    <div className="mt-6">
      <h2 className="text-sm font-bold uppercase tracking-wide text-[#8B8570] mb-4">
        Order Tracking
      </h2>

      <div className="flex flex-col">
        {steps.map((step, index) => {
          const isDelivered = status === "DELIVERED";
          const isCompleted = index < currentIndex || (isDelivered && index === currentIndex);
          const isCurrent = index === currentIndex && !isDelivered;
          const isPending = index > currentIndex;

          return (
            <div key={step.key} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    isCompleted
                      ? "bg-[#6B7256] text-white"
                      : isCurrent
                      ? "bg-[#8B7355] text-white ring-4 ring-[#8B7355]/20"
                      : "bg-[#EDE6D6] text-[#8B8570]"
                  }`}
                >
                  {isCompleted ? "✓" : isCurrent ? "●" : "○"}
                </div>

                {index < steps.length - 1 && (
                  <div
                    className={`w-0.5 flex-1 min-h-[24px] ${
                      isCompleted ? "bg-[#6B7256]" : "bg-[#EDE6D6]"
                    }`}
                  />
                )}
              </div>

              <div className="pb-6">
                <p className={`text-sm font-semibold ${isPending ? "text-[#8B8570]" : "text-[#3D3A2E]"}`}>
                  {step.label}
                </p>
                {isCurrent && (
                  <p className="text-xs text-[#8B7355] mt-0.5">In progress</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default async function OrderDetailPage({ params }: PageProps) {
  const { id } = await params;

  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const orderId = Number(id);
  if (!Number.isInteger(orderId)) {
    notFound();
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: {
            select: { id: true, name: true, image: true, price: true },
          },
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  if (order.userId !== user.id) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#F7F5EF]">
      <Navbar />

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <Link href="/orders" className="text-sm font-semibold text-[#6B7256] hover:underline">
          ← Back to My Orders
        </Link>

        <div className="mt-4 rounded-2xl border border-[#DDD3BC] bg-white p-6 shadow-sm">

          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#EDE6D6] pb-5">
            <div>
              <h1 className="text-2xl font-extrabold text-[#3D3A2E]">
                Order #{order.orderNumber}
              </h1>
              <p className="mt-1 text-sm text-[#8B8570]">
                Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>

            <span className="inline-flex w-fit rounded-full bg-[#6B7256]/15 px-4 py-2 text-sm font-bold text-[#6B7256]">
              {statusLabels[order.status] || order.status}
            </span>
          </div>

          {/* Order Tracking */}
          <OrderTracker status={order.status} />

          {/* Cancel button */}
          {["PENDING", "VERIFYING_PRESCRIPTION", "PREPARING"].includes(order.status) && (
            <CancelOrderButton orderNumber={order.orderNumber} />
          )}

          {/* Delivery Address */}
          <div className="mt-6">
            <h2 className="text-sm font-bold uppercase tracking-wide text-[#8B8570]">
              Delivery Address
            </h2>
            <p className="mt-2 text-sm text-[#3D3A2E]">
              {order.customerName} · {order.customerPhone}
            </p>
            <p className="text-sm text-[#3D3A2E]">
              {order.address}, {order.city}, {order.state} — {order.pincode}
            </p>
          </div>

          {/* Items */}
          <div className="mt-6">
            <h2 className="text-sm font-bold uppercase tracking-wide text-[#8B8570]">
              Items
            </h2>

            <div className="mt-3 space-y-3">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 rounded-xl border border-[#EDE6D6] bg-[#F7F5EF] p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white text-xl">
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
                    <div>
                      <p className="font-semibold text-sm text-[#3D3A2E]">
                        {item.product?.name || "Product"}
                      </p>
                      <p className="text-xs text-[#8B8570]">
                        Qty {item.quantity} × ₹{item.price}
                      </p>
                    </div>
                  </div>
                  <p className="font-bold text-sm text-[#3D3A2E]">
                    ₹{item.price * item.quantity}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Payment + Total */}
          <div className="mt-6 flex items-center justify-between border-t border-[#EDE6D6] pt-5">
            <div>
              <p className="text-xs text-[#8B8570]">Payment Method</p>
              <p className="mt-1 font-bold text-sm text-[#3D3A2E]">{order.paymentMethod}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-[#8B8570]">Total Amount</p>
              <p className="mt-1 text-xl font-extrabold text-[#3D3A2E]">₹{order.totalAmount}</p>
            </div>
          </div>

        </div>
      </div>

      <Footer />
    </main>
  );
}