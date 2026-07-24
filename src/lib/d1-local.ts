// D1-compatible wrapper around node:sqlite for local development.
// Exposes the same API as Cloudflare D1: prepare().all(), .first(), .run(), .batch().
import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";

const DB_PATH = path.resolve(process.cwd(), "data", "minha-estante.db");

class D1Statement {
  private sql: string;
  private db: DatabaseSync;
  private params: any[];

  constructor(db: DatabaseSync, sql: string, params: any[] = []) {
    this.db = db;
    this.sql = sql;
    this.params = params;
  }

  bind(...args: any[]): D1Statement {
    return new D1Statement(this.db, this.sql, args);
  }

  all(): { results: Record<string, unknown>[]; success: boolean } {
    try {
      const stmt = this.db.prepare(this.sql);
      const results = stmt.all(...this.params);
      return { results: results as Record<string, unknown>[], success: true };
    } catch (e) {
      console.error("D1Local all() error:", e);
      return { results: [], success: false };
    }
  }

  first(): Record<string, unknown> | null {
    try {
      const stmt = this.db.prepare(this.sql);
      const row = stmt.get(...this.params);
      return (row as Record<string, unknown>) ?? null;
    } catch (e) {
      console.error("D1Local first() error:", e);
      return null;
    }
  }

  run(): { success: boolean; meta: { changes: number; last_row_id: number } } {
    try {
      const stmt = this.db.prepare(this.sql);
      const info = stmt.run(...this.params);
      return {
        success: true,
        meta: { changes: Number(info.changes), last_row_id: Number(info.lastInsertRowid) },
      };
    } catch (e) {
      console.error("D1Local run() error:", e);
      return { success: false, meta: { changes: 0, last_row_id: 0 } };
    }
  }
}

class D1Database {
  private db: DatabaseSync;

  constructor(db: DatabaseSync) {
    this.db = db;
  }

  prepare(sql: string): D1Statement {
    return new D1Statement(this.db, sql);
  }

  batch(statements: D1Statement[]): { results: Record<string, unknown>[]; success: boolean }[] {
    const results: { results: Record<string, unknown>[]; success: boolean }[] = [];
    // node:sqlite doesn't have an explicit transaction API like better-sqlite3,
    // but we can execute BEGIN/COMMIT/ROLLBACK manually.
    try {
      this.db.exec("BEGIN TRANSACTION;");
      for (const stmt of statements) {
        results.push(stmt.all());
      }
      this.db.exec("COMMIT;");
    } catch (e) {
      this.db.exec("ROLLBACK;");
      console.error("D1Local batch() error:", e);
    }
    return results;
  }

  exec(sql: string): void {
    this.db.exec(sql);
  }

  close(): void {
    // node:sqlite DatabaseSync's close method is close()
    this.db.close();
  }
}

import { PostgresD1Database } from "./d1-postgres";

let _instance: any = null;

export function getLocalDB(): any {
  if (_instance) return _instance;

  const DEFAULT_SUPABASE_URL = "postgresql://postgres.lwmdotggpvcwhetqkyju:aZ6w5IOtjyiqyg5E@aws-0-sa-east-1.pooler.supabase.com:6543/postgres";
  const pgUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL || process.env.SUPABASE_URL || (process.env.VERCEL || process.env.NODE_ENV === "production" ? DEFAULT_SUPABASE_URL : undefined);
  if (pgUrl) {
    _instance = new PostgresD1Database(pgUrl);
    return _instance;
  }

  // Ensure data directory exists
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const db = new DatabaseSync(DB_PATH);
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec("PRAGMA foreign_keys = ON;");
  _instance = new D1Database(db);
  return _instance;
}

export { D1Database, D1Statement };