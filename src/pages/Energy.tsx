import { useState, useEffect } from "react";
import Header from "@/components/Header";
import EnergyDashboard from "@/components/EnergyDashboard";
import { EnergyExpense, EnergyCode, energyRates, energyLabels } from "@/types/EnergyExpense";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Energy = () => {
  const [expenses, setExpenses] = useState<EnergyExpense[]>([]);
  const [date, setDate] = useState("");
  const [nature, setNature] = useState("");
  const [amount, setAmount] = useState("");
  const [code, setCode] = useState<EnergyCode>("7AR");
  const currentYear = new Date().getFullYear().toString();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  useEffect(() => {
    const stored = localStorage.getItem("pimpots-energy");
    if (stored) {
      try {
        setExpenses(JSON.parse(stored));
      } catch (e) {
        console.error("Error loading energy expenses from localStorage:", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("pimpots-energy", JSON.stringify(expenses));
  }, [expenses]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !nature || !amount) return;
    const newExp: EnergyExpense = {
      id: Date.now().toString(),
      date,
      nature,
      amount: parseFloat(amount),
      code,
      createdAt: new Date().toISOString(),
    };
    setExpenses((prev) => [...prev, newExp]);
    setDate("");
    setNature("");
    setAmount("");
  };

  const handleDelete = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const years = Array.from(new Set([...expenses.map((e) => e.date.slice(0, 4)), currentYear])).sort().reverse();
  const filtered = expenses.filter((e) => e.date.startsWith(selectedYear));

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 pb-24 space-y-8">
        <div className="text-center py-6">
          <h2 className="text-3xl font-bold text-foreground mb-2">Transition énergétique</h2>
          <p className="text-muted-foreground">Enregistrez vos travaux éligibles</p>
        </div>

        <EnergyDashboard expenses={filtered} selectedYear={selectedYear} />

        <div className="flex justify-center">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Année" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <form onSubmit={handleAdd} className="max-w-xl mx-auto grid gap-4 md:grid-cols-4 md:items-end">
          <div className="md:col-span-1">
            <Select value={code} onValueChange={(v: EnergyCode) => setCode(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Case" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(energyLabels).map(([c, label]) => (
                  <SelectItem key={c} value={c}>
                    {c} - {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Input
            type="text"
            value={nature}
            onChange={(e) => setNature(e.target.value)}
            placeholder="Nature du travail"
          />
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Montant €"
          />
          <Button type="submit" className="md:col-span-4">
            Ajouter
          </Button>
        </form>

        <div className="max-w-3xl mx-auto">
          {filtered.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th className="pb-2">Date</th>
                  <th className="pb-2">Case</th>
                  <th className="pb-2">Nature</th>
                  <th className="pb-2 text-right">Montant</th>
                  <th className="pb-2 text-right">Crédit</th>
                  <th className="pb-2"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => (
                  <tr key={e.id} className="border-t border-border">
                    <td className="py-2">{new Date(e.date).toLocaleDateString('fr-FR')}</td>
                    <td className="py-2">{e.code}</td>
                    <td className="py-2">{e.nature}</td>
                    <td className="py-2 text-right">{e.amount.toLocaleString('fr-FR')} €</td>
                    <td className="py-2 text-right">{Math.round(e.amount * energyRates[e.code]).toLocaleString('fr-FR')} €</td>
                    <td className="py-2 text-right">
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(e.id)}>
                        Supprimer
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Aucune dépense enregistrée</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Ajoutez vos travaux pour calculer le crédit d'impôt.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default Energy;
