"use client";

import React from "react";
import { ReservationPass } from "@/context/AuthContext";
import { QRCodeSVG } from "qrcode.react";
import { X, Printer } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface EBillModalProps {
  pass: ReservationPass | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function EBillModal({ pass, isOpen, onClose }: EBillModalProps) {
  if (!isOpen || !pass) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs print:hidden"
        />

        {/* E-Bill Receipt Card */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative border border-slate-200 max-h-[90vh] overflow-y-auto z-10 print:shadow-none print:border-none print:max-h-none print:p-0"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition cursor-pointer print:hidden"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Receipt Header */}
          <div className="text-center pb-4 border-b border-dashed border-slate-300 space-y-1">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-black text-lg mx-auto shadow-sm">
              M
            </div>
            <h2 className="font-extrabold text-xl text-slate-900 tracking-tight">
              Mart-<span className="text-emerald-600">In</span> Supermarket
            </h2>
            <p className="text-[11px] text-slate-400 font-medium">Digital Tax Invoice / Pickup Voucher</p>
          </div>

          {/* Metadata Section */}
          <div className="py-4 border-b border-dashed border-slate-300 text-xs space-y-2 text-slate-600">
            <div className="flex justify-between">
              <span className="font-semibold text-slate-400">Invoice ID:</span>
              <span className="font-mono font-bold text-slate-900">{pass.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-slate-400">Customer:</span>
              <span className="font-semibold text-slate-800">{pass.userName}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-slate-400">Pickup Branch:</span>
              <span className="font-medium text-slate-800 text-right truncate max-w-48">
                {pass.store}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-slate-400">Time Window:</span>
              <span className="font-medium text-emerald-700">{pass.slot}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-slate-400">Time Created:</span>
              <span className="font-medium text-slate-700">{pass.createdAt}</span>
            </div>
          </div>

          {/* Itemized Bill Table */}
          <div className="py-4 border-b border-dashed border-slate-300 space-y-3">
            <div className="flex justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <span>Item Description</span>
              <span>Qty x Price</span>
              <span>Amount</span>
            </div>

            <div className="space-y-2 text-xs">
              {pass.items && pass.items.length > 0 ? (
                pass.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-slate-800">
                    <div className="flex-1 pr-2 truncate">
                      <p className="font-semibold truncate">{item.name}</p>
                      {item.unit && <p className="text-[10px] text-slate-400">{item.unit}</p>}
                    </div>
                    <span className="text-slate-500 text-[11px] w-16 text-center">
                      {item.quantity} x ₹{item.price}
                    </span>
                    <span className="font-bold text-slate-900 text-right w-12">
                      ₹{item.quantity * item.price}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-center italic py-2">No itemized details</p>
              )}
            </div>
          </div>

          {/* Price Totals */}
          <div className="py-4 border-b border-dashed border-slate-300 text-xs space-y-1.5">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span>₹{pass.total}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>GST & Taxes (Included)</span>
              <span>₹0.00</span>
            </div>
            <div className="flex justify-between text-slate-900 font-extrabold text-base pt-2">
              <span>Total Payable at Counter</span>
              <span className="text-emerald-600">₹{pass.total}</span>
            </div>
          </div>

          {/* QR Code */}
          <div className="pt-5 text-center space-y-2">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 inline-block">
              <QRCodeSVG
                value={`MART-IN E-BILL\nInvoice: ${pass.id}\nCustomer: ${pass.userName}\nTotal: ₹${pass.total}\nBranch: ${pass.store}`}
                size={120}
                level="H"
              />
            </div>
            <p className="text-[10px] text-slate-400 font-medium">
              Scan at counter to verify reservation and mark payment
            </p>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex gap-3 print:hidden">
            <button
              onClick={handlePrint}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl transition flex items-center justify-center gap-2 text-xs cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition text-xs cursor-pointer"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}