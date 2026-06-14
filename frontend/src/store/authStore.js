/**
 * @file authStore.js
 * @module authStore
 * @description Zustand store for authentication state.
 * Manages login, register, logout, session restoration, and profile updates.
 */
import { create } from "zustand";
import api from "../api/axiosInstance";

export const useAuth = create((set) => ({
  currentUser: null,
  loading: false,
  isAuthenticated: false,
  isCheckingAuth: true,
  error: null,

  register: async (userData) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post("/auth/register", userData);
      set({ loading: false, error: null });
      return res.data;
    } catch (err) {
      set({ loading: false, error: err.response?.data?.message || "Registration failed" });
      throw err;
    }
  },

  login: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post("/auth/login", credentials);
      set({
        loading: false,
        isAuthenticated: true,
        currentUser: res.data.payload,
        error: null,
      });
      return res.data;
    } catch (err) {
      set({
        loading: false,
        isAuthenticated: false,
        currentUser: null,
        error: err.response?.data?.message || "Login failed",
      });
      throw err;
    }
  },

  logout: async () => {
    set({ loading: true });
    try {
      await api.post("/auth/logout");
    } catch (err) {
      // proceed with client-side cleanup regardless
    }
    set({
      loading: false,
      isAuthenticated: false,
      currentUser: null,
      error: null,
    });
  },

  checkAuth: async () => {
    try {
      set({ isCheckingAuth: true });
      const res = await api.get("/auth/me");
      set({
        currentUser: res.data.payload,
        isAuthenticated: true,
        isCheckingAuth: false,
      });
    } catch (err) {
      set({
        currentUser: null,
        isAuthenticated: false,
        isCheckingAuth: false,
      });
    }
  },

  updateProfile: async (data) => {
    set({ loading: true, error: null });
    try {
      const res = await api.put("/profile", data);
      set({ loading: false, currentUser: res.data.payload });
      return res.data;
    } catch (err) {
      set({ loading: false, error: err.response?.data?.message || "Update failed" });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));
