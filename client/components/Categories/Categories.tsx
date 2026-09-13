"use client";

import { CATEGORIES } from "../../data/products";
import { Grid } from "lucide-react";

interface CategoriesProps {
  selectedCategory?: string;
  onSelectCategory?: (category: string) => void;
  onOpenCart?: () => void;
}

export default function Categories({
  selectedCategory: externalCategory = "All",
  onSelectCategory,
}: CategoriesProps) {
  const handleCategoryClick = (cat: string) => {
    if (typeof onSelectCategory === "function") {
      onSelectCategory(cat);
    }
  };

  return (
    <section className="pt-8 pb-4 max-w-7xl mx-auto px-4 sm:px-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Grid className="w-5 h-5 text-emerald-400" />
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Explore Categories
          </h3>
        </div>
        <span className="text-xs text-zinc-400 font-semibold">
          Select a category to filter
        </span>
      </div>

      {/* Category Pills Navigation */}
      <div className="flex gap-2.5 overflow-x-auto scrollbar-none pb-2">
        {CATEGORIES.map((cat) => {
          const isActive = externalCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => handleCategoryClick(cat)}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition cursor-pointer whitespace-nowrap border ${
                isActive
                  ? "bg-emerald-500 text-zinc-950 border-emerald-400 shadow-md shadow-emerald-500/20 scale-[1.02]"
                  : "bg-zinc-900/80 text-zinc-300 border-zinc-800 hover:bg-zinc-800 hover:text-white hover:border-zinc-700"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </section>
  );
}