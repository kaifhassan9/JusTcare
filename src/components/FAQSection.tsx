"use client";

import { useState } from "react";

const faqs = [
  {
    question: "How do I order medicines online from JusTCare?",
    answer: "Ordering is quick and hassle-free. Browse our products, search for what you need, add items to your cart, and proceed to checkout. Once your order is confirmed, we'll start preparing it for delivery.",
  },
  {
    question: "Is online medicine delivery safe?",
    answer: "Absolutely. All medicines and products sold through JusTCare are sourced from a trusted pharmacy and checked for authenticity before dispatch. Our delivery team follows safe handling practices to ensure your order reaches you in good condition.",
  },
  {
    question: "How do I know if there's a delay in delivery?",
    answer: "If there's ever a delay, our team will reach out to you via phone or email. You can also check your order's current status anytime from the 'My Orders' section of your account.",
  },
  {
    question: "Do I need a prescription to order medicines?",
    answer: "Some medicines require a valid prescription. If your order includes such items, you'll be asked to upload a prescription during checkout, which our pharmacy team will verify before your order is processed.",
  },
  {
    question: "How can I track my order?",
    answer: "Once logged in, go to 'My Orders' to see all your past and current orders, along with a live status tracker showing exactly where your order stands — from placed to out for delivery to delivered.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="bg-[#F7F5EF] py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
                <h2 className="text-2xl font-extrabold text-[#3D3A2E] mb-6">
          Frequently Asked Questions
        </h2>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={index}
                className="rounded-xl border border-[#DDD3BC] bg-white overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="font-bold text-sm text-[#3D3A2E]">{faq.question}</span>
                  <span className={`text-[#6B7256] text-lg shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}>
                    ▾
                  </span>
                </button>

                {isOpen && (
                  <div className="px-5 pb-4 text-sm text-[#6B6650] leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}