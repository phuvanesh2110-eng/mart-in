"use client";

import { motion } from "framer-motion";
import { Sparkles, Zap, ShieldCheck } from "lucide-react";

export default function Membership() {
  return (
    <section id="membership" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.3 }}
          className="bg-Gradient-to-br from-slate-900 via-emerald-950 to-slate-900 rounded-3xl p-8 md:p-12 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8"
        >
          {/* Subtle Glow Effect */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-xl z-10">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold px-3 py-1 rounded-full mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Mart-In Plus Membership</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Unlock Priority Pickups & Instant Extra Discounts
            </h2>
            <p className="mt-3 text-slate-300 text-sm sm:text-base">
              Get express packing in under 5 minutes, zero reservation fees, and exclusive member-only pricing across all local outlets.
            </p>

            <div className="mt-6 flex flex-wrap gap-4 text-xs font-medium text-emerald-300">
              <span className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-emerald-400" /> Express 5-Min Packing
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Priority Locker Access
              </span>
            </div>
          </div>

          <div className="z-10 w-full md:w-auto text-center md:text-right">
            <button className="w-full md:w-auto bg-emerald-500 text-slate-950 font-bold px-8 py-4 rounded-2xl hover:bg-emerald-400 active:scale-95 transition-all shadow-lg shadow-emerald-500/20">
              Join Plus @ ₹99/mo
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}