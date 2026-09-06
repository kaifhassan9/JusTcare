import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative bg-[#2C3325] text-[#EBE5D8] border-t border-[#3D4734] overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-0 left-1/4 h-72 w-72 rounded-full bg-[#8B976B]/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-[#C5BAA2]/10 blur-3xl pointer-events-none" />

      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 py-12 md:py-16 md:grid-cols-4">

        {/* Brand Column */}
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#556244] to-[#8B976B] text-[#F5F2EB] shadow-md shadow-[#1E2319]/40">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-[#F5F2EB]">
              JusT<span className="text-[#C5BAA2]">Care</span>
            </h2>
          </div>

          <p className="text-sm leading-relaxed text-[#C5BAA2]">
            Your trusted local pharmacy for medicines and everyday healthcare
            products.
          </p>

          <div className="inline-flex items-center gap-2 rounded-full bg-[#8B976B]/20 border border-[#8B976B]/30 px-3 py-1 text-xs font-semibold text-[#D8D0C0]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#A3B18A] animate-pulse"></span>
            100% Certified Medicines
          </div>
        </div>

        {/* Quick Links Column */}
        <div>
          <h3 className="font-bold text-[#F5F2EB] text-base tracking-wide flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#8B976B]"></span>
            Quick Links
          </h3>

          <div className="mt-4 space-y-2.5 text-sm font-medium">
            <Link 
              href="/" 
              className="block text-[#C5BAA2] hover:text-[#F5F2EB] hover:translate-x-1 transition-all duration-200"
            >
              Home
            </Link>

            <Link 
              href="/medicines" 
              className="block text-[#C5BAA2] hover:text-[#F5F2EB] hover:translate-x-1 transition-all duration-200"
            >
              Medicines
            </Link>

            <Link 
              href="/orders" 
              className="block text-[#C5BAA2] hover:text-[#F5F2EB] hover:translate-x-1 transition-all duration-200"
            >
              My Orders
            </Link>

            <Link 
              href="/cart" 
              className="block text-[#C5BAA2] hover:text-[#F5F2EB] hover:translate-x-1 transition-all duration-200"
            >
              Cart
            </Link>
          </div>
        </div>

        {/* Customer Support Column */}
        <div>
          <h3 className="font-bold text-[#F5F2EB] text-base tracking-wide flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#C5BAA2]"></span>
            Customer Support
          </h3>

          <div className="mt-4 space-y-3 text-sm text-[#C5BAA2] font-medium">
            <p className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#21261C] border border-[#3D4734] text-xs">📞</span>
              <span>+91 8409743476</span>
            </p>
            <p className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#21261C] border border-[#3D4734] text-xs">✉️</span>
              <span>support@justcare.com</span>
            </p>
            <p className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#21261C] border border-[#3D4734] text-xs">🕐</span>
              <span>Mon - Sun: 9 AM - 9 PM</span>
            </p>
          </div>
        </div>

        {/* Store Column */}
        <div>
          <h3 className="font-bold text-[#F5F2EB] text-base tracking-wide flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#8B976B]"></span>
            Our Store
          </h3>

          <div className="mt-4 space-y-3 text-sm text-[#C5BAA2] font-medium">
            <p className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#21261C] border border-[#3D4734] text-xs">📍</span>
              <span>Nawada (Bihar)</span>
            </p>
            <p className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#21261C] border border-[#3D4734] text-xs">🚚</span>
              <span>Local delivery available</span>
            </p>
            <p className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#21261C] border border-[#3D4734] text-xs">🏪</span>
              <span>Store pickup available</span>
            </p>
          </div>
        </div>

      </div>

      {/* Bottom Copyright */}
      <div className="border-t border-[#21261C] bg-[#21261C]/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 text-center text-xs font-semibold text-[#9E9584]">
          © {new Date().getFullYear()} JusTCare. All rights reserved.
        </div>
      </div>
    </footer>
  );
}