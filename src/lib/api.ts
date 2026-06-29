// import axios from "axios";
// const api = axios.create({
//   baseURL: "192.168.0.100:10000",
//   headers: {
//     "Content-Type": "application/json",  // ❌ THIS IS THE PROBLEM
//   },
// });

// /* ================= REQUEST INTERCEPTOR ================= */
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("access_token");

//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }

//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// /* ================= RESPONSE INTERCEPTOR ================= */
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       console.error(" Token invalid or expired");

//       // Optional auto logout
//       localStorage.removeItem("access_token");
//       window.location.href = "/";
//     }

//     return Promise.reject(error);
//   }
// );

// export default api;


import axios from "axios";
import { API_BASE_URL } from "@/services/api/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request Interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor to catch Vite's 200 OK HTML fallback for 404s
api.interceptors.response.use(
  (response) => {
    if (typeof response.data === "string" && response.data.trim().startsWith("<!DOCTYPE html>")) {
      return Promise.reject(new Error("API returned HTML instead of JSON (likely a 404)"));
    }
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
