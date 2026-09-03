import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { bindings } from "../bindings.server";
import { exigirUsuario, usuarioDaSessao } from "../auth.server";

function db() {
  const { DB } = bindings();
  if (!DB) throw new Error("Banco de dados indisponível");
  return DB;
}

// Garante tabelas de salas de leitura e participantes
let schemaSalasGarantido = false;
async function garantirTabelasSalas() {
  if (schemaSalasGarantido) return;
  try {
    const isPg = (db() as any).isPostgres;
    if (isPg) {
      await db().prepare(`
        CREATE TABLE IF NOT EXISTS salas_leitura (
          id SERIAL PRIMARY KEY,
          codigo TEXT UNIQUE NOT NULL,
          livro_id INTEGER NOT NULL,
          livro_titulo TEXT NOT NULL,
          livro_autor TEXT NOT NULL,
          livro_capa TEXT,
          host_usuario_id INTEGER NOT NULL,
          pagina_atual INTEGER DEFAULT 1,
          total_paginas INTEGER DEFAULT 1,
          status TEXT DEFAULT 'ativa',
          criado_em TEXT DEFAULT CURRENT_TIMESTAMP,
          atualizado_em TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `).run();

      await db().prepare(`
        CREATE TABLE IF NOT EXISTS sala_participantes (
          id SERIAL PRIMARY KEY,
          sala_id INTEGER NOT NULL,
          usuario_id INTEGER NOT NULL,
          pagina_pronta INTEGER DEFAULT 0,
          ultimo_sinal TEXT DEFAULT CURRENT_TIMESTAMP,
          reacao TEXT,
          reacao_em TEXT,
          UNIQUE(sala_id, usuario_id)
        )
      `).run();

      await db().prepare(`
        CREATE TABLE IF NOT EXISTS sala_mensagens (
          id SERIAL PRIMARY KEY,
          sala_id INTEGER NOT NULL,
          usuario_id INTEGER NOT NULL,
          mensagem TEXT NOT NULL,
          criado_em TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `).run();
    } else {
      await db().prepare(`
        CREATE TABLE IF NOT EXISTS salas_leitura (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          codigo TEXT UNIQUE NOT NULL,
          livro_id INTEGER NOT NULL,
          livro_titulo TEXT NOT NULL,
          livro_autor TEXT NOT NULL,
          livro_capa TEXT,
          host_usuario_id INTEGER NOT NULL,
          pagina_atual INTEGER DEFAULT 1,
          total_paginas INTEGER DEFAULT 1,
          status TEXT DEFAULT 'ativa',
          criado_em TEXT DEFAULT (datetime('now')),
          atualizado_em TEXT DEFAULT (datetime('now'))
        )
      `).run();

      await db().prepare(`
        CREATE TABLE IF NOT EXISTS sala_participantes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          sala_id INTEGER NOT NULL,
          usuario_id INTEGER NOT NULL,
          pagina_pronta INTEGER DEFAULT 0,
          ultimo_sinal TEXT DEFAULT (datetime('now')),
          reacao TEXT,
          reacao_em TEXT,
          UNIQUE(sala_id, usuario_id)
        )
      `).run();

      await db().prepare(`
        CREATE TABLE IF NOT EXISTS sala_mensagens (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          sala_id INTEGER NOT NULL,
          usuario_id INTEGER NOT NULL,
          mensagem TEXT NOT NULL,
          criado_em TEXT DEFAULT (datetime('now'))
        )
      `).run();
    }
  } catch (e) {
    console.error("Erro ao garantir tabelas de salas_leitura:", e);
  } finally {
    schemaSalasGarantido = true;
  }
}

