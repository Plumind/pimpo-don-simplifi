import { UserProfile } from "@/types/UserData";

export const ONBOARDING_PROFILE_STORAGE_KEY = "pimpots-onboarding-profile" as const;

export type OnboardingProfile = Pick<UserProfile, "firstName" | "lastName" | "email">;

const safeParse = (value: string | null): OnboardingProfile | null => {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as Partial<OnboardingProfile>;
    if (
      typeof parsed?.firstName === "string" &&
      typeof parsed?.lastName === "string" &&
      typeof parsed?.email === "string"
    ) {
      return {
        firstName: parsed.firstName,
        lastName: parsed.lastName,
        email: parsed.email,
      };
    }
    return null;
  } catch (error) {
    console.error("Failed to parse onboarding profile", error);
    return null;
  }
};

export const readOnboardingProfile = (): OnboardingProfile | null => {
  if (typeof window === "undefined") return null;
  return safeParse(localStorage.getItem(ONBOARDING_PROFILE_STORAGE_KEY));
};

export const saveOnboardingProfile = async (profile: OnboardingProfile) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(ONBOARDING_PROFILE_STORAGE_KEY, JSON.stringify(profile));
};

export const clearOnboardingProfile = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ONBOARDING_PROFILE_STORAGE_KEY);
};
