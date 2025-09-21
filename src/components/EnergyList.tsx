import { EnergyExpense } from "@/types/EnergyExpense";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";

interface EnergyListProps {
  expenses: EnergyExpense[];
  onDelete: (id: string) => void | Promise<void>;
}

const EnergyList = ({ expenses, onDelete }: EnergyListProps) => {
  if (expenses.length === 0) {
    return (
      <Card>
        <CardContent className="p-4 text-sm text-muted-foreground text-center">
          Aucune dépense enregistrée pour cette année.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {expenses.map((e) => (
        <Card key={e.id}>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <CardTitle className="text-base">
                {new Date(e.date).toLocaleDateString('fr-FR')} - {e.description || (e.category === 'isolation' ? 'Travaux d\'isolation' : "Équipement économe")}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {e.category === 'isolation' ? 'Case 7AR' : 'Case 7AV'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-bold">{e.amount.toLocaleString('fr-FR')} €</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  void onDelete(e.id);
                }}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default EnergyList;

