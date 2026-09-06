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
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        Quantity
      </p>

      <div className="mt-2.5 flex h-11 w-fit items-center overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80 p-0.5 shadow-sm">
        {/* Minus Button */}
        <button
          type="button"
          onClick={decrease}
          disabled={quantity <= min}
          className="flex h-full w-11 items-center justify-center rounded-lg text-lg font-bold text-slate-700 dark:text-slate-200 transition-all hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm active:scale-95 disabled:cursor-not-allowed disabled:text-slate-300 dark:disabled:text-slate-600 disabled:hover:bg-transparent disabled:hover:shadow-none"
          aria-label="Decrease quantity"
        >
          −
        </button>

        {/* Quantity Display */}
        <div className="flex h-full w-14 items-center justify-center text-base font-extrabold text-slate-900 dark:text-white select-none">
          {quantity}
        </div>

        {/* Plus Button */}
        <button
          type="button"
          onClick={increase}
          disabled={quantity >= max}
          className="flex h-full w-11 items-center justify-center rounded-lg text-lg font-bold text-sky-600 dark:text-sky-400 transition-all hover:bg-sky-50 dark:hover:bg-sky-950/60 hover:shadow-sm active:scale-95 disabled:cursor-not-allowed disabled:text-slate-300 dark:disabled:text-slate-600 disabled:hover:bg-transparent disabled:hover:shadow-none"
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>

      <p className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
        <span className="h-1 w-1 rounded-full bg-slate-400"></span>
        Maximum {max} units per order
      </p>
    </div>
  );
}