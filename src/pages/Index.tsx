import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Dashboard from "@/components/Dashboard";
import ServicesDashboard from "@/components/ServicesDashboard";
import { Receipt } from "@/types/Receipt";
import { ServiceExpense } from "@/types/ServiceExpense";
import { Household } from "@/types/Household";
import { calculateParts, calculateIncomeTax } from "@/lib/tax";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [expenses, setExpenses] = useState<ServiceExpense[]>([]);
  const [selectedYear, setSelectedYear] = useState("all");
  const [household, setHousehold] = useState<Household | null>(null);

  useEffect(() => {
    const storedReceipts = localStorage.getItem("pimpots-receipts");
    if (storedReceipts) {
      try {
        setReceipts(JSON.parse(storedReceipts));
      } catch (e) {
        console.error("Error loading receipts from localStorage:", e);
      }
    }

    const storedServices = localStorage.getItem("pimpots-services");
    if (storedServices) {
      try {
        setExpenses(JSON.parse(storedServices));
      } catch (e) {
        console.error("Error loading services from localStorage:", e);
      }
    }

    const storedHousehold = localStorage.getItem("pimpots-household");
    if (storedHousehold) {
      try {
        setHousehold(JSON.parse(storedHousehold));
      } catch (e) {
        console.error("Error loading household from localStorage:", e);
      }
    }
  }, []);

  const years = Array.from(
    new Set([
      ...receipts.map((r) => r.date.slice(0, 4)),
      ...expenses.map((e) => e.date.slice(0, 4)),
    ])
  )
    .sort()
    .reverse();

  const filteredReceipts = receipts.filter(
    (r) => selectedYear === "all" || r.date.startsWith(selectedYear)
  );
  const filteredExpenses = expenses.filter(
    (e) => selectedYear === "all" || e.date.startsWith(selectedYear)
  );

  const totalDonations = filteredReceipts.reduce((sum, r) => sum + r.amount, 0);
  const donationReduction = Math.round(totalDonations * 0.66);

  let incomeTax = 0;
  let reductionApplied = 0;
  let taxAfter = 0;
  let reductionPercent = 0;
  let remainingPercent = 100;

  if (household) {
    const adults = Math.max(
      1,
      household.members.filter((m) => m.name || m.salary).length
    );
    const totalIncome = household.members.reduce((s, m) => s + (m.salary || 0), 0);
    const parts = calculateParts(adults, household.children);
    incomeTax = calculateIncomeTax(totalIncome, parts);
    reductionApplied = Math.min(donationReduction, incomeTax);
    taxAfter = incomeTax - reductionApplied;
    reductionPercent = incomeTax ? (reductionApplied / incomeTax) * 100 : 0;
    remainingPercent = 100 - reductionPercent;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="text-center py-6">
          <h2 className="text-3xl font-bold text-foreground mb-2">Aperçu global</h2>
          <p className="text-muted-foreground">
            Synthèse des dons 66% et des services à la personne
          </p>
        </div>

        <div className="flex justify-center">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Année" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes</SelectItem>
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
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-2xl font-bold">
                {incomeTax.toLocaleString("fr-FR")} €
              </div>
              <div className="text-sm text-muted-foreground">
                Réduction par dons : {reductionApplied.toLocaleString("fr-FR")} €
              </div>
              <div className="h-4 w-full bg-secondary rounded overflow-hidden flex">
                <div
                  className="bg-success"
                  style={{ width: `${reductionPercent}%` }}
                />
                <div
                  className="bg-primary"
                  style={{ width: `${remainingPercent}%` }}
                />
              </div>
              <div className="text-sm text-muted-foreground">
                Reste à payer : {taxAfter.toLocaleString("fr-FR")} €
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
          Le montant total des dons de l'année est à déclarer en case 7UF.
        </p>

        <ServicesDashboard expenses={filteredExpenses} selectedYear={selectedYear} />
        <p className="text-sm text-muted-foreground text-center">
          Reportez les services à domicile en case 7DB, la garde d'enfants hors domicile en case 7DF, et les montants par enfant en cases 7GA à 7GG.
        </p>
      </main>
    </div>
  );
};

export default Index;

