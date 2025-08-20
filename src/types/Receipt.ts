export interface Receipt {
  id: string;
  date: string; // Format YYYY-MM-DD
  organism: string;
  amount: number;
  createdAt: string;
}

export interface YearSummary {
  year: string;
  receipts: Receipt[];
  totalAmount: number;
  taxReduction: number; // 66% of totalAmount
}