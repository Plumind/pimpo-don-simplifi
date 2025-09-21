import { Home, Users, HandCoins, HandPlatter, GraduationCap, Leaf } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const MobileNav = () => {
  const location = useLocation();
  const { user } = useAuth();

  if (!user || !location.pathname.startsWith("/app")) {
    return null;
  }

  const items = [
    { to: "/app", icon: Home, label: "Aperçu" },
    { to: "/app/foyer", icon: Users, label: "Foyer fiscal" },
    { to: "/app/donations", icon: HandCoins, label: "Dons" },
    { to: "/app/services", icon: HandPlatter, label: "Services" },
    { to: "/app/energie", icon: Leaf, label: "Énergie" },
    { to: "/app/scolarite", icon: GraduationCap, label: "Scolarité" },
  ];

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  return (
    <nav className="fixed bottom-0 left-0 right-0 flex justify-around border-t border-border bg-card py-2 sm:hidden">
      {items.map(({ to, icon: Icon, label }) => (
        <Link
          key={to}
          to={to}
          className={`flex flex-col items-center ${
            isActive(to) ? "text-primary" : "text-muted-foreground"
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
