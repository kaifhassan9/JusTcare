export default function AboutSection() {
  return (
    <section className="bg-white border-y border-[#DDD3BC] py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#3D3A2E]">
          Effortless Online Medicine Orders at JusTCare
        </h2>

        <p className="mt-4 text-sm leading-relaxed text-[#6B6650]">
          Ordering medicines online shouldn't be complicated. At JusTCare, we make it simple —
          browse our wide range of genuine medicines and healthcare products, add them to your cart,
          and your order will be on its way to you. We're your local pharmacy, now online, bringing
          trusted healthcare to your doorstep.
        </p>

        <h3 className="mt-8 text-lg font-bold text-[#3D3A2E]">Why Order Medicines From JusTCare?</h3>

        <ul className="mt-4 space-y-2 text-sm text-[#6B6650]">
          {[
            "Fast, reliable local delivery",
            "Genuine medicines sourced from a trusted pharmacy",
            "Prescription verification by our pharmacy team",
            "Easy order tracking from placement to delivery",
            "Wide range of healthcare and personal care products",
            "Simple returns and dedicated customer support",
          ].map((point) => (
            <li key={point} className="flex items-start gap-2">
              <span className="text-[#6B7256] font-bold">•</span>
              {point}
            </li>
          ))}
        </ul>

        <h3 className="mt-8 text-lg font-bold text-[#3D3A2E]">A Pharmacy You Can Trust</h3>
        <p className="mt-3 text-sm leading-relaxed text-[#6B6650]">
          We understand how important trust is when it comes to your health. Every product on
          JusTCare is checked for authenticity and quality before it reaches your doorstep. Whether
          you need everyday essentials or prescription medicines, we're here to make healthcare
          simple, reliable, and accessible.
        </p>
      </div>
    </section>
  );
}