import logo from "@/assets/logo_pimpo.png";
import { Link, useLocation } from "react-router-dom";

const Header = () => {
  const location = useLocation();
  return (
    <header className="bg-card border-b border-border">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Logo Pimpo" className="h-12 w-12" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">Pimpo</h1>
              <p className="text-sm text-muted-foreground">Pour pimper votre déclaration d'impôts</p>
            </div>
          </div>
          <nav className="flex gap-4">
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
              Dons 66%
            </Link>
            <Link
              to="/services"
              className={`text-sm font-medium hover:underline ${location.pathname === '/services' ? 'text-primary' : 'text-foreground'}`}
            >
              Services à la personne
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
