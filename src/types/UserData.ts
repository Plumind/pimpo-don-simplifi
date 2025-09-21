import { Household } from "./Household";
import { Receipt } from "./Receipt";
import { ServiceExpense } from "./ServiceExpense";
import { EnergyExpense } from "./EnergyExpense";
import { Student } from "./Student";

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
}

export interface UserData {
  profile: UserProfile;
  household: Household | null;
  donations66: Receipt[];
  donations75: Receipt[];
  services: ServiceExpense[];
  energy: EnergyExpense[];
  schooling: Student[];
  createdAt: string;
  updatedAt: string;
}
