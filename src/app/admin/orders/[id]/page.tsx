"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

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
    id: number;
    name: string;
    category: string;
    price: number;
    requiresPrescription: boolean;
  };
};

type Order = {
  id: number;
  orderNumber: string;

  customerName: string;
  customerPhone: string;
  customerEmail: string | null;

  address: string;
  city: string;
  state: string;
  pincode: string;

  totalAmount: number;
  paymentMethod: string;
  status: OrderStatus;

  prescriptionUrl: string | null;

  createdAt: string;
  updatedAt: string;

  items: OrderItem[];

  user: {
    id: number;
    name: string;
    email: string;
  } | null;
};

const statusLabels: Record<OrderStatus, string> = {
  PENDING: "Pending",
  VERIFYING_PRESCRIPTION: "Verifying Prescription",
  PREPARING: "Preparing Order",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

const orderStatuses: OrderStatus[] = [
  "PENDING",
  "VERIFYING_PRESCRIPTION",
  "PREPARING",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

export default function AdminOrderDetailsPage() {
  const params = useParams();

  const id = params.id;

  const [order, setOrder] = useState<Order | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/api/admin/orders/${id}`
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error || "Failed to load order."
        );
        return;
      }

      setOrder(data.order);
    } catch (error) {
      console.error(
        "Fetch order details error:",
        error
      );

      setError(
        "Something went wrong while loading the order."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchOrder();
    }
  }, [id]);

  // Loading
  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">

            <div className="text-4xl animate-spin">
              ⏳
            </div>

            <p className="mt-4 font-bold text-slate-700 dark:text-slate-300">
              Loading order...
            </p>

          </div>
        </div>
      </main>
    );
  }

  // Error
  if (error || !order) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950">

        <div className="flex min-h-screen items-center justify-center px-4">

          <div className="text-center">

            <div className="text-5xl">
              ❌
            </div>

            <h1 className="mt-4 text-2xl font-extrabold">
              Order Not Found
            </h1>

            <p className="mt-2 text-slate-500">
              {error || "This order does not exist."}
            </p>

            <Link
              href="/admin/orders"
              className="mt-6 inline-block rounded-xl bg-sky-600 px-6 py-3 font-bold text-white hover:bg-sky-700"
            >
              Back to Orders
            </Link>

          </div>

        </div>

      </main>
    );
  }

  const currentStatusIndex =
    orderStatuses.indexOf(order.status);

  const isCancelled =
    order.status === "CANCELLED";

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">

      {/* Header */}
      <section className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">

        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">

          <Link
            href="/admin/orders"
            className="text-sm font-bold text-sky-600 hover:text-sky-700"
          >
            ← Back to Orders
          </Link>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <h1 className="text-3xl font-extrabold">
                Order Details
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                #{order.orderNumber}
              </p>

            </div>

            <StatusBadge status={order.status} />

          </div>

        </div>

      </section>

      {/* Main */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-8">

        <div className="grid gap-6 lg:grid-cols-3">

          {/* LEFT */}
          <div className="space-y-6 lg:col-span-2">

            {/* Customer */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">

              <h2 className="text-xl font-extrabold">
                Customer Information
              </h2>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">

                <Info
                  label="Name"
                  value={order.customerName}
                />

                <Info
                  label="Phone"
                  value={order.customerPhone}
                />

                <Info
                  label="Email"
                  value={
                    order.customerEmail ||
                    "Not provided"
                  }
                />

                <Info
                  label="Customer ID"
                  value={
                    order.user
                      ? String(order.user.id)
                      : "Guest"
                  }
                />

              </div>

            </div>

            {/* Delivery Address */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">

              <h2 className="text-xl font-extrabold">
                Delivery Address
              </h2>

              <div className="mt-5 space-y-3 text-sm">

                <p className="font-bold">
                  {order.address}
                </p>

                <p className="text-slate-500">
                  {order.city}, {order.state}
                </p>

                <p className="text-slate-500">
                  PIN Code: {order.pincode}
                </p>

              </div>

            </div>

            {/* Order Items */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">

              <h2 className="text-xl font-extrabold">
                Order Items
              </h2>

              <div className="mt-5 space-y-4">

                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 dark:border-slate-800 p-4"
                  >

                    <div>

                      <p className="font-bold">
                        {item.product.name}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {item.product.category}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Quantity: {item.quantity}
                      </p>

                      {item.product
                        .requiresPrescription && (
                        <span className="mt-2 inline-block rounded-full bg-amber-500/10 px-2 py-1 text-[10px] font-bold text-amber-600">
                          Prescription Required
                        </span>
                      )}

                    </div>

                    <div className="text-right">

                      <p className="font-extrabold">
                        ₹
                        {(
                          item.price *
                          item.quantity
                        ).toFixed(2)}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        ₹{item.price} ×{" "}
                        {item.quantity}
                      </p>

                    </div>

                  </div>
                ))}

              </div>

              {/* Total */}
              <div className="mt-6 border-t border-slate-200 dark:border-slate-800 pt-5 flex items-center justify-between">

                <span className="font-bold">
                  Total
                </span>

                <span className="text-2xl font-extrabold">
                  ₹{order.totalAmount.toFixed(2)}
                </span>

              </div>

            </div>

            {/* Prescription */}
            <div className="rounded-2xl border border-amber-500/30 bg-amber-50/60 dark:bg-amber-950/30 p-6">

              <h2 className="text-lg font-extrabold text-amber-900 dark:text-amber-200">
                💊 Prescription
              </h2>

              {order.prescriptionUrl ? (
                <div className="mt-4">

                  <p className="text-sm text-amber-800 dark:text-amber-300">
                    Prescription has been uploaded.
                  </p>

                  <a
                    href={order.prescriptionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-block rounded-xl bg-amber-600 px-5 py-3 text-sm font-bold text-white hover:bg-amber-700"
                  >
                    View Prescription
                  </a>

                </div>
              ) : (
                <p className="mt-2 text-sm text-amber-800 dark:text-amber-300">
                  No prescription uploaded for
                  this order.
                </p>
              )}

            </div>

          </div>

          {/* RIGHT */}
          <div className="space-y-6">

            {/* Order Summary */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">

              <h2 className="text-xl font-extrabold">
                Order Summary
              </h2>

              <div className="mt-5 space-y-4">

                <Info
                  label="Order ID"
                  value={String(order.id)}
                />

                <Info
                  label="Order Number"
                  value={`#${order.orderNumber}`}
                />

                <Info
                  label="Payment"
                  value={order.paymentMethod}
                />

                <Info
                  label="Created"
                  value={formatDate(
                    order.createdAt
                  )}
                />

              </div>

            </div>

            {/* Status */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">

              <h2 className="text-xl font-extrabold">
                Order Status
              </h2>

              {isCancelled ? (
                <div className="mt-5 rounded-xl bg-red-500/10 border border-red-500/20 p-4">

                  <p className="font-extrabold text-red-600 dark:text-red-400">
                    ❌ Order Cancelled
                  </p>

                  <p className="mt-1 text-xs text-red-500">
                    This order cannot be progressed further.
                  </p>

                </div>
              ) : (
                <div className="mt-5 space-y-5">

                  {orderStatuses.map(
                    (status, index) => {

                      const completed =
                        index <= currentStatusIndex;

                      return (
                        <div
                          key={status}
                          className="flex items-start gap-3"
                        >

                          <div
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                              completed
                                ? "bg-emerald-500 text-white"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                            }`}
                          >
                            {completed
                              ? "✓"
                              : index + 1}
                          </div>

                          <div>

                            <p
                              className={`text-sm font-bold ${
                                completed
                                  ? "text-slate-900 dark:text-white"
                                  : "text-slate-400"
                              }`}
                            >
                              {statusLabels[
                                status
                              ]}
                            </p>

                          </div>

                        </div>
                      );
                    }
                  )}

                </div>
              )}

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}


/* -----------------------------
   Info Component
------------------------------ */

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>

      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-bold break-words">
        {value}
      </p>

    </div>
  );
}


/* -----------------------------
   Status Badge
------------------------------ */

function StatusBadge({
  status,
}: {
  status: OrderStatus;
}) {
  const styles: Record<OrderStatus, string> = {
    PENDING:
      "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",

    VERIFYING_PRESCRIPTION:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400",

    PREPARING:
      "bg-blue-500/10 text-blue-600 dark:text-blue-400",

    OUT_FOR_DELIVERY:
      "bg-purple-500/10 text-purple-600 dark:text-purple-400",

    DELIVERED:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",

    CANCELLED:
      "bg-red-500/10 text-red-600 dark:text-red-400",
  };

  return (
    <span
      className={`inline-flex rounded-full px-4 py-2 text-xs font-extrabold ${styles[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}


/* -----------------------------
   Date Formatter
------------------------------ */

function formatDate(date: string) {
  return new Date(date).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}