import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api, tokenStore, AuthUser } from "@/integrations/api/client";

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  profile: { full_name: string | null; employee_code: string | null; role: string | null } | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, full_name?: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  profile: null,
  signIn: async () => {},
  signUp: async () => {},
  signOut: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = tokenStore.get();
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get<{ user: AuthUser }>("/auth/me")
      .then((res) => setUser(res.user))
      .catch(() => {
        tokenStore.clear();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const signIn = async (email: string, password: string) => {
    const res = await api.post<{ token: string; user: AuthUser }>("/auth/login", { email, password });
    tokenStore.set(res.token);
    setUser(res.user);
  };

  const signUp = async (email: string, password: string, full_name?: string) => {
    const res = await api.post<{ token: string; user: AuthUser }>("/auth/signup", {
      email,
      password,
      full_name,
    });
    tokenStore.set(res.token);
    setUser(res.user);
  };

  const signOut = () => {
    tokenStore.clear();
    setUser(null);
  };

  const profile = user
    ? { full_name: user.full_name, employee_code: user.employee_code, role: user.role }
    : null;

  return (
    <AuthContext.Provider value={{ user, loading, profile, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
