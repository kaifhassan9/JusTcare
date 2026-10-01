"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

type CartItem = {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
  quantity: number;
  requiresPrescription?: boolean;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (product: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;       
  cartItemCount: number;  
  cartTotal: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "medicare_cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  

  // Load cart from localStorage once, on first mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        setCart(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load cart from storage:", error);
    } finally {
      setHasLoaded(true);
    }
  }, []);

  // Persist cart to localStorage every time it changes —
  // but only after the initial load, so we don't immediately
  // overwrite stored data with the empty initial state
  useEffect(() => {
    if (!hasLoaded) return;

    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      console.error("Failed to save cart to storage:", error);
    }
  }, [cart, hasLoaded]);

  const addToCart = (product: Omit<CartItem, "quantity">, quantity = 1) => {
    setCart((currentCart) => {
      const existingItem = currentCart.find((item) => item.id === product.id);

      if (existingItem) {
        return currentCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [...currentCart, { ...product, quantity }];
    });
  };

  const removeFromCart = (id: number) => {
    setCart((currentCart) => currentCart.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(id);
      return;
    }
      const cappedQuantity = Math.min(quantity, 10);

    setCart((currentCart) =>
      currentCart.map((item) => (item.id === id ? { ...item, quantity:cappedQuantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartItemCount = cart.length; // distinct products, regardless of quantity
  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartItemCount, cartTotal }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}