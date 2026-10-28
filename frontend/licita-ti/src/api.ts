import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8081",
  timeout: 15000,
});

export async function healthCheck() {
  const { data } = await api.get("/health");

  return data;
}
