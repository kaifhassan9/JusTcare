import Link from "next/link";

export default function PrescriptionSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-16">
      <div className="relative overflow-hidden rounded-3xl bg-[#6B7256] p-1">
        <div className="relative grid items-center gap-8 p-8 md:grid-cols-2 md:p-12">

          <div className="z-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
              <span className="h-1.5 w-1.5 rounded-full bg-[#F5F1E8]"></span>
              PRESCRIPTION MEDICINES
            </div>

            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Have a prescription?
            </h2>

            <p className="mt-4 max-w-lg text-base leading-relaxed text-white/80">
              Upload your prescription and our pharmacy team will verify it and help you get the medicines you need.
            </p>

            <Link
              href="/prescription"
              className="mt-8 inline-flex items-center gap-2.5 rounded-full bg-[#F5F1E8] px-7 py-3.5 text-base font-bold text-[#3D3A2E] hover:bg-white transition"
            >
              <span>📄</span> Upload Prescription
            </Link>
          </div>

          <div className="flex justify-center md:justify-end">
            <div className="flex h-48 w-48 sm:h-56 sm:w-56 items-center justify-center rounded-3xl bg-white/10 border border-white/20 text-7xl sm:text-8xl">
              🧾
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}