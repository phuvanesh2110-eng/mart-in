"use client";

import { useState, useEffect } from "react";
import Navbar from "../components/Navbar/Navbar";
import Hero from "../components/Hero/Hero";
import Categories from "../components/Categories/Categories";
import Offers from "../components/Offers/Offers";
import Products from "../components/Products/Products";
import AuthModal from "../components/Auth/AuthModal";
import CartDrawer from "../components/Cart/CartDrawer";
import PassesDrawer from "../components/Passes/PassesDrawer";
import Footer from "../components/Footer/Footer";
import { fetcher } from "../services/api";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [activeOfferFilter, setActiveOfferFilter] = useState<string | null>(null);
  const [activePassesCount, setActivePassesCount] = useState<number>(0);

  // Modal toggle states
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isPassesOpen, setIsPassesOpen] = useState<boolean>(false);

  // User session state
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null);

  const refreshPassesCount = () => {
    fetcher<any[]>("/passes")
      .then((data) => {
        const payload = data as any;
        const passes = Array.isArray(payload) ? payload : [];
        const count = passes.filter((pass) =>
          ["ACTIVE", "Confirmed", "Preparing", "Ready"].includes(pass?.status)
        ).length;
        setActivePassesCount(typeof payload?.count === "number" ? payload.count : count);
      })
      .catch((err: any) => console.log("Pass count fetch offline/default:", err));
  };

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Error parsing user from localStorage:", e);
      }
    }

    refreshPassesCount();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
  };

  const handleStartReserving = () => {
    setSelectedCategory("All");
    setActiveOfferFilter(null);
    document.getElementById("catalog-section")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSelectCategory = (categoryName: string) => {
    setSelectedCategory(categoryName);
    document.getElementById("catalog-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 transition-colors duration-200">
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={(query) => {
          setSearchQuery(query);
          if (query.trim() !== "") {
            document.getElementById("catalog-section")?.scrollIntoView({ behavior: "smooth" });
          }
        }}
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenPasses={() => setIsPassesOpen(true)}
        activePassesCount={activePassesCount}
        onLogout={handleLogout}
      />

      <Hero
        onStartReserving={handleStartReserving}
        onExploreCategories={() => {
          document.getElementById("categories-section")?.scrollIntoView({ behavior: "smooth" });
        }}
      />

      {/* Category Filter Pills / Selection Bar */}
      <div id="categories-section">
        <Categories
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
          onOpenCart={() => setIsCartOpen(true)}
        />
      </div>

      {/* Active Store Offers (Interactive Buttons) */}
      <Offers
        activeOfferFilter={activeOfferFilter}
        onSelectOfferFilter={(filter) => setActiveOfferFilter(filter)}
      />

      {/* SINGLE Main Product Catalog Grid */}
      <div id="catalog-section">
        <Products
          externalCategory={selectedCategory}
          searchQuery={searchQuery}
          activeOfferFilter={activeOfferFilter}
          onClearOfferFilter={() => setActiveOfferFilter(null)}
        />
      </div>

      <Footer />

      {/* Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(userData) => setUser(userData)}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onOrderSuccess={() => {
          setIsCartOpen(false);
          refreshPassesCount();
          setIsPassesOpen(true);
        }}
      />

      <PassesDrawer
        isOpen={isPassesOpen}
        onClose={() => setIsPassesOpen(false)}
      />
    </main>
  );
}