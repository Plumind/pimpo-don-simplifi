import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  LineChart,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  OnboardingProfile,
  readOnboardingProfile,
  saveOnboardingProfile,
} from "@/lib/onboarding";
import { LOCAL_STORAGE_KEYS } from "@/lib/user-data";
import { Household, MaritalStatus } from "@/types/Household";
import { calculateIncomeTax, calculateParts } from "@/lib/tax";

const defaultHousehold: Household = {
  status: "marie",
  members: [
    { name: "Pamela", salary: 35000 },
    { name: "Tyson", salary: 32000 },
  ],
  children: 2,
  otherIncome: 2000,
};

const heroHighlights = [
  {
    icon: CalendarCheck,
    title: "Suivi annuel",
    description: "Centralisez vos dons, dépenses et crédits d'impôt toute l'année.",
  },
  {
    icon: ShieldCheck,
    title: "Données sécurisées",
    description: "Vos informations sont sécurisées et prêtes à être synchronisées dans Neon via Netlify.",
  },
  {
    icon: LineChart,
    title: "Projection instantanée",
    description: "Visualisez l'impact de votre foyer fiscal en temps réel.",
  },
];

const parseStoredHousehold = (value: string | null): Household => {
  if (!value) return defaultHousehold;
  try {
    const parsed = JSON.parse(value) as Partial<Household>;
    const members = Array.isArray(parsed.members)
      ? parsed.members.map((member) => ({
          name: typeof member?.name === "string" ? member.name : "",
          salary: typeof member?.salary === "number" ? member.salary : 0,
        }))
      : defaultHousehold.members;
    while (members.length < 2) {
      members.push({ name: "", salary: 0 });
    }
    return {
      status: (parsed.status as MaritalStatus) ?? defaultHousehold.status,
      members,
      children: typeof parsed.children === "number" ? parsed.children : defaultHousehold.children,
      otherIncome:
        typeof parsed.otherIncome === "number" ? parsed.otherIncome : defaultHousehold.otherIncome,
    } satisfies Household;
  } catch (error) {
    console.error("Failed to parse stored household", error);
    return defaultHousehold;
  }
};

