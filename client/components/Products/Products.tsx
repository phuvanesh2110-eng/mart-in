"use client";

import React, { useState, useEffect } from "react";
import { useCart } from "../../context/CartContext";
import { fetcher } from "../../services/api";
import { PRODUCTS as FALLBACK_PRODUCTS, CATEGORIES } from "../../data/products";
import { Star, Clock, Zap, Plus, Minus, ShoppingCart, X, Gift, Tag } from "lucide-react";

interface Product {
  id: string;
  _id?: string;
  title?: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  originalPrice?: number;
  unit: string;
  image: string;
  inStock?: boolean;
  stockQuantity?: number;
  rating?: number;
  isOnOffer?: boolean;
  isBogo?: boolean;
  discountPercentage?: number;
  offerEndsAt?: string | Date;
}

interface ProductsProps {
  externalCategory?: string;
  searchQuery?: string;
  activeOfferFilter?: string | null;
  onClearOfferFilter?: () => void;
}

export default function Products({
  externalCategory = "All",
  searchQuery = "",
  activeOfferFilter = null,
  onClearOfferFilter,
}: ProductsProps) {
  const { cart, addToCart, updateQuantity } = useCart();
  const [products, setProducts] = useState<Product[]>(FALLBACK_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState<string>(externalCategory);
  const [loading, setLoading] = useState<boolean>(true);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setSelectedCategory(externalCategory);
  }, [externalCategory]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const queryParams = new URLSearchParams();
    if (selectedCategory && selectedCategory !== "All") {
      queryParams.append("category", selectedCategory);
    }
    if (searchQuery && searchQuery.trim() !== "") {
      queryParams.append("search", searchQuery.trim());
    }

    const endpoint = `/products${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

    fetcher<Product[]>(endpoint)
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          const formatted = data.map((item: any) => ({
            ...item,
            id: item._id || item.id,
            name: item.title || item.name,
          }));
          setProducts(formatted);
        }
      })
      .catch((err) => {
        console.log("Using static products fallback:", err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedCategory, searchQuery]);

  const handleImageError = (id: string) => {
    setImageErrors((prev) => ({ ...prev, [id]: true }));
  };

  const getQuantityInCart = (productId: string) => {
    const item = cart.find((i) => i.id === productId || i._id === productId);
    return item ? item.quantity : 0;
  };

  // Filter products by search, category, AND offerFilter
  const displayedProducts = products.filter((p) => {
    const pName = (p.title || p.name || "").toLowerCase();
    const pCat = (p.category || "").toLowerCase();
    const q = searchQuery.toLowerCase();

    const matchesSearch = !q || pName.includes(q) || pCat.includes(q);
    const matchesCat = selectedCategory === "All" || p.category === selectedCategory;

    let matchesOffer = true;
    if (activeOfferFilter === "bogo") {
      // BOGO filter: show items with discount or special pack deals
      matchesOffer = Boolean(p.isOnOffer || (p.discountPercentage && p.discountPercentage > 15) || p.price <= 10);
    } else if (activeOfferFilter === "weekend-sale") {
      // Weekend sale filter: show items on offer, ₹5 deals, or discounted items
      matchesOffer = Boolean(p.isOnOffer || p.price <= 10 || (p.originalPrice && p.originalPrice > p.price));
    }

    return matchesSearch && matchesCat && matchesOffer;
  });

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      {/* Active Offer Filter Banner */}
      {activeOfferFilter && (
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-amber-500/10 to-rose-500/10 border border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {activeOfferFilter === "bogo" ? (
              <Gift className="w-5 h-5 text-amber-400" />
            ) : (
              <Tag className="w-5 h-5 text-rose-400" />
            )}
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-amber-400">
                Offer Filter Active
              </p>
              <h4 className="text-sm font-bold text-white">
                {activeOfferFilter === "bogo"
                  ? "Showing Buy 1 Get 1 & Special Pack Items"
                  : "Showing Weekend Sale & Discounted Items"}
              </h4>
            </div>
          </div>
          <button
            onClick={onClearOfferFilter}
            className="flex items-center gap-1 text-xs font-bold text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-xl border border-zinc-700 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            Clear Filter
          </button>
        </div>
      )}

      {/* Header & Category Filter Pills */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Supermarket Products
            </h2>
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-extrabold px-2.5 py-0.5 rounded-full">
              {displayedProducts.length} Items
            </span>
          </div>
          <p className="text-zinc-400 text-xs sm:text-sm mt-1">
            Pocket-friendly Indian groceries delivered home or available for instant store pickup.
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? "bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20 scale-105"
                    : "bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700 border border-zinc-700/60"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid Layout */}
      {displayedProducts.length === 0 ? (
        <div className="text-center py-16 bg-zinc-900/40 rounded-2xl border border-zinc-800">
          <p className="text-zinc-300 font-bold text-base">No products match your criteria</p>
          <p className="text-zinc-500 text-xs mt-1">Try clearing your search query, choosing another category, or resetting active offer filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {displayedProducts.map((product) => {
            const productId = product.id || product._id || "";
            const qty = getQuantityInCart(productId);
            const hasError = imageErrors[productId];
            const isOutOfStock = product.stockQuantity === 0 || product.inStock === false;

            // Offer Calculations
            const discountPct = product.discountPercentage || (
              product.originalPrice && product.originalPrice > product.price
                ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                : 0
            );

            return (
              <div
                key={productId}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 transition-all hover:border-zinc-700 hover:shadow-xl hover:shadow-emerald-500/5"
              >
                {/* Top Image Container with Badges */}
                <div>
                  <div className="relative h-44 w-full overflow-hidden rounded-xl bg-zinc-800 flex items-center justify-center">
                    {!hasError && product.image ? (
                      <img
                        src={product.image}
                        alt={product.name || product.title}
                        onError={() => handleImageError(productId)}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center p-4 text-center">
                        <span className="text-3xl mb-1">🛒</span>
                        <span className="text-xs text-zinc-400 font-semibold">{product.name || product.title}</span>
                      </div>
                    )}

                    {/* Discount, BOGO & Deal Badges */}
                    <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
                      {product.isBogo && (
                        <span className="bg-gradient-to-r from-amber-500 to-amber-400 text-zinc-950 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider shadow-md">
                          🎁 BOGO (1+1 FREE)
                        </span>
                      )}
                      {discountPct > 0 && (
                        <span className="flex items-center gap-1 bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider shadow-md">
                          <Zap className="w-3 h-3 fill-current" />
                          {discountPct}% OFF
                        </span>
                      )}
                      {product.price <= 10 && (
                        <span className="bg-amber-500 text-zinc-950 text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider shadow-md">
                          ₹{product.price} DEAL
                        </span>
                      )}
                    </div>

                    {/* Out of Stock Overlay */}
                    {isOutOfStock && (
                      <div className="absolute inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-20">
                        <span className="bg-rose-500/90 text-white font-extrabold text-xs px-3 py-1.5 rounded-lg tracking-wider uppercase shadow-lg">
                          Out of Stock
                        </span>
                      </div>
                    )}

                    {/* Urgent Countdown Badge */}
                    {product.isOnOffer && !isOutOfStock && (
                      <div className="absolute bottom-2 left-2 right-2 bg-black/80 backdrop-blur-md border border-amber-500/40 text-amber-400 text-[10px] font-bold px-2 py-1 rounded-lg flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-400 animate-pulse" />
                          Limited Offer
                        </span>
                        <span className="text-zinc-300 font-mono">Ends Soon!</span>
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                        {product.category}
                      </span>
                      {product.rating && (
                        <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{product.rating}</span>
                        </div>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-white mt-1.5 line-clamp-1 group-hover:text-emerald-400 transition-colors">
                      {product.title || product.name}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                      {product.description || "Fresh supermarket item sourced with guaranteed quality."}
                    </p>

                    {/* Pricing and Unit */}
                    <div className="mt-3 flex items-baseline justify-between pt-2 border-t border-zinc-800">
                      <div>
                        <span className="text-xs text-zinc-400 font-medium">{product.unit}</span>
                      </div>
                      <div className="text-right flex items-baseline gap-1.5">
                        <span className="text-lg font-black text-white">
                          ₹{product.price}
                        </span>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="text-xs text-zinc-500 line-through font-medium">
                            ₹{product.originalPrice}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dynamic Quantity Stepper Action Button */}
                <div className="mt-4">
                  {isOutOfStock ? (
                    <button
                      disabled
                      className="w-full rounded-xl bg-zinc-800/50 border border-zinc-800 py-2.5 text-xs font-bold text-zinc-500 cursor-not-allowed text-center"
                    >
                      Out of Stock
                    </button>
                  ) : qty > 0 ? (
                    <div className="flex items-center justify-between bg-emerald-500 text-zinc-950 rounded-xl p-1 font-bold shadow-md shadow-emerald-500/10">
                      <button
                        type="button"
                        onClick={() => updateQuantity(productId, -1)}
                        className="w-8 h-8 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition-colors active:scale-95"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-sm font-black px-2">{qty} in Cart</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(productId, 1)}
                        className="w-8 h-8 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition-colors active:scale-95"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => addToCart(product, 1)}
                      className="w-full rounded-xl bg-zinc-800 hover:bg-emerald-500 hover:text-zinc-950 py-2.5 text-xs font-bold text-white transition-all border border-zinc-700/80 hover:border-emerald-400 active:scale-98 flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      Add to Cart
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}