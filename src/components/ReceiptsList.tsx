import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Receipt as ReceiptType } from "@/types/Receipt";
import {
  Building2,
  Calendar,
  Camera,
  Eye,
  Euro,
  ImageOff,
  MoreVertical,
  Pencil,
  Trash,
} from "lucide-react";
import { useRef } from "react";

interface ReceiptsListProps {
  receipts: ReceiptType[];
  onDeleteReceipt: (id: string) => void;
  onEditReceipt: (receipt: ReceiptType) => void;
  onUpdatePhoto: (id: string, photo: string | null) => void;
}

const ReceiptsList = ({ receipts, onDeleteReceipt, onEditReceipt, onUpdatePhoto }: ReceiptsListProps) => {
  const sortedReceipts = [...receipts].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const handlePhotoChange = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const existing = receipts.find(r => r.id === id)?.photo;
    if (existing && !confirm("Remplacer la photo existante ?")) {
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      onUpdatePhoto(id, reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleViewPhoto = (photo?: string | null) => {
    if (photo) window.open(photo, '_blank');
  };

  const handleDeletePhoto = (id: string) => {
    const existing = receipts.find(r => r.id === id)?.photo;
    if (existing && confirm("Supprimer la photo ?")) {
      onUpdatePhoto(id, null);
    }
  };

  if (receipts.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Aucun reçu enregistré</h3>
            <p className="text-sm">Commencez par ajouter votre premier reçu fiscal.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mes reçus fiscaux ({receipts.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sortedReceipts.map((receipt) => (
          <div
            key={receipt.id}
            className="border border-border rounded-lg p-4 space-y-3 hover:bg-muted/30 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{receipt.organism}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(receipt.date)}</span>
                </div>
              </div>

              <div className="text-right space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  ref={(el) => (fileInputRefs.current[receipt.id] = el)}
                  onChange={(e) => handlePhotoChange(receipt.id, e)}
                />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => handleViewPhoto(receipt.photo)}
                      disabled={!receipt.photo}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Voir la photo
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => fileInputRefs.current[receipt.id]?.click()}
                    >
                      <Camera className="mr-2 h-4 w-4" />
                      {receipt.photo ? "Remplacer la photo" : "Prendre une photo"}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDeletePhoto(receipt.id)}
                      disabled={!receipt.photo}
                    >
                      <ImageOff className="mr-2 h-4 w-4 text-destructive" />
                      Supprimer la photo
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onEditReceipt(receipt)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Modifier
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        if (confirm("Supprimer ce reçu ?")) onDeleteReceipt(receipt.id);
                      }}
                    >
                      <Trash className="mr-2 h-4 w-4 text-destructive" />
                      Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <div className="flex items-center gap-1">
                  <Euro className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold text-lg">{receipt.amount.toLocaleString('fr-FR')} €</span>
                </div>
                <Badge variant="secondary" className="text-xs bg-success-light text-success">
                  -{Math.round(receipt.amount * 0.66)} € d'impôt
                </Badge>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ReceiptsList;
