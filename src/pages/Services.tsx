import { useEffect, useMemo, useState } from "react";
import { ServiceExpense } from "@/types/ServiceExpense";
import Header from "@/components/Header";
import ServicesDashboard from "@/components/ServicesDashboard";
import AddServiceForm from "@/components/AddServiceForm";
import ServicesList from "@/components/ServicesList";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useUserData } from "@/hooks/useUserData";
import { uploadServicePhoto, removeFromStorage } from "@/lib/storage";
import { Loader2 } from "lucide-react";

interface ServiceUpdateOptions {
  file?: File | null;
  removePhoto?: boolean;
}

const Services = () => {
  const [editing, setEditing] = useState<ServiceExpense | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const currentYear = new Date().getFullYear().toString();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const { toast } = useToast();
  const { data, isLoading, updateSection, isUpdating } = useUserData();

  const servicesExpenses = data?.services;
  const expenses = useMemo(
    () => servicesExpenses ?? [],
    [servicesExpenses]
  );

  const years = useMemo(() => {
    const list = [
      ...expenses.map((r) => r.date.slice(0, 4)),
      currentYear,
    ];
    return Array.from(new Set(list)).sort().reverse();
  }, [expenses, currentYear]);

  useEffect(() => {
    if (years.length > 0 && !years.includes(selectedYear)) {
      setSelectedYear(years[0]);
    }
  }, [years, selectedYear]);

  const filtered = expenses.filter((e) => {
    const matchesYear = e.date.startsWith(selectedYear);
    const text = `${e.provider} ${e.nature}`.toLowerCase();
    const matchesSearch = text.includes(searchTerm.toLowerCase());
    return matchesYear && matchesSearch;
  });

  const handleAdd = async (
    expense: ServiceExpense,
    options?: { file?: File | null }
  ) => {
    try {
      let toSave: ServiceExpense = {
        ...expense,
        createdAt: expense.createdAt || new Date().toISOString(),
      };
      if (options?.file) {
        const { url, path } = await uploadServicePhoto(null, expense.id, options.file);
        toSave = { ...toSave, photo: url, storagePath: path };
      }
      await updateSection("services", [...expenses, toSave]);
      toast({
        title: "Dépense ajoutée",
        description: `${toSave.nature} enregistré pour ${toSave.provider}.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Erreur lors de l'ajout",
        description: "Impossible d'ajouter cette dépense.",
        variant: "destructive",
      });
    }
  };

  const handleUpdate = async (
    expense: ServiceExpense,
    options?: ServiceUpdateOptions
  ) => {
    try {
      const existing = expenses.find((e) => e.id === expense.id);
      let nextExpense = { ...expense };

      if ((options?.removePhoto || options?.file) && existing?.storagePath) {
        await removeFromStorage(existing.storagePath);
        nextExpense = { ...nextExpense, photo: null, storagePath: null };
      }

      if (options?.file) {
        const { url, path } = await uploadServicePhoto(null, expense.id, options.file);
        nextExpense = { ...nextExpense, photo: url, storagePath: path };
      }

      const nextList = expenses.map((e) => (e.id === expense.id ? nextExpense : e));
      await updateSection("services", nextList);
      setEditing(null);
      toast({
        title: "Dépense mise à jour",
        description: `${nextExpense.nature} modifiée pour ${nextExpense.provider}.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Erreur lors de la mise à jour",
        description: "Impossible de mettre à jour cette dépense.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const target = expenses.find((e) => e.id === id);
      if (target?.storagePath) {
        await removeFromStorage(target.storagePath);
      }
      await updateSection(
        "services",
        expenses.filter((e) => e.id !== id)
      );
      toast({
        title: "Dépense supprimée",
        description: "La dépense a été retirée de la liste.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Suppression impossible",
        description: "Une erreur est survenue lors de la suppression.",
        variant: "destructive",
      });
    }
  };

  const handleUploadPhoto = async (id: string, file: File) => {
    const expense = expenses.find((e) => e.id === id);
    if (!expense) return;
    await handleUpdate(expense, { file });
  };

  const handleDeletePhoto = async (id: string) => {
    const expense = expenses.find((e) => e.id === id);
    if (!expense) return;
    await handleUpdate(expense, { removePhoto: true });
  };

  const handleDownloadPDF = () => {
    if (filtered.length === 0) {
      toast({
        title: "Aucune dépense",
        description: "Aucune dépense trouvée pour l'année sélectionnée.",
        variant: "destructive",
      });
      return;
    }

    const title = `Année ${selectedYear}`;
    const net = (e: ServiceExpense) => e.amount - e.aids;
    const homeTotal = filtered.filter(e => e.category === 'home').reduce((s,e)=>s+net(e),0);
    const homeCapped = Math.min(homeTotal, 12000);
    const childMap: Record<string, {name:string; birth:string; amount:number}> = {};
    filtered.filter(e=>e.category==='childcare').forEach(e=>{
      const key = `${e.childName || ''}|${e.childBirthDate || ''}`;
      const entry = childMap[key] || {name: e.childName || '', birth: e.childBirthDate || '', amount:0};
      entry.amount += net(e);
      childMap[key]=entry;
    });
    const childTotal = Object.values(childMap).reduce((s,d)=>s+d.amount,0);
    const childTotalCapped = Object.values(childMap).reduce((s,d)=>s+Math.min(d.amount,3500),0);
    const credit = Math.round(homeCapped*0.5 + childTotalCapped*0.5);

    const childLines = Object.values(childMap)
      .map(c => `<p>${c.name} (${c.birth ? new Date(c.birth).toLocaleDateString('fr-FR') : ''}) : ${c.amount.toLocaleString('fr-FR')} €</p>`)
      .join("");

    const rows = filtered.map(e => {
      const netAmount = net(e);
      return `<tr><td>${new Date(e.date).toLocaleDateString('fr-FR')}</td><td>${e.nature}</td><td>${e.provider}</td><td>${e.amount.toLocaleString('fr-FR')} €</td><td>${e.aids.toLocaleString('fr-FR')} €</td><td>${netAmount.toLocaleString('fr-FR')} €</td></tr>`;
    }).join("");

    const photosHtml = filtered
      .filter(e => e.photo)
      .map((e,i)=>`<div class="receipt-photo"><h3>Justificatif ${i+1} - ${e.provider} (${new Date(e.date).toLocaleDateString('fr-FR')})</h3><img src="${e.photo}" alt="Justificatif ${i+1}" /></div>`)
      .join("");
    const photosSection = photosHtml ? `<div class="page-break"></div><h2>Justificatifs</h2>${photosHtml}` : "";

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`<!DOCTYPE html><html><head><title>Services à la personne ${title}</title><style>
        body{font-family:Arial,sans-serif;padding:20px;}
        table{width:100%;border-collapse:collapse;margin-top:20px;}
        th,td{border:1px solid #000;padding:8px;text-align:left;}
        h1{margin-bottom:10px;}
        h2{margin-top:40px;}
        img{max-width:100%;height:auto;margin-top:8px;}
        .receipt-photo{margin-bottom:20px;}
        @media print { .page-break { page-break-before: always; } }
      </style></head><body>
        <h1>Services à la personne ${title}</h1>
        <p><strong>Total services à domicile (case 7DB) :</strong> ${homeTotal.toLocaleString('fr-FR')} €</p>
        <p><strong>Total garde d'enfants hors domicile (case 7DF) :</strong> ${childTotal.toLocaleString('fr-FR')} €</p>
        ${childLines ? `<h2>Ventilation par enfant (cases 7GA à 7GG)</h2>${childLines}` : ''}
        <p><strong>Crédit d'impôt estimé (50%) :</strong> ${credit.toLocaleString('fr-FR')} €</p>
        <p>Document justificatif à présenter à l'administration fiscale en cas de contrôle.</p>
        <table><thead><tr><th>Date</th><th>Nature</th><th>Prestataire</th><th>Dépense</th><th>Aides</th><th>Net</th></tr></thead><tbody>${rows}</tbody></table>
        ${photosSection}
      </body></html>`);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 pb-24 space-y-8">
        <div className="text-center py-6">
          <h2 className="text-3xl font-bold text-foreground mb-2">Services à la personne</h2>
          <p className="text-muted-foreground">Suivez vos dépenses et crédits</p>
        </div>
        <ServicesDashboard expenses={filtered} selectedYear={selectedYear} />

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <Input
            placeholder="Rechercher un prestataire ou une nature"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
          <div className="flex gap-2">
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
            <Button onClick={handleDownloadPDF}>Exporter PDF</Button>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <AddServiceForm
              onAdd={handleAdd}
              initialData={editing || undefined}
              onUpdate={handleUpdate}
              onCancelEdit={() => setEditing(null)}
              isSubmitting={isUpdating}
            />
          </div>
          <div>
            <ServicesList
              expenses={filtered}
              onDelete={handleDelete}
              onEdit={(e) => setEditing(e)}
              onUploadPhoto={handleUploadPhoto}
              onDeletePhoto={handleDeletePhoto}
            />
          </div>
        </div>

        <p className="text-sm text-muted-foreground text-center">
          Il existe des majorations dans certains cas particuliers : personnes âgées/handicapées par ex. Consulter la brochure pratique de la déclaration des revenus pour plus d'informations.
        </p>
        <p className="text-sm text-muted-foreground text-center">
          L'enfant doit avoir moins de 6 ans au 1er janvier pour bénéficier du crédit d'impôt.
        </p>
      </main>
    </div>
  );
};

export default Services;
