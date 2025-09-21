import { ensureTables, sql } from "./utils/db";
import { createSession, getSessionCookie } from "./utils/auth";
import type { NetlifyEvent } from "./utils/types";
import { verifyPassword } from "./utils/password";

const unauthorized = () => ({
  statusCode: 401,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ message: "Identifiants incorrects" }),
});

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
    const password = typeof payload.password === "string" ? payload.password : "";

    if (!email || !password) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Identifiants invalides" }),
      };
    }

    const results = await sql<{
      id: number;
      email: string;
      first_name: string;
      last_name: string;
      password_hash: string;
    }>`
      SELECT id, email, first_name, last_name, password_hash
      FROM users
      WHERE email = ${email}
      LIMIT 1
    `;

    if (results.length === 0) {
      return unauthorized();
    }

    const user = results[0];
    const valid = verifyPassword(password, user.password_hash);
    if (!valid) {
      return unauthorized();
    }

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
    console.error("auth-login", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Erreur interne" }),
    };
  }
};

export { handler };
