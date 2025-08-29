export const calculateParts = (adults: number, children: number): number => {
  let parts = adults;
  if (children <= 2) {
    parts += children * 0.5;
  } else {
    parts += 1 + (children - 2);
  }
  return parts;
};

export const calculateIncomeTax = (income: number, parts: number): number => {
  const taxable = income / parts;
  const brackets = [
    { limit: 10777, rate: 0 },
    { limit: 27478, rate: 0.11 },
    { limit: 78570, rate: 0.30 },
    { limit: 168994, rate: 0.41 },
    { limit: Infinity, rate: 0.45 },
  ];
  let tax = 0;
  let prev = 0;
  for (const bracket of brackets) {
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
