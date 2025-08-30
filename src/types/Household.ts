export interface HouseholdMember {
  name: string;
  salary: number; // Net annual salary
}

export type MaritalStatus = "marie" | "pacse" | "concubinage";

export interface Household {
  status: MaritalStatus; // Marital situation
  members: HouseholdMember[]; // Adults in the household
  children: number; // Number of dependent children
}
