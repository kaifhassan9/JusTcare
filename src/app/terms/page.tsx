import React from "react";

export default function TermsAndConditions() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-white">
      <h1 className="text-3xl font-bold mb-6 text-white">Terms & Conditions</h1>
      <p className="text-sm text-gray-300 mb-8">Last updated: September 2026</p>

      <div className="space-y-6 text-sm leading-relaxed text-white">
        <section>
          <h2 className="text-xl font-semibold mb-2 text-white">1. Overview</h2>
          <p className="text-gray-100">
            Welcome to JusTCare. By accessing or using our website and services, you agree to be bound by these Terms and Conditions. Please read them carefully before making any purchase or using our services.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2 text-white">2. Products & Services</h2>
          <p className="text-gray-100">
            We strive to display product details, availability, and pricing as accurately as possible. However, we reserve the right to modify prices, update product descriptions, or discontinue items without prior notice.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2 text-white">3. Orders & Payments</h2>
          <p className="text-gray-100">
            All orders placed are subject to acceptance and stock availability. We accept online payments via Razorpay (UPI, Credit/Debit Cards, Netbanking) and Cash on Delivery (COD). Payment verification is required prior to order dispatch for online transactions.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2 text-white">4. User Responsibilities</h2>
          <p className="text-gray-100">
            You agree to provide accurate and complete personal details (name, shipping address, contact information) when placing an order. Providing false information may lead to order cancellation.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2 text-white">5. Governing Law</h2>
          <p className="text-gray-100">
            These terms shall be governed and construed in accordance with the laws of India. Any legal disputes arising out of the use of this website shall fall under local jurisdiction.
          </p>
        </section>
      </div>
    </div>
  );
}