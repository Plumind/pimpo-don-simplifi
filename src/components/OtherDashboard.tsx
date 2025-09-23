import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Receipt as ReceiptType } from "@/types/Receipt";
import { TrendingUp, Euro, FileText } from "lucide-react";

interface DashboardProps {
  receipts: ReceiptType[];
  selectedYear: string;
  appliedReduction?: number;
}

const OtherDashboard = ({ receipts, selectedYear, appliedReduction }: DashboardProps) => {
  const totalAmount = receipts.reduce((sum, receipt) => sum + receipt.amount, 0);
  const base75 = Math.min(totalAmount, 2000);
  const base66 = Math.max(totalAmount - 2000, 0);
  const estimatedReduction = Math.round(base75 * 0.75 + base66 * 0.66);
  const effectiveReduction = Math.min(
    appliedReduction ?? estimatedReduction,
    estimatedReduction
  );
  const isCapped =
    appliedReduction !== undefined && effectiveReduction < estimatedReduction;
  const reductionLabel = isCapped
    ? "réduction plafonnée par l'impôt dû"
    : "réduction estimée (75% jusqu'à 2 000 €)";

  return (
    <div className="space-y-6">
      <div className="text-center py-6">
        <h2 className="text-3xl font-bold text-foreground mb-2">
          Synthèse des dons 75%
        </h2>
        <p className="text-muted-foreground">Année {selectedYear}</p>
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
              reçu{receipts.length > 1 ? 's' : ''} cette année
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
            <CardTitle className="text-sm font-medium text-success">
              Économie d'impôt
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {effectiveReduction.toLocaleString('fr-FR')} €
            </div>
            <p className="text-xs text-success/80">
              {reductionLabel}
              {isCapped
                ? ` (estimation : ${estimatedReduction.toLocaleString('fr-FR')} €)`
                : null}
            </p>
          </CardContent>
        </Card>
      </div>
      <p className="text-center text-sm text-muted-foreground">Déduction d'impôt</p>
    </div>
  );
};

export default OtherDashboard;
