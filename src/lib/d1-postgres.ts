// Supabase / PostgreSQL D1-compatible adapter.
// Allows TanStack Start server functions to run seamlessly on Vercel with Supabase PostgreSQL!
import postgres from "postgres";

function convertSqliteToPg(sql: string): string {
  let paramIdx = 1;
  let result = sql;

  // 1. Convert ? placeholders to $1, $2, …
  result = result.replace(/\?/g, () => `$${paramIdx++}`);

  // 2. datetime('now', '-N hours/minutes/days') → (NOW() + INTERVAL '-N hours')
  result = result.replace(
    /datetime\s*\(\s*'now'\s*,\s*'([+-]?\d+)\s+(hours?|minutes?|days?|seconds?)'\s*\)/gi,
    (_, amount, unit) => `(NOW() + INTERVAL '${amount} ${unit}')`
  );

  // 3. datetime('now') → NOW()
  result = result.replace(/datetime\s*\(\s*'now'\s*\)/gi, "NOW()");

  return result;
}

class PostgresStatement {
  private sql: string;
  private sqlClient: postgres.Sql;
  private params: any[];

  constructor(sqlClient: postgres.Sql, sql: string, params: any[] = []) {
    this.sqlClient = sqlClient;
    this.sql = sql;
    this.params = params;
  }

  bind(...args: any[]): PostgresStatement {
    return new PostgresStatement(this.sqlClient, this.sql, args);
  }

  async all<T = Record<string, unknown>>(): Promise<{ results: T[]; success: boolean }> {
    try {
      const pgSql = convertSqliteToPg(this.sql);
      const rows = await this.sqlClient.unsafe(pgSql, this.params);
      return { results: Array.from(rows) as T[], success: true };
    } catch (e) {
      console.error("Postgres all() error:", e, "SQL:", this.sql);
      return { results: [], success: false };
    }
  }

  async first<T = Record<string, unknown>>(): Promise<T | null> {
    try {
      const pgSql = convertSqliteToPg(this.sql);
      const rows = await this.sqlClient.unsafe(pgSql, this.params);
      return (rows[0] as T) ?? null;
    } catch (e) {
      console.error("Postgres first() error:", e, "SQL:", this.sql);
      return null;
    }
  }

  async run(): Promise<{ success: boolean; meta: { changes: number; last_row_id: number } }> {
    try {
      const pgSql = convertSqliteToPg(this.sql);
      const res = await this.sqlClient.unsafe(pgSql, this.params);
      return {
        success: true,
        meta: { changes: res.count ?? 0, last_row_id: 0 },
      };
    } catch (e) {
      console.error("Postgres run() error:", e, "SQL:", this.sql);
      return { success: false, meta: { changes: 0, last_row_id: 0 } };
    }
  }
}

export class PostgresD1Database {
  private sqlClient: postgres.Sql;

  constructor(connectionString: string) {
    this.sqlClient = postgres(connectionString, {
      ssl: "require",
      // Serverless-friendly: limit connections and release quickly
      max: 1,
      idle_timeout: 10,
      connect_timeout: 10,
    });
  }

  prepare(sql: string): PostgresStatement {
    return new PostgresStatement(this.sqlClient, sql);
  }

  async batch(statements: PostgresStatement[]): Promise<{ results: any[]; success: boolean }[]> {
    const results = [];
    for (const stmt of statements) {
      results.push(await stmt.all());
    }
    return results;
  }

  async exec(sql: string): Promise<void> {
    await this.sqlClient.unsafe(sql);
  }
}
