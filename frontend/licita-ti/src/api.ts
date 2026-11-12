import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8081",
  timeout: 15000,
});

export const agentApi = axios.create({
  baseURL: import.meta.env.VITE_AGENT_URL || "http://localhost:8082",
  timeout: 180000,
});

export async function healthCheck() {
  const { data } = await api.get("/health");

  return data;
}
