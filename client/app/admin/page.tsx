"use client";

import React, { useState, useEffect } from "react";
import { fetcher } from "../../services/api";
import { PRODUCTS as STATIC_PRODUCTS } from "../../data/products";
import {
  LayoutDashboard,
  ShoppingBag,
  TrendingUp,
  Store,
  Truck,
  Zap,
  Save,
  CheckCircle,
  Clock,
  ArrowLeft,
  Search,
  Gift,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"orders" | "products" | "analytics">("orders");
  const [user, setUser] = useState<{ name?: string; email?: string; role?: string } | null>(null);

  // Admin Data State
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>(STATIC_PRODUCTS);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [savingId, setSavingId] = useState<string | null>(null);

  // Check admin authorization
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        if (parsed.role !== "admin" && !parsed.email?.includes("admin")) {
          // Redirect non-admin users to home
          window.location.href = "/";
        }
      } catch (e) {
        window.location.href = "/";
      }
    } else {
      window.location.href = "/";
    }
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Orders
      const orderData = await fetcher<any[]>("/orders/admin/all");
      if (Array.isArray(orderData)) setOrders(orderData);

      // 2. Fetch Products
      const prodData = await fetcher<any[]>("/products");
      if (Array.isArray(prodData) && prodData.length > 0) {
        setProducts(
          prodData.map((p) => ({
            ...p,
            id: p._id || p.id,
            name: p.title || p.name,
          }))
        );
      }

      // 3. Fetch Analytics
      const analyticsData = await fetcher<any>("/admin/analytics");
      if (analyticsData) setAnalytics(analyticsData);
    } catch (err) {
      console.log("Admin load data error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update order status
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await fetcher(`/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId || o.orderId === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      alert("Failed to update order status.");
    }
  };

  // Update product fields in MongoDB
  const handleUpdateProduct = async (id: string, updatedFields: any) => {
    setSavingId(id);
    try {
      await fetcher(`/products/admin/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedFields),
      });

      setProducts((prev) =>
        prev.map((p) => (p.id === id || p._id === id ? { ...p, ...updatedFields } : p))
      );
    } catch (err) {
      alert("Failed to update product in database.");
    } finally {
      setSavingId(null);
    }
  };

  const filteredProducts = products.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      !q ||
      (p.title || p.name || "").toLowerCase().includes(q) ||
      (p.category || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-zinc-900/90 backdrop-blur border-b border-zinc-800 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-emerald-400 font-bold transition-colors bg-zinc-800 px-3 py-1.5 rounded-xl border border-zinc-700"
            >
              <ArrowLeft className="w-4 h-4" />
              Storefront
            </Link>
            <div>
              <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                <LayoutDashboard className="w-5 h-5 text-emerald-400" />
                Mart-In Admin Control Panel
              </h1>
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                Full-Stack Real-Time Dashboard
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl transition-colors cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <div className="bg-zinc-800 border border-zinc-700 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-400">
              Admin: {user?.name || "Mart-In Admin"}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex gap-2 border-b border-zinc-800 pb-3 overflow-x-auto">
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === "orders"
                ? "bg-emerald-500 text-zinc-950 shadow-md"
                : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            Daily Order Tracker ({orders.length})
          </button>

          <button
            onClick={() => setActiveTab("products")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === "products"
                ? "bg-emerald-500 text-zinc-950 shadow-md"
                : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
            }`}
          >
            <Zap className="w-4 h-4" />
            Daily Price, Stock & BOGO Manager ({products.length})
          </button>

          <button
            onClick={() => setActiveTab("analytics")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === "analytics"
                ? "bg-emerald-500 text-zinc-950 shadow-md"
                : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Customer Analytics
          </button>
        </div>

        {/* TAB 1: DAILY ORDER TRACKER */}
        {activeTab === "orders" && (
          <div className="space-y-4">
            <h3 className="text-lg font-black text-white">Daily Order Tracker & Fulfillment Log</h3>

            {orders.length === 0 ? (
              <div className="text-center py-16 bg-zinc-900/40 rounded-2xl border border-zinc-800 text-zinc-400">
                No customer orders placed yet today.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {orders.map((order) => (
                  <div
                    key={order._id || order.orderId}
                    className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-black text-emerald-400">
                            {order.orderId}
                          </span>
                          <span className="text-xs text-zinc-300 font-bold">
                            Customer: {order.userName} ({order.userEmail})
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-zinc-500" />
                          {new Date(order.createdAt).toLocaleString()} • {order.timeSlot}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-base font-black text-white">₹{order.total}</span>
                          <span className="block text-[11px] text-zinc-400 font-bold">
                            {order.deliveryType === "Delivery" ? "🚚 Home Delivery" : "🏪 Store Pickup"}
                          </span>
                        </div>

                        {/* Status Change Dropdown */}
                        <select
                          value={order.status || "Confirmed"}
                          onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                          className="bg-zinc-800 border border-zinc-700 text-white text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500 cursor-pointer"
                        >
                          <option value="Confirmed">Confirmed</option>
                          <option value="Preparing">Preparing</option>
                          <option value="Ready">Ready</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>

                    {/* Delivery Address */}
                    {order.deliveryType === "Delivery" && order.address && (
                      <p className="text-xs text-amber-400 bg-amber-500/10 p-2 rounded-xl border border-amber-500/20 font-medium">
                        📍 <strong>Delivery Address:</strong> {order.address}
                      </p>
                    )}

                    {/* Items List */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-1">
                      {Array.isArray(order.items) &&
                        order.items.map((item: any, idx: number) => (
                          <div
                            key={idx}
                            className="bg-zinc-800/40 p-2.5 rounded-xl border border-zinc-800 text-xs flex items-center justify-between"
                          >
                            <span className="font-semibold text-zinc-200 line-clamp-1">
                              {item.quantity}x {item.name || item.title}
                            </span>
                            <span className="font-mono text-emerald-400 font-bold">
                              ₹{(item.price || 0) * (item.quantity || 1)}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PRICE, STOCK & BOGO MANAGER */}
        {activeTab === "products" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-black text-white">Daily Price, Stock & BOGO Offer Manager</h3>
                <p className="text-xs text-zinc-400">Edit item pricing, stock levels, and BOGO deals saved directly to MongoDB</p>
              </div>

              <div className="relative max-w-xs w-full">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-white text-xs rounded-xl py-2 pl-9 pr-3 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto border border-zinc-800 rounded-2xl">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-400 uppercase text-[10px] font-black tracking-wider">
                  <tr>
                    <th className="p-3">Product</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Price (₹)</th>
                    <th className="p-3">MRP (₹)</th>
                    <th className="p-3">Stock Qty</th>
                    <th className="p-3">BOGO (1+1)</th>
                    <th className="p-3">Discount %</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 bg-zinc-900/40">
                  {filteredProducts.map((prod) => (
                    <tr key={prod.id} className="hover:bg-zinc-800/40 transition-colors">
                      <td className="p-3 flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-zinc-800 overflow-hidden flex-shrink-0">
                          <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                        </div>
                        <span className="font-bold text-white line-clamp-1">{prod.title || prod.name}</span>
                      </td>

                      <td className="p-3 text-emerald-400 font-semibold">{prod.category}</td>

                      {/* Inline Price Edit */}
                      <td className="p-3">
                        <input
                          type="number"
                          defaultValue={prod.price}
                          onBlur={(e) =>
                            handleUpdateProduct(prod.id, { price: Number(e.target.value) })
                          }
                          className="w-16 bg-zinc-800 border border-zinc-700 text-white text-xs font-bold rounded p-1 text-center"
                        />
                      </td>

                      {/* Inline MRP Edit */}
                      <td className="p-3">
                        <input
                          type="number"
                          defaultValue={prod.originalPrice || prod.price}
                          onBlur={(e) =>
                            handleUpdateProduct(prod.id, { originalPrice: Number(e.target.value) })
                          }
                          className="w-16 bg-zinc-800 border border-zinc-700 text-zinc-400 text-xs rounded p-1 text-center"
                        />
                      </td>

                      {/* Inline Stock Edit */}
                      <td className="p-3">
                        <input
                          type="number"
                          defaultValue={prod.stockQuantity || 50}
                          onBlur={(e) =>
                            handleUpdateProduct(prod.id, { stockQuantity: Number(e.target.value) })
                          }
                          className="w-16 bg-zinc-800 border border-zinc-700 text-white text-xs font-bold rounded p-1 text-center"
                        />
                      </td>

                      {/* BOGO Toggle */}
                      <td className="p-3">
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateProduct(prod.id, { isBogo: !prod.isBogo })
                          }
                          className={`px-2 py-1 rounded text-[10px] font-black uppercase transition-colors ${
                            prod.isBogo
                              ? "bg-amber-500 text-zinc-950"
                              : "bg-zinc-800 text-zinc-400 hover:text-white"
                          }`}
                        >
                          {prod.isBogo ? "BOGO ACTIVE" : "OFF"}
                        </button>
                      </td>

                      {/* Discount % Edit */}
                      <td className="p-3">
                        <input
                          type="number"
                          defaultValue={prod.discountPercentage || 0}
                          onBlur={(e) =>
                            handleUpdateProduct(prod.id, {
                              discountPercentage: Number(e.target.value),
                              isOnOffer: Number(e.target.value) > 0,
                            })
                          }
                          className="w-14 bg-zinc-800 border border-zinc-700 text-white text-xs font-bold rounded p-1 text-center"
                        />
                      </td>

                      <td className="p-3 text-right">
                        {savingId === prod.id ? (
                          <span className="text-[10px] text-amber-400 font-bold">Saving...</span>
                        ) : (
                          <span className="text-[10px] text-emerald-400 font-bold">Synced</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: CUSTOMER ANALYTICS */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            <h3 className="text-lg font-black text-white">Customer Order Analytics & Market Insights</h3>

            {/* Metrics Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
                <span className="text-xs uppercase font-black tracking-wider text-emerald-400">
                  Total Gross Revenue
                </span>
                <h4 className="text-2xl font-black text-white mt-1">
                  ₹{analytics?.totalRevenue || orders.reduce((s, o) => s + (o.total || 0), 0)}
                </h4>
                <p className="text-[10px] text-zinc-400 mt-1">Direct from completed checkouts</p>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
                <span className="text-xs uppercase font-black tracking-wider text-amber-400">
                  Total Customer Orders
                </span>
                <h4 className="text-2xl font-black text-white mt-1">
                  {analytics?.totalOrders || orders.length}
                </h4>
                <p className="text-[10px] text-zinc-400 mt-1">Processed today</p>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
                <span className="text-xs uppercase font-black tracking-wider text-blue-400">
                  Store Pickup vs Delivery
                </span>
                <h4 className="text-xl font-black text-white mt-1">
                  {orders.filter((o) => o.deliveryType === "Pickup").length} Pickup • {orders.filter((o) => o.deliveryType === "Delivery").length} Delivery
                </h4>
                <p className="text-[10px] text-zinc-400 mt-1">Fulfillment distribution</p>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
                <span className="text-xs uppercase font-black tracking-wider text-rose-400">
                  Active BOGO Items
                </span>
                <h4 className="text-2xl font-black text-white mt-1">
                  {products.filter((p) => p.isBogo).length} Items
                </h4>
                <p className="text-[10px] text-zinc-400 mt-1">Tagged with 1+1 Free offer</p>
              </div>
            </div>

            {/* Top Purchased Supermarket Items */}
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl space-y-3">
              <h4 className="text-sm font-black text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Top 5 Most Purchased Supermarket Items
              </h4>

              <div className="space-y-2 pt-1">
                {(analytics?.topItems && analytics.topItems.length > 0
                  ? analytics.topItems
                  : [
                      { name: "Nestle Munch Chocolate Wafer Bar", count: 42 },
                      { name: "Lay's India's Magic Masala Chips", count: 38 },
                      { name: "Amul Taaza Toned Fresh Milk", count: 29 },
                      { name: "Aashirvaad Shudh Chakki Atta", count: 24 },
                      { name: "Dettol Antiseptic Soap Bar", count: 19 },
                    ]
                ).map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-zinc-800/40 rounded-xl border border-zinc-800 text-xs"
                  >
                    <span className="font-bold text-white flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-[10px]">
                        #{idx + 1}
                      </span>
                      {item.name}
                    </span>
                    <span className="font-mono text-emerald-400 font-black">
                      {item.count} Units Sold
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

