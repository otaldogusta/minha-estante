import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { bindings } from "../bindings.server";
import { exigirUsuario } from "../auth.server";

function db() {
  const { DB } = bindings();
  if (!DB) throw new Error("Banco de dados indisponível");
  return DB;
}

export type CartaRecebida = {
  id: number;
  corpo: string | null; // null enquanto lacrada
  remetente: string;
  criado_em: string;
  lida: number;
  desbloqueada: number;
  livro_titulo: string | null;
  livro_id: number | null;
};

export type CartaEnviada = {
  id: number;
  corpo: string;
  destinatario: string;
  criado_em: string;
  lida: number;
  desbloqueada: number;
  livro_titulo: string | null;
};

// Uma carta está desbloqueada se não tem condição, ou se o livro condicionado já foi lido.
const SQL_DESBLOQUEADA = `(c.livro_condicao_id IS NULL OR EXISTS (
  SELECT 1 FROM livros lv WHERE lv.id = c.livro_condicao_id AND lv.status = 'lido'
))`;

export const listarCartas = createServerFn({ method: "GET" }).handler(async () => {
  const u = await exigirUsuario();
  const recebidas = await db()
    .prepare(
      `SELECT c.id,
              CASE WHEN ${SQL_DESBLOQUEADA} THEN c.corpo ELSE NULL END AS corpo,
              ur.nome AS remetente, c.criado_em, c.lida,
              ${SQL_DESBLOQUEADA} AS desbloqueada,
              l.titulo AS livro_titulo, l.id AS livro_id
       FROM cartas c
       JOIN usuarios ur ON ur.id = c.de_usuario_id
       LEFT JOIN livros l ON l.id = c.livro_condicao_id
       WHERE c.para_usuario_id = ?
       ORDER BY c.criado_em DESC, c.id DESC`
    )
    .bind(u.id)
    .all<CartaRecebida>();
  const enviadas = await db()
    .prepare(
      `SELECT c.id, c.corpo, ud.nome AS destinatario, c.criado_em, c.lida,
              ${SQL_DESBLOQUEADA} AS desbloqueada,
              l.titulo AS livro_titulo
       FROM cartas c
       JOIN usuarios ud ON ud.id = c.para_usuario_id
       LEFT JOIN livros l ON l.id = c.livro_condicao_id
       WHERE c.de_usuario_id = ?
       ORDER BY c.criado_em DESC, c.id DESC`
    )
    .bind(u.id)
    .all<CartaEnviada>();
  return { recebidas: recebidas.results, enviadas: enviadas.results };
});

// Destinatários possíveis (as outras contas) + os livros públicos ainda não
// lidos de CADA destinatário (para lacrar a carta a um livro da pessoa).
export const dadosParaEscrever = createServerFn({ method: "GET" }).handler(async () => {
  const u = await exigirUsuario();
  const destinatarios = await db()
    .prepare("SELECT id, nome FROM usuarios WHERE id != ? ORDER BY nome")
    .bind(u.id)
    .all<{ id: number; nome: string }>();
  const livros = await db()
    .prepare(
      `SELECT id, titulo, status, usuario_id FROM livros
       WHERE usuario_id != ? AND privado = 0 AND status IN ('lendo', 'quero_ler')
       ORDER BY CASE status WHEN 'lendo' THEN 0 ELSE 1 END, titulo`
    )
    .bind(u.id)
    .all<{ id: number; titulo: string; status: string; usuario_id: number }>();
  return { destinatarios: destinatarios.results, livros: livros.results };
});

