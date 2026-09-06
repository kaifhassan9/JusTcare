export default function PrescriptionSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-16">
      <div className="relative overflow-hidden rounded-3xl border border-[#D5CDBF] dark:border-[#3D4734] bg-gradient-to-br from-[#F5F2EB] via-[#EBE5D8]/60 to-[#FAF8F5] dark:from-[#1E2319] dark:via-[#252B1F] dark:to-[#1E2319] p-1 shadow-lg shadow-[#556244]/5">
        {/* Background Decorative Lighting */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-[#8B976B]/20 dark:bg-[#8B976B]/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-64 w-64 rounded-full bg-[#C5BAA2]/30 dark:bg-[#C5BAA2]/10 blur-3xl pointer-events-none" />

        <div className="relative grid items-center gap-8 p-8 md:grid-cols-2 md:p-12">

          {/* Content */}
          <div className="z-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#6B7256]/10 border border-[#6B7256]/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#556244] dark:text-[#C5BAA2]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#6B7256] animate-pulse"></span>
              PRESCRIPTION MEDICINES
            </div>

            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-[#2C3325] dark:text-[#F5F2EB]">
              Have a prescription?
            </h2>

            <p className="mt-4 max-w-lg text-base leading-relaxed text-[#5A564A] dark:text-[#C5BAA2]">
              Upload your prescription and our pharmacy team will help you
              with the medicines you need.
            </p>

            <button className="mt-8 inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-[#556244] to-[#6B7256] px-7 py-3.5 text-base font-bold text-[#F5F2EB] shadow-lg shadow-[#556244]/25 hover:from-[#455037] hover:to-[#586045] hover:shadow-[#556244]/35 hover:scale-[1.02] active:scale-95 transition-all">
              <span>📄</span> Upload Prescription
            </button>
          </div>

          {/* Visual Container Stage */}
          <div className="flex justify-center md:justify-end">
            <div className="relative group">
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-[#6B7256] to-[#C5BAA2] opacity-30 blur-xl group-hover:opacity-60 transition duration-500"></div>
              <div className="relative flex h-48 w-48 sm:h-56 sm:w-56 items-center justify-center rounded-3xl border border-[#D5CDBF] dark:border-[#3D4734] bg-[#FAF8F5]/90 dark:bg-[#252B1F]/90 text-7xl sm:text-8xl shadow-xl backdrop-blur-md transition-transform duration-300 group-hover:scale-105">
                🧾
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}