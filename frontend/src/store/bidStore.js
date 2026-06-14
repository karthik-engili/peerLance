/**
 * @file bidStore.js
 * @module bidStore
 * @description Zustand store for bid state management.
 */
import { create } from "zustand";
import api from "../api/axiosInstance";

export const useBid = create((set) => ({
  bids: [],
  myBids: [],
  loading: false,
  error: null,
  currentPage: 1,
  totalPages: 1,

  fetchBidsForProject: async (projectId) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get(`/bid/project/${projectId}`);
      set({ bids: res.data.payload, loading: false });
      return res.data.payload;
    } catch (err) {
      set({ loading: false, error: err.response?.data?.message });
      throw err;
    }
  },

  fetchMyBids: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get("/bid/my", { params });
      const { bids, currentPage, totalPages } = res.data.payload;
      set({ myBids: bids, currentPage, totalPages, loading: false });
      return res.data.payload;
    } catch (err) {
      set({ loading: false, error: err.response?.data?.message });
      throw err;
    }
  },

  submitBid: async (bidData) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post("/bid", bidData);
      set({ loading: false });
      return res.data.payload;
    } catch (err) {
      set({ loading: false, error: err.response?.data?.message });
      throw err;
    }
  },

  editBid: async (bidId, data) => {
    set({ loading: true });
    try {
      const res = await api.put(`/bid/${bidId}`, data);
      set({ loading: false });
      return res.data.payload;
    } catch (err) {
      set({ loading: false, error: err.response?.data?.message });
      throw err;
    }
  },

  withdrawBid: async (bidId) => {
    set({ loading: true });
    try {
      await api.delete(`/bid/${bidId}`);
      set((state) => ({ loading: false, myBids: state.myBids.filter((b) => b._id !== bidId) }));
    } catch (err) {
      set({ loading: false, error: err.response?.data?.message });
      throw err;
    }
  },

  acceptBid: async (bidId) => {
    set({ loading: true });
    try {
      const res = await api.put(`/bid/${bidId}/accept`);
      set({ loading: false });
      return res.data.payload;
    } catch (err) {
      set({ loading: false, error: err.response?.data?.message });
      throw err;
    }
  },

  rejectBid: async (bidId) => {
    set({ loading: true });
    try {
      await api.put(`/bid/${bidId}/reject`);
      set({ loading: false });
    } catch (err) {
      set({ loading: false, error: err.response?.data?.message });
      throw err;
    }
  },

  reset: () => set({ bids: [], myBids: [], currentPage: 1, totalPages: 1 }),
}));
