declare module "pg" {
  export interface QueryResult<T = unknown> {
    rows: T[];
  }

  export interface PoolConfig {
    connectionString?: string;
    ssl?: { rejectUnauthorized: boolean };
  }

  export class Pool {
    constructor(config?: PoolConfig);
    query<T = unknown>(text: string, values?: unknown[]): Promise<QueryResult<T>>;
    end(): Promise<void>;
  }
}
