"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, MapPin, Calendar, Clock, X, Download } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservationData: {
    id: string;
    storeName: string;
    storeAddress: string;
    totalAmount: number;
    totalItems: number;
  } | null;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  reservationData,
}: ConfirmationModalProps) {
  if (!isOpen || !reservationData) return null;

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

        {/* Modal Content */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-md z-10 overflow-hidden border border-slate-100 text-center relative p-6"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Success Badge */}
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <h3 className="text-xl font-bold text-slate-800">
            Reservation Confirmed!
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Show this QR code at the pickup counter for quick collection.
          </p>

          {/* QR Code Card */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 my-5 flex flex-col items-center justify-center shadow-inner">
            <div className="bg-white p-3 rounded-xl shadow-xs border border-slate-100">
              <QRCodeSVG
                value={reservationData.id}
                size={140}
                bgColor="#ffffff"
                fgColor="#0f172a"
                level="H"
              />
            </div>
            <span className="mt-3 font-mono text-xs font-bold text-slate-700 tracking-wider bg-slate-200/60 px-3 py-1 rounded-md">
              {reservationData.id}
            </span>
          </div>

          {/* Details Summary */}
          <div className="space-y-2.5 text-left bg-slate-50/60 p-4 rounded-xl border border-slate-100 text-xs text-slate-600 mb-6">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-800">
                  {reservationData.storeName}
                </p>
                <p className="text-[11px] text-slate-500">
                  {reservationData.storeAddress}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200/60 pt-2.5 mt-2">
              <span className="text-slate-500">Items Reserved:</span>
              <span className="font-semibold text-slate-800">
                {reservationData.totalItems} items
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Pay at Counter:</span>
              <span className="font-bold text-emerald-600 text-sm">
                ₹{reservationData.totalAmount}
              </span>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={onClose}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 rounded-xl transition active:scale-95 cursor-pointer text-sm shadow-md"
          >
            Done & Back to Shopping
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}