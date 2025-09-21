import { ensureTables, sql } from "./utils/db";
import { getSessionFromEvent } from "./utils/auth";
import { mergeUserData, normalizeUserData, Profile, UserData } from "./utils/user-data";
import type { NetlifyEvent } from "./utils/types";

const handler = async (event: NetlifyEvent) => {
  try {
    if (event.httpMethod !== "GET" && event.httpMethod !== "PATCH") {
      return {
        statusCode: 405,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Méthode non autorisée" }),
      };
    }

    await ensureTables();
    const session = await getSessionFromEvent(event);
    if (!session) {
      return {
        statusCode: 401,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Authentification requise" }),
      };
    }

    const profile: Profile = {
      firstName: session.user.first_name,
      lastName: session.user.last_name,
      email: session.user.email,
    };

    const rows = await sql<{ data: unknown }>`
      SELECT data
      FROM user_data
      WHERE user_id = ${session.user.id}
      LIMIT 1
    `;

    const existing = rows.length > 0 ? normalizeUserData(profile, rows[0].data as Partial<UserData>) : normalizeUserData(profile);

    if (event.httpMethod === "GET") {
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: existing }),
      };
    }

    const payload = event.body ? (JSON.parse(event.body) as Record<string, unknown>) : {};
    const updates = payload.updates as Partial<UserData> | undefined;
    const merged = updates ? mergeUserData(existing, updates) : existing;

    await sql`
      INSERT INTO user_data (user_id, data, updated_at)
      VALUES (${session.user.id}, ${JSON.stringify(merged)}::jsonb, NOW())
      ON CONFLICT (user_id) DO UPDATE SET data = EXCLUDED.data, updated_at = EXCLUDED.updated_at
    `;

    if (updates?.profile) {
      await sql`
        UPDATE users
        SET first_name = ${merged.profile.firstName}, last_name = ${merged.profile.lastName}
        WHERE id = ${session.user.id}
      `;
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: merged }),
    };
  } catch (error) {
    console.error("user-data", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Erreur interne" }),
    };
  }
};

export { handler };
