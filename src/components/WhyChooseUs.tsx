const benefits = [
  { icon: "✓", title: "Trusted Pharmacy", description: "Get healthcare products from your trusted local pharmacy." },
  { icon: "🚚", title: "Fast Delivery", description: "Get your order delivered conveniently to your doorstep." },
  { icon: "🔒", title: "Secure & Private", description: "Your account and order information are handled securely." },
  { icon: "💬", title: "Personal Support", description: "Get assistance from our pharmacy team when you need it." },
];

export default function WhyChooseUs() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-16 pt-4">
      <div className="text-center">
        <span className="text-xs font-bold uppercase tracking-widest text-[#6B7256]">
          GUARANTEED SERVICE
        </span>
        <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#3D3A2E]">
          Why Choose Us?
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-sm sm:text-base text-[#6B6650]">
          A simple and trusted way to get your everyday healthcare needs.
        </p>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {benefits.map((benefit) => (
          <div
            key={benefit.title}
            className="group rounded-2xl border border-[#DDD3BC] bg-white p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg"
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#6B7256]/10 border border-[#6B7256]/20 text-2xl text-[#6B7256] group-hover:bg-[#6B7256] group-hover:text-white transition-all duration-300">
              {benefit.icon}
            </div>
            <h3 className="mt-5 font-bold text-base text-[#3D3A2E]">{benefit.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-[#6B6650]">{benefit.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}