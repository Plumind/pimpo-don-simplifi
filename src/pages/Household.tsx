import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Household } from "@/types/Household";
import { calculateParts, calculateTmi, taxBrackets } from "@/lib/tax";
import { useToast } from "@/hooks/use-toast";

const HouseholdPage = () => {
  const { toast } = useToast();
  const [data, setData] = useState<Household>({
    status: "marie",
    members: [
      { name: "", salary: 0 },
      { name: "", salary: 0 },
    ],
    children: 0,
    otherIncome: 0,
  });

  useEffect(() => {
    const stored = localStorage.getItem("pimpots-household");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setData({ status: "marie", otherIncome: 0, ...parsed });
      } catch (e) {
        console.error("Error loading household from localStorage:", e);
      }
    }
  }, []);

  const handleChangeMember = (
    index: number,
    field: "name" | "salary",
    value: string
  ) => {
    setData((prev) => {
      const members = [...prev.members];
      const member = {
        ...members[index],
        [field]: field === "salary" ? Number(value) : value,
      };
      members[index] = member;
      return { ...prev, members };
    });
  };

  const handleSave = () => {
    localStorage.setItem("pimpots-household", JSON.stringify(data));
    toast({ title: "Foyer sauvegardé" });
  };

  const totalIncome =
    data.members.reduce((s, m) => s + (m.salary || 0), 0) +
    (data.otherIncome || 0);
  const adults =
    data.status === "concubinage"
      ? 1
      : Math.max(1, data.members.filter((m) => m.name || m.salary).length);
  const parts = calculateParts(adults, data.children);
  const tmi = calculateTmi(totalIncome, parts);
  const taxable = totalIncome / parts;
  const bracketIndex = taxBrackets.findIndex((b) => taxable <= b.limit);
  const prevLimit = bracketIndex > 0 ? taxBrackets[bracketIndex - 1].limit : 0;
  const currentBracket = taxBrackets[bracketIndex];
  const minThreshold = prevLimit * parts;
  const rawMax =
    currentBracket.limit === Infinity ? Infinity : currentBracket.limit * parts;
  const maxSlider = Number.isFinite(rawMax) ? rawMax : totalIncome * 2;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 pb-24 space-y-8">
        <div className="text-center py-6">
          <h2 className="text-3xl font-bold text-foreground mb-2">Foyer fiscal</h2>
          <p className="text-muted-foreground">Identité et revenus du foyer</p>
        </div>

        <Card className="max-w-xl mx-auto">
          <CardHeader>
            <CardTitle>Informations du foyer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.members.map((m, i) => (
              <div key={i} className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor={`name-${i}`}>{`Nom de la personne ${i + 1}`}</Label>
                  <Input
                    id={`name-${i}`}
                    placeholder="Jean Dupont"
                    value={m.name}
                    onChange={(e) => handleChangeMember(i, "name", e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`salary-${i}`}>Salaire net annuel estimé (€)</Label>
                  <Input
                    id={`salary-${i}`}
                    type="number"
                    placeholder="30000"
                    value={m.salary || ""}
                    onChange={(e) => handleChangeMember(i, "salary", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Montant net perçu sur l'année, après cotisations sociales.
                  </p>
                </div>
              </div>
            ))}
            <div className="space-y-1">
              <Label htmlFor="other-income">Autres revenus annuels (€)</Label>
              <Input
                id="other-income"
                type="number"
                placeholder="5000"
                value={data.otherIncome || ""}
                onChange={(e) =>
                  setData((prev) => ({
                    ...prev,
                    otherIncome: Number(e.target.value),
                  }))
                }
              />
              <p className="text-xs text-muted-foreground">
                Revenus locatifs, pensions, etc.
              </p>
            </div>
            <div className="space-y-1">
              <Label htmlFor="children">Nombre d'enfants à charge</Label>
              <Input
                id="children"
                type="number"
                placeholder="0"
                value={data.children}
                onChange={(e) =>
                  setData((prev) => ({ ...prev, children: Number(e.target.value) }))
                }
              />
              <p className="text-xs text-muted-foreground">
                Enfants rattachés fiscalement au foyer.
              </p>
            </div>
            <div className="space-y-2 pt-2">
              <Label>Situation familiale</Label>
              <RadioGroup
                className="flex gap-4"
                value={data.status}
                onValueChange={(val) =>
                  setData((prev) => ({ ...prev, status: val as Household["status"] }))
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="marie" id="marie" />
                  <Label htmlFor="marie">Marié</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pacse" id="pacse" />
                  <Label htmlFor="pacse">Pacsé</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="concubinage" id="concubinage" />
                  <Label htmlFor="concubinage">Concubinage</Label>
                </div>
              </RadioGroup>
              <p className="text-xs text-muted-foreground">
                Sélectionnez votre statut pour le calcul des parts fiscales.
              </p>
            </div>
            <div className="space-y-1 pt-2">
              <p>Nombre de parts : {parts}</p>
              <p>
                Revenus totaux : {totalIncome.toLocaleString("fr-FR")} €
              </p>
            </div>
            {totalIncome > 0 && (
              <div className="space-y-4 pt-4">
                <p className="text-center font-medium">
                  Taux marginal d'imposition : {(tmi * 100).toFixed(0)}%
                </p>
                <div>
                  <Slider
                    value={[Math.min(totalIncome, maxSlider)]}
                    min={minThreshold}
                    max={maxSlider}
                    step={1}
                    disabled
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>{minThreshold.toLocaleString("fr-FR")} €</span>
                    <span>
                      {Number.isFinite(rawMax)
                        ? `${rawMax.toLocaleString("fr-FR")} €`
                        : "∞"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    Revenu du foyer : {totalIncome.toLocaleString("fr-FR")} €
                  </p>
                </div>
              </div>
            )}
            <Button onClick={handleSave} className="w-full">
              Sauvegarder
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default HouseholdPage;
