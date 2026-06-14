/**
 * @file savedStore.js
 * @module savedStore
 * @description Zustand store for saved/bookmarked projects.
 */
import { create } from "zustand";
import api from "../api/axiosInstance";

export const useSaved = create((set, get) => ({
  savedProjects: [],
  savedIds: [],
  loading: false,

  fetchSavedProjects: async () => {
    set({ loading: true });
    try {
      const res = await api.get("/saved");
      const projects = res.data.payload;
      set({
        savedProjects: projects,
        savedIds: projects.map((p) => p._id),
        loading: false,
      });
    } catch (err) {
      set({ loading: false });
    }
  },

  toggleSave: async (projectId) => {
    try {
      const res = await api.post(`/saved/${projectId}`);
      if (res.data.saved) {
        set((state) => ({ savedIds: [...state.savedIds, projectId] }));
      } else {
        set((state) => ({
          savedIds: state.savedIds.filter((id) => id !== projectId),
          savedProjects: state.savedProjects.filter((p) => p._id !== projectId),
        }));
      }
      return res.data;
    } catch (err) {
      throw err;
    }
  },

  isSaved: (projectId) => get().savedIds.includes(projectId),

  reset: () => set({ savedProjects: [], savedIds: [] }),
}));
