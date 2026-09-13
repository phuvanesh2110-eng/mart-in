"use client";

import React, { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { fetcher } from "../../services/api";

interface Pass {
  _id?: string;
  id?: string;
  title?: string;
  storeName?: string;
  status?: string;
  itemsCount?: number;
  total?: number;
  timeSlot?: string;
  qrCode?: string;
  orderId?: string;
  createdAt?: string;
}

interface PassesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const normalizePass = (pass: Pass) => {
  const orderId = pass.orderId || pass._id || pass.id || `pass_${Date.now()}`;
  const qrValue =
    pass.qrCode ||
    `upi://pay?pa=martin@upi&pn=Mart-In&am=${Number(pass.total || 0).toFixed(2)}&cu=INR&tn=${encodeURIComponent(`Mart-In ${orderId}`)}`;

  return {
    ...pass,
    orderId,
    title: pass.title || "Pickup Pass",
    storeName: pass.storeName || "Mart-In Store",
    status: pass.status || "Confirmed",
    itemsCount: pass.itemsCount || 1,
    total: Number(pass.total || 0),
    qrCode: qrValue,
  };
};

export default function PassesDrawer({ isOpen, onClose }: PassesDrawerProps) {
  const [passes, setPasses] = useState<Pass[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    fetcher<Pass[]>("/passes")
      .then((data) => {
        const normalized = Array.isArray(data) ? data.map(normalizePass) : [];
        setPasses(normalized);
      })
      .catch((err) => {
        console.error(err);
        setPasses([]);
      })
      .finally(() => setLoading(false));
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 h-full p-6 shadow-xl flex flex-col justify-between overflow-y-auto">
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Active Pickup Passes
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-lg"
            >
              ✕
            </button>
          </div>

          <div className="mt-6 space-y-4">
            {loading ? (
              <p className="text-center text-slate-500 py-8">Loading passes from server...</p>
            ) : passes.length === 0 ? (
              <p className="text-center text-slate-500 py-8">No active passes found in MongoDB.</p>
            ) : (
              passes.map((pass) => {
                const normalizedPass = normalizePass(pass);
                return (
                  <div
                    key={normalizedPass.orderId}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-col gap-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {normalizedPass.title}
                      </span>
                      <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                        {normalizedPass.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 text-sm text-slate-600 dark:text-slate-400">
                        <p>
                          Store: <span className="font-medium text-slate-800 dark:text-slate-200">{normalizedPass.storeName}</span>
                        </p>
                        <p className="mt-1">
                          Slot: <span className="font-medium text-slate-800 dark:text-slate-200">{normalizedPass.timeSlot || "Any time"}</span>
                        </p>
                        <p className="mt-1">
                          Total: <span className="font-medium text-slate-800 dark:text-slate-200">₹{Number(normalizedPass.total || 0).toFixed(2)}</span>
                        </p>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-900">
                        <QRCodeSVG value={normalizedPass.qrCode} size={90} includeMargin />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                      <span>Items: {normalizedPass.itemsCount}</span>
                      <span>ID: {String(normalizedPass.orderId).slice(-6)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold rounded-xl hover:opacity-90 transition-opacity"
        >
          Close Drawer
        </button>
      </div>
    </div>
  );
}