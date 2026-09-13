"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface CartItem {
  id: string;
  _id?: string;
  name: string;
  title?: string;
  price: number;
  quantity: number;
  image?: string;
  unit?: string;
  isBogo?: boolean;
}

interface CartContextType {
  cart: CartItem[];
  cartItems: CartItem[];
  addToCart: (product: any, delta?: number) => void;
  updateQuantity: (id: string, delta: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  totalCount: number;
  subtotal: number;
  bogoDiscountAmount: number;
  promoDiscountPct: number;
  appliedOfferTitle: string | null;
  applyPromoOffer: (discountPct: number, offerTitle: string) => void;
  removePromoOffer: () => void;
  discountAmount: number;
  totalPayable: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [promoDiscountPct, setPromoDiscountPct] = useState<number>(0);
  const [appliedOfferTitle, setAppliedOfferTitle] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("mart_in_cart");
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
      const savedOffer = localStorage.getItem("mart_in_offer");
      if (savedOffer) {
        const parsed = JSON.parse(savedOffer);
        setPromoDiscountPct(parsed.pct || 0);
        setAppliedOfferTitle(parsed.title || null);
      }
    } catch (e) {
      console.error("Cart localStorage error:", e);
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem("mart_in_cart", JSON.stringify(cart));
    } catch (e) {
      console.error("Cart save error:", e);
    }
  }, [cart]);

  const applyPromoOffer = (discountPct: number, offerTitle: string) => {
    setPromoDiscountPct(discountPct);
    setAppliedOfferTitle(offerTitle);
    try {
      localStorage.setItem(
        "mart_in_offer",
        JSON.stringify({ pct: discountPct, title: offerTitle })
      );
    } catch (e) {
      console.error("Offer save error:", e);
    }
  };

  const removePromoOffer = () => {
    setPromoDiscountPct(0);
    setAppliedOfferTitle(null);
    try {
      localStorage.removeItem("mart_in_offer");
    } catch (e) {
      console.error("Offer remove error:", e);
    }
  };

  // Add to cart with BOGO 1+1 FREE logic
  const addToCart = (product: any, delta: number = 1) => {
    const targetId = product.id || product._id;
    const name = product.name || product.title || "Product";
    const isBogoItem = Boolean(product.isBogo);

    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.id === targetId || (item._id && item._id === targetId)
      );

      if (existingIndex > -1) {
        let newQty = prev[existingIndex].quantity + delta;
        // BOGO Logic: adding 1 unit to a 1-unit item set to 2, or adding to BOGO item makes it 2 minimum
        if (isBogoItem && delta > 0 && newQty % 2 !== 0) {
          newQty = newQty + 1; // ensure 1+1 pair
        }
        if (newQty <= 0) {
          return prev.filter((_, idx) => idx !== existingIndex);
        }
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
        };
        return updated;
      }

      if (delta <= 0) return prev;

      // Initial add for BOGO item: adding 1 unit automatically sets quantity to 2 (1 + 1 free)
      const initialQty = isBogoItem && delta === 1 ? 2 : delta;

      return [
        ...prev,
        {
          id: targetId,
          _id: product._id,
          name,
          title: name,
          price: Number(product.price || 0),
          quantity: initialQty,
          image: product.image,
          unit: product.unit || "",
          isBogo: isBogoItem,
        },
      ];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) => {
      const item = prev.find((i) => i.id === id || i._id === id);
      if (!item) return prev;
      let newQty = item.quantity + delta;
      if (newQty <= 0) {
        return prev.filter((i) => i.id !== id && i._id !== id);
      }
      return prev.map((i) =>
        i.id === id || i._id === id ? { ...i, quantity: newQty } : i
      );
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id && item._id !== id));
  };

  const clearCart = () => {
    setCart([]);
    removePromoOffer();
  };

  const totalCount = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);

  // Subtotal before BOGO discount
  const grossSubtotal = cart.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
    0
  );

  // BOGO Discount Calculation: for every pair of BOGO items, 1 item is free!
  const bogoDiscountAmount = cart.reduce((sum, item) => {
    if (item.isBogo && item.quantity >= 2) {
      const freeUnits = Math.floor(item.quantity / 2);
      return sum + freeUnits * item.price;
    }
    return sum;
  }, 0);

  // Subtotal after BOGO free items
  const subtotal = Math.max(0, grossSubtotal - bogoDiscountAmount);

  // Promo Code Discount Calculation
  const discountAmount = Math.round((subtotal * promoDiscountPct) / 100);
  const totalPayable = Math.max(0, subtotal - discountAmount);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartItems: cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalCount,
        subtotal,
        bogoDiscountAmount,
        promoDiscountPct,
        appliedOfferTitle,
        applyPromoOffer,
        removePromoOffer,
        discountAmount,
        totalPayable,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}