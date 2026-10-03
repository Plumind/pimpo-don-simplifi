import { getSessionFromEvent } from "./utils/auth";
import { withLambda } from "@netlify/aws-lambda-compat";

const handler = withLambda(async (event) => {
  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Méthode non autorisée" }),
    };
  }

  try {
    const session = await getSessionFromEvent(event);
    if (!session) {
      return {
        statusCode: 401,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Aucune session active" }),
      };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user: {
          id: session.user.id,
          email: session.user.email,
          firstName: session.user.first_name,
          lastName: session.user.last_name,
        },
      }),
    };
  } catch (error) {
    console.error("session", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Erreur interne" }),
    };
  }
});

export default handler;