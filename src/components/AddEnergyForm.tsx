import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EnergyExpense } from "@/types/EnergyExpense";

interface AddEnergyFormProps {
  onAdd: (exp: EnergyExpense) => Promise<void> | void;
  isSubmitting?: boolean;
}

const AddEnergyForm = ({ onAdd, isSubmitting }: AddEnergyFormProps) => {
  const [formData, setFormData] = useState({
    date: "",
    category: "isolation",
    description: "",
    amount: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.date || !formData.category || !formData.amount) return;
    const newExpense: EnergyExpense = {
      id: Date.now().toString(),
      date: formData.date,
      category: formData.category as 'isolation' | 'equipment',
      description: formData.description.trim(),
      amount: parseFloat(formData.amount),
      createdAt: new Date().toISOString(),
    };
    try {
      await onAdd(newExpense);
      setFormData({ date: "", category: "isolation", description: "", amount: "" });
    } catch (error) {
      console.error(error);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ajouter une dépense</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date *</Label>
            <Input id="date" type="date" value={formData.date} onChange={e => handleChange('date', e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Catégorie *</Label>
            <Select value={formData.category} onValueChange={v => handleChange('category', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="isolation">Travaux d'isolation</SelectItem>
                <SelectItem value="equipment">Équipements économes</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" value={formData.description} onChange={e => handleChange('description', e.target.value)} placeholder="ex: Isolation des combles" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Montant (€) *</Label>
            <Input id="amount" type="number" min="0" step="0.01" value={formData.amount} onChange={e => handleChange('amount', e.target.value)} required />
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddEnergyForm;

