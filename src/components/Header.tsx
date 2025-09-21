import logo from "@/assets/logo_pimpots.png";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut } from "lucide-react";

const Header = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const displayName = user?.displayName?.trim();
  const subtitle = displayName || user?.email || "";
  return (
    <header className="bg-card border-b border-border">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="Logo Pimpôts" className="h-12 w-12" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">Pimpôts</h1>
              <p className="text-sm text-muted-foreground">
                Faciliter le suivi tout au long de l'année...
                <br />
                Pour pimper votre déclaration d'impôts
              </p>
            </div>
          </Link>
          <nav className="hidden items-center gap-4 sm:flex">
            <Link
              to="/"
              className={`text-sm font-medium hover:underline ${location.pathname === '/' ? 'text-primary' : 'text-foreground'}`}
            >
              Aperçu
            </Link>
            <Link
              to="/foyer"
              className={`text-sm font-medium hover:underline ${location.pathname === '/foyer' ? 'text-primary' : 'text-foreground'}`}
            >
              Foyer fiscal
            </Link>
            <Link
              to="/donations"
              className={`text-sm font-medium hover:underline ${location.pathname === '/donations' ? 'text-primary' : 'text-foreground'}`}
            >
              Dons
            </Link>
            <Link
              to="/services"
              className={`text-sm font-medium hover:underline ${location.pathname === '/services' ? 'text-primary' : 'text-foreground'}`}
            >
              Services à la personne
            </Link>
            <Link
              to="/energie"
              className={`text-sm font-medium hover:underline ${location.pathname === '/energie' ? 'text-primary' : 'text-foreground'}`}
            >
              Transition énergétique
            </Link>
            <Link
              to="/scolarite"
              className={`text-sm font-medium hover:underline ${location.pathname === '/scolarite' ? 'text-primary' : 'text-foreground'}`}
            >
              Scolarité
            </Link>
            <div className="ml-4 flex items-center gap-3">
              {subtitle ? (
                <span className="text-sm text-muted-foreground">{subtitle}</span>
              ) : null}
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => {
                  signOut().catch(() => {
                    console.error("Erreur lors de la déconnexion");
                  });
                }}
              >
                <LogOut className="h-4 w-4" />
                Se déconnecter
              </Button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