const Home = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [accountForm, setAccountForm] = useState<OnboardingProfile>(() => {
    const stored = readOnboardingProfile();
    return (
      stored ?? {
        firstName: "",
        lastName: "",
        email: "",
      }
    );
  });
  const [household, setHousehold] = useState<Household>(() => {
    if (typeof window === "undefined") {
      return defaultHousehold;
    }
    return parseStoredHousehold(localStorage.getItem(LOCAL_STORAGE_KEYS.household));
  });

  useEffect(() => {
    if (!user && typeof window !== "undefined") {
      localStorage.setItem(LOCAL_STORAGE_KEYS.household, JSON.stringify(household));
    }
  }, [household, user]);

  const adults = useMemo(() => {
    const declaredAdults = household.members.filter((member) => member.name || member.salary).length;
    if (household.status === "concubinage") {
      return 1;
    }
    return Math.max(1, declaredAdults || household.members.length);
  }, [household.members, household.status]);

  const parts = useMemo(() => calculateParts(adults, household.children), [adults, household.children]);
  const totalIncome = useMemo(
    () =>
      household.members.reduce((acc, member) => acc + (member.salary || 0), 0) +
      (household.otherIncome || 0),
    [household.members, household.otherIncome]
  );
  const estimatedTax = useMemo(() => {
    if (!totalIncome || !parts) return 0;
    return Math.round(calculateIncomeTax(totalIncome, parts));
  }, [totalIncome, parts]);

  const handleAccountSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (user) {
      navigate("/app");
      return;
    }
    setIsSubmitting(true);
    try {
      const payload: OnboardingProfile = {
        firstName: accountForm.firstName.trim(),
        lastName: accountForm.lastName.trim(),
        email: accountForm.email.trim(),
      };
      await saveOnboardingProfile(payload);
      toast({
        title: "Presque terminé !",
        description: "Choisissez un mot de passe pour finaliser votre inscription.",
      });
      navigate("/inscription", { state: { prefill: payload } });
    } catch (error) {
      console.error(error);
      toast({
        title: "Inscription impossible",
        description: "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMemberChange = (index: number, field: "name" | "salary", value: string) => {
    setHousehold((prev) => {
      const members = [...prev.members];
      const current = members[index] ?? { name: "", salary: 0 };
      const nextMember = {
        ...current,
        [field]: field === "salary" ? Number(value) || 0 : value,
      };
      members[index] = nextMember;
      return { ...prev, members };
    });
  };

  const handleStatusChange = (value: string) => {
    setHousehold((prev) => ({ ...prev, status: value as MaritalStatus }));
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/60 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Link to="/" className="text-lg font-semibold text-primary">
            Pimpôts
          </Link>
          <div className="flex items-center gap-3">
            {user ? (
              <Button variant="ghost" asChild>
                <Link to="/app">Accéder à mon espace</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/connexion">Se connecter</Link>
                </Button>
                <Button asChild>
                  <Link to="#ouvrir-compte">Ouvrir un compte</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="space-y-20 pb-20">
        <section className="bg-muted/30">
          <div className="container mx-auto grid gap-12 px-4 py-16 lg:grid-cols-[1.2fr_1fr]">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
                <ShieldCheck className="h-4 w-4" />
                Déclarez vos avantages fiscaux sans stress
              </div>
              <h1 className="text-3xl font-bold leading-tight text-foreground sm:text-4xl lg:text-5xl">
                Le compagnon qui simplifie votre déclaration d'impôts
              </h1>
              <p className="max-w-2xl text-lg text-muted-foreground">
                Enregistrez vos dons, vos services à la personne et vos dépenses énergétiques au fil de l'année.
                Lorsque vous êtes prêt, synchronisez votre espace Netlify avec Neon pour conserver toutes vos informations.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {heroHighlights.map(({ icon: Icon, title, description }) => (
                  <div key={title} className="flex items-start gap-3">
                    <div className="mt-1 rounded-full bg-primary/10 p-2 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-foreground">{title}</h3>
                      <p className="text-sm text-muted-foreground">{description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link to="#ouvrir-compte" className="flex items-center gap-2">
                    Je crée mon compte
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/connexion">J'ai déjà un compte</Link>
                </Button>
              </div>
            </div>

            <Card id="ouvrir-compte" className="shadow-lg">
              <CardHeader>
                <CardTitle>Ouvrir un compte</CardTitle>
                <CardDescription>
                  Renseignez vos informations pour finaliser votre inscription et relier automatiquement votre foyer à Neon.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleAccountSubmit}>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Prénom</Label>
                      <Input
                        id="firstName"
                        value={accountForm.firstName}
                        onChange={(event) =>
                          setAccountForm((prev) => ({ ...prev, firstName: event.target.value }))
                        }
                        autoComplete="given-name"
                        required
                        disabled={Boolean(user)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Nom</Label>
                      <Input
                        id="lastName"
                        value={accountForm.lastName}
                        onChange={(event) =>
                          setAccountForm((prev) => ({ ...prev, lastName: event.target.value }))
                        }
                        autoComplete="family-name"
                        required
                        disabled={Boolean(user)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Adresse mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={accountForm.email}
                      onChange={(event) =>
                        setAccountForm((prev) => ({ ...prev, email: event.target.value }))
                      }
                      autoComplete="email"
                      required
                      disabled={Boolean(user)}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isSubmitting || Boolean(user)}>
                    {user ? "Vous êtes déjà connecté" : "Continuer"}
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    Vous serez redirigé pour choisir un mot de passe sécurisé avant que vos données ne soient synchronisées.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="container mx-auto px-4">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
            <Card>
              <CardHeader>
                <CardTitle>Simuler mon foyer fiscal</CardTitle>
                <CardDescription>
                  Ajustez les informations ci-dessous pour visualiser immédiatement votre situation. Les données ne sont
                  enregistrées que si vous n'êtes pas connecté.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {household.members.map((member, index) => (
                    <div key={index} className="space-y-2">
                      <Label htmlFor={`member-${index}`}>{`Personne ${index + 1}`}</Label>
                      <Input
                        id={`member-${index}`}
                        placeholder="Nom"
                        value={member.name}
                        onChange={(event) => handleMemberChange(index, "name", event.target.value)}
                      />
                      <Input
                        type="number"
                        inputMode="numeric"
                        placeholder="Revenu net annuel (€)"
                        value={member.salary || ""}
                        onChange={(event) => handleMemberChange(index, "salary", event.target.value)}
                      />
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="other-income">Autres revenus annuels (€)</Label>
                  <Input
                    id="other-income"
                    type="number"
                    inputMode="numeric"
                    value={household.otherIncome || ""}
                    onChange={(event) =>
                      setHousehold((prev) => ({
                        ...prev,
                        otherIncome: Number(event.target.value) || 0,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="children">Nombre d'enfants à charge</Label>
                  <Input
                    id="children"
                    type="number"
                    inputMode="numeric"
                    value={household.children}
                    onChange={(event) =>
                      setHousehold((prev) => ({
                        ...prev,
                        children: Math.max(0, Number(event.target.value) || 0),
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Situation familiale</Label>
                  <RadioGroup value={household.status} onValueChange={handleStatusChange} className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="marie" id="marie" />
                      <Label htmlFor="marie">Marié</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="pacse" id="pacse" />
                      <Label htmlFor="pacse">Pacsé</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="concubinage" id="concubinage" />
                      <Label htmlFor="concubinage">Concubinage</Label>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/50 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <CheckCircle2 className="h-5 w-5" />
                  Résumé instantané
                </CardTitle>
                <CardDescription>
                  Ces calculs sont fournis à titre indicatif et vous permettent d'évaluer l'intérêt d'un suivi continu.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="flex items-center justify-between rounded-md bg-background px-4 py-3">
                    <span className="text-sm text-muted-foreground">Revenu annuel total</span>
                    <span className="text-lg font-semibold text-foreground">
                      {totalIncome.toLocaleString("fr-FR")}{" €"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-md bg-background px-4 py-3">
                    <span className="text-sm text-muted-foreground">Nombre de parts fiscales</span>
                    <span className="text-lg font-semibold text-foreground">{parts.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-md bg-background px-4 py-3">
                    <span className="text-sm text-muted-foreground">Impôt estimé</span>
                    <span className="text-lg font-semibold text-foreground">
                      {estimatedTax.toLocaleString("fr-FR")}{" €"}
                    </span>
                  </div>
                </div>
                <div className="space-y-2 rounded-md bg-background px-4 py-3 text-sm text-muted-foreground">
                  <p>
                    {user
                      ? "Les informations saisies ici ne sont pas enregistrées pendant que vous êtes connecté."
                      : "Ces informations seront conservées sur votre appareil jusqu'à la création de votre compte."}
                  </p>
                  <p>
                    Connectez-vous pour enregistrer définitivement vos données et suivre vos crédits d'impôt au fil des
                    mois.
                  </p>
                </div>
                <Button asChild>
                  <Link to={user ? "/app" : "/connexion"} className="flex items-center gap-2">
                    {user ? "Accéder à mon tableau de bord" : "Je poursuis mon inscription"}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;
