import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Dashboard from "@/components/Dashboard";
import ServicesDashboard from "@/components/ServicesDashboard";
import { Receipt } from "@/types/Receipt";
import { ServiceExpense } from "@/types/ServiceExpense";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Index = () => {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [expenses, setExpenses] = useState<ServiceExpense[]>([]);
  const [selectedYear, setSelectedYear] = useState("all");

  useEffect(() => {
    const storedReceipts = localStorage.getItem("pimpo-receipts");
    if (storedReceipts) {
      try {
        setReceipts(JSON.parse(storedReceipts));
      } catch (e) {
        console.error("Error loading receipts from localStorage:", e);
      }
    }

    const storedServices = localStorage.getItem("pimpo-services");
    if (storedServices) {
      try {
        setExpenses(JSON.parse(storedServices));
      } catch (e) {
        console.error("Error loading services from localStorage:", e);
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

