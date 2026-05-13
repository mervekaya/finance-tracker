import { createContext, useContext, useState, useEffect } from "react";
import * as authApi from "../../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      authApi.getMe()
        .then((r) => setUser(r.data))
        .catch(() => localStorage.removeItem("token"))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const r = await authApi.login(email, password);
    localStorage.setItem("token", r.data.access_token);
    const me = await authApi.getMe();
    setUser(me.data);
  };

  const register = async (email, name, password) => {
    const r = await authApi.register(email, name, password);
    localStorage.setItem("token", r.data.access_token);
    const me = await authApi.getMe();
    setUser(me.data);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
