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

type Stats = {
  totalOrders: number;
  pendingOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  outForDeliveryOrders: number;
  totalProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalSales: number;
};

type RecentOrder = {
  id: number;
  orderNumber: string;
  customerName: string;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
};

type DashboardData = {
  stats: Stats;
  recentOrders: RecentOrder[];
};

const statusLabels: Record<OrderStatus, string> = {
  PENDING: "Pending",
  VERIFYING_PRESCRIPTION: "Verifying Prescription",
  PREPARING: "Preparing",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/dashboard");
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to load dashboard.");
        return;
      }

      setDashboard(data);
    } catch (error) {
      console.error("Fetch dashboard error:", error);
      setError("Something went wrong while loading dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F7F5EF]">
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="text-4xl animate-spin">⏳</div>
            <p className="mt-4 font-bold text-[#3D3A2E]">Loading dashboard...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !dashboard) {
    return (
      <main className="min-h-screen bg-[#F7F5EF]">
        <div className="flex min-h-screen items-center justify-center px-4">
          <div className="text-center">
            <div className="text-5xl">❌</div>
            <h1 className="mt-4 text-2xl font-extrabold text-[#3D3A2E]">Unable to Load Dashboard</h1>
            <p className="mt-2 text-[#6B6650]">{error || "No dashboard data found."}</p>
            <button
              onClick={fetchDashboard}
              className="mt-6 rounded-full bg-[#6B7256] px-6 py-3 font-bold text-white hover:bg-[#5a6047] transition"
            >
              Try Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  const { stats, recentOrders } = dashboard;

  return (
    <main className="min-h-screen bg-[#F7F5EF] text-[#3D3A2E]">

      {/* Header */}
      <section className="border-b border-[#DDD3BC] bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-extrabold text-[#3D3A2E]">Admin Dashboard</h1>
              <p className="mt-1 text-sm text-[#6B6650]">Manage your medical store from one place.</p>
            </div>

            <button
              onClick={fetchDashboard}
              className="rounded-full border border-[#DDD3BC] bg-white px-4 py-2.5 text-sm font-bold text-[#3D3A2E] hover:bg-[#EDE6D6] transition"
            >
              🔄 Refresh
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-8">

        {/* Quick Navigation */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <Link
            href="/admin/orders"
            className="rounded-2xl border border-[#DDD3BC] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#6B7256]/10 text-2xl">
                📦
              </div>
              <div>
                <h2 className="font-extrabold text-[#3D3A2E]">Manage Orders</h2>
                <p className="mt-1 text-xs text-[#8B8570]">View and update customer orders</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/products"
            className="rounded-2xl border border-[#DDD3BC] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#8B7355]/10 text-2xl">
                💊
              </div>
              <div>
                <h2 className="font-extrabold text-[#3D3A2E]">Manage Products</h2>
                <p className="mt-1 text-xs text-[#8B8570]">Add, edit and manage inventory</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/prescriptions"
            className="rounded-2xl border border-[#DDD3BC] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#6B7256]/10 text-2xl">
                📄
              </div>
              <div>
                <h2 className="font-extrabold text-[#3D3A2E]">Prescriptions</h2>
                <p className="mt-1 text-xs text-[#8B8570]">Review uploaded prescriptions</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Sales + Orders */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <DashboardCard
            title="Total Sales"
            value={`₹${stats.totalSales.toLocaleString("en-IN")}`}
            icon="💰"
            description="Non-cancelled orders"
          />
          <DashboardCard
            title="Total Orders"
            value={stats.totalOrders}
            icon="📦"
            description="All customer orders"
          />
          <DashboardCard
            title="Pending Orders"
            value={stats.pendingOrders}
            icon="⏳"
            description="Need attention"
          />
          <DashboardCard
            title="Delivered"
            value={stats.deliveredOrders}
            icon="✅"
            description="Successfully delivered"
          />
        </div>

        {/* Order Statistics */}
        <div className="mt-8">
          <h2 className="text-xl font-extrabold text-[#3D3A2E]">Order Overview</h2>

          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <DashboardCard
              title="Out for Delivery"
              value={stats.outForDeliveryOrders}
              icon="🚚"
              description="Currently being delivered"
            />
            <DashboardCard
              title="Cancelled"
              value={stats.cancelledOrders}
              icon="❌"
              description="Cancelled orders"
            />
            <DashboardCard
              title="Pending"
              value={stats.pendingOrders}
              icon="⏰"
              description="Pending or verification"
            />
          </div>
        </div>

        {/* Product Statistics */}
        <div className="mt-8">
          <h2 className="text-xl font-extrabold text-[#3D3A2E]">Inventory Overview</h2>

          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <DashboardCard
              title="Total Products"
              value={stats.totalProducts}
              icon="💊"
              description="Products in store"
            />
            <DashboardCard
              title="Low Stock"
              value={stats.lowStockProducts}
              icon="⚠️"
              description="1–5 items remaining"
            />
            <DashboardCard
              title="Out of Stock"
              value={stats.outOfStockProducts}
              icon="🚫"
              description="Need restocking"
            />
          </div>
        </div>

        {/* Recent Orders */}
        <div className="mt-8 overflow-hidden rounded-2xl border border-[#DDD3BC] bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[#EDE6D6] px-6 py-5">
            <div>
              <h2 className="text-xl font-extrabold text-[#3D3A2E]">Recent Orders</h2>
              <p className="mt-1 text-xs text-[#8B8570]">Latest customer orders</p>
            </div>

            <Link
              href="/admin/orders"
              className="text-sm font-bold text-[#6B7256] hover:underline"
            >
              View All →
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="text-4xl">📦</div>
              <p className="mt-3 font-bold text-[#3D3A2E]">No orders yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-[#EDE6D6] bg-[#F7F5EF]">
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase text-[#8B8570]">Order</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase text-[#8B8570]">Customer</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase text-[#8B8570]">Amount</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase text-[#8B8570]">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase text-[#8B8570]">Date</th>
                  </tr>
                </thead>

                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-[#F0EBE0] last:border-0 hover:bg-[#F7F5EF] transition">
                      <td className="px-6 py-5">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="font-extrabold text-[#6B7256] hover:underline"
                        >
                          #{order.orderNumber}
                        </Link>
                        <p className="mt-1 text-xs text-[#8B8570]">ID: {order.id}</p>
                      </td>

                      <td className="px-6 py-5">
                        <p className="font-bold text-[#3D3A2E]">{order.customerName}</p>
                      </td>

                      <td className="px-6 py-5">
                        <p className="font-extrabold text-[#3D3A2E]">₹{order.totalAmount.toLocaleString("en-IN")}</p>
                      </td>

                      <td className="px-6 py-5">
                        <StatusBadge status={order.status} />
                      </td>

                      <td className="px-6 py-5">
                        <p className="text-sm text-[#8B8570]">
                          {new Date(order.createdAt).toLocaleDateString("en-IN")}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </section>
    </main>
  );
}

function DashboardCard({
  title,
  value,
  icon,
  description,
}: {
  title: string;
  value: string | number;
  icon: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-[#DDD3BC] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#8B8570]">{title}</p>
          <p className="mt-2 text-3xl font-extrabold text-[#3D3A2E]">{value}</p>
          <p className="mt-1 text-xs text-[#8B8570]">{description}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#6B7256]/10 text-2xl">
          {icon}
        </div>
      </div>
    </div>
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