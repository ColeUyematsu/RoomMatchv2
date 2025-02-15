"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode }from "jwt-decode";

interface AuthContextType {
  isAuthenticated: boolean;
  userId: string | null;  // Add userId field
  isAdmin: boolean;
  login: (token: string, userId: string) => void; // Accept userId in login function
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null); // Store userId
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const storedUserId = localStorage.getItem("user_id"); // Retrieve userId from localStorage
    if (token && storedUserId) {
      setIsAuthenticated(true);
      setUserId(storedUserId);
      try {
        const decoded: any = jwtDecode(token);  // Decode JWT token
        setIsAdmin(decoded.is_admin || false);  // Extract isAdmin field
      } catch (error) {
        console.error("Error decoding token:", error);
      
      }
    }
  }, []);

  const login = (token: string, userId: string) => {
    localStorage.setItem("access_token", token);
    localStorage.setItem("user_id", userId); // Store userId
    setIsAuthenticated(true);
    setUserId(userId);
    try {
      const decoded: any = jwtDecode(token);
      setIsAdmin(decoded.is_admin || false);  // Store admin status
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_id"); // Clear userId on logout
    setIsAuthenticated(false);
    setUserId(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userId, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return { ...context, isAdmin: context.isAdmin };
}