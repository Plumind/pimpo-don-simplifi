import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { UserData } from "@/types/UserData";
import { ensureHouseholdDefaults } from "@/lib/user-data";
import { fetchJson } from "@/lib/http";

const withDefaults = (data: UserData): UserData => {
  return {
    ...data,
    household: ensureHouseholdDefaults(data.household),
    donations66: data.donations66 ?? [],
    donations75: data.donations75 ?? [],
    services: data.services ?? [],
    energy: data.energy ?? [],
    schooling: data.schooling ?? [],
  };
};

export const useUserData = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["userData", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async (): Promise<UserData> => {
      if (!user?.id) {
        throw new Error("Utilisateur non authentifié");
      }
      const response = await fetchJson<{ data: UserData }>("/user-data");
      return withDefaults(response.data);
    },
  });

  const mutation = useMutation({
    mutationFn: async (payload: Partial<UserData>) => {
      if (!user?.id) {
        throw new Error("Utilisateur non authentifié");
      }
      const response = await fetchJson<{ data: UserData }>("/user-data", {
        method: "PATCH",
        body: {
          updates: {
            ...payload,
            updatedAt: new Date().toISOString(),
          },
        },
      });
      return withDefaults(response.data);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["userData", user?.id], data);
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
