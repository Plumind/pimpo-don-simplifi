import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Receipt as ReceiptType } from "@/types/Receipt";
import { TrendingUp, Euro, FileText } from "lucide-react";

interface DashboardProps {
  receipts: ReceiptType[];
  selectedYear: string;
}

const Dashboard = ({ receipts, selectedYear }: DashboardProps) => {
  const displayYear = selectedYear === 'all' ? 'Toutes' : selectedYear;

  const totalAmount = receipts.reduce((sum, receipt) => sum + receipt.amount, 0);
  const taxReduction = Math.round(totalAmount * 0.66);

  return (
    <div className="space-y-6">
      <div className="text-center py-6">
        <h2 className="text-3xl font-bold text-foreground mb-2">
          {displayYear === 'Toutes' ? 'Toutes années' : `Année ${displayYear}`}
        </h2>
        <p className="text-muted-foreground">
          Votre synthèse fiscale en temps réel
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dons effectués</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{receipts.length}</div>
              <p className="text-xs text-muted-foreground">
                reçu{receipts.length > 1 ? 's' : ''} {displayYear === 'Toutes' ? 'au total' : 'cette année'}
              </p>
            </CardContent>
          </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Montant total</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAmount.toLocaleString('fr-FR')} €</div>
            <p className="text-xs text-muted-foreground">
              de dons déclarables
            </p>
          </CardContent>
        </Card>

        <Card className="bg-success-light border-success/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-success">Économie d'impôt</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{taxReduction.toLocaleString('fr-FR')} €</div>
            <p className="text-xs text-success/80">
              réduction estimée (66%)
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;