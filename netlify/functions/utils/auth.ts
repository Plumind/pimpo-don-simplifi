import { randomUUID } from "crypto";
import { sql } from "./db";
import type { NetlifyEvent } from "./types";

const SESSION_COOKIE = "pimpo_session";
const SESSION_DURATION_DAYS = 30;

export interface SessionUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
}

export const createSession = async (userId: number) => {
  const token = randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000);
  await sql`
    INSERT INTO sessions (token, user_id, expires_at)
    VALUES (${token}, ${userId}, ${expiresAt.toISOString()})
  `;
  return { token, expiresAt };
};

export const clearSessionCookie = () =>
  serializeCookie(SESSION_COOKIE, "", {
    path: "/",
    httpOnly: true,
    sameSite: "Lax",
    secure: process.env.NODE_ENV === "production",
    expires: new Date(0),
  });

export const getSessionCookie = (token: string, expiresAt: Date) =>
  serializeCookie(SESSION_COOKIE, token, {
    path: "/",
    httpOnly: true,
    sameSite: "Lax",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
  });

export const getSessionFromEvent = async (event: NetlifyEvent) => {
  const cookies = parseCookies(event.headers.cookie);
  const token = cookies[SESSION_COOKIE];
  if (!token) {
    return null;
  }

  const results = await sql<{
    token: string;
    expires_at: string;
    id: number;
    email: string;
    first_name: string;
    last_name: string;
  }>`
    SELECT s.token, s.expires_at, u.id, u.email, u.first_name, u.last_name
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.token = ${token} AND s.expires_at > NOW()
  `;

  if (results.length === 0) {
    return null;
  }

  const [row] = results;
  return {
    token: row.token,
    expiresAt: new Date(row.expires_at),
    user: {
      id: row.id,
      email: row.email,
      first_name: row.first_name,
      last_name: row.last_name,
    },
  };
};

export const destroySession = async (token: string) => {
  await sql`DELETE FROM sessions WHERE token = ${token}`;
};

const parseCookies = (cookieHeader: string | undefined) => {
  const result: Record<string, string> = {};
  if (!cookieHeader) {
    return result;
  }
  const pairs = cookieHeader.split(";");
  for (const pair of pairs) {
    const index = pair.indexOf("=");
    if (index < 0) continue;
    const name = pair.slice(0, index).trim();
    const value = pair.slice(index + 1).trim();
    if (!name) continue;
    result[name] = decodeURIComponent(value);
  }
  return result;
};

interface CookieOptions {
  path?: string;
  httpOnly?: boolean;
  sameSite?: "Lax" | "Strict" | "None";
  secure?: boolean;
  expires?: Date;
}

const serializeCookie = (name: string, value: string, options: CookieOptions) => {
  let cookie = `${name}=${encodeURIComponent(value)}`;
  if (options.path) {
    cookie += `; Path=${options.path}`;
  }
  if (options.httpOnly) {
    cookie += "; HttpOnly";
  }
  if (options.sameSite) {
    cookie += `; SameSite=${options.sameSite}`;
  }
  if (options.secure) {
    cookie += "; Secure";
  }
  if (options.expires) {
    cookie += `; Expires=${options.expires.toUTCString()}`;
  }
  return cookie;
};
