import React from "react";

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-white">
      <h1 className="text-3xl font-bold mb-6 text-white">Privacy Policy</h1>
      <p className="text-sm text-gray-300 mb-8">Last updated: September 2026</p>

      <div className="space-y-6 text-sm leading-relaxed text-white">
        <section>
          <h2 className="text-xl font-semibold mb-2 text-white">1. Information We Collect</h2>
          <p className="text-gray-100">
            We collect personal information necessary to process your orders and enhance your experience. This includes your name, email address, phone number, shipping address, and payment transaction IDs.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2 text-white">2. How We Use Your Data</h2>
          <ul className="list-disc ml-5 space-y-1 text-gray-100">
            <li>To process and fulfill your orders.</li>
            <li>To communicate order status updates and tracking details.</li>
            <li>To process payment transactions securely via authorized third-party gateways (Razorpay).</li>
            <li>To improve customer support and website performance.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2 text-white">3. Payment Security</h2>
          <p className="text-gray-100">
            We do not store complete credit card numbers or sensitive payment details on our servers. All online transactions are processed through encrypted, PCI-DSS compliant payment processing platforms (Razorpay).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2 text-white">4. Data Sharing & Third Parties</h2>
          <p className="text-gray-100">
            We do not sell or trade your personal information. We share your data only with essential operational service providers such as courier partners (for delivery) and payment gateways (for transaction processing).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2 text-white">5. Contact Us</h2>
          <p className="text-gray-100">
            If you have questions regarding this Privacy Policy or your personal information, please contact our support team.
          </p>
        </section>
      </div>
    </div>
  );
}