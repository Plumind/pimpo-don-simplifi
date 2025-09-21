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

  const navItems = [
    { to: "/app", label: "Aperçu" },
    { to: "/app/foyer", label: "Foyer fiscal" },
    { to: "/app/donations", label: "Dons" },
    { to: "/app/services", label: "Services à la personne" },
    { to: "/app/energie", label: "Transition énergétique" },
    { to: "/app/scolarite", label: "Scolarité" },
  ];

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  return (
    <header className="bg-card border-b border-border">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between gap-3">
          <Link to="/app" className="flex items-center gap-3">
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
            {navItems.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`text-sm font-medium hover:underline ${
                  isActive(to) ? "text-primary" : "text-foreground"
                }`}
              >
                {label}
              </Link>
            ))}
            <div className="ml-4 flex items-center gap-3">
              {subtitle ? <span className="text-sm text-muted-foreground">{subtitle}</span> : null}
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
