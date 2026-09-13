"use client";

import React, { useState } from "react";
import { useCart } from "../../context/CartContext";
import CheckoutModal from "./CheckoutModal";
import RazorpayButton from "../Common/RazorpayButton";
import { Store, Truck, Trash2, Plus, Minus, X, ArrowRight, ShoppingBag } from "lucide-react";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess?: () => void;
}

export default function CartDrawer({ isOpen, onClose, onOrderSuccess }: CartDrawerProps) {
  const { cart, updateQuantity, removeFromCart, clearCart, subtotal, discountAmount, promoDiscountPct, appliedOfferTitle, removePromoOffer } = useCart();
  const [deliveryType, setDeliveryType] = useState<"Pickup" | "Delivery">("Pickup");
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  if (!isOpen) return null;

  const deliveryFee = deliveryType === "Delivery" ? (subtotal > 299 ? 0 : 25) : 0;
  const finalTotal = Math.max(0, subtotal - discountAmount) + deliveryFee;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Cart Drawer Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-zinc-900 border-l border-zinc-800 z-50 p-6 flex flex-col justify-between shadow-2xl overflow-y-auto">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-400" />
              <h2 className="text-xl font-black text-white">Your Supermarket Cart</h2>
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-black px-2.5 py-0.5 rounded-full">
                {cart.length} Items
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Delivery Mode Selector (Pickup vs Delivery) */}
          <div className="mt-4 p-1 bg-zinc-800/80 border border-zinc-700/80 rounded-xl flex gap-1">
            <button
              type="button"
              onClick={() => setDeliveryType("Pickup")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                deliveryType === "Pickup"
                  ? "bg-emerald-500 text-zinc-950 shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              Instant Store Pickup (Free)
            </button>
            <button
              type="button"
              onClick={() => setDeliveryType("Delivery")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                deliveryType === "Delivery"
                  ? "bg-emerald-500 text-zinc-950 shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              Home Delivery
            </button>
          </div>

          {/* Free Delivery Banner if applicable */}
          {deliveryType === "Delivery" && (
            <div className="mt-2 text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2 text-center font-bold">
              {subtotal >= 299 ? "🎉 FREE Home Delivery unlocked!" : `Add ₹${299 - subtotal} more for FREE Home Delivery`}
            </div>
          )}

          {/* Cart Item List */}
          <div className="mt-4 space-y-3 max-h-[48vh] overflow-y-auto pr-1">
            {cart.length === 0 ? (
              <div className="text-center py-16 text-zinc-500 space-y-2">
                <p className="text-4xl">🛒</p>
                <p className="font-bold text-zinc-300">Your cart is currently empty</p>
                <p className="text-xs">Browse items starting from ₹5 and add them to your cart!</p>
              </div>
            ) : (
              cart.map((item) => {
                const itemId = item.id || item._id || "";
                return (
                  <div
                    key={itemId}
                    className="bg-zinc-800/60 border border-zinc-700/60 rounded-xl p-3 flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-zinc-800 rounded-lg overflow-hidden flex items-center justify-center border border-zinc-700/50 flex-shrink-0">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name || item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="font-bold text-emerald-400 text-sm">
                            {(item.name || item.title || "P").charAt(0)}
                          </span>
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white line-clamp-1">
                          {item.name || item.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-black text-emerald-400">
                            ₹{item.price}
                          </span>
                          {item.unit && (
                            <span className="text-[10px] text-zinc-400">{item.unit}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quantity Stepper & Delete */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-700/80 rounded-lg px-1.5 py-1">
                        <button
                          type="button"
                          onClick={() => updateQuantity(itemId, -1)}
                          className="text-zinc-300 hover:text-white font-bold w-5 h-5 flex items-center justify-center rounded hover:bg-zinc-800"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-black text-white min-w-[16px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(itemId, 1)}
                          className="text-zinc-300 hover:text-white font-bold w-5 h-5 flex items-center justify-center rounded hover:bg-zinc-800"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(itemId)}
                        className="text-zinc-500 hover:text-rose-400 p-1 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer Summary & Checkout Actions */}
        <div className="pt-4 border-t border-zinc-800 space-y-3 mt-4">
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-zinc-400">
              <span>Items Subtotal</span>
              <span className="text-white font-bold">₹{subtotal}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-400 font-bold bg-emerald-500/10 p-1.5 rounded-lg border border-emerald-500/20">
                <span className="flex items-center gap-1">
                  🏷️ {appliedOfferTitle || "Promo Discount"} ({promoDiscountPct}%)
                </span>
                <span>-₹{discountAmount}</span>
              </div>
            )}
            <div className="flex justify-between text-zinc-400">
              <span>{deliveryType === "Delivery" ? "Home Delivery Fee" : "Store Pickup Fee"}</span>
              <span className="text-emerald-400 font-bold">
                {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
              </span>
            </div>
            <div className="flex justify-between text-sm font-black text-white pt-2 border-t border-zinc-800">
              <span>Total Payable</span>
              <span className="text-emerald-400 text-base">₹{finalTotal}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            {cart.length > 0 && (
              <RazorpayButton
                amount={finalTotal}
                onSuccess={() => {
                  clearCart();
                  onClose();
                  if (typeof onOrderSuccess === "function") onOrderSuccess();
                }}
              />
            )}

            <button
              disabled={cart.length === 0}
              onClick={() => setIsCheckoutOpen(true)}
              className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-zinc-950 font-black py-3 px-4 rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 text-xs uppercase tracking-wider cursor-pointer"
            >
              Proceed to {deliveryType === "Delivery" ? "Delivery Slot" : "Pickup Slot"}
              <ArrowRight className="w-4 h-4" />
            </button>

            {cart.length > 0 && (
              <button
                type="button"
                onClick={clearCart}
                className="w-full text-[11px] text-zinc-500 hover:text-rose-400 transition-colors py-1 font-semibold"
              >
                Clear Cart
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Checkout Modal Trigger */}
      {isCheckoutOpen && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          defaultDeliveryType={deliveryType}
          onClose={() => setIsCheckoutOpen(false)}
          onOrderSuccess={() => {
            setIsCheckoutOpen(false);
            onClose();
            if (typeof onOrderSuccess === "function") onOrderSuccess();
          }}
        />
      )}
    </>
  );
}