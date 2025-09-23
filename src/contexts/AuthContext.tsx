import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { clearLocalUserData, mergeLocalDataWithProfile, readLocalUserData } from "@/lib/user-data";
import { UserProfile } from "@/types/UserData";
import { fetchJson } from "@/lib/http";

interface SessionUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
}

export interface AuthUser extends SessionUser {
  uid: string;
  displayName: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: UserProfile & { password: string }) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const loadInitialSession = useCallback(async () => {
    try {
      const response = await fetchJson<{ user: SessionUser }>("/session");
      if (response?.user) {
        setUser(formatUser(response.user));
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadInitialSession();
  }, [loadInitialSession]);

  const refreshUser = useCallback(async () => {
    try {
      const response = await fetchJson<{ user: SessionUser }>("/session");
      if (response?.user) {
        setUser(formatUser(response.user));
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const response = await fetchJson<{ user: SessionUser }>("/auth-login", {
      method: "POST",
      body: { email, password },
    });
    setUser(formatUser(response.user));
  }, []);

  const signUp = useCallback(
    async ({ firstName, lastName, email, password }: UserProfile & { password: string }) => {
      const localData = readLocalUserData();
      const profile: UserProfile = {
        firstName,
        lastName,
        email,
      };
      const initialData = mergeLocalDataWithProfile(profile, localData);
      const response = await fetchJson<{ user: SessionUser }>("/auth-register", {
        method: "POST",
        body: {
          firstName,
          lastName,
          email,
          password,
          initialData,
        },
      });
      clearLocalUserData();
      setUser(formatUser(response.user));
    },
    []
  );

  const signOut = useCallback(async () => {
    await fetchJson("/auth-logout", { method: "POST" });
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      signIn,
      signUp,
      signOut,
      refreshUser,
    }),
    [user, loading, signIn, signUp, signOut, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

const formatUser = ({ id, email, firstName, lastName }: SessionUser): AuthUser => {
  const displayName = `${firstName ?? ""} ${lastName ?? ""}`.trim();
  return {
    id,
    uid: String(id),
    email,
    firstName,
    lastName,
    displayName,
  };
};
