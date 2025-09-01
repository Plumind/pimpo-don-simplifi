import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EnergyExpense, energyRates, energyCategories } from "@/types/EnergyExpense";
import { TrendingUp } from "lucide-react";

interface EnergyDashboardProps {
  expenses: EnergyExpense[];
  selectedYear: string;
}

const EnergyDashboard = ({ expenses, selectedYear }: EnergyDashboardProps) => {
  const totals = energyCategories.map((code) => {
    const amount = expenses
      .filter((e) => e.code === code)
      .reduce((s, e) => s + e.amount, 0);
    const credit = Math.round(amount * energyRates[code]);
    return { code, amount, credit };
  });
  const totalCredit = totals.reduce((s, t) => s + t.credit, 0);

  return (
    <div className="space-y-6">
      <div className="text-center py-6">
        <h2 className="text-3xl font-bold text-foreground mb-2">Année {selectedYear}</h2>
        <p className="text-muted-foreground">Synthèse des travaux énergie</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {totals.map((t) => (
          <Card key={t.code}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.code}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{t.amount.toLocaleString('fr-FR')} €</div>
              <p className="text-xs text-muted-foreground">
                Crédit {Math.round(energyRates[t.code] * 100)}% : {t.credit.toLocaleString('fr-FR')} €
              </p>
            </CardContent>
          </Card>
        ))}
        <Card className="bg-success-light border-success/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-success">Crédit d'impôt total</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{totalCredit.toLocaleString('fr-FR')} €</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EnergyDashboard;
