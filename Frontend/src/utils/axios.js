import axios from "axios";
import { getAuthData, saveAuthData, clearAuthData } from "./auth.utils";

const api = axios.create({
  baseURL: import.meta.env.VITE_SERVER,
  withCredentials: true,
});

console.log(import.meta.env.VITE_SERVER)
api.interceptors.request.use((config) => {
  const auth = getAuthData();
  if (auth?.accessToken) {
    config.headers.Authorization = `Bearer ${auth.accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;
    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const auth = getAuthData();
        const res = await axios.post(
          `${import.meta.env.VITE_SERVER}/user/refresh-token`,
          {},
          { withCredentials: true }
        );



        const { user, accessToken, refreshToken } = res.data.data;
        saveAuthData({ user, accessToken, refreshToken });

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch {
        clearAuthData();
        window.location.href = "/auth";
        return Promise.reject(err);
      }
    }
    return Promise.reject(err);
  }
);

export default api;
