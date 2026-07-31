import { ensureTables, sql } from "./utils/db";
import { sendPasswordResetEmail } from "./utils/email";
import { hashPassword } from "./utils/password";
import type { NetlifyEvent } from "./utils/types";

// Génère un mot de passe temporaire aléatoire
const generateTemporaryPassword = (): string => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

const handler = async (event: NetlifyEvent) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Méthode non autorisée" }),
    };
  }

  try {
    await ensureTables();
    const payload = event.body ? (JSON.parse(event.body) as Record<string, unknown>) : {};
    const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";

    if (!email) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Adresse email requise" }),
      };
    }

    // Vérifier que l'email existe
    const users = await sql<{
      id: number;
      email: string;
      first_name: string;
      last_name: string;
    }>`
      SELECT id, email, first_name, last_name
      FROM users
      WHERE email = ${email}
      LIMIT 1
    `;

    if (users.length === 0) {
      // Ne pas révéler que l'email n'existe pas (pour des raisons de sécurité)
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "Si cette adresse email existe, un email de réinitialisation a été envoyé.",
        }),
      };
    }

    const user = users[0];
    const temporaryPassword = generateTemporaryPassword();
    const passwordHash = hashPassword(temporaryPassword);

    // Mettre à jour le mot de passe
    await sql`
      UPDATE users
      SET password_hash = ${passwordHash}
      WHERE id = ${user.id}
    `;

    // Envoyer l'email
    const emailSent = await sendPasswordResetEmail({
      to: user.email,
      firstName: user.first_name || "Utilisateur",
      temporaryPassword,
    });

    if (!emailSent) {
      console.error("Failed to send password reset email for user:", user.id);
      // Ne pas retourner d'erreur pour éviter de révéler des infos
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "Si cette adresse email existe, un email de réinitialisation a été envoyé.",
        }),
      };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Si cette adresse email existe, un email de réinitialisation a été envoyé.",
      }),
    };
  } catch (error) {
    console.error("auth-forgot-password", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Erreur interne" }),
    };
  }
};

export { handler };
