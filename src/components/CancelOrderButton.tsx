"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CancelOrderButton({ orderNumber }: { orderNumber: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirming, setConfirming] = useState(false);

  async function handleCancel() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/orders/${orderNumber}/cancel`, {
        method: "PATCH",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to cancel order.");
        setLoading(false);
        return;
      }

      // Refresh the server component so the page re-fetches the updated order
      router.refresh();
    } catch (err) {
      console.error("Cancel order error:", err);
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  if (!confirming) {
    return (
      <div className="mt-4">
        <button
          onClick={() => setConfirming(true)}
          className="w-full rounded-xl border border-red-200 dark:border-red-900 px-4 py-3 text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
        >
          Cancel Order
        </button>
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20 p-4">
      <p className="text-sm font-bold text-slate-900 dark:text-white">
        Are you sure you want to cancel this order?
      </p>
      <p className="mt-1 text-xs text-slate-500">
        This action cannot be undone.
      </p>

      {error && (
        <p className="mt-2 text-xs font-semibold text-red-600">{error}</p>
      )}

      <div className="mt-3 flex gap-2">
        <button
          onClick={handleCancel}
          disabled={loading}
          className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-60"
        >
          {loading ? "Cancelling..." : "Yes, Cancel Order"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          disabled={loading}
          className="flex-1 rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          Keep Order
        </button>
      </div>
    </div>
  );
}