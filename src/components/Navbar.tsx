"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, FormEvent } from "react";
import { useCart } from "@/context/CartContext";
import LoginModal from "@/components/LoginModal";

interface SearchResult {
  place_id: number;
  display_name: string;
  name: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
  };
}

function NavbarContent() {
  const router = useRouter();
  const { cartItemCount } = useCart();
  const [searchQuery, setSearchQuery] = useState("");

  // Location Drawer States
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("Your location");
  const [manualInput, setManualInput] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const [user, setUser] = useState<{
    name: string;
    email: string;
    role: string;
  } | null>(null);

  // Helper to get storage key unique to the logged-in user
  function getLocationStorageKey(userEmail?: string | null) {
    return userEmail ? `user_delivery_location_${userEmail}` : "user_delivery_location_guest";
  }

  // Fetch current user details
  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch("/api/auth/me");
        const data = await response.json();
        if (data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    }

    fetchUser();
  }, []);

  // Update displayed location whenever user state changes (Login / Logout / Switch User)
  useEffect(() => {
    const storageKey = getLocationStorageKey(user?.email);
    const savedLocation = localStorage.getItem(storageKey);

    if (savedLocation) {
      setSelectedLocation(savedLocation);
    } else {
      setSelectedLocation("Your location"); // Reset for new/unconfigured users
    }
  }, [user]);

  // Real-time Search Autocomplete with Debounce
  useEffect(() => {
    if (!manualInput.trim() || manualInput.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            manualInput
          )}&countrycodes=in&addressdetails=1&limit=6`
        );
        const data = await res.json();
        setSearchResults(data);
      } catch (error) {
        console.error("Location search error:", error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [manualInput]);

  async function handleLogout() {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        setUser(null);
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  }

  function saveAddress(address: string) {
    setSelectedLocation(address);
    const storageKey = getLocationStorageKey(user?.email);
    localStorage.setItem(storageKey, address);

    setIsDrawerOpen(false);
    setManualInput("");
    setSearchResults([]);
  }

  function handleUseCurrentLocation() {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          const city =
            data.address.city ||
            data.address.town ||
            data.address.village ||
            data.address.suburb ||
            "Selected Location";
          const postcode = data.address.postcode ? ` - ${data.address.postcode}` : "";
          saveAddress(`${city}${postcode}`);
        } catch {
          saveAddress(`${latitude.toFixed(2)}, ${longitude.toFixed(2)}`);
        } finally {
          setLoading(false);
        }
      },
      () => {
        setLoading(false);
        alert("Unable to fetch location. Please check browser permissions.");
      }
    );
  }

  function formatSearchResult(item: SearchResult) {
    const parts = item.display_name.split(",");
    const primaryName = parts[0]?.trim() || item.name;
    const secondaryName = parts.slice(1, 3).join(",").trim();
    return { primaryName, secondaryName };
  }

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#F5F1E8] border-b border-[#DDD3BC]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 py-4">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#6B7256] text-white text-xl shadow-sm">
              <i className="fa-solid fa-staff-snake"></i>
            </div>
            <div>
              <div className="font-[family-name:var(--font-poppins)] text-xl font-bold text-[#3D3A2E] flex items-center gap-1">
                JusT<span className="text-[#6B7256]">Care</span>
              </div>
              <div className="text-[11px] font-medium text-[#8B8570] -mt-0.5">
                Your trusted pharmacy
              </div>
            </div>
          </Link>

          {/* Search Bar - Hidden on Home Page */}
          {pathname !== "/" && (
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-2">
              <div className="flex w-full items-center rounded-full bg-white border border-[#DDD3BC] px-4 py-2.5">
                <svg className="h-4 w-4 text-[#8B8570] mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search medicines, health products..."
                  className="w-full bg-transparent text-sm outline-none placeholder-[#8B8570] text-[#3D3A2E]"
                />
                <button type="submit" className="rounded-full bg-[#6B7256] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#5a6047] transition shrink-0">
                  Search
                </button>
              </div>
            </form>
          )}

          {/* Action Group */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {pathname !== "/" && (
              <button
                onClick={() => setShowMobileSearch((s) => !s)}
                className="flex md:hidden items-center justify-center h-10 w-10 rounded-full border border-[#DDD3BC] bg-white text-[#3D3A2E] hover:bg-[#EDE6D6] transition"
                aria-label="Search"
              >
                <i className="fa-solid fa-magnifying-glass"></i>
              </button>
            )}

            <button
              onClick={() => setIsDrawerOpen(true)}
              className="hidden md:flex items-center gap-2 rounded-full border border-[#DDD3BC] bg-white px-3.5 py-2 text-sm hover:bg-[#EDE6D6] transition"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#6B7256]/15 text-[#6B7256] text-xs">
                <i className="fa-solid fa-location-dot"></i>
              </span>
              <span className="text-left leading-tight max-w-[120px] truncate">
                <span className="block text-[10px] font-semibold uppercase tracking-wide text-[#8B8570]">
                  Deliver to
                </span>
                <span className="font-semibold text-xs text-[#3D3A2E] truncate block">
                  {selectedLocation}
                </span>
              </span>
            </button>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative flex items-center gap-2 rounded-full bg-white border border-[#DDD3BC] px-3.5 py-2.5 text-sm font-semibold text-[#3D3A2E] hover:bg-[#EDE6D6] transition"
            >
              <span className="text-lg"><i className="fa-solid fa-cart-shopping"></i></span>
              {cartItemCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#8B7355] px-1.5 text-xs font-bold text-white">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {/* Account / Login */}
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/account"
                  className="flex items-center gap-2 rounded-full border border-[#DDD3BC] bg-white px-3 sm:px-3.5 py-2.5 text-sm font-semibold text-[#3D3A2E] hover:border-[#6B7256] hover:text-[#6B7256] transition"
                >
                  <span><i className="fa-solid fa-user"></i></span>
                  <span className="hidden sm:inline max-w-[100px] truncate">{user.name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center h-10 w-10 sm:w-auto sm:px-3.5 sm:py-2.5 rounded-full border border-red-200 bg-white text-sm font-semibold text-red-500 hover:bg-red-50 transition"
                  aria-label="Logout"
                >
                  <i className="fa-solid fa-right-from-bracket sm:hidden"></i>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsLoginOpen(true)}
                className="rounded-full bg-[#6B7256] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#5a6047] transition cursor-pointer"
              >
                Login
              </button>
            )}

            {/* Render Login Popup Modal */}
            <LoginModal 
              isOpen={isLoginOpen} 
              onClose={() => setIsLoginOpen(false)} 
            />
          </div>
        </div>

        {showMobileSearch && pathname !== "/" && (
          <div className="md:hidden px-4 pb-3">
            <form onSubmit={handleSearch} className="flex w-full items-center rounded-full bg-white border border-[#DDD3BC] px-4 py-2.5">
              <svg className="h-4 w-4 text-[#8B8570] mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search medicines..."
                autoFocus
                className="w-full bg-transparent text-sm outline-none placeholder-[#8B8570] text-[#3D3A2E]"
              />
              <button type="submit" className="rounded-full bg-[#6B7256] px-4 py-1.5 text-xs font-semibold text-white shrink-0">
                Go
              </button>
            </form>
          </div>
        )}

        {/* Navigation Sub-bar */}
        <div className="bg-[#6B7256] border-t border-[#5A6047] shadow-inner">
          <nav className="mx-auto flex max-w-7xl items-center gap-2 px-4 sm:px-6 py-2 overflow-x-auto text-sm font-medium text-white">
            <Link
              href="/"
              className="rounded-full px-4 py-1.5 transition hover:bg-white/15 hover:text-white"
            >
              Home
            </Link>

            <Link
              href="/products"
              className="rounded-full px-4 py-1.5 transition hover:bg-white/15 hover:text-white"
            >
              Healthcare
            </Link>

            <Link
              href="/prescription"
              className="flex items-center gap-2 rounded-full bg-white/20 text-white px-4 py-1.5 font-semibold hover:bg-white/30 transition shadow-sm ml-auto sm:ml-0"
            >
              <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
              Upload Prescription
            </Link>

            {user?.role === "PHARMACY_ADMIN" && (
              <Link
                href="/admin"
                className="flex items-center gap-2 rounded-full bg-white/20 text-white px-4 py-1.5 font-semibold hover:bg-white/30 transition shadow-sm"
              >
                Admin Dashboard
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Slide-over Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsDrawerOpen(false)}
          />

          <div className="relative z-10 h-full w-full max-w-md bg-white p-6 shadow-2xl flex flex-col overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#DDD3BC] pb-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1 text-lg text-[#3D3A2E] hover:opacity-70"
                >
                  ←
                </button>
                <h2 className="text-lg font-bold text-[#3D3A2E]">Deliver to</h2>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1 text-lg font-bold text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {/* Input Form */}
            <div className="mt-6">
              <div className="relative">
                <input
                  type="text"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder="Search for society, locality, city..."
                  className="w-full rounded-xl border border-[#DDD3BC] bg-[#F5F1E8]/50 px-4 py-3 text-sm outline-none focus:border-[#6B7256] text-[#3D3A2E]"
                />
                {manualInput && (
                  <button
                    onClick={() => {
                      setManualInput("");
                      setSearchResults([]);
                    }}
                    className="absolute right-3 top-3.5 text-xs text-gray-400 bg-gray-200 rounded-full h-4 w-4 flex items-center justify-center"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Live Search Suggestions */}
            {manualInput.trim().length > 1 ? (
              <div className="mt-4 flex-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#8B8570] mb-2">
                  Search Results
                </p>

                {isSearching && (
                  <p className="text-xs text-gray-500 py-3">Searching locations...</p>
                )}

                {!isSearching && searchResults.length === 0 && (
                  <p className="text-xs text-gray-500 py-3">No locations found.</p>
                )}

                <div className="divide-y divide-gray-100">
                  {searchResults.map((item) => {
                    const { primaryName, secondaryName } = formatSearchResult(item);
                    return (
                      <button
                        key={item.place_id}
                        onClick={() => saveAddress(`${primaryName}${secondaryName ? `, ${secondaryName}` : ""}`)}
                        className="w-full text-left py-3 px-1 hover:bg-[#F5F1E8]/60 transition flex flex-col"
                      >
                        <span className="font-bold text-sm text-[#3D3A2E]">
                          {primaryName}
                        </span>
                        {secondaryName && (
                          <span className="text-xs text-[#8B8570] truncate mt-0.5">
                            {secondaryName}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Default View when Input is Empty */
              <div className="mt-6 flex-1">
                <button
                  onClick={handleUseCurrentLocation}
                  disabled={loading}
                  className="flex w-full items-center gap-3 rounded-xl border border-[#6B7256] p-3 text-sm font-semibold text-[#6B7256] hover:bg-[#6B7256]/10 transition"
                >
                  <span><i className="fa-solid fa-location-dot"></i></span>
                  <span>{loading ? "Locating..." : "Use Current Location"}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default function Navbar() {
  return (
    <Suspense fallback={null}>
      <NavbarContent />
    </Suspense>
  );
}