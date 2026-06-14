/**
 * @file projectStore.js
 * @module projectStore
 * @description Zustand store for project state management.
 * Handles CRUD, pagination, and filtering for projects.
 */
import { create } from "zustand";
import api from "../api/axiosInstance";

export const useProject = create((set, get) => ({
  projects: [],
  myProjects: [],
  currentProject: null,
  loading: false,
  error: null,
  // Pagination
  currentPage: 1,
  totalPages: 1,
  totalCount: 0,

  fetchProjects: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get("/project", { params });
      const { projects, totalCount, currentPage, totalPages } = res.data.payload;
      set({ projects, totalCount, currentPage, totalPages, loading: false });
      return res.data.payload;
    } catch (err) {
      set({ loading: false, error: err.response?.data?.message || "Failed to fetch projects" });
      throw err;
    }
  },

  fetchMyProjects: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get("/project/my", { params });
      set({ myProjects: res.data.payload.projects, loading: false });
      return res.data.payload;
    } catch (err) {
      set({ loading: false, error: err.response?.data?.message });
      throw err;
    }
  },

  fetchProjectById: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get(`/project/${id}`);
      set({ currentProject: res.data.payload, loading: false });
      return res.data.payload;
    } catch (err) {
      set({ loading: false, error: err.response?.data?.message });
      throw err;
    }
  },

  createProject: async (formData) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post("/project", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      set({ loading: false });
      return res.data.payload;
    } catch (err) {
      set({ loading: false, error: err.response?.data?.message });
      throw err;
    }
  },

  updateProject: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const res = await api.put(`/project/${id}`, data);
      set({ loading: false, currentProject: res.data.payload });
      return res.data.payload;
    } catch (err) {
      set({ loading: false, error: err.response?.data?.message });
      throw err;
    }
  },

  deleteProject: async (id) => {
    set({ loading: true });
    try {
      await api.delete(`/project/${id}`);
      set((state) => ({
        loading: false,
        projects: state.projects.filter((p) => p._id !== id),
        myProjects: state.myProjects.filter((p) => p._id !== id),
      }));
    } catch (err) {
      set({ loading: false, error: err.response?.data?.message });
      throw err;
    }
  },

  completeProject: async (id) => {
    set({ loading: true });
    try {
      const res = await api.put(`/project/${id}/complete`);
      set({ loading: false, currentProject: res.data.payload });
      return res.data.payload;
    } catch (err) {
      set({ loading: false, error: err.response?.data?.message });
      throw err;
    }
  },

  reset: () => set({ projects: [], myProjects: [], currentProject: null, currentPage: 1, totalPages: 1, totalCount: 0 }),
}));
