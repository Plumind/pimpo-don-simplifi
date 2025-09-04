import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ServiceExpense } from "@/types/ServiceExpense";
import { Plus, Camera, ImageOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AddServiceFormProps {
  onAdd: (expense: ServiceExpense) => void;
  initialData?: ServiceExpense;
  onUpdate?: (expense: ServiceExpense) => void;
  onCancelEdit?: () => void;
}

const AddServiceForm = ({ onAdd, initialData, onUpdate, onCancelEdit }: AddServiceFormProps) => {
  const [isFormOpen, setIsFormOpen] = useState(!!initialData);
  const [formData, setFormData] = useState({
    date: initialData?.date || "",
    category: initialData?.category || "home",
    nature: initialData?.nature || "",
    provider: initialData?.provider || "",
    amount: initialData?.amount ? initialData.amount.toString() : "",
    aids: initialData?.aids ? initialData.aids.toString() : "0",
    childName: initialData?.childName || "",
    childBirthDate: initialData?.childBirthDate || "",
  });
  const [photo, setPhoto] = useState<string | null>(initialData?.photo || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (initialData) {
      setIsFormOpen(true);
      setFormData({
        date: initialData.date,
        category: initialData.category,
        nature: initialData.nature,
        provider: initialData.provider,
        amount: initialData.amount.toString(),
        aids: initialData.aids.toString(),
        childName: initialData.childName || "",
        childBirthDate: initialData.childBirthDate || "",
      });
      setPhoto(initialData.photo || null);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.date || !formData.nature || !formData.provider || !formData.amount) {
      toast({
        title: "Champs manquants",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      });
      return;
    }

    if (formData.category === "childcare" && (!formData.childName || !formData.childBirthDate)) {
      toast({
        title: "Informations enfant manquantes",
        description: "Nom et date de naissance du ou des enfants requis pour la garde d'enfants.",
        variant: "destructive",
      });
      return;
    }

    const newExpense: ServiceExpense = {
      id: initialData?.id || Date.now().toString(),
      date: formData.date,
      category: formData.category as "home" | "childcare",
      nature: formData.nature.trim(),
      provider: formData.provider.trim(),
      amount: parseFloat(formData.amount),
      aids: parseFloat(formData.aids || "0"),
      childName: formData.category === "childcare" ? formData.childName.trim() : undefined,
      childBirthDate: formData.category === "childcare" ? formData.childBirthDate : undefined,
      photo: photo || undefined,
      createdAt: initialData?.createdAt || new Date().toISOString(),
    };

    if (initialData && onUpdate) {
      onUpdate(newExpense);
      toast({
        title: "Dépense mise à jour !",
        description: `${newExpense.nature} enregistré pour ${newExpense.provider}.`,
      });
    } else {
      onAdd(newExpense);
      toast({
        title: "Dépense ajoutée !",
        description: `${newExpense.nature} enregistré pour ${newExpense.provider}.`,
      });
    }

    setFormData({
      date: "",
      category: "home",
      nature: "",
      provider: "",
      amount: "",
      aids: "0",
      childName: "",
      childBirthDate: "",
    });
    setPhoto(null);
    setIsFormOpen(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (photo && !confirm("Remplacer la photo existante ?")) {
      e.target.value = "";
      return;
    }

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
              <h3 className="text-lg font-semibold mb-2">Ajouter une dépense</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Ajoutez une nouvelle dépense de services à la personne
              </p>
              <Button onClick={() => setIsFormOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Nouvelle dépense
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
          {initialData ? "Modifier la dépense" : "Nouvelle dépense"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="date">Date *</Label>
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
            <Label>Catégorie *</Label>
            <Select value={formData.category} onValueChange={(v) => handleInputChange("category", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="home">Service à domicile</SelectItem>
                <SelectItem value="childcare">Garde d'enfants hors domicile</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nature">Nature de la dépense *</Label>
            <Input
              id="nature"
              type="text"
              placeholder="ex: Ménage, Jardinage"
              value={formData.nature}
              onChange={(e) => handleInputChange("nature", e.target.value)}
              className="w-full"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="provider">Organisme / prestataire *</Label>
            <Input
              id="provider"
              type="text"
              placeholder="Nom du prestataire"
              value={formData.provider}
              onChange={(e) => handleInputChange("provider", e.target.value)}
              className="w-full"
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="amount">Montant (€) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => handleInputChange("amount", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="aids">Aides perçues (€)</Label>
              <Input
                id="aids"
                type="number"
                step="0.01"
                min="0"
                value={formData.aids}
                onChange={(e) => handleInputChange("aids", e.target.value)}
              />
            </div>
          </div>

          {formData.category === "childcare" && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="childName">Nom du ou des enfants *</Label>
                <Input
                  id="childName"
                  type="text"
                  value={formData.childName}
                  onChange={(e) => handleInputChange("childName", e.target.value)}
                  required={formData.category === "childcare"}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="childBirthDate">Date de naissance *</Label>
                <Input
                  id="childBirthDate"
                  type="date"
                  value={formData.childBirthDate}
                  onChange={(e) => handleInputChange("childBirthDate", e.target.value)}
                  required={formData.category === "childcare"}
                />
              </div>
              <p className="text-xs text-muted-foreground md:col-span-2">
                L'enfant doit avoir moins de 6 ans au 1er janvier pour bénéficier du crédit d'impôt.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label>Justificatif</Label>
            <div className="flex items-center gap-2">
              {photo && (
                <img src={photo} alt="Justificatif" className="h-20 w-20 object-cover rounded" />
              )}
              <Button
                type="button"
                variant="outline"
                className="gap-2"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="h-4 w-4" />
                {photo ? "Remplacer" : "Ajouter"}
              </Button>
              {photo && (
                <Button type="button" variant="ghost" onClick={() => setPhoto(null)}>
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
              {initialData ? "Mettre à jour" : "Enregistrer"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsFormOpen(false);
                setFormData({
                  date: "",
                  category: "home",
                  nature: "",
                  provider: "",
                  amount: "",
                  aids: "0",
                  childName: "",
                  childBirthDate: "",
                });
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

export default AddServiceForm;
