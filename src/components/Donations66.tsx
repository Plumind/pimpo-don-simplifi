import { useEffect, useMemo, useState } from "react";
import { Receipt as ReceiptType } from "@/types/Receipt";
import Dashboard from "@/components/Dashboard";
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
import { useUserData } from "@/hooks/useUserData";
import { useAuth } from "@/contexts/AuthContext";
import { uploadReceiptPhoto, removeFromStorage } from "@/lib/storage";
import { Loader2 } from "lucide-react";

interface ReceiptUpdateOptions {
  file?: File | null;
  removePhoto?: boolean;
}

const Donations66 = () => {
  const [editingReceipt, setEditingReceipt] = useState<ReceiptType | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const currentYear = new Date().getFullYear().toString();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const { toast } = useToast();
  const { user } = useAuth();
  const { data, isLoading, updateSection, isUpdating } = useUserData();

  const donations66 = data?.donations66;
  const receipts = useMemo(
    () => donations66 ?? [],
    [donations66]
  );

  const years = useMemo(() => {
    const list = [
      ...receipts.map((r) => r.date.slice(0, 4)),
      currentYear,
    ];
    return Array.from(new Set(list)).sort().reverse();
  }, [receipts, currentYear]);

  useEffect(() => {
    if (years.length > 0 && !years.includes(selectedYear)) {
      setSelectedYear(years[0]);
    }
  }, [years, selectedYear]);

  const filteredReceipts = receipts.filter((r) => {
    const matchesYear = r.date.startsWith(selectedYear);
    const matchesSearch = r.organism
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesYear && matchesSearch;
  });

  const ensureUserId = () => {
    if (!user?.uid) {
      toast({
        title: "Session expirée",
        description: "Veuillez vous reconnecter pour continuer.",
        variant: "destructive",
      });
      throw new Error("Utilisateur non connecté");
    }
    return user.uid;
  };

  const handleAddReceipt = async (
    newReceipt: ReceiptType,
    options?: { file?: File | null }
  ) => {
    try {
      const uid = ensureUserId();
      let receiptToSave: ReceiptType = {
        ...newReceipt,
        createdAt: newReceipt.createdAt || new Date().toISOString(),
      };
      if (options?.file) {
        const { url, path } = await uploadReceiptPhoto(uid, newReceipt.id, options.file);
        receiptToSave = {
          ...receiptToSave,
          photo: url,
          storagePath: path,
        };
      }
      await updateSection("donations66", [...receipts, receiptToSave]);
      toast({
        title: "Reçu ajouté !",
        description: `Don de ${receiptToSave.amount}€ à ${receiptToSave.organism} enregistré.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Erreur lors de l'ajout",
        description: "Impossible d'ajouter ce reçu pour le moment.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateReceipt = async (
    updated: ReceiptType,
    options?: ReceiptUpdateOptions
  ) => {
    try {
      const uid = ensureUserId();
      const existing = receipts.find((r) => r.id === updated.id);
      let nextReceipt = { ...updated };

      if ((options?.removePhoto || options?.file) && existing?.storagePath) {
        await removeFromStorage(existing.storagePath);
        nextReceipt = { ...nextReceipt, photo: null, storagePath: null };
      }

      if (options?.file) {
        const { url, path } = await uploadReceiptPhoto(uid, updated.id, options.file);
        nextReceipt = { ...nextReceipt, photo: url, storagePath: path };
      }

      const nextList = receipts.map((r) => (r.id === updated.id ? nextReceipt : r));
      await updateSection("donations66", nextList);
      setEditingReceipt(null);
      toast({
        title: "Reçu mis à jour",
        description: `${nextReceipt.organism} modifié avec succès.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Erreur lors de la mise à jour",
        description: "Impossible de mettre à jour ce reçu.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteReceipt = async (id: string) => {
    try {
      ensureUserId();
      const target = receipts.find((r) => r.id === id);
      if (target?.storagePath) {
        await removeFromStorage(target.storagePath);
      }
      await updateSection(
        "donations66",
        receipts.filter((r) => r.id !== id)
      );
      toast({
        title: "Reçu supprimé",
        description: "Le reçu a été retiré de votre historique.",
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
    const receipt = receipts.find((r) => r.id === id);
    if (!receipt) return;
    await handleUpdateReceipt(receipt, { file });
  };

  const handleDeletePhoto = async (id: string) => {
    const receipt = receipts.find((r) => r.id === id);
    if (!receipt) return;
    await handleUpdateReceipt(receipt, { removePhoto: true });
  };

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
    const taxReduction = Math.round(totalAmount * 0.66);

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
        <p>Le montant total des dons de l'année est à saisir dans la case 7UF de la déclaration d'impôts.</p>
        <p><strong>Réduction fiscale (66%) :</strong> ${taxReduction.toLocaleString('fr-FR')} €</p>
        <p>Document justificatif à présenter à l'administration fiscale en cas de contrôle.</p>
        <table><thead><tr><th>Date</th><th>Organisme</th><th>Montant</th></tr></thead><tbody>${rows}</tbody></table>
        ${photosSection}
      </body></html>`);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center py-6">
        <h2 className="text-3xl font-bold text-foreground mb-2">Dons 66%</h2>
        <p className="text-muted-foreground">Gérez vos reçus et réductions</p>
      </div>
      <Dashboard receipts={filteredReceipts} selectedYear={selectedYear} />

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
            isSubmitting={isUpdating}
          />
        </div>

        <div>
          <ReceiptsList
            receipts={filteredReceipts}
            onDeleteReceipt={handleDeleteReceipt}
            onEditReceipt={(receipt) => setEditingReceipt(receipt)}
            onUploadPhoto={handleUploadPhoto}
            onDeletePhoto={handleDeletePhoto}
          />
        </div>
      </div>
    </div>
  );
};

export default Donations66;
