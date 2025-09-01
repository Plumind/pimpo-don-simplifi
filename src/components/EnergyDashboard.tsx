import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EnergyExpense } from "@/types/EnergyExpense";
import { Leaf, Snowflake, Wrench } from "lucide-react";

interface EnergyDashboardProps {
  expenses: EnergyExpense[];
  selectedYear: string;
}

const EnergyDashboard = ({ expenses, selectedYear }: EnergyDashboardProps) => {
  const isolationTotal = expenses
    .filter(e => e.category === 'isolation')
    .reduce((s, e) => s + e.amount, 0);
  const equipmentTotal = expenses
    .filter(e => e.category === 'equipment')
    .reduce((s, e) => s + e.amount, 0);

  return (
    <div className="space-y-6">
      <div className="text-center py-6">
        <h2 className="text-3xl font-bold text-foreground mb-2">Synthèse transition énergétique</h2>
        <p className="text-muted-foreground">Année {selectedYear}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dépenses enregistrées</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expenses.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Isolation (7AR)</CardTitle>
            <Snowflake className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isolationTotal.toLocaleString('fr-FR')} €</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Équipements (7AV)</CardTitle>
            <Leaf className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{equipmentTotal.toLocaleString('fr-FR')} €</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EnergyDashboard;

