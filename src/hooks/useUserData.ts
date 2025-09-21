import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { UserData, UserProfile } from "@/types/UserData";
import {
  clearLocalUserData,
  ensureHouseholdDefaults,
  mergeLocalDataWithProfile,
  readLocalUserData,
} from "@/lib/user-data";

const parseDisplayName = (displayName?: string | null): Pick<UserProfile, "firstName" | "lastName"> => {
  if (!displayName) {
    return { firstName: "", lastName: "" };
  }
  const [firstName, ...rest] = displayName.split(" ").filter(Boolean);
  return {
    firstName: firstName ?? "",
    lastName: rest.join(" ") ?? "",
  };
};

const withDefaults = (profile: UserProfile, data?: Partial<UserData>): UserData => {
  const now = new Date().toISOString();
  return {
    profile: data?.profile ?? profile,
    household: ensureHouseholdDefaults(data?.household ?? null),
    donations66: data?.donations66 ?? [],
    donations75: data?.donations75 ?? [],
    services: data?.services ?? [],
    energy: data?.energy ?? [],
    schooling: data?.schooling ?? [],
    createdAt: data?.createdAt ?? now,
    updatedAt: data?.updatedAt ?? now,
  };
};

export const useUserData = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["userData", user?.uid],
    enabled: Boolean(user?.uid),
    queryFn: async (): Promise<UserData> => {
      if (!user?.uid) {
        throw new Error("Utilisateur non authentifié");
      }
      const ref = doc(db, "users", user.uid);
      const snapshot = await getDoc(ref);
      const baseProfile: UserProfile = {
        email: user.email ?? "",
        ...parseDisplayName(user.displayName),
      };

      if (!snapshot.exists()) {
        const localData = readLocalUserData();
        const initial = mergeLocalDataWithProfile(baseProfile, localData);
        await setDoc(ref, initial);
        clearLocalUserData();
        return initial;
      }

      const data = snapshot.data() as Partial<UserData>;
      const mergedProfile = data.profile ?? baseProfile;
      return withDefaults({ ...baseProfile, ...mergedProfile }, data);
    },
  });

  const mutation = useMutation({
    mutationFn: async (payload: Partial<UserData>) => {
      if (!user?.uid) {
        throw new Error("Utilisateur non authentifié");
      }
      const ref = doc(db, "users", user.uid);
      const nextPayload: Partial<UserData> = {
        ...payload,
        updatedAt: new Date().toISOString(),
      };
      await setDoc(ref, nextPayload, { merge: true });
      return nextPayload;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["userData", user?.uid] });
    },
  });

  const helpers = useMemo(
    () => ({
      updateSection: async <K extends keyof UserData>(key: K, value: UserData[K]) => {
        await mutation.mutateAsync({ [key]: value } as Partial<UserData>);
      },
    }),
    [mutation]
  );

  return {
    ...query,
    updateUserData: mutation.mutateAsync,
    isUpdating: mutation.isPending,
    ...helpers,
  };
};
