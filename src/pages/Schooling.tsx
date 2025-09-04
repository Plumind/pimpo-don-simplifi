import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Student } from "@/types/Student";

const LEVELS = [
  { value: "college", label: "Collégien", amount: 61, box: "7EA" },
  { value: "lycee", label: "Lycéen", amount: 153, box: "7EC" },
  { value: "superieur", label: "Étudiant", amount: 183, box: "7EF" },
];

const Schooling = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [form, setForm] = useState<Omit<Student, "id">>({
    name: "",
    birthDate: "",
    level: "college",
  });

  useEffect(() => {
    const stored = localStorage.getItem("pimpots-schooling");
    if (stored) {
      try {
        setStudents(JSON.parse(stored));
      } catch (e) {
        console.error("Error loading schooling from localStorage:", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("pimpots-schooling", JSON.stringify(students));
  }, [students]);

  const addStudent = () => {
    if (!form.name || !form.birthDate) return;
    const newStudent: Student = { id: Date.now().toString(), ...form };
    setStudents((prev) => [...prev, newStudent]);
    setForm({ name: "", birthDate: "", level: "college" });
  };

  const removeStudent = (id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
  };

  const total = students.reduce((sum, s) => {
    const lvl = LEVELS.find((l) => l.value === s.level)!;
    return sum + lvl.amount;
  }, 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 pb-24 space-y-8">
        <div className="text-center py-6">
          <h2 className="text-3xl font-bold text-foreground mb-2">Scolarité</h2>
          <p className="text-muted-foreground">
            Réduction pour frais de scolarité au collège, au lycée ou en études
            supérieures
          </p>
        </div>

        <Card className="max-w-xl mx-auto">
          <CardHeader>
            <CardTitle>Ajouter un enfant</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="name">Nom</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="birthDate">Date de naissance</Label>
              <Input
                id="birthDate"
                type="date"
                value={form.birthDate}
                onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="level">Niveau</Label>
              <Select
                value={form.level}
                onValueChange={(val) =>
                  setForm({ ...form, level: val as Student["level"] })
                }
              >
                <SelectTrigger id="level">
                  <SelectValue placeholder="Niveau" />
                </SelectTrigger>
                <SelectContent>
                  {LEVELS.map((l) => (
                    <SelectItem key={l.value} value={l.value}>
                      {l.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={addStudent}>Ajouter</Button>
          </CardContent>
        </Card>

        {students.length > 0 && (
          <>
            <Card className="max-w-xl mx-auto">
              <CardHeader>
                <CardTitle>Enfants scolarisés</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {students.map((s) => {
                  const lvl = LEVELS.find((l) => l.value === s.level)!;
                  return (
                    <div key={s.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{s.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Né le {new Date(s.birthDate).toLocaleDateString("fr-FR")} – {lvl.label} (case {lvl.box})
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeStudent(s.id)}
                      >
                        Supprimer
                      </Button>
                    </div>
                  );
                })}
                <div className="font-bold">
                  Total réduction : {total.toLocaleString("fr-FR")} €
                </div>
              </CardContent>
            </Card>
            <p className="text-sm text-muted-foreground text-center">Déduction d'impôt</p>
          </>
        )}
      </main>
    </div>
  );
};

export default Schooling;
