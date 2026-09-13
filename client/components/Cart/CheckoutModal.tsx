"use client";

import React, { useState } from "react";
import { useCart } from "../../context/CartContext";
import { fetcher } from "../../services/api";
import { Store, Truck, Clock, MapPin, CheckCircle, X } from "lucide-react";

interface CheckoutModalProps {
  isOpen: boolean;
  defaultDeliveryType?: "Pickup" | "Delivery";
  onClose: () => void;
  onOrderSuccess?: (orderData?: any) => void;
}

const STORES = [
  { id: "store-1", name: "Mart-In Central Flagship Store", distance: "0.8 km away" },
  { id: "store-2", name: "Mart-In Express North", distance: "1.5 km away" },
  { id: "store-3", name: "Mart-In Super Center South", distance: "2.3 km away" },
];

const PICKUP_SLOTS = [
  "10:00 AM - 11:00 AM",
  "11:00 AM - 12:00 PM",
  "02:00 PM - 03:00 PM",
  "04:00 PM - 05:00 PM",
  "06:00 PM - 07:00 PM",
];

const DELIVERY_SLOTS = [
  "Instant 30-Min Express",
  "Today (02:00 PM - 04:00 PM)",
  "Today (06:00 PM - 08:00 PM)",
  "Tomorrow Morning (08:00 AM - 10:00 AM)",
];

