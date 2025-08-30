import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Household } from "@/types/Household";
import { useToast } from "@/hooks/use-toast";

const HouseholdPage = () => {
  const { toast } = useToast();
  const [data, setData] = useState<Household>({
    members: [
      { name: "", salary: 0 },
      { name: "", salary: 0 },
    ],
    children: 0,
  });

  useEffect(() => {
    const stored = localStorage.getItem("pimpots-household");
    if (stored) {
      try {
        setData(JSON.parse(stored));
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 space-y-8">
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
              <div key={i} className="grid gap-2 md:grid-cols-2">
                <Input
                  placeholder={`Nom de la personne ${i + 1}`}
                  value={m.name}
                  onChange={(e) => handleChangeMember(i, "name", e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Salaire net annuel (€)"
                  value={m.salary || ""}
                  onChange={(e) => handleChangeMember(i, "salary", e.target.value)}
                />
              </div>
            ))}
            <Input
              type="number"
              placeholder="Nombre d'enfants à charge"
              value={data.children}
              onChange={(e) =>
                setData((prev) => ({ ...prev, children: Number(e.target.value) }))
              }
            />
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
