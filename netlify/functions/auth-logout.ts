import { ensureTables } from "./utils/db";
import { clearSessionCookie, destroySession, getSessionFromEvent } from "./utils/auth";
import type { NetlifyEvent } from "./utils/types";

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
    if (session?.token) {
      await destroySession(session.token);
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": clearSessionCookie(),
      },
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    console.error("auth-logout", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Erreur interne" }),
    };
  }
};

export { handler };
