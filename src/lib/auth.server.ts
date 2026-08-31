// Autenticação server-side: hash de senha (PBKDF2 via Web Crypto),
// sessões em D1 e cookie httpOnly.
import { getCookie, setCookie, deleteCookie } from "@tanstack/react-start/server";

import { bindings } from "./bindings.server";

const COOKIE = "estante_sessao";
const DIAS_SESSAO = 180;
const ITERACOES = 100000;

function db() {
  const { DB } = bindings();
  if (!DB) throw new Error("Banco de dados indisponível");
  return DB;
}

function hex(buf: ArrayBuffer | Uint8Array): string {
  const b = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  return [...b].map((x) => x.toString(16).padStart(2, "0")).join("");
}

function hexToBytes(s: string): Uint8Array {
  const out = new Uint8Array(s.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(s.slice(i * 2, i * 2 + 2), 16);
  return out;
}

async function pbkdf2(senha: string, salt: Uint8Array, iteracoes: number): Promise<string> {
  const material = await crypto.subtle.importKey("raw", new TextEncoder().encode(senha), "PBKDF2", false, [
    "deriveBits",
  ]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: salt as unknown as BufferSource, iterations: iteracoes },
    material,
    256
  );
  return hex(bits);
}

export async function hashSenha(senha: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const h = await pbkdf2(senha, salt, ITERACOES);
  return `pbkdf2$${ITERACOES}$${hex(salt)}$${h}`;
}

export async function verificarSenha(senha: string, armazenado: string): Promise<boolean> {
  const partes = armazenado.split("$");
  if (partes.length !== 4 || partes[0] !== "pbkdf2") return false;
  const h = await pbkdf2(senha, hexToBytes(partes[2]), Number(partes[1]));
  // comparação em tempo constante
  const a = hexToBytes(h);
  const b = hexToBytes(partes[3]);
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

export type Usuario = { id: number; nome: string; usuario: string };

const sessionCache = new Map<string, { user: Usuario | null; expires: number }>();

export async function criarSessao(usuarioId: number): Promise<void> {
  const token = hex(crypto.getRandomValues(new Uint8Array(32)));
  const expira = new Date(Date.now() + DIAS_SESSAO * 86400000).toISOString();
  await db().prepare("INSERT INTO sessoes (token, usuario_id, expira_em) VALUES (?, ?, ?)").bind(token, usuarioId, expira).run();
  // Limpeza oportunista de sessões vencidas.
  await db().prepare("DELETE FROM sessoes WHERE expira_em < datetime('now')").run();
  setCookie(COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: DIAS_SESSAO * 86400,
  });
}

export async function usuarioDaSessao(): Promise<Usuario | null> {
  const token = getCookie(COOKIE);
  if (!token || !/^[0-9a-f]{64}$/.test(token)) return null;

  const now = Date.now();
  const cached = sessionCache.get(token);

  if (cached && cached.expires > now) {
    return cached.user;
  }

  try {
    await db()
      .prepare("UPDATE sessoes SET ultimo_acesso = datetime('now') WHERE token = ?")
      .bind(token)
      .run();
  } catch {}

  const row = await db()
    .prepare(
      `SELECT u.id, u.nome, u.usuario FROM sessoes s
       JOIN usuarios u ON u.id = s.usuario_id
       WHERE s.token = ? AND s.expira_em > datetime('now')`
    )
    .bind(token)
    .first<Usuario>();

  const user = row ?? null;
  if (user) {
    try {
      await db()
        .prepare("UPDATE usuarios SET ultimo_acesso = datetime('now') WHERE id = ?")
        .bind(user.id)
        .run();
    } catch {}
  }
  sessionCache.set(token, { user, expires: now + 30_000 });
  return user;
}

export async function exigirUsuario(): Promise<Usuario> {
  const u = await usuarioDaSessao();
  if (!u) throw new Error("Não autenticado");
  return u;
}

export async function encerrarSessao(): Promise<void> {
  const token = getCookie(COOKIE);
  if (token) {
    sessionCache.delete(token);
    try {
      await db().prepare("DELETE FROM sessoes WHERE token = ?").bind(token).run();
    } catch {
      // Ignorar erro se DB estiver indisponível durante logout
    }
  }
  deleteCookie(COOKIE, {
    path: "/",
    secure: true,
    sameSite: "lax",
  });
}
