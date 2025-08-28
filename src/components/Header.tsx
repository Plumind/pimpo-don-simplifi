import logo from "@/assets/logo_pimpo.png";

const Header = () => {
  return (
    <header className="bg-card border-b border-border">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Logo Pimpo" className="h-12 w-12" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Pimpo</h1>
            <p className="text-sm text-muted-foreground">Pour pimper votre déclaration d'impôts</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
