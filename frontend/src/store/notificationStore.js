/**
 * @file notificationStore.js
 * @module notificationStore
 * @description Zustand store for notification state.
 */
import { create } from "zustand";
import api from "../api/axiosInstance";

export const useNotification = create((set) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,

  fetchNotifications: async () => {
    set({ loading: true });
    try {
      const res = await api.get("/notification");
      const { notifications, unreadCount } = res.data.payload;
      set({ notifications, unreadCount, loading: false });
    } catch (err) {
      set({ loading: false });
    }
  },

  markAsRead: async (id) => {
    try {
      await api.put(`/notification/${id}/read`);
      set((state) => ({
        notifications: state.notifications.map((n) => n._id === id ? { ...n, isRead: true } : n),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (err) { /* silent */ }
  },

  markAllAsRead: async () => {
    try {
      await api.put("/notification/read-all");
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));
    } catch (err) { /* silent */ }
  },

  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },

  reset: () => set({ notifications: [], unreadCount: 0 }),
}));
