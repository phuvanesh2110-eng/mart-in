"use client";

import React from "react";
import { Tag, Zap, Percent, Gift, Check, X } from "lucide-react";
import { useCart } from "../../context/CartContext";

interface OffersProps {
  activeOfferFilter?: string | null;
  onSelectOfferFilter?: (offerKey: string | null) => void;
}

export default function Offers({ activeOfferFilter, onSelectOfferFilter }: OffersProps) {
  const { promoDiscountPct, appliedOfferTitle, applyPromoOffer, removePromoOffer } = useCart();

  const handle10PercentClick = () => {
    if (appliedOfferTitle === "10% OFF Special Deal") {
      removePromoOffer();
    } else {
      applyPromoOffer(10, "10% OFF Special Deal");
    }
  };

  const handleOfferCardClick = (offerKey: string) => {
    if (offerKey === "10-percent") {
      handle10PercentClick();
    } else {
      if (activeOfferFilter === offerKey) {
        if (typeof onSelectOfferFilter === "function") onSelectOfferFilter(null);
      } else {
        if (typeof onSelectOfferFilter === "function") onSelectOfferFilter(offerKey);
        // Scroll to catalog section to show filtered products
        document.getElementById("catalog-section")?.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <section id="offers" className="py-10 bg-zinc-950 border-t border-b border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
              <h2 className="text-2xl font-black text-white tracking-tight">
                Active Store Offers
              </h2>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Click any offer below to apply instant discounts or filter active deal items.
            </p>
          </div>

          {/* Clear Active Filters / Promos */}
          {(appliedOfferTitle || activeOfferFilter) && (
            <button
              onClick={() => {
                removePromoOffer();
                if (typeof onSelectOfferFilter === "function") onSelectOfferFilter(null);
              }}
              className="flex items-center gap-1.5 text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-xl hover:bg-rose-500/20 transition-all self-start sm:self-auto cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              Reset Active Offers
            </button>
          )}
        </div>

        {/* 3 Interactive Offer Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Offer Card 1: 10% OFF */}
          <div
            onClick={() => handleOfferCardClick("10-percent")}
            className={`relative p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
              appliedOfferTitle === "10% OFF Special Deal"
                ? "bg-gradient-to-r from-emerald-600 to-emerald-500 border-emerald-400 text-zinc-950 shadow-lg shadow-emerald-500/20 scale-[1.02]"
                : "bg-zinc-900/80 border-zinc-800 hover:border-emerald-500/60 text-white"
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div
                className={`p-3 rounded-xl ${
                  appliedOfferTitle === "10% OFF Special Deal"
                    ? "bg-zinc-950/20 text-zinc-950"
                    : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                }`}
              >
                <Percent className="w-6 h-6" />
              </div>
              <div>
                <span
                  className={`text-[10px] uppercase font-black tracking-wider ${
                    appliedOfferTitle === "10% OFF Special Deal" ? "text-zinc-950/80" : "text-emerald-400"
                  }`}
                >
                  Cart Promo Discount
                </span>
                <h3 className="text-lg font-black leading-tight">10% OFF Storewide</h3>
                <p
                  className={`text-xs mt-0.5 font-medium ${
                    appliedOfferTitle === "10% OFF Special Deal" ? "text-zinc-950/80" : "text-zinc-400"
                  }`}
                >
                  {appliedOfferTitle === "10% OFF Special Deal" ? "✓ 10% Discount Applied to Cart!" : "Click to apply 10% off cart total"}
                </p>
              </div>
            </div>
            {appliedOfferTitle === "10% OFF Special Deal" && (
              <span className="bg-zinc-950 text-emerald-400 p-1.5 rounded-full">
                <Check className="w-4 h-4 stroke-[3]" />
              </span>
            )}
          </div>

          {/* Offer Card 2: Buy 1 Get 1 */}
          <div
            onClick={() => handleOfferCardClick("bogo")}
            className={`relative p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
              activeOfferFilter === "bogo"
                ? "bg-gradient-to-r from-amber-500 to-amber-400 border-amber-300 text-zinc-950 shadow-lg shadow-amber-500/20 scale-[1.02]"
                : "bg-zinc-900/80 border-zinc-800 hover:border-amber-500/60 text-white"
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div
                className={`p-3 rounded-xl ${
                  activeOfferFilter === "bogo"
                    ? "bg-zinc-950/20 text-zinc-950"
                    : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                }`}
              >
                <Gift className="w-6 h-6" />
              </div>
              <div>
                <span
                  className={`text-[10px] uppercase font-black tracking-wider ${
                    activeOfferFilter === "bogo" ? "text-zinc-950/80" : "text-amber-400"
                  }`}
                >
                  Filter Catalog
                </span>
                <h3 className="text-lg font-black leading-tight">Buy 1 Get 1 Free</h3>
                <p
                  className={`text-xs mt-0.5 font-medium ${
                    activeOfferFilter === "bogo" ? "text-zinc-950/80" : "text-zinc-400"
                  }`}
                >
                  {activeOfferFilter === "bogo" ? "✓ Filtering BOGO Supermarket Items" : "Click to view BOGO deal products"}
                </p>
              </div>
            </div>
            {activeOfferFilter === "bogo" && (
              <span className="bg-zinc-950 text-amber-400 p-1.5 rounded-full">
                <Check className="w-4 h-4 stroke-[3]" />
              </span>
            )}
          </div>

          {/* Offer Card 3: Weekend Sale */}
          <div
            onClick={() => handleOfferCardClick("weekend-sale")}
            className={`relative p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
              activeOfferFilter === "weekend-sale"
                ? "bg-gradient-to-r from-rose-600 to-rose-500 border-rose-400 text-white shadow-lg shadow-rose-500/20 scale-[1.02]"
                : "bg-zinc-900/80 border-zinc-800 hover:border-rose-500/60 text-white"
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div
                className={`p-3 rounded-xl ${
                  activeOfferFilter === "weekend-sale"
                    ? "bg-white/20 text-white"
                    : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                }`}
              >
                <Tag className="w-6 h-6" />
              </div>
              <div>
                <span
                  className={`text-[10px] uppercase font-black tracking-wider ${
                    activeOfferFilter === "weekend-sale" ? "text-white/80" : "text-rose-400"
                  }`}
                >
                  Lightning Deals
                </span>
                <h3 className="text-lg font-black leading-tight">Weekend Sale</h3>
                <p
                  className={`text-xs mt-0.5 font-medium ${
                    activeOfferFilter === "weekend-sale" ? "text-white/90" : "text-zinc-400"
                  }`}
                >
                  {activeOfferFilter === "weekend-sale" ? "✓ Showing Active Sale & ₹5 Items" : "Click to view active weekend discounts"}
                </p>
              </div>
            </div>
            {activeOfferFilter === "weekend-sale" && (
              <span className="bg-white text-rose-600 p-1.5 rounded-full">
                <Check className="w-4 h-4 stroke-[3]" />
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}