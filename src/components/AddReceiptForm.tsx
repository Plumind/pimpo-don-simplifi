import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Receipt as ReceiptType } from "@/types/Receipt";
import { Plus, Camera, ImageOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AddReceiptFormProps {
  onAddReceipt: (receipt: ReceiptType) => void;
  initialData?: ReceiptType;
  onUpdateReceipt?: (receipt: ReceiptType) => void;
  onCancelEdit?: () => void;
}

const AddReceiptForm = ({ onAddReceipt, initialData, onUpdateReceipt, onCancelEdit }: AddReceiptFormProps) => {
  const [isFormOpen, setIsFormOpen] = useState(!!initialData);
  const [formData, setFormData] = useState({
    date: initialData?.date || "",
    organism: initialData?.organism || "",
    amount: initialData?.amount ? initialData.amount.toString() : "",
  });
  const [photo, setPhoto] = useState<string | null>(initialData?.photo || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (initialData) {
      setIsFormOpen(true);
      setFormData({
        date: initialData.date,
        organism: initialData.organism,
        amount: initialData.amount.toString(),
      });
      setPhoto(initialData.photo || null);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.date || !formData.organism || !formData.amount) {
      toast({
        title: "Champs manquants",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      });
      return;
    }

    const newReceipt: ReceiptType = {
      id: initialData?.id || Date.now().toString(),
      date: formData.date,
      organism: formData.organism.trim(),
      amount: parseFloat(formData.amount),
      photo: photo || undefined,
      createdAt: initialData?.createdAt || new Date().toISOString(),
    };

    if (initialData && onUpdateReceipt) {
      onUpdateReceipt(newReceipt);
      toast({
        title: "Reçu mis à jour !",
        description: `Don de ${newReceipt.amount}€ à ${newReceipt.organism} modifié.`,
      });
    } else {
      onAddReceipt(newReceipt);
      toast({
        title: "Reçu ajouté !",
        description: `Don de ${newReceipt.amount}€ à ${newReceipt.organism} enregistré.`,
      });
    }
    setFormData({ date: "", organism: "", amount: "" });
    setPhoto(null);
    setIsFormOpen(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhoto(reader.result as string);
    };
    reader.readAsDataURL(file);
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
          {initialData ? "Modifier le reçu fiscal" : "Nouveau reçu fiscal"}
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

          <div className="space-y-2">
            <Label>Photo du reçu</Label>
            <div className="flex items-center gap-2">
              {photo && (
                <img
                  src={photo}
                  alt="Reçu"
                  className="h-20 w-20 object-cover rounded"
                />
              )}
              <Button
                type="button"
                variant="outline"
                className="gap-2"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="h-4 w-4" />
                {photo ? "Remplacer la photo" : "Prendre une photo"}
              </Button>
              {photo && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setPhoto(null)}
                >
                  <ImageOff className="h-4 w-4" />
                </Button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handlePhotoChange}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              {initialData ? "Mettre à jour" : "Enregistrer le reçu"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsFormOpen(false);
                setFormData({ date: "", organism: "", amount: "" });
                setPhoto(null);
                if (initialData && onCancelEdit) onCancelEdit();
              }}
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
