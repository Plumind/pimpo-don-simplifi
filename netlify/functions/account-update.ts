import { ensureTables, sql } from "./utils/db";
import { getSessionFromEvent } from "./utils/auth";
import type { NetlifyEvent } from "./utils/types";
import { verifyPassword, hashPassword } from "./utils/password";

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
    const session = await getSessionFromEvent(event);
    if (!session) {
      return {
        statusCode: 401,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Authentification requise" }),
      };
    }

    const payload = event.body ? (JSON.parse(event.body) as Record<string, unknown>) : {};
    const currentPassword = typeof payload.currentPassword === "string" ? payload.currentPassword : "";
    const newPassword = typeof payload.newPassword === "string" ? payload.newPassword : "";

    if (!currentPassword || !newPassword) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Champs manquants" }),
      };
    }

    if (newPassword.length < 8) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Le nouveau mot de passe doit contenir au moins 8 caractères" }),
      };
    }

    const users = await sql<{ password_hash: string }>`
      SELECT password_hash
      FROM users
      WHERE id = ${session.user.id}
      LIMIT 1
    `;

    if (users.length === 0) {
      return {
        statusCode: 404,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Utilisateur introuvable" }),
      };
    }

    const { password_hash: storedHash } = users[0];
    if (!verifyPassword(currentPassword, storedHash)) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Mot de passe actuel incorrect" }),
      };
    }

    const newHash = hashPassword(newPassword);
    await sql`
      UPDATE users
      SET password_hash = ${newHash}
      WHERE id = ${session.user.id}
    `;

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Mot de passe mis à jour" }),
    };
  } catch (error) {
    console.error("account-update", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Erreur interne" }),
    };
  }
};

export { handler };
