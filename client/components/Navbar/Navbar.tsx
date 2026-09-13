"use client";

import React, { useState } from "react";
import { User, LogOut, ShoppingBag, Ticket, Search, ShieldAlert, History } from "lucide-react";
import { useCart } from "../../context/CartContext";
import OrderHistoryModal from "../Cart/OrderHistoryModal";
import Link from "next/link";

interface NavbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  user: { name?: string; email?: string; role?: string } | null;
  onOpenAuth: () => void;
  onOpenCart: () => void;
  onOpenPasses: () => void;
  activePassesCount: number;
  onLogout: () => void;
}

export default function Navbar({
  searchQuery,
  setSearchQuery,
  user,
  onOpenAuth,
  onOpenCart,
  onOpenPasses,
  activePassesCount,
  onLogout,
}: NavbarProps) {
  const { totalCount, subtotal } = useCart();
  const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState(false);

  const isAdmin = user?.role === "admin" || user?.email?.toLowerCase().includes("admin");

  return (
    <>
      <header className="sticky top-0 z-40 bg-zinc-900/90 backdrop-blur-md border-b border-zinc-800 p-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 sm:gap-6">
          {/* Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <span className="bg-emerald-500 text-zinc-950 font-black px-2.5 py-1 rounded-xl text-lg shadow-md shadow-emerald-500/20">
              M
            </span>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-white tracking-tight leading-none">
                Mart-In
              </h1>
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                Supermarket
              </span>
            </div>
          </div>

          {/* Dynamic Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder="Search groceries (e.g. Amul, Lay's, Atta, BOGO deals)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-800/80 border border-zinc-700/80 text-white text-xs sm:text-sm rounded-xl py-2 pl-9 pr-4 focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-zinc-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-2 text-zinc-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Admin Dashboard Link (For Admin Role) */}
            {isAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 px-3 py-2 rounded-xl text-xs font-black border border-amber-500/40 transition-all cursor-pointer"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Admin</span>
              </Link>
            )}

            {/* My Orders History Button (For Customers) */}
            {user && (
              <button
                onClick={() => setIsOrderHistoryOpen(true)}
                className="flex items-center gap-1.5 bg-zinc-800/60 hover:bg-zinc-800 text-zinc-300 px-3 py-2 rounded-xl text-xs font-bold border border-zinc-700/60 transition-all cursor-pointer"
                title="My Order History"
              >
                <History className="w-4 h-4 text-emerald-400" />
                <span className="hidden lg:inline">My Orders</span>
              </button>
            )}

            {/* Pickup Passes Button */}
            <button
              onClick={onOpenPasses}
              className="flex items-center gap-1.5 bg-zinc-800/60 hover:bg-zinc-800 text-emerald-400 px-3 py-2 rounded-xl text-xs font-bold border border-zinc-700/60 transition-all cursor-pointer"
            >
              <Ticket className="w-4 h-4" />
              <span className="hidden md:inline">Passes</span>
              {activePassesCount > 0 && (
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded-full text-[10px] font-black">
                  {activePassesCount}
                </span>
              )}
            </button>

            {/* User Authentication */}
            {user ? (
              <div className="flex items-center gap-2 bg-zinc-800/80 border border-zinc-700 px-3 py-2 rounded-xl text-xs font-medium text-white">
                <User className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">
                  Hi,{" "}
                  <strong className="text-emerald-400 font-semibold">
                    {user.name || user.email?.split("@")[0]}
                  </strong>
                </span>
                <button
                  onClick={onLogout}
                  className="ml-1 text-zinc-400 hover:text-rose-400 transition-colors p-0.5"
                  title="Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold border border-zinc-700 transition-colors cursor-pointer"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}

            {/* Cart Toggle Button */}
            <button
              onClick={onOpenCart}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 px-3.5 py-2 rounded-xl text-xs font-black transition-all shadow-md shadow-emerald-500/20 cursor-pointer active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Cart</span>
              {totalCount > 0 && (
                <span className="bg-zinc-950 text-emerald-400 px-2 py-0.5 rounded-lg text-[11px] font-black">
                  {totalCount} • ₹{subtotal}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Customer Order History Modal */}
      {isOrderHistoryOpen && user?.email && (
        <OrderHistoryModal
          isOpen={isOrderHistoryOpen}
          onClose={() => setIsOrderHistoryOpen(false)}
          userEmail={user.email}
        />
      )}
    </>
  );
}