import { ensureTables, sql } from "./utils/db";
import { createSession, getSessionCookie } from "./utils/auth";
import { createInitialUserData, Profile, UserData } from "./utils/user-data";
import type { NetlifyEvent } from "./utils/types";
import { hashPassword } from "./utils/password";

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
    const firstName = typeof payload.firstName === "string" ? payload.firstName.trim() : "";
    const lastName = typeof payload.lastName === "string" ? payload.lastName.trim() : "";
    const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
    const password = typeof payload.password === "string" ? payload.password : "";
    const initialData = payload.initialData as Partial<UserData> | undefined;

    if (!email || !password || password.length < 6) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Informations d'inscription invalides" }),
      };
    }

    const existing = await sql`SELECT id FROM users WHERE email = ${email} LIMIT 1`;
    if (existing.length > 0) {
      return {
        statusCode: 409,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Un compte existe déjà avec cet email" }),
      };
    }

    const hash = hashPassword(password);

    const inserted = await sql<{
      id: number;
      email: string;
      first_name: string;
      last_name: string;
    }>`
      INSERT INTO users (email, first_name, last_name, password_hash)
      VALUES (${email}, ${firstName}, ${lastName}, ${hash})
      RETURNING id, email, first_name, last_name
    `;

    const user = inserted[0];
    const profile: Profile = {
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
    };
    const data = createInitialUserData(profile, initialData);

    await sql`
      INSERT INTO user_data (user_id, data, updated_at)
      VALUES (${user.id}, ${JSON.stringify(data)}::jsonb, NOW())
      ON CONFLICT (user_id) DO UPDATE SET data = EXCLUDED.data, updated_at = EXCLUDED.updated_at
    `;

    const session = await createSession(user.id);
    const cookie = getSessionCookie(session.token, session.expiresAt);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": cookie,
      },
      body: JSON.stringify({
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
        },
      }),
    };
  } catch (error) {
    console.error("auth-register", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Erreur interne" }),
    };
  }
};

export { handler };
