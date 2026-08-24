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

  // 4. COALESCE with criado_em timestamp column -> CAST to text
  result = result.replace(/COALESCE\(([^)]*?)criado_em([^)]*?)\)/gi, (match) => {
    if (match.includes("CAST(")) return match;
    return match.replace(/criado_em/g, "CAST(criado_em AS TEXT)");
  });

  return result;
}

function sanitizeRow<T>(row: T): T {
  if (!row) return row;
  const newRow = { ...row } as any;
  const numericColumns = [
    "id",
    "usuario_id",
    "ano",
    "paginas",
    "ano_leitura",
    "nota",
    "pagina_atual",
    "privado",
    "adaptacao",
    "vi_adaptacao",
    "valor",
    "carta_vista"
  ];
  for (const key of Object.keys(newRow)) {
    const val = newRow[key];
    if (val === null || val === undefined) continue;
    if (numericColumns.includes(key)) {
      if (typeof val === "string") {
        const num = Number(val);
        if (!isNaN(num)) {
          newRow[key] = num;
        }
      }
    }
  }
  return newRow as T;
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
      const sanitized = Array.from(rows).map(row => sanitizeRow(row as T));
      return { results: sanitized, success: true };
    } catch (e) {
      console.error("Postgres all() error:", e, "SQL:", this.sql);
      return { results: [], success: false };
    }
  }

  async first<T = Record<string, unknown>>(): Promise<T | null> {
    try {
      const pgSql = convertSqliteToPg(this.sql);
      const rows = await this.sqlClient.unsafe(pgSql, this.params);
      return rows[0] ? sanitizeRow(rows[0] as T) : null;
    } catch (e) {
      console.error("Postgres first() error:", e, "SQL:", this.sql);
      return null;
    }
  }

  async run(): Promise<{ success: boolean; meta: { changes: number; last_row_id: number } }> {
    try {
      let pgSql = convertSqliteToPg(this.sql);
      let lastRowId = 0;
      if (/^\s*INSERT\s+INTO/i.test(pgSql) && !/RETURNING/i.test(pgSql)) {
        try {
          const res = await this.sqlClient.unsafe(pgSql + " RETURNING id", this.params);
          if (res && res[0] && res[0].id) {
            lastRowId = Number(res[0].id) || 0;
          }
          return {
            success: true,
            meta: { changes: res.count ?? 1, last_row_id: lastRowId },
          };
        } catch {
          // Se falhar o RETURNING (ex: tabela sem coluna id), cai no fallback normal
        }
      }
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
  public isPostgres = true;
  private sqlClient: postgres.Sql;

  constructor(connectionString: string) {
    this.sqlClient = postgres(connectionString, {
      ssl: "require",
      // Serverless-friendly settings for Vercel + Supabase Transaction Pooler
      max: 1,
      idle_timeout: 10,
      connect_timeout: 10,
      // Required for Transaction Pooler (port 6543): it doesn't support
      // named prepared statements (only simple query protocol).
      prepare: false,
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
