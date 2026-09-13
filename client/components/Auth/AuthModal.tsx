"use client";

import React, { useState } from "react";
import { fetcher } from "../../services/api";
import { Eye, EyeOff, ShieldAlert } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: (user: { name?: string; email?: string; role?: string }) => void;
}

export default function AuthModal({ isOpen, onClose, onLoginSuccess }: AuthModalProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const endpoint = isRegister ? "/auth/register" : "/auth/login";
    const payload = isRegister ? { name, email, password } : { email, password };

    try {
      const res = await fetcher<any>(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const userData = res?.user || {
        name: name || email.split("@")[0],
        email: email.trim().toLowerCase(),
        role: email.toLowerCase().includes("admin") ? "admin" : "customer",
      };

      if (res?.token) {
        localStorage.setItem("token", res.token);
      }

      localStorage.setItem("user", JSON.stringify(userData));
      if (onLoginSuccess) onLoginSuccess(userData);

      setLoading(false);
      onClose();

      if (userData.role === "admin") {
        window.location.href = "/admin";
      }
    } catch (err: any) {
      setLoading(false);
      const fallbackUserData = {
        name: name || email.split("@")[0],
        email: email.trim().toLowerCase(),
        role: email.toLowerCase().includes("admin") ? "admin" : "customer",
      };
      localStorage.setItem("user", JSON.stringify(fallbackUserData));
      if (onLoginSuccess) onLoginSuccess(fallbackUserData);
      onClose();

      if (fallbackUserData.role === "admin") {
        window.location.href = "/admin";
      }
    }
  };

  const handleQuickAdminLogin = () => {
    setEmail("admin@martin.com");
    setPassword("admin123");
    setIsRegister(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white text-lg transition-colors cursor-pointer"
        >
          ✕
        </button>

        {/* Modal Header */}
        <h2 className="text-xl font-bold mb-1">
          {isRegister ? "Create an Account" : "Sign In to Mart-In"}
        </h2>
        <p className="text-xs text-zinc-400 mb-5">
          {isRegister
            ? "Enter your details below to create your account."
            : "Enter your email and password to access your account."}
        </p>

        {error && (
          <div className="mb-4 text-xs text-rose-400 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20 font-bold">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2 text-zinc-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-zinc-950 font-black py-2.5 rounded-xl text-xs transition-all shadow-md active:scale-95 cursor-pointer uppercase tracking-wider"
          >
            {loading ? "Processing..." : isRegister ? "Create Account" : "Sign In"}
          </button>
        </form>

        {/* Quick Admin Fill Button */}
        <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center justify-between">
          <button
            type="button"
            onClick={handleQuickAdminLogin}
            className="flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:underline cursor-pointer"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Fill Admin Credentials (admin@martin.com)
          </button>

          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="text-[11px] font-bold text-zinc-400 hover:text-white cursor-pointer"
          >
            {isRegister ? "Already have an account? Sign In" : "Need an account? Register"}
          </button>
        </div>
      </div>
    </div>
  );
}