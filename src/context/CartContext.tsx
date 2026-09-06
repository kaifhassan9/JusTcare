"use client";

import {
  createContext,
  useContext,
  useState,
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

  addToCart: (
    product: Omit<CartItem, "quantity">,
    quantity?: number
  ) => void;

  removeFromCart: (id: number) => void;

  updateQuantity: (
    id: number,
    quantity: number
  ) => void;

  clearCart: () => void;

  cartCount: number;

  cartTotal: number;
};

const CartContext = createContext<
  CartContextType | undefined
>(undefined);

export function CartProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [cart, setCart] = useState<CartItem[]>([]);

  // ADD PRODUCT TO CART
  const addToCart = (
    product: Omit<CartItem, "quantity">,
    quantity = 1
  ) => {
    setCart((currentCart) => {
      const existingItem = currentCart.find(
        (item) => item.id === product.id
      );

      // Product already exists in cart
      if (existingItem) {
        return currentCart.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity:
                  item.quantity + quantity,
              }
            : item
        );
      }

      // Product doesn't exist in cart
      return [
        ...currentCart,
        {
          ...product,
          quantity,
        },
      ];
    });
  };

  // REMOVE PRODUCT FROM CART
  const removeFromCart = (id: number) => {
    setCart((currentCart) =>
      currentCart.filter(
        (item) => item.id !== id
      )
    );
  };

  // UPDATE PRODUCT QUANTITY
  const updateQuantity = (
    id: number,
    quantity: number
  ) => {
    // If quantity becomes 0, remove product
    if (quantity < 1) {
      removeFromCart(id);
      return;
    }

    setCart((currentCart) =>
      currentCart.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity,
            }
          : item
      )
    );
  };

  // CLEAR ENTIRE CART
  const clearCart = () => {
    setCart([]);
  };

  // TOTAL NUMBER OF PRODUCTS
  const cartCount = cart.reduce(
    (total, item) =>
      total + item.quantity,
    0
  );

  // TOTAL PRICE
  const cartTotal = cart.reduce(
    (total, item) =>
      total + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// CUSTOM HOOK
export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider"
    );
  }

  return context;
}