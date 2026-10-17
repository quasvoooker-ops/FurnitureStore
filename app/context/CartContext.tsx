"use client";

import { createContext, useContext, useEffect, useState } from "react";

export interface CartItem {
  id: number;
  name: string;
  price: string;
  image: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Omit<CartItem, "quantity">) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
}

const CartContext = createContext<CartContextType>({
  items: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  totalItems: 0,
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("cart");
    if (saved) setItems(JSON.parse(saved));
  }, []);

  function save(updated: CartItem[]) {
    setItems(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  }

  function addToCart(product: Omit<CartItem, "quantity">) {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      const updated = existing
        ? prev.map((i) => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
        : [...prev, { ...product, quantity: 1 }];
      localStorage.setItem("cart", JSON.stringify(updated));
      return updated;
    });
  }

  function removeFromCart(id: number) {
    save(items.filter((i) => i.id !== id));
  }

  function updateQuantity(id: number, quantity: number) {
    if (quantity < 1) return removeFromCart(id);
    save(items.map((i) => i.id === id ? { ...i, quantity } : i));
  }

  function clearCart() {
    save([]);
  }

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, totalItems }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
