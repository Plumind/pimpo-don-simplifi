const FALLBACK_CONNECTION_STRING = "postgresql://local-memory";

const providedConnectionString =
  process.env.NETLIFY_POSTGRES_URL ||
  process.env.DATABASE_URL ||
  process.env.NEON_DATABASE_URL;

if (!providedConnectionString) {
  console.warn(
    "[db] No database connection string configured. Falling back to the in-memory Postgres stub. " +
      "Set NETLIFY_POSTGRES_URL, DATABASE_URL or NEON_DATABASE_URL to connect to a persistent database."
  );
}

const connectionString = providedConnectionString ?? FALLBACK_CONNECTION_STRING;

const MEMORY_URL_PREFIXES = [FALLBACK_CONNECTION_STRING, "postgres://local-memory"];
const useInMemory = MEMORY_URL_PREFIXES.some((prefix) =>
  connectionString.startsWith(prefix)
);

type Pool = import("pg").Pool;
type PoolConfig = import("pg").PoolConfig;

interface MemoryUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  password_hash: string;
  created_at: string;
}

interface MemoryUserData {
  user_id: number;
  data: unknown;
  updated_at: string;
}

interface MemorySession {
  token: string;
  user_id: number;
  created_at: string;
  expires_at: string;
}

const memoryState: {
  users: MemoryUser[];
  userData: MemoryUserData[];
  sessions: MemorySession[];
  nextUserId: number;
} = {
  users: [],
  userData: [],
  sessions: [],
  nextUserId: 1,
};

const toIsoString = (value: unknown) => {
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === "string") {
    return new Date(value).toISOString();
  }
  return new Date().toISOString();
};

const cloneData = <T>(value: T): T => {
  if (value === undefined || value === null) {
    return value;
  }
  try {
    return JSON.parse(JSON.stringify(value)) as T;
  } catch {
    return value;
  }
};

const normalizeQuery = (query: string) => query.replace(/\s+/g, " ").trim();

