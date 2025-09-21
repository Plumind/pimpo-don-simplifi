import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ServiceExpense } from "@/types/ServiceExpense";
import { Calendar, Building2, Euro, Trash, Pencil, Eye, Camera, ImageOff } from "lucide-react";
import { useRef } from "react";

interface ServicesListProps {
  expenses: ServiceExpense[];
  onDelete: (id: string) => void | Promise<void>;
  onEdit: (expense: ServiceExpense) => void;
  onUploadPhoto: (id: string, file: File) => void | Promise<void>;
  onDeletePhoto: (id: string) => void | Promise<void>;
}

const ServicesList = ({ expenses, onDelete, onEdit, onUploadPhoto, onDeletePhoto }: ServicesListProps) => {
  const sorted = [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const handlePhotoChange = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const existing = expenses.find((r) => r.id === id)?.photo;
    if (existing && !confirm("Remplacer la photo existante ?")) {
      e.target.value = "";
      return;
    }
    await onUploadPhoto(id, file);
    e.target.value = "";
  };

  const handleViewPhoto = (photo?: string | null) => {
    if (photo) window.open(photo, '_blank', 'noopener,noreferrer');
  };

  const handleDeletePhoto = (id: string) => {
    const existing = expenses.find((r) => r.id === id)?.photo;
    if (existing && confirm("Supprimer la photo ?")) {
      onDeletePhoto(id);
    }
  };

  if (expenses.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Aucune dépense enregistrée</h3>
            <p className="text-sm">Ajoutez vos premières dépenses de services à la personne.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dépenses ({expenses.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sorted.map((exp) => {
          const net = exp.amount - exp.aids;
          return (
            <div
              key={exp.id}
              className="border border-border rounded-lg p-4 space-y-3 hover:bg-muted/30 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{exp.provider}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">{exp.nature}</div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(exp.date)}</span>
                  </div>
                  {exp.category === 'childcare' && exp.childName && (
                    <div className="text-sm text-muted-foreground">
                      Enfant : {exp.childName}
                    </div>
                  )}
                </div>

                <div className="space-y-2 sm:text-right">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    ref={(el) => (fileInputRefs.current[exp.id] = el)}
                    onChange={(e) => handlePhotoChange(exp.id, e)}
                  />
                  <div className="grid grid-cols-3 gap-2 sm:flex sm:justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleViewPhoto(exp.photo)}
                      disabled={!exp.photo}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => fileInputRefs.current[exp.id]?.click()}
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeletePhoto(exp.id)}
                      disabled={!exp.photo}
                    >
                      <ImageOff className="h-4 w-4 text-destructive" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(exp)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (confirm("Supprimer cette dépense ?")) {
                        void onDelete(exp.id);
                      }
                    }}
                  >
                      <Trash className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-1 sm:justify-end">
                    <Euro className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold text-lg">{net.toLocaleString('fr-FR')} €</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {exp.aids > 0 ? `Aides déduites: ${exp.aids.toLocaleString('fr-FR')} €` : 'Sans aide'}
                  </Badge>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default ServicesList;
