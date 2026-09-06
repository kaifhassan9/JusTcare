const benefits = [
  {
    icon: "✓",
    title: "Trusted Pharmacy",
    description: "Get healthcare products from your trusted local pharmacy.",
  },
  {
    icon: "🚚",
    title: "Fast Delivery",
    description: "Get your order delivered conveniently to your doorstep.",
  },
  {
    icon: "🔒",
    title: "Secure & Private",
    description: "Your account and order information are handled securely.",
  },
  {
    icon: "💬",
    title: "Personal Support",
    description: "Get assistance from our pharmacy team when you need it.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-16 pt-4">
      <div className="text-center">
        <span className="text-xs font-bold uppercase tracking-widest text-[#556244] dark:text-[#C5BAA2]">
          GUARANTEED SERVICE
        </span>
        <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#2C3325] dark:text-[#F5F2EB]">
          Why Choose Us?
        </h2>

        <p className="mx-auto mt-2 max-w-2xl text-sm sm:text-base text-[#5A564A] dark:text-[#C5BAA2]">
          A simple and trusted way to get your everyday healthcare needs.
        </p>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {benefits.map((benefit) => (
          <div
            key={benefit.title}
            className="group relative rounded-2xl border border-[#D5CDBF] dark:border-[#3D4734] bg-[#FAF8F5] dark:bg-[#1E2319] p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-[#6B7256]/50 hover:shadow-xl hover:shadow-[#556244]/10"
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#6B7256]/10 dark:bg-[#6B7256]/20 border border-[#6B7256]/20 text-2xl text-[#556244] dark:text-[#C5BAA2] group-hover:scale-110 group-hover:bg-gradient-to-tr group-hover:from-[#556244] group-hover:to-[#6B7256] group-hover:text-[#F5F2EB] group-hover:border-transparent transition-all duration-300 shadow-sm">
              {benefit.icon}
            </div>

            <h3 className="mt-5 font-bold text-base text-[#2C3325] dark:text-[#F5F2EB] group-hover:text-[#556244] dark:group-hover:text-[#C5BAA2] transition-colors">
              {benefit.title}
            </h3>

            <p className="mt-2 text-sm leading-relaxed text-[#5A564A] dark:text-[#C5BAA2]">
              {benefit.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}