const runMemoryQuery = (text: string, values: unknown[]) => {
  const normalized = normalizeQuery(text);

  if (normalized.startsWith("CREATE TABLE")) {
    return [];
  }

  if (normalized.startsWith("CREATE INDEX")) {
    return [];
  }

  switch (normalized) {
    case "SELECT id FROM users WHERE email = $1 LIMIT 1": {
      const email = String(values[0] ?? "");
      const user = memoryState.users.find((entry) => entry.email === email);
      return user ? [{ id: user.id }] : [];
    }
    case "INSERT INTO users (email, first_name, last_name, password_hash) VALUES ($1, $2, $3, $4) RETURNING id, email, first_name, last_name": {
      const email = String(values[0] ?? "");
      const firstName = String(values[1] ?? "");
      const lastName = String(values[2] ?? "");
      const passwordHash = String(values[3] ?? "");
      const user: MemoryUser = {
        id: memoryState.nextUserId++,
        email,
        first_name: firstName,
        last_name: lastName,
        password_hash: passwordHash,
        created_at: new Date().toISOString(),
      };
      memoryState.users.push(user);
      return [
        {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
        },
      ];
    }
    case "INSERT INTO user_data (user_id, data, updated_at) VALUES ($1, $2::jsonb, NOW()) ON CONFLICT (user_id) DO UPDATE SET data = EXCLUDED.data, updated_at = EXCLUDED.updated_at": {
      const userId = Number(values[0] ?? 0);
      const rawData = values[1];
      let data: unknown = rawData;
      if (typeof rawData === "string") {
        try {
          data = JSON.parse(rawData);
        } catch {
          data = rawData;
        }
      }
      const now = new Date().toISOString();
      const existing = memoryState.userData.find((entry) => entry.user_id === userId);
      if (existing) {
        existing.data = cloneData(data);
        existing.updated_at = now;
      } else {
        memoryState.userData.push({
          user_id: userId,
          data: cloneData(data),
          updated_at: now,
        });
      }
      return [];
    }
    case "SELECT id, email, first_name, last_name, password_hash FROM users WHERE email = $1 LIMIT 1": {
      const email = String(values[0] ?? "");
      const user = memoryState.users.find((entry) => entry.email === email);
      if (!user) {
        return [];
      }
      return [
        {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          password_hash: user.password_hash,
        },
      ];
    }
    case "INSERT INTO sessions (token, user_id, expires_at) VALUES ($1, $2, $3)": {
      const token = String(values[0] ?? "");
      const userId = Number(values[1] ?? 0);
      const expiresAt = toIsoString(values[2]);
      const createdAt = new Date().toISOString();
      memoryState.sessions = memoryState.sessions.filter(
        (session) => session.token !== token
      );
      memoryState.sessions.push({
        token,
        user_id: userId,
        created_at: createdAt,
        expires_at: expiresAt,
      });
      return [];
    }
    case "SELECT s.token, s.expires_at, u.id, u.email, u.first_name, u.last_name FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = $1 AND s.expires_at > NOW()": {
      const token = String(values[0] ?? "");
      const session = memoryState.sessions.find((entry) => entry.token === token);
      if (!session) {
        return [];
      }
      if (new Date(session.expires_at).getTime() <= Date.now()) {
        return [];
      }
      const user = memoryState.users.find((entry) => entry.id === session.user_id);
      if (!user) {
        return [];
      }
      return [
        {
          token: session.token,
          expires_at: session.expires_at,
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
        },
      ];
    }
    case "DELETE FROM sessions WHERE token = $1": {
      const token = String(values[0] ?? "");
      memoryState.sessions = memoryState.sessions.filter(
        (session) => session.token !== token
      );
      return [];
    }
    case "SELECT data FROM user_data WHERE user_id = $1 LIMIT 1": {
      const userId = Number(values[0] ?? 0);
      const entry = memoryState.userData.find((item) => item.user_id === userId);
      if (!entry) {
        return [];
      }
      return [
        {
          data: cloneData(entry.data),
        },
      ];
    }
    case "UPDATE users SET first_name = $1, last_name = $2 WHERE id = $3": {
      const firstName = String(values[0] ?? "");
      const lastName = String(values[1] ?? "");
      const id = Number(values[2] ?? 0);
      const user = memoryState.users.find((entry) => entry.id === id);
      if (user) {
        user.first_name = firstName;
        user.last_name = lastName;
      }
      return [];
    }
    default:
      throw new Error(`Unsupported in-memory query: ${normalized}`);
  }
};

let poolPromise: Promise<Pool> | null = null;

const resolvePool = async (): Promise<Pool> => {
  if (poolPromise) {
    return poolPromise;
  }

  poolPromise = (async () => {
    try {
      const pg = await import("pg");
      const config: PoolConfig = { connectionString };
      const shouldUseSSL = !/localhost|127\.0\.0\.1/.test(connectionString);
      if (shouldUseSSL) {
        config.ssl = { rejectUnauthorized: false };
      }
      return new pg.Pool(config);
    } catch (error) {
      poolPromise = null;
      const message =
        error instanceof Error ? error.message : "Unknown error loading pg";
      throw new Error(`Failed to initialize Postgres client: ${message}`);
    }
  })();

  return poolPromise;
};

export const sql = async <T = unknown>(
  strings: TemplateStringsArray,
  ...values: unknown[]
): Promise<T[]> => {
  const text = strings.reduce((acc, part, index) => {
    const placeholder = index < values.length ? `$${index + 1}` : "";
    return `${acc}${part}${placeholder}`;
  }, "");
  if (useInMemory) {
    return runMemoryQuery(text, values) as T[];
  }
  const pool = await resolvePool();
  const result = await pool.query(text, values);
  return result.rows as T[];
};

let initialized = false;

export const ensureTables = async () => {
  if (initialized) return;

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      first_name TEXT NOT NULL DEFAULT '',
      last_name TEXT NOT NULL DEFAULT '',
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS user_data (
      user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      data JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      expires_at TIMESTAMPTZ NOT NULL
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions(user_id)`;

  initialized = true;
};
