export interface DonationCalculationInput {
  donations66: number;
  donations75: number;
  totalIncome: number;
  incomeTax: number;
}

export interface DonationCalculationResult {
  total7UF: number;
  total7UD: number;
  donation66Estimated: number;
  donation75Estimated: number;
  donation66Applied: number;
  donation75Applied: number;
  donationReductionEstimated: number;
  donationReductionApplied: number;
  carryForward: number;
  limit20: number;
}

export const calculateDonationBenefits = ({
  donations66,
  donations75,
  totalIncome,
  incomeTax,
}: DonationCalculationInput): DonationCalculationResult => {
  const safeIncomeTax = Math.max(incomeTax, 0);
  const limit20 = Math.max(totalIncome * 0.2, 0);
  const capped75 = Math.min(Math.max(donations75, 0), 2000);
  const excess75 = Math.max(donations75 - 2000, 0);
  const eligible66Base = Math.max(donations66 + excess75, 0);
  const total7UF = Math.min(eligible66Base, limit20);
  const total7UD = capped75;
  const carryForward = Math.max(eligible66Base - limit20, 0);

  const donation66Estimated = Math.round(total7UF * 0.66);
  const donation75Estimated = Math.round(total7UD * 0.75);

  const donation75Applied = Math.min(donation75Estimated, safeIncomeTax);
  const remainingAfter75 = Math.max(safeIncomeTax - donation75Applied, 0);
  const donation66Applied = Math.min(donation66Estimated, remainingAfter75);

  return {
    total7UF,
    total7UD,
    donation66Estimated,
    donation75Estimated,
    donation66Applied,
    donation75Applied,
    donationReductionEstimated: donation66Estimated + donation75Estimated,
    donationReductionApplied: donation66Applied + donation75Applied,
    carryForward,
    limit20,
  };
};
