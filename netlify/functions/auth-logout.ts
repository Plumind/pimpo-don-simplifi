import { clearSessionCookie, destroySession, getSessionFromEvent } from "./utils/auth";
import { withLambda } from "@netlify/aws-lambda-compat";

const handler = withLambda(async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Méthode non autorisée" }),
    };
  }

  try {
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
});

export default handler;