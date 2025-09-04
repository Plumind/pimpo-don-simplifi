import { useEffect, useState } from "react";
import Header from "@/components/Header";
import AddEnergyForm from "@/components/AddEnergyForm";
import EnergyList from "@/components/EnergyList";
import EnergyDashboard from "@/components/EnergyDashboard";
import { EnergyExpense } from "@/types/EnergyExpense";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Energy = () => {
  const [expenses, setExpenses] = useState<EnergyExpense[]>([]);
  const currentYear = new Date().getFullYear().toString();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  useEffect(() => {
    const stored = localStorage.getItem('pimpots-energy');
    if (stored) {
      try {
        setExpenses(JSON.parse(stored));
      } catch (e) {
        console.error('Error loading energy expenses from localStorage:', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('pimpots-energy', JSON.stringify(expenses));
  }, [expenses]);

  const years = Array.from(new Set([...expenses.map(e => e.date.slice(0,4)), currentYear])).sort().reverse();

  const filtered = expenses.filter(e => e.date.startsWith(selectedYear));

  const handleAdd = (exp: EnergyExpense) => setExpenses(prev => [...prev, exp]);
  const handleDelete = (id: string) => setExpenses(prev => prev.filter(e => e.id !== id));

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 pb-24 space-y-8">
        <div className="text-center py-6">
          <h2 className="text-3xl font-bold text-foreground mb-2">Transition énergétique</h2>
          <p className="text-muted-foreground">Suivez vos dépenses (cases 7AR à 7AV)</p>
        </div>

        <EnergyDashboard expenses={filtered} selectedYear={selectedYear} />

        <div className="flex justify-center">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Année" />
            </SelectTrigger>
            <SelectContent>
              {years.map(year => (
                <SelectItem key={year} value={year}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <AddEnergyForm onAdd={handleAdd} />
          <EnergyList expenses={filtered} onDelete={handleDelete} />
        </div>

        <p className="text-sm text-muted-foreground text-center">
          Reportez les travaux d'isolation en case 7AR et les équipements économes en case 7AV.
        </p>
        <p className="text-sm text-muted-foreground text-center">
          Le crédit d'impôt « CITE » a évolué ; certains travaux ne sont plus déclarables via 7AR/7AV. Consulter la brochure pratique de la déclaration des revenus pour plus d'informations.
        </p>
      </main>
    </div>
  );
};

export default Energy;

