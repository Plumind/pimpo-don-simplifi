import { Receipt, FileText } from "lucide-react";

const Header = () => {
  return (
    <header className="bg-card border-b border-border">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-3">
          <div className="bg-primary rounded-xl p-3">
            <Receipt className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Pimpo</h1>
            <p className="text-sm text-muted-foreground">Vos reçus fiscaux simplifiés</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;