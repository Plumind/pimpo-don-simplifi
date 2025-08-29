export interface ServiceExpense {
  id: string;
  date: string; // Format YYYY-MM-DD
  category: 'home' | 'childcare';
  nature: string;
  provider: string;
  amount: number; // Dépense totale engagée
  aids: number; // Aides perçues à déduire
  childName?: string;
  childBirthDate?: string; // Format YYYY-MM-DD
  photo?: string | null;
  createdAt: string;
}
