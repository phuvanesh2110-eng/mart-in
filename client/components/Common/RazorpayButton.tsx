"use client";

import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";

interface RazorpayButtonProps {
  amount: number;
  onSuccess?: (payload?: any) => void;
}

const createUpiLink = (amount: number, orderId: string) => {
  const total = Number((amount / 100 || amount || 0).toFixed(2));
  return `upi://pay?pa=martin@upi&pn=Mart-In&am=${total}&cu=INR&tn=${encodeURIComponent(`Mart-In Order ${orderId}`)}`;
};

export default function RazorpayButton({ amount, onSuccess }: RazorpayButtonProps) {
  const [fallbackPayment, setFallbackPayment] = useState<null | {
    upiLink: string;
    orderId: string;
    amount: number;
  }>(null);

  const handlePayment = async () => {
    try {
      const res = await fetch("/api/razorpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to create Razorpay order");
        return;
      }

      const orderAmount = Number(data.amount || Math.round(amount * 100));
      const orderId = data.orderId || `mock_order_${Date.now()}`;
      const fallbackLink = createUpiLink(orderAmount, orderId);

      if (data.mock === true || data.mode === "mock") {
        setFallbackPayment({ upiLink: fallbackLink, orderId, amount: orderAmount });
        if (onSuccess) onSuccess({ ...data, upiLink: fallbackLink, mock: true });
        return;
      }

      if (!(window as any).Razorpay) {
        setFallbackPayment({ upiLink: fallbackLink, orderId, amount: orderAmount });
        if (onSuccess) onSuccess({ ...data, upiLink: fallbackLink, mock: true });
        return;
      }

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "Mart-In",
        description: "Store Pickup Payment",
        order_id: data.orderId,
        handler: function (response: any) {
          if (onSuccess) onSuccess(response);
          alert(`Payment Successful! Payment ID: ${response.razorpay_payment_id}`);
        },
        prefill: {
          name: "Customer",
          email: "customer@example.com",
          contact: "9999999999",
        },
        theme: {
          color: "#10b981",
        },
      };

      try {
        const paymentObject = new (window as any).Razorpay(options);
        paymentObject.open();
      } catch (error) {
        console.error("Razorpay modal failed:", error);
        setFallbackPayment({ upiLink: fallbackLink, orderId, amount: orderAmount });
        if (onSuccess) onSuccess({ ...data, upiLink: fallbackLink, mock: true });
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong with the payment execution.");
    }
  };

  return (
    <>
      <button
        onClick={handlePayment}
        className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl transition-all"
      >
        Pay ₹{amount} Online (UPI / Card)
      </button>

      {fallbackPayment && (
        <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 text-white shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-400">Test Mode</p>
                <h3 className="text-xl font-bold text-white">Complete your UPI payment</h3>
              </div>
              <button
                type="button"
                onClick={() => setFallbackPayment(null)}
                className="text-slate-400 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>

            <div className="flex justify-center rounded-2xl bg-white p-4">
              <QRCodeSVG value={fallbackPayment.upiLink} size={180} includeMargin />
            </div>

            <div className="mt-4 space-y-2 rounded-xl border border-slate-800 bg-slate-800/60 p-3 text-sm text-slate-300">
              <p>
                <span className="font-semibold text-white">Order:</span> {fallbackPayment.orderId}
              </p>
              <p>
                <span className="font-semibold text-white">Amount:</span> ₹{(fallbackPayment.amount / 100 || fallbackPayment.amount).toFixed(2)}
              </p>
              <p className="break-all text-xs text-slate-400">{fallbackPayment.upiLink}</p>
            </div>

            <div className="mt-4 flex gap-3">
              <a
                href={fallbackPayment.upiLink}
                className="flex-1 rounded-xl bg-emerald-500 px-4 py-3 text-center text-sm font-bold text-slate-950"
              >
                Open UPI App
              </a>
              <button
                type="button"
                onClick={() => setFallbackPayment(null)}
                className="flex-1 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-semibold text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}