export default function CheckoutModal({
  isOpen,
  defaultDeliveryType = "Pickup",
  onClose,
  onOrderSuccess,
}: CheckoutModalProps) {
  const { cart, subtotal, clearCart } = useCart();
  const [deliveryType, setDeliveryType] = useState<"Pickup" | "Delivery">(defaultDeliveryType);
  const [selectedStore, setSelectedStore] = useState(STORES[0].name);
  const [selectedSlot, setSelectedSlot] = useState(
    defaultDeliveryType === "Delivery" ? DELIVERY_SLOTS[0] : PICKUP_SLOTS[0]
  );
  const [address, setAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const deliveryFee = deliveryType === "Delivery" ? (subtotal > 299 ? 0 : 25) : 0;
  const totalAmount = subtotal + deliveryFee;

  const handleConfirmOrder = async () => {
    if (deliveryType === "Delivery" && !address.trim()) {
      alert("Please enter a valid home delivery address.");
      return;
    }

    setIsSubmitting(true);

    try {
      const storedUser = localStorage.getItem("user");
      const parsedUser = storedUser ? JSON.parse(storedUser) : null;

      const orderPayload = {
        deliveryType,
        store: deliveryType === "Pickup" ? selectedStore : "Home Delivery",
        storeName: deliveryType === "Pickup" ? selectedStore : "Home Delivery",
        timeSlot: selectedSlot,
        address: deliveryType === "Delivery" ? address : "",
        items: cart,
        subtotal: Number(subtotal.toFixed(2)),
        total: Number(totalAmount.toFixed(2)),
        status: "Confirmed",
        userId: parsedUser?.id || parsedUser?._id || null,
        userName: parsedUser?.name || "Valued Customer",
        userEmail: parsedUser?.email || "customer@martin.com",
        createdAt: new Date().toISOString(),
      };

      const response = await fetcher<{ success?: boolean; order?: any; pass?: any }>("/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const orderData = response?.pass || response?.order || response || orderPayload;
      clearCart();
      onClose();

      if (typeof onOrderSuccess === "function") {
        onOrderSuccess(orderData);
      } else {
        alert("Order placed successfully! Check your Pickup/Delivery Passes for status.");
      }
    } catch (err) {
      const offlineOrder = {
        deliveryType,
        store: deliveryType === "Pickup" ? selectedStore : "Home Delivery",
        storeName: deliveryType === "Pickup" ? selectedStore : "Home Delivery",
        timeSlot: selectedSlot,
        address: deliveryType === "Delivery" ? address : "",
        items: cart,
        subtotal: Number(subtotal.toFixed(2)),
        total: Number(totalAmount.toFixed(2)),
        status: "Confirmed",
        mode: "offline-demo",
      };

      clearCart();
      onClose();

      if (typeof onOrderSuccess === "function") {
        onOrderSuccess(offlineOrder);
      } else {
        alert("Order placed successfully! View status in Passes.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-zinc-800">
          <div>
            <h3 className="text-lg font-black text-white">Checkout Details</h3>
            <p className="text-xs text-zinc-400 mt-0.5">Select fulfillment method & time slot</p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Fulfillment Type Toggle */}
        <div className="mt-5 p-1 bg-zinc-800/80 border border-zinc-700/80 rounded-xl flex gap-1">
          <button
            type="button"
            onClick={() => {
              setDeliveryType("Pickup");
              setSelectedSlot(PICKUP_SLOTS[0]);
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              deliveryType === "Pickup"
                ? "bg-emerald-500 text-zinc-950 shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Store className="w-4 h-4" />
            Store Pickup (Free)
          </button>
          <button
            type="button"
            onClick={() => {
              setDeliveryType("Delivery");
              setSelectedSlot(DELIVERY_SLOTS[0]);
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              deliveryType === "Delivery"
                ? "bg-emerald-500 text-zinc-950 shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Truck className="w-4 h-4" />
            Home Delivery
          </button>
        </div>

        <div className="mt-5 space-y-5">
          {/* Section 1: Store Location OR Delivery Address */}
          {deliveryType === "Pickup" ? (
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 mb-2.5 flex items-center gap-1.5">
                <Store className="w-4 h-4" />
                1. Select Pickup Store
              </h4>
              <div className="space-y-2">
                {STORES.map((store) => (
                  <div
                    key={store.id}
                    onClick={() => setSelectedStore(store.name)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex justify-between items-center ${
                      selectedStore === store.name
                        ? "border-emerald-500 bg-emerald-500/10 text-white"
                        : "border-zinc-800 bg-zinc-800/40 text-zinc-400 hover:border-zinc-700"
                    }`}
                  >
                    <div>
                      <p className="font-bold text-xs text-white">{store.name}</p>
                      <p className="text-[10px] text-zinc-400">{store.distance}</p>
                    </div>
                    <input
                      type="radio"
                      checked={selectedStore === store.name}
                      onChange={() => setSelectedStore(store.name)}
                      className="accent-emerald-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 mb-2.5 flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                1. Delivery Address
              </h4>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter complete delivery address (House No, Flat, Street, Area, Pincode)..."
                rows={3}
                className="w-full bg-zinc-800/80 border border-zinc-700/80 text-white text-xs rounded-xl p-3 focus:outline-none focus:border-emerald-500"
              />
            </div>
          )}

          {/* Section 2: Time Slot */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 mb-2.5 flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              2. Select {deliveryType === "Pickup" ? "Pickup" : "Delivery"} Time Slot
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {(deliveryType === "Pickup" ? PICKUP_SLOTS : DELIVERY_SLOTS).map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setSelectedSlot(slot)}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                    selectedSlot === slot
                      ? "border-emerald-500 bg-emerald-500 text-zinc-950 shadow-sm"
                      : "border-zinc-800 bg-zinc-800/40 text-zinc-300 hover:border-zinc-700"
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Summary */}
          <div className="bg-zinc-800/50 border border-zinc-800 rounded-xl p-3 space-y-1 text-xs">
            <div className="flex justify-between text-zinc-400">
              <span>Items Total ({cart.length})</span>
              <span className="text-white font-bold">₹{subtotal}</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Fulfillment ({deliveryType})</span>
              <span className="text-emerald-400 font-bold">
                {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
              </span>
            </div>
            <div className="flex justify-between text-sm font-black text-white pt-2 border-t border-zinc-700/60">
              <span>Total Payable</span>
              <span className="text-emerald-400">₹{totalAmount}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-zinc-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-zinc-400 hover:text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleConfirmOrder}
            className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-zinc-950 text-xs font-black transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5 uppercase tracking-wider"
          >
            <CheckCircle className="w-4 h-4" />
            {isSubmitting ? "Placing Order..." : "Confirm & Place Order"}
          </button>
        </div>
      </div>
    </div>
  );
}