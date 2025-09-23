export interface Profile {
  firstName: string;
  lastName: string;
  email: string;
}

export interface HouseholdMember {
  name: string;
  salary: number;
}

export interface Household {
  status: string;
  members: HouseholdMember[];
  children: number;
  otherIncome: number;
  withholdingMonthly: number;
}

export interface UserData {
  profile: Profile;
  household: Household | null;
  donations66: unknown[];
  donations75: unknown[];
  services: unknown[];
  energy: unknown[];
  schooling: unknown[];
  createdAt: string;
  updatedAt: string;
}

const sanitizeProfile = (base: Profile, next?: Partial<Profile> | null): Profile => ({
  firstName: typeof next?.firstName === "string" ? next.firstName : base.firstName,
  lastName: typeof next?.lastName === "string" ? next.lastName : base.lastName,
  email: base.email,
});

const ensureArray = <T>(value: unknown, fallback: T[]): T[] => {
  return Array.isArray(value) ? (value as T[]) : fallback;
};

const ensureHousehold = (value: unknown): Household | null => {
  if (!value || typeof value !== "object") {
    return null;
  }
  const input = value as Partial<Household> & { members?: unknown };
  const members = Array.isArray(input.members)
    ? input.members.map((member) => {
        if (!member || typeof member !== "object") {
          return { name: "", salary: 0 };
        }
        const m = member as { name?: unknown; salary?: unknown };
        return {
          name: typeof m.name === "string" ? m.name : "",
          salary: typeof m.salary === "number" ? m.salary : 0,
        };
      })
    : [];

  return {
    status: typeof input.status === "string" ? input.status : "marie",
    members,
    children: typeof input.children === "number" ? input.children : 0,
    otherIncome: typeof input.otherIncome === "number" ? input.otherIncome : 0,
    withholdingMonthly:
      typeof input.withholdingMonthly === "number" ? input.withholdingMonthly : 0,
  };
};

const nowIso = () => new Date().toISOString();

export const createInitialUserData = (
  profile: Profile,
  overrides: Partial<UserData> = {}
): UserData => {
  const now = nowIso();
  const baseProfile = sanitizeProfile(profile, overrides.profile);

  return {
    profile: baseProfile,
    household: overrides.household !== undefined ? ensureHousehold(overrides.household) : null,
    donations66: ensureArray(overrides.donations66, []),
    donations75: ensureArray(overrides.donations75, []),
    services: ensureArray(overrides.services, []),
    energy: ensureArray(overrides.energy, []),
    schooling: ensureArray(overrides.schooling, []),
    createdAt: typeof overrides.createdAt === "string" ? overrides.createdAt : now,
    updatedAt: typeof overrides.updatedAt === "string" ? overrides.updatedAt : now,
  };
};

export const mergeUserData = (existing: UserData, updates: Partial<UserData>): UserData => {
  const now = nowIso();
  const nextProfile = sanitizeProfile(existing.profile, updates.profile);
  const hasHousehold = Object.prototype.hasOwnProperty.call(updates, "household");
  const hasDonations66 = Object.prototype.hasOwnProperty.call(updates, "donations66");
  const hasDonations75 = Object.prototype.hasOwnProperty.call(updates, "donations75");
  const hasServices = Object.prototype.hasOwnProperty.call(updates, "services");
  const hasEnergy = Object.prototype.hasOwnProperty.call(updates, "energy");
  const hasSchooling = Object.prototype.hasOwnProperty.call(updates, "schooling");

  return {
    profile: nextProfile,
    household: hasHousehold ? ensureHousehold(updates.household ?? null) : existing.household,
    donations66: hasDonations66 ? ensureArray(updates.donations66, []) : existing.donations66,
    donations75: hasDonations75 ? ensureArray(updates.donations75, []) : existing.donations75,
    services: hasServices ? ensureArray(updates.services, []) : existing.services,
    energy: hasEnergy ? ensureArray(updates.energy, []) : existing.energy,
    schooling: hasSchooling ? ensureArray(updates.schooling, []) : existing.schooling,
    createdAt: existing.createdAt,
    updatedAt: typeof updates.updatedAt === "string" ? updates.updatedAt : now,
  };
};

export const normalizeUserData = (profile: Profile, data?: Partial<UserData> | null): UserData => {
  if (!data) {
    return createInitialUserData(profile);
  }
  return mergeUserData(createInitialUserData(profile, data), data);
};
