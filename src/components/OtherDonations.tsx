import { useState, useEffect } from "react";
import { Receipt as ReceiptType } from "@/types/Receipt";
import OtherDashboard from "@/components/OtherDashboard";
import AddReceiptForm from "@/components/AddReceiptForm";
import ReceiptsList from "@/components/ReceiptsList";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const OtherDonations = () => {
  const [receipts, setReceipts] = useState<ReceiptType[]>([]);
  const [editingReceipt, setEditingReceipt] = useState<ReceiptType | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const currentYear = new Date().getFullYear().toString();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const { toast } = useToast();

  useEffect(() => {
    const storedReceipts = localStorage.getItem('pimpots-other-receipts');
    if (storedReceipts) {
      try {
        setReceipts(JSON.parse(storedReceipts));
      } catch (error) {
        console.error('Error loading receipts from localStorage:', error);
      }
    } else {
      const sampleReceipts: ReceiptType[] = [
        {
          id: "1",
          date: "2024-12-01",
          organism: "Secours populaire",
          amount: 50,
          createdAt: new Date().toISOString()
        },
        {
          id: "2",
          date: "2024-11-10",
          organism: "Secours Catholique",
          amount: 120,
          createdAt: new Date().toISOString()
        }
      ];
      setReceipts(sampleReceipts);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('pimpots-other-receipts', JSON.stringify(receipts));
  }, [receipts]);

  const handleAddReceipt = (newReceipt: ReceiptType) => {
    setReceipts(prev => [...prev, newReceipt]);
  };

  const handleUpdateReceipt = (updated: ReceiptType) => {
    setReceipts(prev => prev.map(r => (r.id === updated.id ? updated : r)));
    setEditingReceipt(null);
  };

  const handleDeleteReceipt = (id: string) => {
    setReceipts(prev => prev.filter(r => r.id !== id));
  };

  const handleUpdateReceiptPhoto = (id: string, photo: string | null) => {
    setReceipts(prev => prev.map(r => (r.id === id ? { ...r, photo: photo || undefined } : r)));
  };

  const years = Array.from(new Set([...receipts.map(r => r.date.slice(0, 4)), currentYear])).sort().reverse();

  const filteredReceipts = receipts.filter((r) => {
    const matchesYear = r.date.startsWith(selectedYear);
    const matchesSearch = r.organism.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesYear && matchesSearch;
  });

  const calculateTaxReductions = (list: ReceiptType[]) => {
    let remaining = 2000;
    const reductions: Record<string, number> = {};
    const chronological = [...list].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    chronological.forEach((r) => {
      const amount75 = Math.min(r.amount, remaining);
      const amount66 = r.amount - amount75;
      reductions[r.id] = Math.round(amount75 * 0.75 + amount66 * 0.66);
      remaining -= amount75;
    });
    return reductions;
  };

  const taxReductions = calculateTaxReductions(filteredReceipts);

  const handleDownloadPDF = () => {
    if (filteredReceipts.length === 0) {
      toast({
        title: "Aucun reçu",
        description: "Aucun reçu trouvé pour l'année sélectionnée.",
        variant: "destructive",
      });
      return;
    }

    const title = `Année ${selectedYear}`;
    const totalAmount = filteredReceipts.reduce((sum, r) => sum + r.amount, 0);
    const base75 = Math.min(totalAmount, 2000);
    const base66 = Math.max(totalAmount - 2000, 0);
    const taxReduction = Math.round(base75 * 0.75 + base66 * 0.66);

    const rows = filteredReceipts
      .map(
        (r) =>
          `<tr><td>${new Date(r.date).toLocaleDateString('fr-FR')}</td><td>${r.organism}</td><td>${r.amount.toLocaleString('fr-FR')} €</td></tr>`
      )
      .join("");

    const photosHtml = filteredReceipts
      .filter((r) => r.photo)
      .map(
        (r, i) =>
          `<div class="receipt-photo"><h3>Reçu ${i + 1} - ${r.organism} (${new Date(r.date).toLocaleDateString('fr-FR')})</h3><img src="${r.photo}" alt="Reçu ${i + 1}" /></div>`
      )
      .join("");

    const photosSection = photosHtml
      ? `<div class="page-break"></div><h2>Photos des reçus fiscaux</h2>${photosHtml}`
      : "";

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`<!DOCTYPE html><html><head><title>Reçus fiscaux ${title}</title><style>
        body{font-family:Arial,sans-serif;padding:20px;}
        table{width:100%;border-collapse:collapse;margin-top:20px;}
        th,td{border:1px solid #000;padding:8px;text-align:left;}
        h1{margin-bottom:10px;}
        h2{margin-top:40px;}
        img{max-width:100%;height:auto;margin-top:8px;}
        .receipt-photo{margin-bottom:20px;}
        @media print { .page-break { page-break-before: always; } }
      </style></head><body>
        <h1>Reçus fiscaux ${title}</h1>
        <p><strong>Montant total des dons :</strong> ${totalAmount.toLocaleString('fr-FR')} €</p>
        <p>Le montant total des dons de l'année est à saisir dans la case 7UD de la déclaration d'impôts.</p>
        <p><strong>Réduction fiscale (75% jusqu'à 2 000 €) :</strong> ${taxReduction.toLocaleString('fr-FR')} €</p>
        <p>Document justificatif à présenter à l'administration fiscale en cas de contrôle.</p>
        <table><thead><tr><th>Date</th><th>Organisme</th><th>Montant</th></tr></thead><tbody>${rows}</tbody></table>
        ${photosSection}
      </body></html>`);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div className="space-y-8">
      <div className="text-center py-6">
        <h2 className="text-3xl font-bold text-foreground mb-2">Dons 75%</h2>
        <p className="text-muted-foreground">Organismes d'aide aux personnes en difficulté</p>
      </div>
      <OtherDashboard receipts={filteredReceipts} selectedYear={selectedYear} />

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <Input
          placeholder="Rechercher un organisme"
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
          <AddReceiptForm
            onAddReceipt={handleAddReceipt}
            initialData={editingReceipt || undefined}
            onUpdateReceipt={handleUpdateReceipt}
            onCancelEdit={() => setEditingReceipt(null)}
          />
        </div>

        <div>
          <ReceiptsList
            receipts={filteredReceipts}
            onDeleteReceipt={handleDeleteReceipt}
            onEditReceipt={(receipt) => setEditingReceipt(receipt)}
            onUpdatePhoto={handleUpdateReceiptPhoto}
            taxRate={0.75}
            taxReductions={taxReductions}
          />
        </div>
      </div>
    </div>
  );
};

export default OtherDonations;
