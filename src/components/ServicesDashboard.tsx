import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ServiceExpense } from "@/types/ServiceExpense";
import { FileText, Euro, TrendingUp, Baby } from "lucide-react";

interface ServicesDashboardProps {
  expenses: ServiceExpense[];
  selectedYear: string;
}

const ServicesDashboard = ({ expenses, selectedYear }: ServicesDashboardProps) => {
  const net = (e: ServiceExpense) => e.amount - e.aids;

  const homeTotal = expenses
    .filter(e => e.category === 'home')
    .reduce((sum, e) => sum + net(e), 0);
  const homeCapped = Math.min(homeTotal, 12000);

  const childMap: Record<string, number> = {};
  expenses
    .filter(e => e.category === 'childcare')
    .forEach(e => {
      const key = `${e.childName || ''}|${e.childBirthDate || ''}`;
      childMap[key] = (childMap[key] || 0) + net(e);
    });
  const childTotal = Object.values(childMap).reduce((s, amt) => s + amt, 0);
  const childTotalCapped = Object.values(childMap).reduce((s, amt) => s + Math.min(amt, 3500), 0);

  const credit = Math.round(homeCapped * 0.5 + childTotalCapped * 0.5);

  return (
    <div className="space-y-6">
      <div className="text-center py-6">
        <h2 className="text-3xl font-bold text-foreground mb-2">
          Année {selectedYear}
        </h2>
        <p className="text-muted-foreground">Synthèse des services à la personne</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dépenses enregistrées</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expenses.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Services à domicile (7DB)</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{homeTotal.toLocaleString('fr-FR')} €</div>
            <p className="text-xs text-muted-foreground">
              plafond 12 000 €
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Garde d'enfants (7DF)</CardTitle>
            <Baby className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{childTotal.toLocaleString('fr-FR')} €</div>
            <p className="text-xs text-muted-foreground">
              plafond 3 500 € / enfant
            </p>
          </CardContent>
        </Card>

        <Card className="bg-success-light border-success/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-success">Crédit d'impôt estimé</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{credit.toLocaleString('fr-FR')} €</div>
            <p className="text-xs text-success/80">50 % des dépenses éligibles</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ServicesDashboard;
