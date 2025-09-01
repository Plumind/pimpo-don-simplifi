export type EnergyCode = '7AR' | '7AS' | '7AT' | '7AU' | '7AV';

export interface EnergyExpense {
  id: string;
  date: string; // Format YYYY-MM-DD
  nature: string;
  amount: number; // Montant éligible
  code: EnergyCode; // Case fiscale correspondante
  createdAt: string;
}

export const energyRates: Record<EnergyCode, number> = {
  '7AR': 0.3,
  '7AS': 0.3,
  '7AT': 0.15,
  '7AU': 0.3,
  '7AV': 0.15,
};

export const energyLabels: Record<EnergyCode, string> = {
  '7AR': 'Chaudière THPE',
  '7AS': 'Pompe à chaleur',
  '7AT': 'Isolation vitrages',
  '7AU': 'Isolation parois opaques',
  '7AV': 'Régulation chauffage',
};

export const energyCategories = Object.keys(energyRates) as EnergyCode[];
