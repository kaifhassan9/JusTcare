"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";

type ProductCardProps = {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
  requiresPrescription?: boolean;
};

export default function ProductCard({
  id,
  name,
  category,
  price,
  image,
  requiresPrescription = false,
}: ProductCardProps) {
  const { cart, addToCart, updateQuantity, removeFromCart } = useCart();

  const cartItem = cart.find((item) => item.id === id);
  const isInCart = !!cartItem;

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({ id, name, category, price, image, requiresPrescription }, 1);
  };

  const handleIncrease = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (cartItem) updateQuantity(id, cartItem.quantity + 1);
  };

  const handleDecrease = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (cartItem) {
      if (cartItem.quantity <= 1) {
        removeFromCart(id);
      } else {
        updateQuantity(id, cartItem.quantity - 1);
      }
    }
  };

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-[#DDD3BC] bg-white p-4 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg">
      <Link href={`/products/${id}`} className="block">
        <div className="relative flex h-48 w-full items-center justify-center overflow-hidden rounded-xl bg-[#F7F5EF] p-4">
          {image?.startsWith("http") ? (
            <img
              src={image}
              alt={name}
              className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <span className="text-6xl transition-transform duration-300 group-hover:scale-110">
              {image}
            </span>
          )}

          {requiresPrescription && (
            <span className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded-full bg-[#8B7355]/15 border border-[#8B7355]/30 px-2.5 py-0.5 text-[11px] font-bold text-[#8B7355]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#8B7355]"></span>
              Rx Required
            </span>
          )}
        </div>

        <p className="mt-4 text-[11px] font-bold uppercase tracking-wider text-[#6B7256]">
          {category}
        </p>

        <h3 className="mt-1 line-clamp-2 min-h-[44px] text-base font-bold text-[#3D3A2E] transition-colors group-hover:text-[#6B7256]">
          {name}
        </h3>

        <div className="mt-3 flex items-center justify-between pt-2 border-t border-[#EDE6D6]">
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-extrabold text-[#3D3A2E]">₹{price}</span>
            <span className="text-xs font-medium text-[#8B8570]">incl. taxes</span>
          </div>
        </div>
      </Link>

      {/* Either "Add to Cart" button, or a quantity stepper once it's in the cart */}
      {isInCart ? (
        <div className="mt-4 flex items-center justify-between rounded-full border border-[#DDD3BC] bg-[#F7F5EF] p-1">
          <button
            type="button"
            onClick={handleDecrease}
            className="flex h-8 w-8 items-center justify-center rounded-full text-base font-bold text-[#3D3A2E] hover:bg-white transition active:scale-95"
            aria-label="Decrease quantity"
          >
            −
          </button>

          <span className="text-sm font-extrabold text-[#3D3A2E]">
            {cartItem?.quantity}
          </span>

          <button
            type="button"
            onClick={handleIncrease}
            disabled={cartItem ? cartItem.quantity >= 10 : false}
            className="flex h-8 w-8 items-center justify-center rounded-full text-base font-bold text-[#6B7256] hover:bg-white transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleAddToCart}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-sm font-bold text-white shadow-sm transition-all active:scale-95 bg-[#8B7355] hover:bg-[#7a6549]"
        >
          <span>🛒</span> Add to Cart
        </button>
      )}
    </div>
  );
}