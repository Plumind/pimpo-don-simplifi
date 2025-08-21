import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Receipt as ReceiptType } from "@/types/Receipt";
import { Calendar, Building2, Euro } from "lucide-react";

interface ReceiptsListProps {
  receipts: ReceiptType[];
}

const ReceiptsList = ({ receipts }: ReceiptsListProps) => {
  const sortedReceipts = [...receipts].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (receipts.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Aucun reçu enregistré</h3>
            <p className="text-sm">Commencez par ajouter votre premier reçu fiscal.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mes reçus fiscaux ({receipts.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sortedReceipts.map((receipt) => (
          <div
            key={receipt.id}
            className="border border-border rounded-lg p-4 space-y-3 hover:bg-muted/30 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{receipt.organism}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(receipt.date)}</span>
                </div>
              </div>
              
              <div className="text-right space-y-2">
                <div className="flex items-center gap-1">
                  <Euro className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold text-lg">{receipt.amount.toLocaleString('fr-FR')} €</span>
                </div>
                <Badge variant="secondary" className="text-xs bg-success-light text-success">
                  -{Math.round(receipt.amount * 0.66)} € d'impôt
                </Badge>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ReceiptsList;