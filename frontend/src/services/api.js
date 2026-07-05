// ─── Axios API Service ─────────────────────────────────────────────────────
// A pre-configured Axios instance that:
//   1. Points to the backend base URL (from .env)
//   2. Sends cookies automatically (withCredentials)
//   3. Injects the stored JWT accessToken as a Bearer header on every request
//   4. Intercepts 401 responses to redirect to login

import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Required to send/receive httpOnly cookies
  headers: { "Content-Type": "application/json" },
});

// ── Request Interceptor: attach JWT from localStorage ──────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor: handle token expiry ──────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Determine if the failed request was an authentication request
    const isAuthRequest =
      originalRequest.url?.includes("/users/login") ||
      originalRequest.url?.includes("/users/register") ||
      originalRequest.url?.includes("/users/refresh-token");

    // If 401, not already retried, and is NOT a login/register/refresh request, try to refresh
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRequest) {
      originalRequest._retry = true;
      try {
        const { data } = await axios.post(
          `${API_BASE_URL}/users/refresh-token`,
          {},
          { withCredentials: true }
        );
        const newToken = data.data.accessToken;
        localStorage.setItem("accessToken", newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("accessToken");
        if (window.location.pathname.startsWith("/dashboard")) {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// ── Auth API ────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post("/users/register", data),
  login: (data) => api.post("/users/login", data),
  logout: () => api.post("/users/logout"),
  getMe: () => api.get("/users/me"),
  refreshToken: () => api.post("/users/refresh-token"),
  updateProfile: (data) => api.patch("/users/profile", data),
  updateAvatar: (formData) =>
    api.patch("/users/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getPublicProfile: (username) => api.get(`/users/portfolio/${username}`),
};

// ── Posts API ───────────────────────────────────────────────────────────
export const postsAPI = {
  createPost: (formData) =>
    api.post("/posts", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getMyPosts: (page = 1, limit = 12) =>
    api.get(`/posts?page=${page}&limit=${limit}`),
  getPublicPosts: (username, page = 1, limit = 12) =>
    api.get(`/posts/public/${username}?page=${page}&limit=${limit}`),
  updatePost: (postId, data) => api.patch(`/posts/${postId}`, data),
  deletePost: (postId) => api.delete(`/posts/${postId}`),
};

export default api;
