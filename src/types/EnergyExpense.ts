export interface EnergyExpense {
  id: string;
  date: string; // Format YYYY-MM-DD
  category: 'isolation' | 'equipment';
  description: string;
  amount: number;
  createdAt: string;
}
