"use client";

import React from "react";
import { ArrowRight, Grid } from "lucide-react";

interface HeroProps {
  onStartReserving?: () => void;
  onExploreCategories?: () => void;
}

export default function Hero({ onStartReserving, onExploreCategories }: HeroProps) {
  return (
    <section className="text-center py-16 px-4 max-w-4xl mx-auto">
      <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
        Reserve Online. <br />
        <span className="text-emerald-400">Pick Up Instantly.</span>
      </h1>
      <p className="text-zinc-400 text-sm md:text-base max-w-xl mx-auto mb-8">
        Select your daily essentials online and collect them ready-packed from your nearest local supermarket in minutes.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-4">
        {/* Start Reserving: Shows all products */}
        <button
          onClick={onStartReserving}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold px-6 py-3 rounded-full text-sm transition-all shadow-lg hover:shadow-emerald-500/20"
        >
          <span>Start Reserving</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* Explore Categories: Directs to Category Filters */}
        <button
          onClick={onExploreCategories}
          className="flex items-center gap-2 bg-zinc-800/80 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 font-medium px-6 py-3 rounded-full text-sm transition-all"
        >
          <Grid className="w-4 h-4" />
          <span>Explore Categories</span>
        </button>
      </div>
    </section>
  );
}