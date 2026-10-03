import { getDatabase } from "@netlify/database";
import type { Pool } from "pg";

type DatabaseConnection = ReturnType<typeof getDatabase>;

export type WaddlerSQL = DatabaseConnection["sql"];

export type QueryRows<T> = T[];

let cachedConnection: DatabaseConnection | null = null;

const resolveConnection = (): DatabaseConnection => {
  if (!cachedConnection) {
    cachedConnection = getDatabase();
  }
  return cachedConnection;
};

export const sql: WaddlerSQL = ((strings, ...params) =>
  resolveConnection().sql(strings, ...params)) as WaddlerSQL;

export const rawQuery = async <T>(text: string, values: unknown[] = []): Promise<T[]> => {
  const connection = resolveConnection();
  const result = await (connection.pool as Pool).query(text, values);
  return result.rows as T[];
};
