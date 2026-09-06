"use client";

import { useState } from "react";

interface LocationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAddress: (address: string) => void;
}

export default function LocationDrawer({
  isOpen,
  onClose,
  onSelectAddress,
}: LocationDrawerProps) {
  const [manualInput, setManualInput] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // Use browser geolocation to auto-detect current location
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
          // Free reverse geocoding via OpenStreetMap Nominatim API
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
          const formattedAddress = `${city}${postcode}`;

          onSelectAddress(formattedAddress);
          onClose();
        } catch (error) {
          console.error("Geocoding error:", error);
          onSelectAddress(`${latitude.toFixed(2)}, ${longitude.toFixed(2)}`);
          onClose();
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        setLoading(false);
        alert("Unable to fetch location. Please check browser permissions.");
      }
    );
  }

  function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (manualInput.trim()) {
      onSelectAddress(manualInput.trim());
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Dark Overlay Background */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over Panel from Right */}
      <aside className="relative z-10 w-full max-w-md bg-white h-full shadow-2xl flex flex-col p-6 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4 border-[#DDD3BC]">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-100 text-[#3D3A2E]"
            >
              ←
            </button>
            <h2 className="text-lg font-bold text-[#3D3A2E]">Deliver to</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold"
          >
            ✕
          </button>
        </div>

        {/* Input Search Form */}
        <form onSubmit={handleManualSubmit} className="mt-6">
          <div className="relative">
            <input
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="Search for society, locality, pincode..."
              className="w-full rounded-lg border border-[#DDD3BC] bg-[#F5F1E8]/40 px-4 py-3 text-sm outline-none focus:border-[#6B7256] text-[#3D3A2E]"
            />
            {manualInput && (
              <button
                type="button"
                onClick={() => setManualInput("")}
                className="absolute right-3 top-3 text-xs text-gray-400 bg-gray-200 rounded-full h-5 w-5 flex items-center justify-center"
              >
                ✕
              </button>
            )}
          </div>
        </form>

        {/* Use Current Location Button */}
        <button
          onClick={handleUseCurrentLocation}
          disabled={loading}
          className="mt-4 flex items-center gap-3 w-full p-3 rounded-lg border border-[#6B7256] text-[#6B7256] hover:bg-[#6B7256]/10 transition text-sm font-semibold"
        >
          <span>🎯</span>
          <span>{loading ? "Fetching location..." : "Use Current Location"}</span>
        </button>

        {/* Example Popular Cities Quick Select */}
        <div className="mt-8">
          <p className="text-xs font-bold uppercase tracking-wider text-[#8B8570] mb-3">
            Popular Cities
          </p>
          <div className="flex flex-wrap gap-2">
            {["Patna 800001", "Nawada 805111", "Delhi 110001", "Mumbai 400001"].map(
              (city) => (
                <button
                  key={city}
                  onClick={() => {
                    onSelectAddress(city);
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded-full border border-[#DDD3BC] text-xs font-medium text-[#3D3A2E] hover:bg-[#EDE6D6] transition"
                >
                  {city}
                </button>
              )
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}