export const calculateParts = (adults: number, children: number): number => {
  let parts = adults;
  if (children <= 2) {
    parts += children * 0.5;
  } else {
    parts += 1 + (children - 2);
  }
  return parts;
};

export interface TaxBracket {
  limit: number;
  rate: number;
}

export const taxBrackets: TaxBracket[] = [
  // Barème de l'impôt sur le revenu 2025
  { limit: 11848, rate: 0 },
  { limit: 30208, rate: 0.11 },
  { limit: 86376, rate: 0.3 },
  { limit: 185784, rate: 0.41 },
  { limit: Infinity, rate: 0.45 },
];

export const calculateIncomeTax = (income: number, parts: number): number => {
  const taxable = income / parts;
  let tax = 0;
  let prev = 0;
  for (const bracket of taxBrackets) {
    if (taxable > bracket.limit) {
      tax += (bracket.limit - prev) * bracket.rate;
      prev = bracket.limit;
    } else {
      tax += (taxable - prev) * bracket.rate;
      break;
    }
  }
  return Math.round(tax * parts);
};

export const calculateTmi = (income: number, parts: number): number => {
  const taxable = income / parts;
  const bracket = taxBrackets.find((b) => taxable <= b.limit);
  return bracket ? bracket.rate : taxBrackets[taxBrackets.length - 1].rate;
};
