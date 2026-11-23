import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5016/api",
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Something went wrong. Please try again.";
    return Promise.reject(new Error(message));
  },
);

export default api;
