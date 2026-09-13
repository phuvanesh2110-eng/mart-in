"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface User {
  name: string;
  email: string;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  unit?: string; // 👈 Made optional to match CartContext perfectly
}

export interface ReservationPass {
  id: string;
  store: string;
  slot: string;
  total: number;
  userName: string;
  itemCount: number;
  items: CartItem[];
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthOpen: boolean;
  reservations: ReservationPass[];
  login: (name: string, email: string) => void;
  logout: () => void;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  addReservation: (reservation: ReservationPass) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [reservations, setReservations] = useState<ReservationPass[]>([]);

  // Load user & reservations from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("martin_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    const savedPasses = localStorage.getItem("martin_reservations");
    if (savedPasses) {
      setReservations(JSON.parse(savedPasses));
    }
  }, []);

  const login = (name: string, email: string) => {
    const newUser = { name, email };
    setUser(newUser);
    localStorage.setItem("martin_user", JSON.stringify(newUser));
    setIsAuthOpen(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("martin_user");
  };

  const openAuthModal = () => setIsAuthOpen(true);
  const closeAuthModal = () => setIsAuthOpen(false);

  const addReservation = (reservation: ReservationPass) => {
    const updatedPasses = [reservation, ...reservations];
    setReservations(updatedPasses);
    localStorage.setItem("martin_reservations", JSON.stringify(updatedPasses));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthOpen,
        reservations,
        login,
        logout,
        openAuthModal,
        closeAuthModal,
        addReservation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}