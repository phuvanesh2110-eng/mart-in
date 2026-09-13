"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Check, Clock } from "lucide-react";

interface Store {
  id: string;
  name: string;
  address: string;
  distance: string;
  timing: string;
}

const stores: Store[] = [
  {
    id: "1",
    name: "Mart-In Central Express",
    address: "Block B, Main Road, City Center",
    distance: "0.8 km away",
    timing: "Open until 10:00 PM",
  },
  {
    id: "2",
    name: "Mart-In Superstore",
    address: "4th Cross Street, Tech Park Zone",
    distance: "2.1 km away",
    timing: "Open until 11:30 PM",
  },
  {
    id: "3",
    name: "Mart-In Daily Outlet",
    address: "Near Metro Station, West Hub",
    distance: "3.5 km away",
    timing: "Open 24/7",
  },
];

interface StoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (store: Store) => void;
}

export default function StoreModal({ isOpen, onClose, onConfirm }: StoreModalProps) {
  const [selectedStore, setSelectedStore] = useState<Store>(stores[0]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900 backdrop-blur-xs"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-lg z-10 overflow-hidden border border-slate-100"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 className="font-bold text-lg text-slate-800">
                Select Pickup Store
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Choose your nearest supermarket for instant pickup
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-200/60 rounded-full text-slate-500 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Store List */}
          <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
            {stores.map((store) => {
              const isSelected = selectedStore.id === store.id;
              return (
                <div
                  key={store.id}
                  onClick={() => setSelectedStore(store)}
                  className={`p-4 rounded-2xl border-2 transition cursor-pointer flex items-start justify-between gap-3 ${
                    isSelected
                      ? "border-emerald-600 bg-emerald-50/30"
                      : "border-slate-100 bg-slate-50/50 hover:border-slate-200"
                  }`}
                >
                  <div className="flex gap-3">
                    <div
                      className={`p-2.5 rounded-xl h-fit ${
                        isSelected
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-200/70 text-slate-600"
                      }`}
                    >
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800 text-sm">
                        {store.name}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        {store.address}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-[11px] font-medium text-slate-600">
                        <span className="text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                          {store.distance}
                        </span>
                        <span className="flex items-center gap-1 text-slate-500">
                          <Clock className="w-3 h-3" />
                          {store.timing}
                        </span>
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="bg-emerald-600 text-white p-1 rounded-full">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action Footer */}
          <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm(selectedStore)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition shadow-md shadow-emerald-600/20 active:scale-95 cursor-pointer"
            >
              Confirm Reservation
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}