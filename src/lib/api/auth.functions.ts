import { createServerFn } from "@tanstack/react-start";
import { getRequestUrl } from "@tanstack/react-start/server";
import { z } from "zod";

import { bindings } from "../bindings.server";
import {
  criarSessao,
  encerrarSessao,
  exigirUsuario,
  hashSenha,
  usuarioDaSessao,
  verificarSenha,
} from "../auth.server";

function db() {
  const { DB } = bindings();
  if (!DB) throw new Error("Banco de dados indisponível");
  return DB;
}

async function garantirColunaStatusPresenca() {
  try {
    await db().prepare("ALTER TABLE usuarios ADD COLUMN status_presenca TEXT DEFAULT 'online'").run();
  } catch {
    // Coluna já existe
  }
}

export const sessaoAtual = createServerFn({ method: "GET" }).handler(async () => {
  const u = await usuarioDaSessao();
  if (!u) return { autenticado: false as const };
  await garantirColunaStatusPresenca();

  let email: string | null = null;
  let statusPresenca: "online" | "lendo" | "ocupado" | "invisivel" = "online";

  try {
    const row = await db()
      .prepare("SELECT email, status_presenca FROM usuarios WHERE id = ?")
      .bind(u.id)
      .first<{ email: string | null; status_presenca: string | null }>();
    email = row?.email ?? null;
    if (row?.status_presenca) {
      statusPresenca = row.status_presenca as any;
    }
  } catch {
    const row = await db()
      .prepare("SELECT email FROM usuarios WHERE id = ?")
      .bind(u.id)
      .first<{ email: string | null }>();
    email = row?.email ?? null;
  }

  return {
    autenticado: true as const,
    id: u.id,
    nome: u.nome,
    usuario: u.usuario,
    email,
    statusPresenca,
  };
});

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export const entrar = createServerFn({ method: "POST" })
  .validator(z.object({ usuario: z.string().min(1).max(80), senha: z.string().min(1).max(200) }))
  .handler(async ({ data }) => {
    const row = await db()
      .prepare("SELECT id, nome, usuario, senha_hash, carta_vista FROM usuarios WHERE usuario = ?")
      .bind(data.usuario.trim().toLowerCase())
      .first<{ id: number; nome: string; usuario: string; senha_hash: string; carta_vista: number }>();
    
    const senhaValida = row ? await verificarSenha(data.senha, row.senha_hash) : false;
    if (!row || !senhaValida) {
      // Pequeno delay (600ms) para mitigar scripts de força bruta em massa
      await new Promise((r) => setTimeout(r, 600));
      return { ok: false as const, erro: "Usuário ou senha incorretos." };
    }
    await criarSessao(row.id);
    return { ok: true as const, nome: row.nome, cartaPendente: row.carta_vista === 0 };
  });

export const sair = createServerFn({ method: "POST" }).handler(async () => {
  await encerrarSessao();
  return { ok: true };
});

// Carta de boas-vindas: pendente até ela guardar; depois fica em "Minha conta".
// A carta pertence à PRIMEIRA conta da casa (id 1) e só ela pode vê-la.
export const cartaStatus = createServerFn({ method: "GET" }).handler(async () => {
  const u = await exigirUsuario();
  const row = await db().prepare("SELECT carta_vista FROM usuarios WHERE id = ?").bind(u.id).first<{ carta_vista: number }>();
  return { vista: (row?.carta_vista ?? 0) === 1, nome: u.nome, dona: u.id === 1 };
});

export const guardarCarta = createServerFn({ method: "POST" }).handler(async () => {
  const u = await exigirUsuario();
  await db().prepare("UPDATE usuarios SET carta_vista = 1 WHERE id = ?").bind(u.id).run();
  return { ok: true };
});

// ------- Convites para novos leitores -------

function gerarCodigo(): string {
  const b = crypto.getRandomValues(new Uint8Array(12));
  return [...b].map((x) => x.toString(16).padStart(2, "0")).join("");
}

