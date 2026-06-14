/**
 * @file axiosInstance.js
 * @description Configured Axios client with base URL, credentials, and interceptors
 * for automatic error displaying and unauthorized session management.
 */
import axios from "axios";
import toast from "react-hot-toast";

const api = axios.create({
  baseURL: "http://localhost:6868/api",
  withCredentials: true,
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || "Something went wrong";

    if (status === 401) {
      // Clear client session and redirect if user was authenticated
      // We can directly call window.location to redirect to login if unauthorized
      // or we can let the authStore / route guards handle it.
      // But we should definitely clear local state if needed.
    } else if (status === 500) {
      toast.error("Internal Server Error. Please try again later.");
    } else if (message) {
      // Don't show toast for specific silent checks (like me check)
      const isCheckMe = error.config.url.endsWith("/auth/me");
      if (!isCheckMe) {
        toast.error(message);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
