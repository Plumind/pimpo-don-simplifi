import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import {
  mergeLocalDataWithProfile,
  readLocalUserData,
  clearLocalUserData,
} from "@/lib/user-data";
import { UserProfile } from "@/types/UserData";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: UserProfile & { password: string }) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async ({ firstName, lastName, email, password }: UserProfile & { password: string }) => {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    if (firstName || lastName) {
      await updateProfile(credential.user, {
        displayName: `${firstName} ${lastName}`.trim(),
      });
    }
    const profile: UserProfile = {
      firstName,
      lastName,
      email: credential.user.email ?? email,
    };
    const localData = readLocalUserData();
    const initialData = mergeLocalDataWithProfile(profile, localData);
    await setDoc(doc(db, "users", credential.user.uid), initialData);
    clearLocalUserData();
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      signIn,
      signUp,
      signOut,
    }),
    [user, loading]
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
