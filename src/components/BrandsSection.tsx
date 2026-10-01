import Image from "next/image";

const brands = [
  {
    name: "Himalaya",
    discount: "20%",
    bg: "#E4F0E4",
    logo: "https://cdn.shopify.com/s/files/1/0272/4714/9155/files/logo-aboutus.png?1207",
  },
  {
    name: "Cetaphil",
    discount: "20%",
    bg: "#E4EAF3",
    logo: "https://images.seeklogo.com/logo-png/48/1/cetaphil-logo-png_seeklogo-483868.png", // Add Cetaphil logo URL here
  },
  {
    name: "Dabur",
    discount: "40%",
    bg: "#FBE9E4",
    logo: "https://upload.wikimedia.org/wikipedia/hi/2/2c/Dabur_Logo.svg.png?utm_source=hi.wikipedia.org&utm_campaign=index&utm_content=thumbnail_unscaled&_=20110221080129", // Add Dabur logo URL here
  },
  {
    name: "Derma",
    discount: "10%",
    bg: "#F0EDE4",
    logo: "https://airiamall.com/wp-content/uploads/2025/01/The-Derma-Co-Airia-Mall-Gurugram.png", // Add Minimalist logo URL here
  },
  {
    name: "Mamypoko Pants",
    discount: "20%",
    bg: "#F3E4EC",
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRzDjy9c5l1D--ZlhLghWUJzEJRIXcYCuhEfC4EJpiUkg&s", // Add MamyPoko logo URL here
  },
];

export default function BrandsSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-16">
      <h2 className="font-[family-name:var(--font-poppins)] text-2xl font-bold text-[#3D3A2E] mb-6">
        Popular Brands
      </h2>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {brands.map((brand) => (
          <div
            key={brand.name}
            className="rounded-2xl border border-[#DDD3BC] bg-white overflow-hidden shadow-sm transition hover:-translate-y-1 hover:shadow-md cursor-pointer"
          >
           {/* Logo area */}
<div
  className="flex h-24 w-full items-center justify-center p-2 overflow-hidden"
  style={{ backgroundColor: brand.bg }}
>
  {brand.logo ? (
    <img
      src={brand.logo}
      alt={`${brand.name} logo`}
      className="h-full w-full object-contain mix-blend-multiply scale-110"
    />
  ) : (
    <span className="text-xs font-bold text-[#8B8570]">
      {brand.name} logo
    </span>
  )}
</div>

            {/* Discount badge */}
            <div className="bg-[#6B7256] py-3 text-center">
              <p className="text-[10px] font-bold uppercase tracking-wide text-white/80">
                Up to
              </p>
              <p className="text-lg font-extrabold text-white leading-tight">
                {brand.discount}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-white/80">
                Off
              </p>
            </div>

            <p className="py-2.5 text-center text-sm font-semibold text-[#3D3A2E]">
              {brand.name}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}