export const criarConvite = createServerFn({ method: "POST" }).handler(async () => {
  const u = await exigirUsuario();
  // Limite: 3 convites pendentes e ativos (não usados e criados a menos de 48 horas)
  const activeCount = await db()
    .prepare(
      `SELECT COUNT(*) as count FROM convites 
       WHERE criado_por = ? AND usado_por IS NULL AND criado_em >= datetime('now', '-48 hours')`
    )
    .bind(u.id)
    .first<{ count: number }>();
  
  if (activeCount && activeCount.count >= 3) {
    throw new Error("Você já atingiu o limite de 3 convites pendentes ativos.");
  }

  const codigo = gerarCodigo();
  await db().prepare("INSERT INTO convites (codigo, criado_por) VALUES (?, ?)").bind(codigo, u.id).run();
  return { codigo };
});

export const listarConvites = createServerFn({ method: "GET" }).handler(async () => {
  const u = await exigirUsuario();
  const { results } = await db()
    .prepare(
      `SELECT c.codigo, c.criado_em, c.usado_em, un.nome AS usado_por_nome,
       (c.criado_em < datetime('now', '-48 hours')) AS expirado
       FROM convites c LEFT JOIN usuarios un ON un.id = c.usado_por
       WHERE c.criado_por = ?
       ORDER BY c.criado_em DESC`
    )
    .bind(u.id)
    .all<{ codigo: string; criado_em: string; usado_em: string | null; usado_por_nome: string | null; expirado: number }>();
  return results;
});

export const revogarConvite = createServerFn({ method: "POST" })
  .validator(z.object({ codigo: z.string().regex(/^[0-9a-f]{24}$/) }))
  .handler(async ({ data }) => {
    const u = await exigirUsuario();
    // Só permite revogar convites não usados criados pelo próprio usuário logado
    await db()
      .prepare("DELETE FROM convites WHERE codigo = ? AND criado_por = ? AND usado_por IS NULL")
      .bind(data.codigo, u.id)
      .run();
    return { ok: true };
  });

// Público: valida um convite (para a tela de cadastro).
export const validarConvite = createServerFn({ method: "GET" })
  .validator(z.object({ codigo: z.string().regex(/^[0-9a-f]{24}$/) }))
  .handler(async ({ data }) => {
    const row = await db()
      .prepare(
        `SELECT c.usado_por, uc.nome AS convidou,
         (c.criado_em < datetime('now', '-48 hours')) AS expirado
         FROM convites c
         JOIN usuarios uc ON uc.id = c.criado_por
         WHERE c.codigo = ?`
      )
      .bind(data.codigo)
      .first<{ usado_por: number | null; convidou: string; expirado: number }>();
    if (!row) return { valido: false as const };
    if (row.usado_por) return { valido: false as const, usado: true };
    if (row.expirado === 1) return { valido: false as const, expirado: true };
    return { valido: true as const, convidou: row.convidou };
  });

// Público: cria a conta a partir de um convite válido e já entra.
export const cadastrarComConvite = createServerFn({ method: "POST" })
  .validator(
    z.object({
      codigo: z.string().regex(/^[0-9a-f]{24}$/),
      nome: z.string().min(1).max(80),
      usuario: z.string().min(3).max(80).regex(/^[a-z0-9._-]+$/i, "Use letras, números, ponto, hífen"),
      senha: z.string().min(6).max(200),
    })
  )
  .handler(async ({ data }) => {
    const convite = await db()
      .prepare(
        `SELECT usado_por, (criado_em < datetime('now', '-48 hours')) AS expirado
         FROM convites WHERE codigo = ?`
      )
      .bind(data.codigo)
      .first<{ usado_por: number | null; expirado: number }>();
    if (!convite || convite.usado_por || convite.expirado === 1) {
      return { ok: false as const, erro: "Convite inválido, expirado ou já usado." };
    }

    const usuario = data.usuario.trim().toLowerCase();
    const existe = await db().prepare("SELECT 1 FROM usuarios WHERE usuario = ?").bind(usuario).first();
    if (existe) return { ok: false as const, erro: "Esse nome de usuário já está em uso." };

    const nomeJaExiste = await db()
      .prepare("SELECT 1 FROM usuarios WHERE lower(trim(nome)) = lower(trim(?))")
      .bind(data.nome.trim())
      .first();
    if (nomeJaExiste) return { ok: false as const, erro: "Já existe um leitor com esse nome. Escolha um nome diferente." };

    const hash = await hashSenha(data.senha);
    // carta_vista = 1: a carta de boas-vindas é exclusiva da primeira conta.
    const res = await db()
      .prepare("INSERT INTO usuarios (nome, usuario, senha_hash, carta_vista) VALUES (?, ?, ?, 1)")
      .bind(data.nome.trim(), usuario, hash)
      .run();
    const novoId = Number(res.meta.last_row_id);
    await db()
      .prepare("UPDATE convites SET usado_por = ?, usado_em = datetime('now') WHERE codigo = ? AND usado_por IS NULL")
      .bind(novoId, data.codigo)
      .run();
    await criarSessao(novoId);
    return { ok: true as const, nome: data.nome.trim() };
  });

