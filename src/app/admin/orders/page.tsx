"use client";
import Link from "next/link";
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
    name: string;
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

const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["VERIFYING_PRESCRIPTION", "PREPARING", "CANCELLED"],
  VERIFYING_PRESCRIPTION: ["PREPARING", "CANCELLED"],
  PREPARING: ["OUT_FOR_DELIVERY", "CANCELLED"],
  OUT_FOR_DELIVERY: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [updatingOrderId, setUpdatingOrderId] =
    useState<number | null>(null);

  // Fetch all orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/orders");

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to load orders.");
        return;
      }

      setOrders(data.orders);
    } catch (error) {
      console.error("Fetch admin orders error:", error);
      setError("Something went wrong while loading orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Update order status
  const updateStatus = async (
    orderId: number,
    newStatus: OrderStatus
  ) => {
    try {
      setUpdatingOrderId(orderId);

      const response = await fetch(
        `/api/admin/orders/${orderId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to update order status.");
        return;
      }

      // Update UI immediately
      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status: data.order.status,
              }
            : order
        )
      );
    } catch (error) {
      console.error("Update status error:", error);
      alert("Something went wrong while updating the order.");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Loading
  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="text-4xl animate-spin">⏳</div>

            <p className="mt-4 font-bold text-slate-700 dark:text-slate-300">
              Loading orders...
            </p>
          </div>
        </div>
      </main>
    );
  }

  // Error
  if (error) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="flex min-h-screen items-center justify-center px-4">
          <div className="text-center">
            <div className="text-5xl">❌</div>

            <h1 className="mt-4 text-2xl font-extrabold">
              Unable to Load Orders
            </h1>

            <p className="mt-2 text-slate-500">
              {error}
            </p>

            <button
              onClick={fetchOrders}
              className="mt-6 rounded-xl bg-sky-600 px-6 py-3 font-bold text-white hover:bg-sky-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  // Statistics
  const totalOrders = orders.length;

  const pendingOrders = orders.filter(
    (order) =>
      order.status === "PENDING" ||
      order.status === "VERIFYING_PRESCRIPTION"
  ).length;

  const preparingOrders = orders.filter(
    (order) => order.status === "PREPARING"
  ).length;

  const deliveredOrders = orders.filter(
    (order) => order.status === "DELIVERED"
  ).length;

  const cancelledOrders = orders.filter(
    (order) => order.status === "CANCELLED"
  ).length;

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">

            {/* Header */}
      <header className="border-b border-[#DDD3BC] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-2xl font-extrabold text-[#3D3A2E]">Pharmacy Admin Dashboard</h1>
            <p className="mt-1 text-sm text-[#6B6650]">Manage customer orders and update order status.</p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/prescriptions"
              className="rounded-full border border-[#DDD3BC] px-4 py-2 text-sm font-bold text-[#3D3A2E] hover:bg-[#EDE6D6] transition"
            >
              Prescriptions
            </Link>

            <Link
              href="/"
              className="rounded-full border border-[#DDD3BC] px-4 py-2 text-sm font-bold text-[#3D3A2E] hover:bg-[#EDE6D6] transition"
            >
              Back to Website
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-8">

        {/* Statistics */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">

          <StatCard
            title="Total Orders"
            value={totalOrders}
            icon="📦"
          />

          <StatCard
            title="Pending"
            value={pendingOrders}
            icon="⏳"
          />

          <StatCard
            title="Preparing"
            value={preparingOrders}
            icon="💊"
          />

          <StatCard
            title="Delivered"
            value={deliveredOrders}
            icon="✅"
          />

          <StatCard
            title="Cancelled"
            value={cancelledOrders}
            icon="❌"
          />

        </div>

        {/* Orders */}
        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">

          <div className="border-b border-slate-200 dark:border-slate-800 px-6 py-5">

            <h2 className="text-xl font-extrabold">
              All Orders
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              {orders.length} order{orders.length !== 1 ? "s" : ""}
            </p>

          </div>

          {orders.length === 0 ? (
            <div className="px-6 py-16 text-center">

              <div className="text-5xl">📦</div>

              <h3 className="mt-4 text-lg font-bold">
                No Orders Yet
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Customer orders will appear here.
              </p>

            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full min-w-[900px]">

                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Order
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Customer
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Items
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Amount
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Status
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Action
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {orders.map((order) => {
                    const nextStatuses =
                      allowedTransitions[order.status];

                    return (
                      <tr
                        key={order.id}
                        className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
                      >

                        {/* Order */}
                        <td className="px-6 py-5">

                          <p className="font-extrabold text-sky-600 dark:text-sky-400">
                            #{order.orderNumber}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            ID: {order.id}
                          </p>

                        </td>

                        {/* Customer */}
                        <td className="px-6 py-5">

                          <p className="font-bold">
                            {order.customerName}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {order.customerPhone}
                          </p>

                          {order.customerEmail && (
                            <p className="mt-1 text-xs text-slate-500">
                              {order.customerEmail}
                            </p>
                          )}

                        </td>

                        {/* Items */}
                        <td className="px-6 py-5">

                          <p className="font-bold">
                            {order.items.length} product
                            {order.items.length !== 1 ? "s" : ""}
                          </p>

                          <div className="mt-2 space-y-1">

                            {order.items.map((item) => (
                              <p
                                key={item.id}
                                className="text-xs text-slate-500"
                              >
                                {item.product?.name ?? "Product"} ×{" "}
                                {item.quantity}
                              </p>
                            ))}

                          </div>

                        </td>

                        {/* Amount */}
                        <td className="px-6 py-5">

                          <p className="font-extrabold">
                            ₹{order.totalAmount}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {order.paymentMethod}
                          </p>

                        </td>

                        {/* Status */}
                        <td className="px-6 py-5">

                          <StatusBadge status={order.status} />

                        </td>

                        {/* Action */}
<td className="px-6 py-5">
  <div className="flex flex-col gap-2">

    {/* View Details */}
    <Link
      href={`/admin/orders/${order.id}`}
      className="rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-2 text-center text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
    >
      View Details
    </Link>

    {/* Update Status */}
    {nextStatuses.length > 0 ? (
      <select
        value=""
        disabled={updatingOrderId === order.id}
        onChange={(e) => {
          const value = e.target.value as OrderStatus;

          if (value) {
            updateStatus(order.id, value);
          }
        }}
        className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-bold outline-none focus:border-sky-500"
      >
        <option value="">
          {updatingOrderId === order.id
            ? "Updating..."
            : "Update Status"}
        </option>

        {nextStatuses.map((status) => (
          <option
            key={status}
            value={status}
          >
            {statusLabels[status]}
          </option>
        ))}
      </select>
    ) : (
      <span className="text-center text-xs font-bold text-slate-400">
        No status changes
      </span>
    )}

  </div>
</td>
                      </tr>
                    );
                  })}

                </tbody>

              </table>

            </div>
          )}

        </div>

      </section>

    </main>
  );
}


/* -----------------------------
   Statistics Card
------------------------------ */

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">

      <div className="flex items-center justify-between">

        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-3xl font-extrabold">
            {value}
          </p>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/10 text-2xl">
          {icon}
        </div>

      </div>

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
      className={`inline-flex rounded-full px-3 py-1.5 text-xs font-extrabold ${styles[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}