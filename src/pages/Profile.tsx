import { FormEvent, useEffect, useState } from "react";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useUserData } from "@/hooks/useUserData";
import { useAuth } from "@/contexts/AuthContext";
import { fetchJson } from "@/lib/http";
import { Loader2 } from "lucide-react";

const Profile = () => {
  const { data, isLoading, isUpdating, updateUserData } = useUserData();
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [profileForm, setProfileForm] = useState({ firstName: "", lastName: "" });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (data?.profile) {
      setProfileForm({
        firstName: data.profile.firstName ?? "",
        lastName: data.profile.lastName ?? "",
      });
    }
  }, [data?.profile?.firstName, data?.profile?.lastName]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 text-center text-sm text-muted-foreground">
        Impossible de charger votre profil pour le moment.
      </div>
    );
  }

  const email = data.profile.email || user?.email || "";

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavingProfile(true);
    try {
      await updateUserData({
        profile: {
          firstName: profileForm.firstName.trim(),
          lastName: profileForm.lastName.trim(),
          email,
        },
      });
      await refreshUser();
      toast({
        title: "Profil mis à jour",
        description: "Vos informations personnelles ont été enregistrées.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Mise à jour impossible",
        description: "Veuillez réessayer plus tard.",
        variant: "destructive",
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Les mots de passe ne correspondent pas",
        description: "Veuillez confirmer votre nouveau mot de passe.",
        variant: "destructive",
      });
      return;
    }
    setSavingPassword(true);
    try {
      await fetchJson("/account-update", {
        method: "POST",
        body: {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        },
      });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast({
        title: "Mot de passe mis à jour",
        description: "Votre mot de passe a été modifié avec succès.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Échec de la mise à jour",
        description:
          error instanceof Error ? error.message : "Impossible de modifier votre mot de passe.",
        variant: "destructive",
      });
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto max-w-3xl px-4 py-8 pb-24 space-y-8">
        <div className="py-6 text-center">
          <h2 className="mb-2 text-3xl font-bold text-foreground">Profil</h2>
          <p className="text-muted-foreground">
            Gérez vos informations personnelles et sécurisez votre accès à Pimpôts.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informations personnelles</CardTitle>
            <CardDescription>Ces informations apparaissent dans l'interface de l'application.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input
                    id="firstName"
                    value={profileForm.firstName}
                    onChange={(event) =>
                      setProfileForm((prev) => ({ ...prev, firstName: event.target.value }))
                    }
                    placeholder="Alex"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="lastName">Nom</Label>
                  <Input
                    id="lastName"
                    value={profileForm.lastName}
                    onChange={(event) =>
                      setProfileForm((prev) => ({ ...prev, lastName: event.target.value }))
                    }
                    placeholder="Martin"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="email">Adresse e-mail</Label>
                <Input id="email" value={email} disabled />
                <p className="text-xs text-muted-foreground">
                  L'adresse e-mail utilisée pour la connexion ne peut pas être modifiée.
                </p>
              </div>
              <Button type="submit" disabled={savingProfile || isUpdating} className="gap-2">
                {(savingProfile || isUpdating) && <Loader2 className="h-4 w-4 animate-spin" />}
                Enregistrer
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Modifier le mot de passe</CardTitle>
            <CardDescription>
              Choisissez un mot de passe suffisamment complexe pour protéger votre espace personnel.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(event) =>
                    setPasswordForm((prev) => ({ ...prev, currentPassword: event.target.value }))
                  }
                  required
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(event) =>
                      setPasswordForm((prev) => ({ ...prev, newPassword: event.target.value }))
                    }
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(event) =>
                      setPasswordForm((prev) => ({ ...prev, confirmPassword: event.target.value }))
                    }
                    required
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Votre nouveau mot de passe doit contenir au moins 8 caractères.
              </p>
              <Button type="submit" disabled={savingPassword} className="gap-2">
                {savingPassword && <Loader2 className="h-4 w-4 animate-spin" />}
                Mettre à jour le mot de passe
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Profile;
