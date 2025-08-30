import { useState, useEffect } from "react";
import { ServiceExpense } from "@/types/ServiceExpense";
import Header from "@/components/Header";
import ServicesDashboard from "@/components/ServicesDashboard";
import AddServiceForm from "@/components/AddServiceForm";
import ServicesList from "@/components/ServicesList";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const Services = () => {
  const [expenses, setExpenses] = useState<ServiceExpense[]>([]);
  const [editing, setEditing] = useState<ServiceExpense | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    const stored = localStorage.getItem('pimpots-services');
    if (stored) {
      try {
        setExpenses(JSON.parse(stored));
      } catch (e) {
        console.error('Error loading services from localStorage:', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('pimpots-services', JSON.stringify(expenses));
  }, [expenses]);

  const handleAdd = (exp: ServiceExpense) => setExpenses(prev => [...prev, exp]);
  const handleUpdate = (exp: ServiceExpense) => {
    setExpenses(prev => prev.map(e => e.id === exp.id ? exp : e));
    setEditing(null);
  };
  const handleDelete = (id: string) => setExpenses(prev => prev.filter(e => e.id !== id));
  const handleUpdatePhoto = (id: string, photo: string | null) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, photo: photo || undefined } : e));
  };

  const years = Array.from(new Set(expenses.map(r => r.date.slice(0,4)))).sort().reverse();

  const filtered = expenses.filter((e) => {
    const matchesYear = selectedYear === "all" || e.date.startsWith(selectedYear);
    const text = `${e.provider} ${e.nature}`.toLowerCase();
    const matchesSearch = text.includes(searchTerm.toLowerCase());
    return matchesYear && matchesSearch;
  });

  const handleDownloadPDF = () => {
    if (filtered.length === 0) {
      toast({
        title: "Aucune dépense",
        description: "Aucune dépense trouvée pour l'année sélectionnée.",
        variant: "destructive",
      });
      return;
    }

    const title = selectedYear === "all" ? "Toutes années" : `Année ${selectedYear}`;
    const net = (e: ServiceExpense) => e.amount - e.aids;
    const homeTotal = filtered.filter(e => e.category === 'home').reduce((s,e)=>s+net(e),0);
    const homeCapped = Math.min(homeTotal, 12000);
    const childMap: Record<string, {name:string; birth:string; amount:number}> = {};
    filtered.filter(e=>e.category==='childcare').forEach(e=>{
      const key = `${e.childName||''}|${e.childBirthDate||''}`;
      const entry = childMap[key] || {name: e.childName||'', birth: e.childBirthDate||'', amount:0};
      entry.amount += net(e);
      childMap[key]=entry;
    });
    const childTotal = Object.values(childMap).reduce((s,d)=>s+d.amount,0);
    const childTotalCapped = Object.values(childMap).reduce((s,d)=>s+Math.min(d.amount,3500),0);
    const credit = Math.round(homeCapped*0.5 + childTotalCapped*0.5);

    const childLines = Object.values(childMap)
      .map(c => `<p>${c.name} (${new Date(c.birth).toLocaleDateString('fr-FR')}) : ${c.amount.toLocaleString('fr-FR')} €</p>`)
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
                <SelectItem value="all">Toutes</SelectItem>
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
            />
          </div>
          <div>
            <ServicesList
              expenses={filtered}
              onDelete={handleDelete}
              onEdit={(e) => setEditing(e)}
              onUpdatePhoto={handleUpdatePhoto}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Services;
