"use client";

import React, { useState, useEffect } from "react";
import { fetcher } from "../../services/api";
import { ShoppingBag, Truck, Store, X, Clock, CheckCircle } from "lucide-react";

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
}

export default function OrderHistoryModal({
  isOpen,
  onClose,
  userEmail,
}: OrderHistoryModalProps) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && userEmail) {
      setLoading(true);
      fetcher<any[]>(`/orders/my-orders?email=${encodeURIComponent(userEmail)}`)
        .then((data) => {
          if (Array.isArray(data)) setOrders(data);
        })
        .catch((err) => {
          console.log("Customer orders fetch error/offline fallback:", err);
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, userEmail]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-lg font-black text-white">My Order History</h3>
              <p className="text-xs text-zinc-400">Past purchases for {userEmail}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-5 space-y-4">
          {loading ? (
            <div className="text-center py-12 text-zinc-400 text-xs font-semibold">
              Loading your past orders...
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 space-y-2">
              <p className="text-3xl">📦</p>
              <p className="text-sm font-bold text-zinc-300">No past orders found</p>
              <p className="text-xs">Your completed store pickup & delivery orders will appear here!</p>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order._id || order.orderId}
                className="bg-zinc-800/60 border border-zinc-700/60 rounded-xl p-4 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-700/50 pb-2.5">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-emerald-400">
                        {order.orderId}
                      </span>
                      <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        {order.status || "Confirmed"}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-zinc-500" />
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-sm font-black text-white">₹{order.total}</span>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-400 mt-0.5 justify-start sm:justify-end">
                      {order.deliveryType === "Delivery" ? (
                        <>
                          <Truck className="w-3 h-3 text-emerald-400" />
                          Home Delivery
                        </>
                      ) : (
                        <>
                          <Store className="w-3 h-3 text-emerald-400" />
                          Store Pickup
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Items Purchased List */}
                <div className="space-y-1.5 pt-1">
                  {Array.isArray(order.items) &&
                    order.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between text-xs text-zinc-300">
                        <span className="line-clamp-1 font-medium">
                          {item.quantity}x {item.name || item.title}
                          {item.isBogo && (
                            <span className="ml-1 text-[9px] bg-amber-500/20 text-amber-400 px-1 py-0.2 rounded font-black">
                              BOGO 1+1 FREE
                            </span>
                          )}
                        </span>
                        <span className="font-mono text-zinc-400 font-bold">
                          ₹{(item.price || 0) * (item.quantity || 1)}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