// ------- Recuperação de senha -------

function gerarToken(): string {
  const b = crypto.getRandomValues(new Uint8Array(24));
  return [...b].map((x) => x.toString(16).padStart(2, "0")).join("");
}

// Público: cria um pedido de recuperação. Resposta sempre genérica
// (não revela se a conta existe). Envia email quando houver provedor
// configurado (RESEND_API_KEY) e email cadastrado; o pedido também fica
// visível para os outros leitores da casa ajudarem.
export const solicitarRecuperacao = createServerFn({ method: "POST" })
  .validator(z.object({ identificador: z.string().min(1).max(200) }))
  .handler(async ({ data }) => {
    const ident = data.identificador.trim().toLowerCase();
    const user = await db()
      .prepare("SELECT id, nome, email FROM usuarios WHERE usuario = ? OR (email IS NOT NULL AND lower(email) = ?)")
      .bind(ident, ident)
      .first<{ id: number; nome: string; email: string | null }>();

    let emailEnviado = false;
    if (user) {
      // Limita a 3 pedidos ativos por conta (evita spam de tokens).
      const ativos = await db()
        .prepare("SELECT COUNT(*) AS n FROM redefinicoes WHERE usuario_id = ? AND usado = 0 AND expira_em > datetime('now')")
        .bind(user.id)
        .first<{ n: number }>();
      if ((ativos?.n ?? 0) < 3) {
        const token = gerarToken();
        const expira = new Date(Date.now() + 24 * 3600000).toISOString();
        await db()
          .prepare("INSERT INTO redefinicoes (token, usuario_id, expira_em) VALUES (?, ?, ?)")
          .bind(token, user.id, expira)
          .run();

        const { RESEND_API_KEY } = bindings();
        if (RESEND_API_KEY && user.email) {
          try {
            const origem = getRequestUrl().origin;
            const link = `${origem}/redefinir/${token}`;
            const res = await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
              body: JSON.stringify({
                from: "Minha Estante <onboarding@resend.dev>",
                to: [user.email],
                subject: "Recuperar sua senha da Minha Estante",
                html: `<p>Oi, ${escapeHtml(user.nome)}!</p><p>Recebemos um pedido para redefinir sua senha. O link vale por 24 horas:</p><p><a href="${link}">${link}</a></p><p>Se não foi você, ignore este email.</p>`,
              }),
              signal: AbortSignal.timeout(10000),
            });
            emailEnviado = res.ok;
          } catch {
            emailEnviado = false;
          }
        }
      }
    }
    return { ok: true as const, emailEnviado };
  });

// Público: valida um token de redefinição (para a página /redefinir).
export const validarRedefinicao = createServerFn({ method: "GET" })
  .validator(z.object({ token: z.string().regex(/^[0-9a-f]{48}$/) }))
  .handler(async ({ data }) => {
    const row = await db()
      .prepare(
        `SELECT r.usado, r.expira_em, u.nome FROM redefinicoes r
         JOIN usuarios u ON u.id = r.usuario_id WHERE r.token = ?`
      )
      .bind(data.token)
      .first<{ usado: number; expira_em: string; nome: string }>();
    if (!row || row.usado === 1 || row.expira_em <= new Date().toISOString()) {
      return { valido: false as const };
    }
    return { valido: true as const, nome: row.nome };
  });

// Público: redefine a senha com um token válido e encerra as sessões antigas.
export const redefinirSenha = createServerFn({ method: "POST" })
  .validator(z.object({ token: z.string().regex(/^[0-9a-f]{48}$/), novaSenha: z.string().min(6).max(200) }))
  .handler(async ({ data }) => {
    const row = await db()
      .prepare("SELECT usuario_id, usado, expira_em FROM redefinicoes WHERE token = ?")
      .bind(data.token)
      .first<{ usuario_id: number; usado: number; expira_em: string }>();
    if (!row || row.usado === 1 || row.expira_em <= new Date().toISOString()) {
      return { ok: false as const, erro: "Este link expirou ou já foi usado. Peça um novo." };
    }
    const hash = await hashSenha(data.novaSenha);
    await db().prepare("UPDATE usuarios SET senha_hash = ? WHERE id = ?").bind(hash, row.usuario_id).run();
    await db().prepare("UPDATE redefinicoes SET usado = 1 WHERE token = ?").bind(data.token).run();
    await db().prepare("DELETE FROM sessoes WHERE usuario_id = ?").bind(row.usuario_id).run();
    return { ok: true as const };
  });