export const enviarCarta = createServerFn({ method: "POST" })
  .validator(
    z.object({
      para: z.number().int(),
      corpo: z.string().min(1).max(8000),
      livroCondicaoId: z.number().int().nullish(),
    })
  )
  .handler(async ({ data }) => {
    const u = await exigirUsuario();
    if (data.para === u.id) return { ok: false as const, erro: "Escolha outra pessoa." };
    
    // Rate limit: máximo 10 cartas enviadas na última hora (proteção contra abuso/spam)
    const recentLetters = await db()
      .prepare("SELECT COUNT(*) AS count FROM cartas WHERE de_usuario_id = ? AND criado_em >= datetime('now', '-1 hour')")
      .bind(u.id)
      .first<{ count: number }>();
    if (recentLetters && recentLetters.count >= 10) {
      return { ok: false as const, erro: "Você atingiu o limite de envio de cartas (máximo 10 por hora)." };
    }

    const destino = await db().prepare("SELECT 1 FROM usuarios WHERE id = ?").bind(data.para).first();
    if (!destino) return { ok: false as const, erro: "Destinatário não encontrado." };
    if (data.livroCondicaoId) {
      const livro = await db()
        .prepare("SELECT status, usuario_id, privado FROM livros WHERE id = ?")
        .bind(data.livroCondicaoId)
        .first<{ status: string; usuario_id: number; privado: number }>();
      if (!livro || livro.usuario_id !== data.para || livro.privado === 1) {
        return { ok: false as const, erro: "Escolha um livro da estante pública do destinatário." };
      }
      if (livro.status === "lido") return { ok: false as const, erro: "Esse livro já foi lido; a carta chegaria aberta." };
    }
    await db()
      .prepare("INSERT INTO cartas (de_usuario_id, para_usuario_id, corpo, livro_condicao_id) VALUES (?, ?, ?, ?)")
      .bind(u.id, data.para, data.corpo.trim(), data.livroCondicaoId ?? null)
      .run();
    return { ok: true as const };
  });

// Editar/excluir: só o remetente, e só enquanto não foi lida.
export const editarCarta = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.number().int(), corpo: z.string().min(1).max(8000) }))
  .handler(async ({ data }) => {
    const u = await exigirUsuario();
    const res = await db()
      .prepare("UPDATE cartas SET corpo = ? WHERE id = ? AND de_usuario_id = ? AND lida = 0")
      .bind(data.corpo.trim(), data.id, u.id)
      .run();
    return { ok: res.meta.changes > 0 };
  });

export const excluirCarta = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.number().int() }))
  .handler(async ({ data }) => {
    const u = await exigirUsuario();
    const res = await db()
      .prepare("DELETE FROM cartas WHERE id = ? AND de_usuario_id = ? AND lida = 0")
      .bind(data.id, u.id)
      .run();
    return { ok: res.meta.changes > 0 };
  });

export const lerCarta = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.number().int() }))
  .handler(async ({ data }) => {
    const u = await exigirUsuario();
    await db()
      .prepare(
        `UPDATE cartas SET lida = 1, lida_em = datetime('now')
         WHERE id = ? AND para_usuario_id = ? AND lida = 0 AND ` +
          SQL_DESBLOQUEADA.replaceAll("c.", "cartas.")
      )
      .bind(data.id, u.id)
      .run();
    return { ok: true };
  });

// Badge do cabeçalho: cartas desbloqueadas e ainda não lidas.
export const contarCartasNovas = createServerFn({ method: "GET" }).handler(async () => {
  const u = await exigirUsuario();
  const row = await db()
    .prepare(
      `SELECT COUNT(*) AS n FROM cartas c
       WHERE c.para_usuario_id = ? AND c.lida = 0 AND ${SQL_DESBLOQUEADA}`
    )
    .bind(u.id)
    .first<{ n: number }>();
  return { novas: row?.n ?? 0 };
});

// Usado na celebração: cartas que acabaram de destravar com este livro.
export const cartasDesbloqueadasPorLivro = createServerFn({ method: "GET" })
  .validator(z.object({ livroId: z.number().int() }))
  .handler(async ({ data }) => {
    const u = await exigirUsuario();
    const { results } = await db()
      .prepare(
        `SELECT c.id, ur.nome AS remetente FROM cartas c
         JOIN usuarios ur ON ur.id = c.de_usuario_id
         WHERE c.para_usuario_id = ? AND c.livro_condicao_id = ? AND c.lida = 0`
      )
      .bind(u.id, data.livroId)
      .all<{ id: number; remetente: string }>();
    return results;
  });
