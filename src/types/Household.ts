export interface HouseholdMember {
  name: string;
  salary: number; // Net annual salary
}

export interface Household {
  members: HouseholdMember[]; // Adults in the household
  children: number; // Number of dependent children
}
