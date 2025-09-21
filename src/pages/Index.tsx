import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import Dashboard from "@/components/Dashboard";
import ServicesDashboard from "@/components/ServicesDashboard";
import OtherDashboard from "@/components/OtherDashboard";
import { Receipt } from "@/types/Receipt";
import { ServiceExpense } from "@/types/ServiceExpense";
import { Student } from "@/types/Student";
import { Household } from "@/types/Household";
import { EnergyExpense } from "@/types/EnergyExpense";
import { calculateParts, calculateIncomeTax } from "@/lib/tax";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import EnergyDashboard from "@/components/EnergyDashboard";
import { Loader2, TrendingUp } from "lucide-react";
import { useUserData } from "@/hooks/useUserData";

const Index = () => {
  const currentYear = new Date().getFullYear().toString();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const { data, isLoading, error } = useUserData();

  const donations66 = data?.donations66;
  const donations75 = data?.donations75;
  const serviceExpenses = data?.services;
  const schoolingStudents = data?.schooling;
  const energyExpenses = data?.energy;
  const household = data?.household ?? null;

  const receipts = useMemo(
    () => donations66 ?? [],
    [donations66]
  );
  const otherReceipts = useMemo(
    () => donations75 ?? [],
    [donations75]
  );
  const expenses = useMemo(
    () => serviceExpenses ?? [],
    [serviceExpenses]
  );
  const students = useMemo(
    () => schoolingStudents ?? [],
    [schoolingStudents]
  );
  const energy = useMemo(
    () => energyExpenses ?? [],
    [energyExpenses]
  );

  const years = useMemo(() => {
    const list = [
      ...receipts.map((r) => r.date.slice(0, 4)),
      ...otherReceipts.map((r) => r.date.slice(0, 4)),
      ...expenses.map((e) => e.date.slice(0, 4)),
      ...energy.map((e) => e.date.slice(0, 4)),
      currentYear,
    ];
    return Array.from(new Set(list)).sort().reverse();
  }, [receipts, otherReceipts, expenses, energy, currentYear]);

  useEffect(() => {
    if (years.length > 0 && !years.includes(selectedYear)) {
      setSelectedYear(years[0]);
    }
  }, [years, selectedYear]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-md text-center text-destructive">
          Une erreur est survenue lors du chargement de vos données. Veuillez actualiser la page.
        </div>
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const filteredReceipts = receipts.filter((r) => r.date.startsWith(selectedYear));
  const filteredOtherReceipts = otherReceipts.filter((r) => r.date.startsWith(selectedYear));
  const filteredExpenses = expenses.filter((e) => e.date.startsWith(selectedYear));
  const filteredStudents = students;
  const filteredEnergy = energy.filter((e) => e.date.startsWith(selectedYear));

  const isolationTotal = filteredEnergy
    .filter((e) => e.category === "isolation")
    .reduce((sum, e) => sum + e.amount, 0);
  const equipmentTotal = filteredEnergy
    .filter((e) => e.category === "equipment")
    .reduce((sum, e) => sum + e.amount, 0);

  const totalDonations66 = filteredReceipts.reduce((sum, r) => sum + r.amount, 0);
  const totalDonations75 = filteredOtherReceipts.reduce((sum, r) => sum + r.amount, 0);
  const base75 = Math.min(totalDonations75, 2000);
  const excess75 = Math.max(totalDonations75 - 2000, 0);
  const totalIncome = household
    ? household.members.reduce((s, m) => s + (m.salary || 0), 0) +
      (household.otherIncome || 0)
    : 0;
  const limit20 = totalIncome * 0.2;
  const total7UF = Math.min(totalDonations66 + excess75, limit20);
  const donationCarryForward = Math.max(totalDonations66 + excess75 - limit20, 0);
  const total7UD = base75;
  const donationReduction = Math.round(total7UF * 0.66 + total7UD * 0.75);
  const schoolingTotals = filteredStudents.reduce(
    (acc, s) => {
      const map = {
        college: { amount: 61, box: "7EA" },
        lycee: { amount: 153, box: "7EC" },
        superieur: { amount: 183, box: "7EF" },
      } as const;
      const info = map[s.level];
      acc.total += info.amount;
      acc.byBox[info.box] = (acc.byBox[info.box] || 0) + info.amount;
      return acc;
    },
    { total: 0, byBox: {} as Record<string, number> }
  );

  const schoolingReduction = schoolingTotals.total;
  const energyCredit = Math.round((isolationTotal + equipmentTotal) * 0.3);
  let incomeTax = 0;
  let donationReductionApplied = 0;
  let schoolingReductionApplied = 0;
  let reductionApplied = 0;
  let serviceCredit = 0;
  let taxAfterDeductions = 0;
  let finalTax = 0;
  let totalDeductions = 0;
  let totalRefunds = 0;
  let deductionPercent = 0;
  let creditPercent = 0;
  let payPercent = 0;
  let refundPercent = 0;
  let markerPercent = 0;

  if (household) {
    const adults =
      household.status === "concubinage"
        ? 1
        : Math.max(
            1,
            household.members.filter((m) => m.name || m.salary).length
          );
    const parts = calculateParts(adults, household.children);
    incomeTax = calculateIncomeTax(totalIncome, parts);
    donationReductionApplied = Math.min(donationReduction, incomeTax);
    const afterDonations = incomeTax - donationReductionApplied;
    schoolingReductionApplied = Math.min(schoolingReduction, afterDonations);
    reductionApplied = donationReductionApplied + schoolingReductionApplied;
    taxAfterDeductions = incomeTax - reductionApplied;

    const net = (e: ServiceExpense) => e.amount - e.aids;
    const homeTotal = filteredExpenses
      .filter((e) => e.category === "home")
      .reduce((sum, e) => sum + net(e), 0);
    const homeCapped = Math.min(homeTotal, 12000);
    const childMap: Record<string, number> = {};
    filteredExpenses
      .filter((e) => e.category === "childcare")
      .forEach((e) => {
        const key = `${e.childName || ""}|${e.childBirthDate || ""}`;
        childMap[key] = (childMap[key] || 0) + net(e);
      });
    const childTotalCapped = Object.values(childMap).reduce(
      (s, amt) => s + Math.min(amt, 3500),
      0
    );
    serviceCredit = Math.round(homeCapped * 0.5 + childTotalCapped * 0.5);

    const totalCreditApplied = serviceCredit + energyCredit;
    finalTax = taxAfterDeductions - totalCreditApplied;

    totalDeductions = reductionApplied;
    totalRefunds = totalCreditApplied;
    const maxValue = Math.max(incomeTax, totalDeductions + totalRefunds);
    deductionPercent = maxValue ? (totalDeductions / maxValue) * 100 : 0;
    creditPercent = maxValue ? (totalRefunds / maxValue) * 100 : 0;
    payPercent = maxValue
      ? (Math.max(incomeTax - (totalDeductions + totalRefunds), 0) / maxValue) * 100
      : 0;
    refundPercent = maxValue
      ? (Math.max(totalDeductions + totalRefunds - incomeTax, 0) / maxValue) * 100
      : 0;
    markerPercent = maxValue ? (incomeTax / maxValue) * 100 : 0;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 pb-24 space-y-8">
        <div className="text-center py-6">
          <h2 className="text-3xl font-bold text-foreground mb-2">Aperçu global</h2>
          <p className="text-muted-foreground">Année {selectedYear}</p>
        </div>

        <div className="flex justify-center">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Année" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {household ? (
          <Card className="max-w-xl mx-auto">
            <CardHeader>
              <CardTitle>Impôt sur le revenu estimé</CardTitle>
              <CardDescription>Année {selectedYear}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-2xl font-bold">
                {incomeTax.toLocaleString("fr-FR")} €
              </div>
              <div className="text-sm text-muted-foreground">
                Réduction dons : {donationReductionApplied.toLocaleString("fr-FR")} €
              </div>
              <div className="text-sm text-muted-foreground">
                Réduction scolarité : {schoolingReductionApplied.toLocaleString("fr-FR")} €
              </div>
              <div className="text-sm text-muted-foreground">
                Crédit services à la personne : {serviceCredit.toLocaleString("fr-FR")} €
              </div>
              <div className="text-sm text-muted-foreground">
                Crédit transition énergétique : {energyCredit.toLocaleString("fr-FR")} €
              </div>
              <div className="text-sm text-muted-foreground">
                Total déductions : {totalDeductions.toLocaleString("fr-FR")} €
              </div>
              <div className="text-sm text-muted-foreground">
                Total remboursements : {totalRefunds.toLocaleString("fr-FR")} €
              </div>
              <div className="relative h-4 w-full bg-gray-200 rounded overflow-hidden">
                <div className="flex h-full">
                  <div
                    className="bg-gray-400"
                    style={{ width: `${deductionPercent}%` }}
                  />
                  <div
                    className="bg-white border"
                    style={{ width: `${creditPercent}%` }}
                  />
                  {payPercent > 0 && (
                    <div
                      className="bg-blue-500"
                      style={{ width: `${payPercent}%` }}
                    />
                  )}
                  {refundPercent > 0 && (
                    <div
                      className="bg-green-500"
                      style={{ width: `${refundPercent}%` }}
                    />
                  )}
                </div>
                <div
                  className="absolute top-0 bottom-0 border-l-2 border-black"
                  style={{ left: `${markerPercent}%` }}
                />
              </div>
              <div className="flex flex-wrap justify-between text-xs text-muted-foreground pt-1">
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-gray-400 rounded-sm" />
                  <span>Déduction</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-white border rounded-sm" />
                  <span>Crédit</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-blue-500 rounded-sm" />
                  <span>Impôt dû</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-green-500 rounded-sm" />
                  <span>Remboursement</span>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                {finalTax >= 0
                  ? `Reste à payer : ${finalTax.toLocaleString("fr-FR")} €`
                  : `Remboursement : ${Math.abs(finalTax).toLocaleString("fr-FR")} €`}
              </div>
            </CardContent>
          </Card>
        ) : (
          <p className="text-sm text-muted-foreground text-center">
            Renseignez votre foyer fiscal pour estimer votre impôt.
          </p>
        )}

        <Dashboard receipts={filteredReceipts} selectedYear={selectedYear} />
        <p className="text-sm text-muted-foreground text-center">
          Dons 66% : {total7UF.toLocaleString("fr-FR")} € → case 7UF
        </p>
        <OtherDashboard
          receipts={filteredOtherReceipts}
          selectedYear={selectedYear}
        />
        <p className="text-sm text-muted-foreground text-center">
          Dons 75% : {total7UD.toLocaleString("fr-FR")} € → case 7UD
        </p>

        <ServicesDashboard expenses={filteredExpenses} selectedYear={selectedYear} />
        <p className="text-sm text-muted-foreground text-center">
          Reportez les services à domicile en case 7DB, la garde d'enfants hors domicile en case 7DF, et les montants par enfant en cases 7GA à 7GG.
        </p>

        <EnergyDashboard expenses={filteredEnergy} selectedYear={selectedYear} />
        <p className="text-sm text-muted-foreground text-center">
          Reportez les travaux d'isolation en case 7AR et les équipements économes en case 7AV.
        </p>

        {filteredStudents.length > 0 && (
          <>
            <div className="text-center py-6">
              <h2 className="text-3xl font-bold text-foreground mb-2">
                Synthèse scolarité
              </h2>
              <p className="text-muted-foreground">Année {selectedYear}</p>
            </div>
            <Card className="max-w-xl mx-auto bg-success-light border-success/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-success">
                  Économie d'impôt
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-2xl font-bold text-success">
                  {schoolingReduction.toLocaleString("fr-FR")} €
                </div>
                <ul className="text-sm text-success/80">
                  {Object.entries(schoolingTotals.byBox).map(([box, amt]) => (
                    <li key={box}>
                      Case {box} : {amt.toLocaleString("fr-FR")} €
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <p className="text-sm text-muted-foreground text-center">
              Déduction d'impôt
            </p>
            <p className="text-sm text-muted-foreground text-center">
              Reportez les montants par enfant dans les cases 7EA, 7EC et 7EF.
            </p>
          </>
        )}
      </main>
    </div>
  );
};

export default Index;

