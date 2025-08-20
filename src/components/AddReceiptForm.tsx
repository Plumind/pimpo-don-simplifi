import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Receipt as ReceiptType } from "@/types/Receipt";
import { Plus, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AddReceiptFormProps {
  onAddReceipt: (receipt: ReceiptType) => void;
}

const AddReceiptForm = ({ onAddReceipt }: AddReceiptFormProps) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: "",
    organism: "",
    amount: ""
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.date || !formData.organism || !formData.amount) {
      toast({
        title: "Champs manquants",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive"
      });
      return;
    }

    const newReceipt: ReceiptType = {
      id: Date.now().toString(),
      date: formData.date,
      organism: formData.organism.trim(),
      amount: parseFloat(formData.amount),
      createdAt: new Date().toISOString()
    };

    onAddReceipt(newReceipt);
    setFormData({ date: "", organism: "", amount: "" });
    setIsFormOpen(false);
    
    toast({
      title: "Reçu ajouté !",
      description: `Don de ${newReceipt.amount}€ à ${newReceipt.organism} enregistré.`,
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isFormOpen) {
    return (
      <Card className="border-dashed border-2 border-muted-foreground/30 hover:border-primary/50 transition-colors">
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <div className="bg-secondary rounded-full p-4 w-16 h-16 mx-auto flex items-center justify-center">
              <Camera className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Ajouter un reçu fiscal</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Photographiez votre reçu et renseignez les informations
              </p>
              <Button onClick={() => setIsFormOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Nouveau reçu
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Nouveau reçu fiscal
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="date">Date du don *</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange("date", e.target.value)}
              className="w-full"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="organism">Organisme bénéficiaire *</Label>
            <Input
              id="organism"
              type="text"
              placeholder="ex: Médecins Sans Frontières"
              value={formData.organism}
              onChange={(e) => handleInputChange("organism", e.target.value)}
              className="w-full"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Montant du don (€) *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="ex: 100"
              value={formData.amount}
              onChange={(e) => handleInputChange("amount", e.target.value)}
              className="w-full"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              Enregistrer le reçu
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsFormOpen(false)}
              className="flex-1"
            >
              Annuler
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddReceiptForm;