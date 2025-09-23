import { Household } from "@/types/Household";
import { Receipt } from "@/types/Receipt";
import { ServiceExpense } from "@/types/ServiceExpense";
import { EnergyExpense } from "@/types/EnergyExpense";
import { Student } from "@/types/Student";
import { UserData, UserProfile } from "@/types/UserData";

export const LOCAL_STORAGE_KEYS = {
  donations66: "pimpots-receipts",
  donations75: "pimpots-other-receipts",
  services: "pimpots-services",
  schooling: "pimpots-schooling",
  energy: "pimpots-energy",
  household: "pimpots-household",
} as const;

const parseJson = <T>(value: string | null): T | undefined => {
  if (!value) return undefined;
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.error("Failed to parse localStorage value", error);
    return undefined;
  }
};

export const readLocalUserData = () => {
  const donations66 = parseJson<Receipt[]>(
    localStorage.getItem(LOCAL_STORAGE_KEYS.donations66)
  );
  const donations75 = parseJson<Receipt[]>(
    localStorage.getItem(LOCAL_STORAGE_KEYS.donations75)
  );
  const services = parseJson<ServiceExpense[]>(
    localStorage.getItem(LOCAL_STORAGE_KEYS.services)
  );
  const schooling = parseJson<Student[]>(
    localStorage.getItem(LOCAL_STORAGE_KEYS.schooling)
  );
  const energy = parseJson<EnergyExpense[]>(
    localStorage.getItem(LOCAL_STORAGE_KEYS.energy)
  );
  const household = parseJson<Household>(
    localStorage.getItem(LOCAL_STORAGE_KEYS.household)
  );

  return {
    donations66,
    donations75,
    services,
    schooling,
    energy,
    household,
  };
};

export const clearLocalUserData = () => {
  Object.values(LOCAL_STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });
};

export const createInitialUserData = (
  profile: UserProfile,
  overrides: Partial<UserData> = {}
): UserData => {
  const now = new Date().toISOString();
  return {
    profile,
    household: overrides.household ?? null,
    donations66: overrides.donations66 ?? [],
    donations75: overrides.donations75 ?? [],
    services: overrides.services ?? [],
    schooling: overrides.schooling ?? [],
    energy: overrides.energy ?? [],
    createdAt: overrides.createdAt ?? now,
    updatedAt: overrides.updatedAt ?? now,
  };
};

export const ensureHouseholdDefaults = (household: Household | null) => {
  if (!household) return null;
  return {
    status: household.status ?? "marie",
    otherIncome: household.otherIncome ?? 0,
    withholdingMonthly: household.withholdingMonthly ?? 0,
    members: Array.isArray(household.members)
      ? household.members.map((member) => ({
          name: member.name ?? "",
          salary: member.salary ?? 0,
        }))
      : [],
    children: household.children ?? 0,
  } satisfies Household;
};

export const mergeLocalDataWithProfile = (
  profile: UserProfile,
  localData: ReturnType<typeof readLocalUserData>
) => {
  return createInitialUserData(profile, {
    donations66: localData.donations66 ?? [],
    donations75: localData.donations75 ?? [],
    services: localData.services ?? [],
    schooling: localData.schooling ?? [],
    energy: localData.energy ?? [],
    household: ensureHouseholdDefaults(localData.household ?? null),
  });
};
