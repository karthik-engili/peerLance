/**
 * @file chatStore.js
 * @module chatStore
 * @description Zustand store for chat message state per project.
 */
import { create } from "zustand";
import api from "../api/axiosInstance";

export const useChat = create((set) => ({
  messages: [],
  loading: false,

  fetchMessages: async (projectId) => {
    set({ loading: true });
    try {
      const res = await api.get(`/chat/${projectId}`);
      set({ messages: res.data.payload, loading: false });
    } catch (err) {
      set({ loading: false });
    }
  },

  sendMessage: async (messageData) => {
    try {
      const res = await api.post("/chat", messageData);
      set((state) => ({ messages: [...state.messages, res.data.payload] }));
      return res.data.payload;
    } catch (err) {
      throw err;
    }
  },

  addMessage: (message) => {
    set((state) => ({ messages: [...state.messages, message] }));
  },

  markAsRead: async (projectId) => {
    try {
      await api.put(`/chat/${projectId}/read`);
    } catch (err) { /* silent */ }
  },

  reset: () => set({ messages: [] }),
}));
