// ─── Auth Context ──────────────────────────────────────────────────────────
// Provides authentication state and actions to the entire app.
// State: { user, isAuthenticated, isLoading }
// Actions: login, logout, register, updateUser

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authAPI } from "../services/api.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if the user has a valid session on first load
  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const { data } = await authAPI.getMe();
      setUser(data.data);
    } catch {
      localStorage.removeItem("accessToken");
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (credentials) => {
    const { data } = await authAPI.login(credentials);
    localStorage.setItem("accessToken", data.data.accessToken);
    setUser(data.data.user);
    return data.data.user;
  };

  const register = async (userData) => {
    const { data } = await authAPI.register(userData);
    return data.data;
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } finally {
      localStorage.removeItem("accessToken");
      setUser(null);
    }
  };

  // Call this after updating profile to keep local state in sync
  const updateUser = (updatedUser) => {
    setUser((prev) => ({ ...prev, ...updatedUser }));
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, isLoading, login, logout, register, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export default AuthContext;
