import { Home, Users, HandCoins, HandPlatter, GraduationCap } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const MobileNav = () => {
  const location = useLocation();
  const items = [
    { to: "/", icon: Home, label: "Aperçu" },
    { to: "/foyer", icon: Users, label: "Foyer fiscal" },
    { to: "/donations", icon: HandCoins, label: "Dons" },
    { to: "/services", icon: HandPlatter, label: "Services" },
    { to: "/scolarite", icon: GraduationCap, label: "Scolarité" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 flex justify-around border-t border-border bg-card py-2 sm:hidden">
      {items.map(({ to, icon: Icon, label }) => (
        <Link
          key={to}
          to={to}
          className={`flex flex-col items-center ${
            location.pathname === to ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <Icon className="h-6 w-6" />
          <span className="sr-only">{label}</span>
        </Link>
      ))}
    </nav>
  );
};

export default MobileNav;
