import React from "react";

export default function RefundPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-white">
      <h1 className="text-3xl font-bold mb-6 text-white">Refund & Cancellation Policy</h1>
      <p className="text-sm text-gray-300 mb-8">Last updated: September 2026</p>

      <div className="space-y-6 text-sm leading-relaxed text-white">
        <section>
          <h2 className="text-xl font-semibold mb-2 text-white">1. Order Cancellations</h2>
          <p className="text-gray-100">
            Orders can be cancelled prior to dispatch. Once an order has been shipped, it cannot be directly cancelled, but may be eligible for return upon delivery depending on product category guidelines.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2 text-white">2. Return Eligibility</h2>
          <p className="text-gray-100">
            Items are eligible for return or replacement within 7 days of delivery if they are damaged during transit, defective, or incorrect items were delivered. Products must be unused and returned in original packaging.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2 text-white">3. Refund Process & Timelines</h2>
          <p className="text-gray-100">
            Once a returned item is received and inspected, refunds will be initiated:
          </p>
          <ul className="list-disc ml-5 space-y-1 mt-2 text-gray-100">
            <li><strong className="text-white">Online Payments (Razorpay):</strong> Refunds will be processed back to the original source payment method (UPI/Card/Bank Account) within 5–7 business days.</li>
            <li><strong className="text-white">Cash on Delivery (COD):</strong> Refunds will be issued via bank transfer or store credit after verifying customer account details.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2 text-white">4. Contact Support</h2>
          <p className="text-gray-100">
            For any return, replacement, or refund queries, reach out to our customer support with your Order ID.
          </p>
        </section>
      </div>
    </div>
  );
}