// Pedidos de recuperação dos OUTROS leitores (para a "recuperação pela casa":
// Apenas a conta administradora principal da casa pode gerar o link e passar pessoalmente).
export const listarPedidosRecuperacao = createServerFn({ method: "GET" }).handler(async () => {
  const u = await exigirUsuario();
  // Restrição de segurança: Apenas a conta ID 1 (dono/administrador da casa) pode ver os tokens
  if (u.id !== 1) return [];
  const { results } = await db()
    .prepare(
      `SELECT r.token, us.nome, r.criado_em FROM redefinicoes r
       JOIN usuarios us ON us.id = r.usuario_id
       WHERE r.usuario_id != ? AND r.usado = 0 AND r.expira_em > datetime('now')
       ORDER BY r.criado_em DESC`
    )
    .bind(u.id)
    .all<{ token: string; nome: string; criado_em: string }>();
  return results;
});

export const atualizarConta = createServerFn({ method: "POST" })
  .validator(
    z.object({
      senhaAtual: z.string().min(1).max(200),
      nome: z.string().min(1).max(80).optional(),
      usuario: z.string().min(3).max(80).regex(/^[a-z0-9._-]+$/i, "Use letras, números, ponto, hífen").optional(),
      email: z.string().email().max(200).nullish(),
      novaSenha: z.string().min(6).max(200).optional(),
    })
  )
  .handler(async ({ data }) => {
    const u = await exigirUsuario();
    const row = await db()
      .prepare("SELECT senha_hash, email FROM usuarios WHERE id = ?")
      .bind(u.id)
      .first<{ senha_hash: string; email: string | null }>();
    if (!row || !(await verificarSenha(data.senhaAtual, row.senha_hash))) {
      return { ok: false as const, erro: "Senha atual incorreta." };
    }
    const novoUsuario = data.usuario?.trim().toLowerCase();
    if (novoUsuario && novoUsuario !== u.usuario) {
      const existe = await db().prepare("SELECT 1 FROM usuarios WHERE usuario = ? AND id != ?").bind(novoUsuario, u.id).first();
      if (existe) return { ok: false as const, erro: "Esse nome de usuário já está em uso." };
    }
    // email: undefined = manter; null = remover; string = trocar
    const novoEmail = data.email === undefined ? row.email : data.email ? data.email.trim().toLowerCase() : null;
    const novoHash = data.novaSenha ? await hashSenha(data.novaSenha) : row.senha_hash;
    await db()
      .prepare("UPDATE usuarios SET nome = ?, usuario = ?, email = ?, senha_hash = ? WHERE id = ?")
      .bind(data.nome?.trim() || u.nome, novoUsuario || u.usuario, novoEmail, novoHash, u.id)
      .run();
    // Troca de senha encerra as outras sessões por segurança.
    if (data.novaSenha) {
      await db().prepare("DELETE FROM sessoes WHERE usuario_id = ?").bind(u.id).run();
      await criarSessao(u.id);
    }
    return { ok: true as const };
  });

export const atualizarStatusPresenca = createServerFn({ method: "POST" })
  .validator(z.object({ status: z.enum(["online", "lendo", "ocupado", "invisivel"]) }))
  .handler(async ({ data }) => {
    const u = await exigirUsuario();
    await garantirColunaStatusPresenca();
    try {
      await db()
        .prepare("UPDATE usuarios SET status_presenca = ? WHERE id = ?")
        .bind(data.status, u.id)
        .run();
    } catch {
      try {
        await db().prepare("ALTER TABLE usuarios ADD COLUMN status_presenca TEXT DEFAULT 'online'").run();
        await db()
          .prepare("UPDATE usuarios SET status_presenca = ? WHERE id = ?")
          .bind(data.status, u.id)
          .run();
      } catch {
        // Silencioso
      }
    }
    return { ok: true as const, status: data.status };
  });
