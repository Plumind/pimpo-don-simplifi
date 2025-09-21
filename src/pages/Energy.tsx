import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import AddEnergyForm from "@/components/AddEnergyForm";
import EnergyList from "@/components/EnergyList";
import EnergyDashboard from "@/components/EnergyDashboard";
import { EnergyExpense } from "@/types/EnergyExpense";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUserData } from "@/hooks/useUserData";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const Energy = () => {
  const currentYear = new Date().getFullYear().toString();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const { data, isLoading, updateSection, isUpdating } = useUserData();
  const { toast } = useToast();

  const energyExpenses = data?.energy;
  const expenses = useMemo(
    () => energyExpenses ?? [],
    [energyExpenses]
  );

  const years = useMemo(() => {
    const list = [
      ...expenses.map((e) => e.date.slice(0, 4)),
      currentYear,
    ];
    return Array.from(new Set(list)).sort().reverse();
  }, [expenses, currentYear]);

  useEffect(() => {
    if (years.length > 0 && !years.includes(selectedYear)) {
      setSelectedYear(years[0]);
    }
  }, [years, selectedYear]);

  const filtered = expenses.filter((e) => e.date.startsWith(selectedYear));

  const handleAdd = async (exp: EnergyExpense) => {
    try {
      const next = [...expenses, { ...exp, createdAt: exp.createdAt || new Date().toISOString() }];
      await updateSection("energy", next);
      toast({
        title: "Dépense ajoutée",
        description: `${exp.description} enregistré.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Erreur lors de l'ajout",
        description: "Impossible d'ajouter cette dépense.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await updateSection(
        "energy",
        expenses.filter((e) => e.id !== id)
      );
      toast({
        title: "Dépense supprimée",
        description: "La dépense énergétique a été retirée.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Suppression impossible",
        description: "Une erreur est survenue lors de la suppression.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

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
              {years.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <AddEnergyForm onAdd={handleAdd} isSubmitting={isUpdating} />
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