function gerarCodigoSala(): string {
  const chars = "abcdefghjkmnpqrstuvwxyz23456789";
  let out = "";
  for (let i = 0; i < 6; i++) {
    out += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return out;
}

export type SalaMensagem = {
  id: number;
  usuarioId: number;
  usuarioNome: string;
  mensagem: string;
  criadoEm: string;
};

export type ParticipanteSala = {
  usuarioId: number;
  nome: string;
  usuario: string;
  paginaPronta: number;
  estaProntoNaPaginaAtual: boolean;
  ultimoSinal: string;
  estaConectado: boolean;
  reacao: string | null;
  reacaoEm: string | null;
};

export type SalaLeituraDetalhes = {
  id: number;
  codigo: string;
  livroId: number;
  livroTitulo: string;
  livroAutor: string;
  livroCapa: string | null;
  hostUsuarioId: number;
  hostNome: string;
  paginaAtual: number;
  totalPaginas: number;
  status: "ativa" | "encerrada";
  souHost: boolean;
  participantes: ParticipanteSala[];
  totalProntos: number;
  totalParticipantes: number;
  mensagens: SalaMensagem[];
  mensagens: SalaMensagem[];
};

// 1. Criar ou reativar sala de leitura para um livro
export const criarSalaLeitura = createServerFn({ method: "POST" })
  .validator(
    z.object({
      livroId: z.number().int(),
      paginaInicial: z.number().int().default(1),
      totalPaginas: z.number().int().default(1),
    })
  )
  .handler(async ({ data }): Promise<{ ok: boolean; codigo?: string; erro?: string }> => {
    const u = await exigirUsuario();
    await garantirTabelasSalas();

    try {
      const livro = await db()
        .prepare("SELECT id, titulo, autor, capa FROM livros WHERE id = ?")
        .bind(data.livroId)
        .first<{ id: number; titulo: string; autor: string; capa: string | null }>();

      if (!livro) {
        return { ok: false, erro: "Livro não encontrado." };
      }

      // Encerra salas ativas anteriores do mesmo host
      try {
        await db()
          .prepare("UPDATE salas_leitura SET status = 'encerrada' WHERE host_usuario_id = ? AND status = 'ativa'")
          .bind(u.id)
          .run();
      } catch {}

      const codigo = gerarCodigoSala();

      const res = await db()
        .prepare(
          `INSERT INTO salas_leitura 
           (codigo, livro_id, livro_titulo, livro_autor, livro_capa, host_usuario_id, pagina_atual, total_paginas, status, criado_em, atualizado_em)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ativa', datetime('now'), datetime('now'))`
        )
        .bind(codigo, livro.id, livro.titulo, livro.autor, livro.capa || null, u.id, data.paginaInicial, data.totalPaginas)
        .run();

      const salaId = Number(res.meta.last_row_id);

      // Adiciona o host como participante ativo
      await db()
        .prepare(
          `INSERT INTO sala_participantes (sala_id, usuario_id, pagina_pronta, ultimo_sinal)
           VALUES (?, ?, ?, datetime('now'))
           ON CONFLICT(sala_id, usuario_id) DO UPDATE SET pagina_pronta = excluded.pagina_pronta, ultimo_sinal = datetime('now')`
        )
        .bind(salaId, u.id, data.paginaInicial)
        .run();

      return { ok: true, codigo };
    } catch (e: any) {
      console.error("Erro ao criar sala de leitura:", e);
      return { ok: false, erro: e.message || "Falha ao criar sala de leitura." };
    }
  });

// 2. Obter estado da sala de leitura
export const obterSalaLeitura = createServerFn({ method: "POST" })
  .validator(z.object({ codigo: z.string() }))
  .handler(async ({ data }): Promise<SalaLeituraDetalhes | null> => {
    const u = await usuarioDaSessao();
    await garantirTabelasSalas();

    try {
      const sala = await db()
        .prepare(
          `SELECT s.id, s.codigo, s.livro_id AS "livroId", s.livro_titulo AS "livroTitulo", 
                  s.livro_autor AS "livroAutor", s.livro_capa AS "livroCapa",
                  s.host_usuario_id AS "hostUsuarioId", u.nome AS "hostNome",
                  s.pagina_atual AS "paginaAtual", s.total_paginas AS "totalPaginas",
                  s.status
           FROM salas_leitura s
           JOIN usuarios u ON u.id = s.host_usuario_id
           WHERE s.codigo = ?`
        )
        .bind(data.codigo.toLowerCase().trim())
        .first<{
          id: number;
          codigo: string;
          livroId: number;
          livroTitulo: string;
          livroAutor: string;
          livroCapa: string | null;
          hostUsuarioId: number;
          hostNome: string;
          paginaAtual: number;
          totalPaginas: number;
          status: "ativa" | "encerrada";
        }>();

      if (!sala) return null;

      // Se o usuário logado está consultando a sala, atualiza o sinal de presença dele
      if (u) {
        try {
          await db()
            .prepare(
              `INSERT INTO sala_participantes (sala_id, usuario_id, ultimo_sinal)
               VALUES (?, ?, datetime('now'))
               ON CONFLICT(sala_id, usuario_id) DO UPDATE SET ultimo_sinal = datetime('now')`
            )
            .bind(sala.id, u.id)
            .run();
        } catch {}
      }

      // Busca participantes da sala
      const participantesRaw = await db()
        .prepare(
          `SELECT p.usuario_id AS "usuarioId", u.nome, u.usuario, 
                  p.pagina_pronta AS "paginaPronta", p.ultimo_sinal AS "ultimoSinal",
                  p.reacao, p.reacao_em AS "reacaoEm"
           FROM sala_participantes p
           JOIN usuarios u ON u.id = p.usuario_id
           WHERE p.sala_id = ?
           ORDER BY CASE WHEN p.usuario_id = ? THEN 0 ELSE 1 END, u.nome`
        )
        .bind(sala.id, sala.hostUsuarioId)
        .all<{
          usuarioId: number;
          nome: string;
          usuario: string;
          paginaPronta: number;
          ultimoSinal: string;
          reacao: string | null;
          reacaoEm: string | null;
        }>();

      const participantes: ParticipanteSala[] = (participantesRaw.results || []).map((p) => {
        const pagPronta = Number(p.paginaPronta || 0);
        const estaPronto = pagPronta >= Number(sala.paginaAtual);
        return {
          usuarioId: p.usuarioId,
          nome: p.nome,
          usuario: p.usuario,
          paginaPronta: pagPronta,
          estaProntoNaPaginaAtual: estaPronto,
          ultimoSinal: p.ultimoSinal,
          estaConectado: true,
          reacao: p.reacao || null,
          reacaoEm: p.reacaoEm || null,
        };
      });

      const totalProntos = participantes.filter((p) => p.estaProntoNaPaginaAtual).length;

      return {
        id: sala.id,
        codigo: sala.codigo,
        livroId: sala.livroId,
        livroTitulo: sala.livroTitulo,
        livroAutor: sala.livroAutor,
        livroCapa: sala.livroCapa,
        hostUsuarioId: sala.hostUsuarioId,
        hostNome: sala.hostNome,
        paginaAtual: Number(sala.paginaAtual),
        totalPaginas: Number(sala.totalPaginas),
        status: sala.status,
        souHost: u ? u.id === sala.hostUsuarioId : false,
        participantes,
        totalProntos,
        totalParticipantes: participantes.length,
      };
    } catch (e) {
      console.error("Erro ao obter sala de leitura:", e);
      return null;
    }
  });

// 3. Obter sala ativa de um livro específico (para sugerir entrada ao abrir o leitor)
export const obterSalaAtivaDoLivro = createServerFn({ method: "POST" })
  .validator(z.object({ livroId: z.number().int() }))
  .handler(async ({ data }): Promise<{ temSala: boolean; codigo?: string; hostNome?: string; livroTitulo?: string } | null> => {
    await garantirTabelasSalas();
    try {
      const row = await db()
        .prepare(
          `SELECT s.codigo, u.nome AS "hostNome", s.livro_titulo AS "livroTitulo"
           FROM salas_leitura s
           JOIN usuarios u ON u.id = s.host_usuario_id
           WHERE s.livro_id = ? AND s.status = 'ativa'
           ORDER BY s.id DESC LIMIT 1`
        )
        .bind(data.livroId)
        .first<{ codigo: string; hostNome: string; livroTitulo: string }>();

      if (!row) return { temSala: false };
      return {
        temSala: true,
        codigo: row.codigo,
        hostNome: row.hostNome,
        livroTitulo: row.livroTitulo,
      };
    } catch {
      return { temSala: false };
    }
  });

// 4. Listar todas as salas ativas na casa (para o banner no cabeçalho/estante)
export const listarSalasAtivas = createServerFn({ method: "POST" }).handler(async () => {
  await garantirTabelasSalas();
  try {
    const { results } = await db()
      .prepare(
        `SELECT s.codigo, s.livro_id AS "livroId", s.livro_titulo AS "livroTitulo", 
                s.livro_autor AS "livroAutor", s.livro_capa AS "livroCapa",
                u.nome AS "hostNome", s.host_usuario_id AS "hostUsuarioId",
                (SELECT COUNT(*) FROM sala_participantes sp WHERE sp.sala_id = s.id) AS "numParticipantes"
         FROM salas_leitura s
         JOIN usuarios u ON u.id = s.host_usuario_id
         WHERE s.status = 'ativa'
         ORDER BY s.id DESC`
      )
      .all<{
        codigo: string;
        livroId: number;
        livroTitulo: string;
        livroAutor: string;
        livroCapa: string | null;
        hostNome: string;
        hostUsuarioId: number;
        numParticipantes: number;
      }>();

    return results || [];
  } catch {
    return [];
  }
});

// 5. Entrar em uma sala de leitura
export const entrarSalaLeitura = createServerFn({ method: "POST" })
  .validator(z.object({ codigo: z.string() }))
  .handler(async ({ data }) => {
    const u = await exigirUsuario();
    await garantirTabelasSalas();

    const sala = await db()
      .prepare("SELECT id, status FROM salas_leitura WHERE codigo = ?")
      .bind(data.codigo.toLowerCase().trim())
      .first<{ id: number; status: string }>();

    if (!sala || sala.status !== "ativa") {
      return { ok: false, erro: "Sala não encontrada ou já encerrada." };
    }

    try {
      await db()
        .prepare(
          `INSERT INTO sala_participantes (sala_id, usuario_id, ultimo_sinal)
           VALUES (?, ?, datetime('now'))
           ON CONFLICT(sala_id, usuario_id) DO UPDATE SET ultimo_sinal = datetime('now')`
        )
        .bind(sala.id, u.id)
        .run();
      return { ok: true };
    } catch (e: any) {
      return { ok: false, erro: e.message || "Erro ao entrar na sala." };
    }
  });

// 6. Sincronizar página pelo Host
export const sincronizarPaginaHost = createServerFn({ method: "POST" })
  .validator(z.object({ codigo: z.string(), paginaAtual: z.number().int() }))
  .handler(async ({ data }) => {
    const u = await exigirUsuario();
    await garantirTabelasSalas();

    const sala = await db()
      .prepare("SELECT id, host_usuario_id FROM salas_leitura WHERE codigo = ? AND status = 'ativa'")
      .bind(data.codigo)
      .first<{ id: number; host_usuario_id: number }>();

    if (!sala || sala.host_usuario_id !== u.id) {
      return { ok: false, erro: "Apenas o host pode sincronizar a página." };
    }

    try {
      await db()
        .prepare("UPDATE salas_leitura SET pagina_atual = ?, atualizado_em = datetime('now') WHERE id = ?")
        .bind(data.paginaAtual, sala.id)
        .run();

      // Marca o host como pronto na página dele
      await db()
        .prepare(
          `UPDATE sala_participantes 
           SET pagina_pronta = ?, ultimo_sinal = datetime('now') 
           WHERE sala_id = ? AND usuario_id = ?`
        )
        .bind(data.paginaAtual, sala.id, u.id)
        .run();

      return { ok: true };
    } catch (e: any) {
      return { ok: false, erro: e.message };
    }
  });

// 7. Marcar página como pronta (terminou de ler a página)
export const marcarPaginaPronta = createServerFn({ method: "POST" })
  .validator(z.object({ codigo: z.string(), pagina: z.number().int() }))
  .handler(async ({ data }) => {
    const u = await exigirUsuario();
    await garantirTabelasSalas();

    const sala = await db()
      .prepare("SELECT id FROM salas_leitura WHERE codigo = ? AND status = 'ativa'")
      .bind(data.codigo)
      .first<{ id: number }>();

    if (!sala) return { ok: false, erro: "Sala inativa" };

    try {
      await db()
        .prepare(
          `UPDATE sala_participantes 
           SET pagina_pronta = ?, ultimo_sinal = datetime('now') 
           WHERE sala_id = ? AND usuario_id = ?`
        )
        .bind(data.pagina, sala.id, u.id)
        .run();
      return { ok: true };
    } catch (e: any) {
      return { ok: false, erro: e.message };
    }
  });

// 8. Enviar reação ao vivo (❤️, 😱, 😭, ☕, 🔥, 💡)
export const enviarReacao = createServerFn({ method: "POST" })
  .validator(z.object({ codigo: z.string(), reacao: z.string().max(10) }))
  .handler(async ({ data }) => {
    const u = await exigirUsuario();
    await garantirTabelasSalas();

    const sala = await db()
      .prepare("SELECT id FROM salas_leitura WHERE codigo = ? AND status = 'ativa'")
      .bind(data.codigo)
      .first<{ id: number }>();

    if (!sala) return { ok: false, erro: "Sala inativa" };

    try {
      await db()
        .prepare(
          `UPDATE sala_participantes 
           SET reacao = ?, reacao_em = datetime('now'), ultimo_sinal = datetime('now')
           WHERE sala_id = ? AND usuario_id = ?`
        )
        .bind(data.reacao, sala.id, u.id)
        .run();
      return { ok: true };
    } catch (e: any) {
      return { ok: false, erro: e.message };
    }
  });

// 9. Sair da sala
export const sairSalaLeitura = createServerFn({ method: "POST" })
  .validator(z.object({ codigo: z.string() }))
  .handler(async ({ data }) => {
    const u = await exigirUsuario();
    await garantirTabelasSalas();

    const sala = await db()
      .prepare("SELECT id, host_usuario_id FROM salas_leitura WHERE codigo = ?")
      .bind(data.codigo)
      .first<{ id: number; host_usuario_id: number }>();

    if (!sala) return { ok: true };

    try {
      // Se for o host saindo, encerra a sala para todos
      if (sala.host_usuario_id === u.id) {
        await db()
          .prepare("UPDATE salas_leitura SET status = 'encerrada', atualizado_em = datetime('now') WHERE id = ?")
          .bind(sala.id)
          .run();
      } else {
        await db()
          .prepare("DELETE FROM sala_participantes WHERE sala_id = ? AND usuario_id = ?")
          .bind(sala.id, u.id)
          .run();
      }
      return { ok: true };
    } catch (e: any) {
      return { ok: false, erro: e.message };
    }
  });

// 10. Encerrar sala (exclusivo do Host)
export const encerrarSala = createServerFn({ method: "POST" })
  .validator(z.object({ codigo: z.string() }))
  .handler(async ({ data }) => {
    const u = await exigirUsuario();
    await garantirTabelasSalas();

    const sala = await db()
      .prepare("SELECT id, host_usuario_id FROM salas_leitura WHERE codigo = ?")
      .bind(data.codigo)
      .first<{ id: number; host_usuario_id: number }>();

    if (!sala || sala.host_usuario_id !== u.id) {
      return { ok: false, erro: "Apenas o host pode encerrar a sala." };
    }

    try {
      await db()
        .prepare("UPDATE salas_leitura SET status = 'encerrada', atualizado_em = datetime('now') WHERE id = ?")
        .bind(sala.id)
        .run();
      return { ok: true };
    } catch (e: any) {
      return { ok: false, erro: e.message };
    }
  });

// 11. Convidar leitor para a sala (cria uma notificação/carta especial para o leitor convidado)
export const convidarLeitorParaSala = createServerFn({ method: "POST" })
  .validator(
    z.object({
      codigo: z.string(),
      paraUsuarioId: z.number().int(),
    })
  )
  .handler(async ({ data }) => {
    const u = await exigirUsuario();
    await garantirTabelasSalas();

    if (data.paraUsuarioId === u.id) {
      return { ok: false, erro: "Você não pode convidar a si mesmo." };
    }

    const sala = await db()
      .prepare("SELECT id, livro_id, livro_titulo, host_usuario_id FROM salas_leitura WHERE codigo = ? AND status = 'ativa'")
      .bind(data.codigo)
      .first<{ id: number; livro_id: number; livro_titulo: string; host_usuario_id: number }>();

    if (!sala) {
      return { ok: false, erro: "Sala de leitura não encontrada ou encerrada." };
    }

    const remetenteNome = u.nome || "Um leitor da casa";
    const corpoCarta = `🛋️ **${remetenteNome}** te convidou para uma Sessão Coletiva de **"${sala.livro_titulo}"** no Modo Cineminha!\n\nAcesse o livro ou clique no botão abaixo para entrar na sala sincronizada em tempo real.\n\n[SALA_LEITURA:${sala.livro_id}]`;

    try {
      await db()
        .prepare(
          "INSERT INTO cartas (de_usuario_id, para_usuario_id, corpo, livro_condicao_id) VALUES (?, ?, ?, NULL)"
        )
        .bind(u.id, data.paraUsuarioId, corpoCarta)
        .run();

      return { ok: true };
    } catch (e: any) {
      return { ok: false, erro: e.message || "Erro ao enviar convite" };
    }
  });



// 12. Enviar mensagem no chat da sala
export const enviarMensagemSala = createServerFn({ method: "POST" })
  .validator(z.object({ codigo: z.string(), mensagem: z.string().min(1).max(500) }))
  .handler(async ({ data }) => {
    const u = await exigirUsuario();
    await garantirTabelasSalas();

    const sala = await db()
      .prepare("SELECT id FROM salas_leitura WHERE codigo = ? AND status = 'ativa'")
      .bind(data.codigo)
      .first<{ id: number }>();

    if (!sala) return { ok: false, erro: "Sala inativa ou nao encontrada" };

    try {
      await db()
        .prepare(
          "INSERT INTO sala_mensagens (sala_id, usuario_id, mensagem) VALUES (?, ?, ?)"
        )
        .bind(sala.id, u.id, data.mensagem.trim())
        .run();
        
      // Atualiza ultimo sinal do participante
      await db()
        .prepare(
          `UPDATE sala_participantes 
           SET ultimo_sinal = datetime('now')
           WHERE sala_id = ? AND usuario_id = ?`
        )
        .bind(sala.id, u.id)
        .run();

      return { ok: true };
    } catch (e: any) {
      return { ok: false, erro: e.message };
    }
  });
