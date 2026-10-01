"use client";

type QuantitySelectorProps = {
  quantity: number;
  setQuantity: React.Dispatch<React.SetStateAction<number>>;
  min?: number;
  max?: number;
};

export default function QuantitySelector({
  quantity,
  setQuantity,
  min = 1,
  max = 10,
}: QuantitySelectorProps) {
  const decrease = () => {
    setQuantity((current) => Math.max(min, current - 1));
  };

  const increase = () => {
    setQuantity((current) => Math.min(max, current + 1));
  };

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wider text-[#8B8570]">
        Quantity
      </p>

      <div className="mt-2.5 flex h-11 w-fit items-center overflow-hidden rounded-full border border-[#DDD3BC] bg-[#F7F5EF] p-0.5 shadow-sm">
        {/* Minus Button */}
        <button
          type="button"
          onClick={decrease}
          disabled={quantity <= min}
          className="flex h-full w-11 items-center justify-center rounded-full text-lg font-bold text-[#3D3A2E] transition-all hover:bg-white hover:shadow-sm active:scale-95 disabled:cursor-not-allowed disabled:text-[#C9C2B0] disabled:hover:bg-transparent disabled:hover:shadow-none"
          aria-label="Decrease quantity"
        >
          −
        </button>

        {/* Quantity Display */}
        <div className="flex h-full w-14 items-center justify-center text-base font-extrabold text-[#3D3A2E] select-none">
          {quantity}
        </div>

        {/* Plus Button */}
        <button
          type="button"
          onClick={increase}
          disabled={quantity >= max}
          className="flex h-full w-11 items-center justify-center rounded-full text-lg font-bold text-[#6B7256] transition-all hover:bg-[#6B7256]/10 hover:shadow-sm active:scale-95 disabled:cursor-not-allowed disabled:text-[#C9C2B0] disabled:hover:bg-transparent disabled:hover:shadow-none"
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>

      <p className="mt-2 text-xs font-medium text-[#8B8570] flex items-center gap-1">
        <span className="h-1 w-1 rounded-full bg-[#8B8570]"></span>
        Maximum {max} units per order
      </p>
    </div>
  );
}