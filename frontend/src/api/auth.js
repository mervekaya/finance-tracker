import client from "./client";

export const register = (email, name, password) =>
  client.post("/auth/register", { email, name, password });

export const login = (email, password) =>
  client.post("/auth/login", { email, password });

export const getMe = () => client.get("/auth/me");
