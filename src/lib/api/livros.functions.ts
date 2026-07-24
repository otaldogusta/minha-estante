import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { bindings } from "../bindings.server";
import { exigirUsuario } from "../auth.server";
import type { Livro } from "../livros";

function db() {
  const { DB } = bindings();
  if (!DB) throw new Error("Banco de dados indisponível");
  return DB;
}

// Sempre a estante do usuário logado.
export const listarLivros = createServerFn({ method: "GET" }).handler(async () => {
  const u = await exigirUsuario();
  const { results } = await db()
    .prepare(
      `SELECT * FROM livros
       WHERE usuario_id = ?
       ORDER BY CASE status WHEN 'lendo' THEN 0 WHEN 'quero_ler' THEN 1 ELSE 2 END,
                ano_leitura DESC, COALESCE(fim, inicio, criado_em) DESC, id DESC`
    )
    .bind(u.id)
    .all<Livro>();
  return results;
});

export const obterLivro = createServerFn({ method: "GET" })
  .validator(z.object({ id: z.number().int() }))
  .handler(async ({ data }) => {
    const u = await exigirUsuario();
    const livro = await db()
      .prepare("SELECT * FROM livros WHERE id = ? AND usuario_id = ?")
      .bind(data.id, u.id)
      .first<Livro>();
    if (!livro) throw new Error("Livro não encontrado");
    return livro;
  });

const livroInput = z.object({
  id: z.number().int().optional(),
  titulo: z.string().min(1).max(300),
  autor: z.string().min(1).max(200),
  pais: z.string().max(60).nullish(),
  genero: z.string().max(60).nullish(),
  editora: z.string().max(120).nullish(),
  ano: z.number().int().min(0).max(2100).nullish(),
  paginas: z.number().int().min(1).max(20000).nullish(),
  formato: z.string().max(30).nullish(),
  status: z.enum(["quero_ler", "lendo", "lido", "abandonado"]),
  ano_leitura: z.number().int().min(1900).max(2100).nullish(),
  inicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullish(),
  fim: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullish(),
  nota: z.number().min(0).max(5).nullish(),
  palavra: z.string().max(60).nullish(),
  resenha: z.string().max(8000).nullish(),
  adaptacao: z.boolean().default(false),
  vi_adaptacao: z.boolean().default(false),
  valor: z.number().min(0).max(100000).nullish(),
  capa: z.string().url().max(600).nullish(),
  sinopse: z.string().max(2000).nullish(),
  pagina_atual: z.number().int().min(0).max(20000).nullish(),
  privado: z.boolean().default(false),
});

export const salvarLivro = createServerFn({ method: "POST" })
  .validator(livroInput)
  .handler(async ({ data }) => {
    const u = await exigirUsuario();
    const d = {
      ...data,
      pais: data.pais ?? null,
      genero: data.genero ?? null,
      editora: data.editora ?? null,
      ano: data.ano ?? null,
      paginas: data.paginas ?? null,
      formato: data.formato ?? null,
      ano_leitura: data.ano_leitura ?? null,
      inicio: data.inicio ?? null,
      fim: data.fim ?? null,
      nota: data.nota ?? null,
      palavra: data.palavra ?? null,
      resenha: data.resenha ?? null,
      valor: data.valor ?? null,
      capa: data.capa ?? null,
      sinopse: data.sinopse ?? null,
      pagina_atual: data.pagina_atual ?? null,
    };
    if (d.id) {
      await db()
        .prepare(
          `UPDATE livros SET titulo=?, autor=?, pais=?, genero=?, editora=?, ano=?, paginas=?, formato=?,
           status=?, ano_leitura=?, inicio=?, fim=?, nota=?, palavra=?, resenha=?, adaptacao=?, vi_adaptacao=?,
           valor=?, capa=?, sinopse=?, pagina_atual=?, privado=? WHERE id=? AND usuario_id=?`
        )
        .bind(
          d.titulo, d.autor, d.pais, d.genero, d.editora, d.ano, d.paginas, d.formato,
          d.status, d.ano_leitura, d.inicio, d.fim, d.nota, d.palavra, d.resenha,
          d.adaptacao ? 1 : 0, d.vi_adaptacao ? 1 : 0, d.valor, d.capa, d.sinopse,
          d.pagina_atual, d.privado ? 1 : 0, d.id, u.id
        )
        .run();
      return { id: d.id };
    }
    const res = await db()
      .prepare(
        `INSERT INTO livros (usuario_id, titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura,
         inicio, fim, nota, palavra, resenha, adaptacao, vi_adaptacao, valor, capa, sinopse, pagina_atual, privado)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
      )
      .bind(
        u.id, d.titulo, d.autor, d.pais, d.genero, d.editora, d.ano, d.paginas, d.formato, d.status,
        d.ano_leitura, d.inicio, d.fim, d.nota, d.palavra, d.resenha,
        d.adaptacao ? 1 : 0, d.vi_adaptacao ? 1 : 0, d.valor, d.capa, d.sinopse, d.pagina_atual,
        d.privado ? 1 : 0
      )
      .run();
    return { id: Number(res.meta.last_row_id) };
  });

export const excluirLivro = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.number().int() }))
  .handler(async ({ data }) => {
    const u = await exigirUsuario();
    await db().prepare("DELETE FROM livros WHERE id = ? AND usuario_id = ?").bind(data.id, u.id).run();
    return { ok: true };
  });

// Atualização rápida do marcador de página (cartão "Lendo agora").
export const atualizarProgresso = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.number().int(), pagina_atual: z.number().int().min(0).max(20000) }))
  .handler(async ({ data }) => {
    const u = await exigirUsuario();
    await db()
      .prepare("UPDATE livros SET pagina_atual = ? WHERE id = ? AND usuario_id = ?")
      .bind(data.pagina_atual, data.id, u.id)
      .run();
    return { ok: true };
  });

// ------- Perfis públicos -------

export type LeitorResumo = {
  usuario: string;
  nome: string;
  lidos: number;
  lendoAgora: string | null;
  online: boolean;
};

export const listarLeitores = createServerFn({ method: "GET" }).handler(async () => {
  await exigirUsuario();
  const { results } = await db()
    .prepare(
      `SELECT us.usuario, us.nome,
              (SELECT COUNT(*) FROM livros l WHERE l.usuario_id = us.id AND l.status = 'lido' AND l.privado = 0) AS lidos,
              (SELECT l.titulo FROM livros l WHERE l.usuario_id = us.id AND l.status = 'lendo' AND l.privado = 0
               ORDER BY l.inicio DESC LIMIT 1) AS lendoAgora,
              (EXISTS (SELECT 1 FROM sessoes s WHERE s.usuario_id = us.id AND s.expira_em > datetime('now'))) AS online
       FROM usuarios us
       ORDER BY us.nome`
    )
    .all<Omit<LeitorResumo, "online"> & { online: number }>();
  return results.map((r) => ({ ...r, online: Boolean(r.online) }));
});

// Perfil público: apenas livros não privados, sem valores gastos.
export const obterPerfilPublico = createServerFn({ method: "GET" })
  .validator(z.object({ usuario: z.string().min(1).max(80) }))
  .handler(async ({ data }) => {
    const eu = await exigirUsuario();
    const dono = await db()
      .prepare("SELECT id, nome, usuario FROM usuarios WHERE usuario = ?")
      .bind(data.usuario.trim().toLowerCase())
      .first<{ id: number; nome: string; usuario: string }>();
    if (!dono) throw new Error("Leitor não encontrado");
    const { results } = await db()
      .prepare(
        `SELECT id, titulo, autor, genero, paginas, status, ano_leitura, inicio, fim, nota, palavra, capa
         FROM livros WHERE usuario_id = ? AND privado = 0
         ORDER BY CASE status WHEN 'lendo' THEN 0 WHEN 'quero_ler' THEN 1 ELSE 2 END,
                  ano_leitura DESC, COALESCE(fim, inicio, CAST(criado_em AS TEXT)) DESC, id DESC`
      )
      .bind(dono.id)
      .all<
        Pick<
          Livro,
          "id" | "titulo" | "autor" | "genero" | "paginas" | "status" | "ano_leitura" | "inicio" | "fim" | "nota" | "palavra" | "capa"
        >
      >();
    return { nome: dono.nome, usuario: dono.usuario, souEu: dono.id === eu.id, livros: results };
  });

// Busca metadados de um livro (Google Books com fallback Open Library), server-side.
export type ResultadoBusca = {
  titulo: string;
  autor: string;
  editora: string | null;
  ano: number | null;
  paginas: number | null;
  capa: string | null;
  sinopse: string | null;
  genero: string | null;
};

export const buscarLivroExterno = createServerFn({ method: "GET" })
  .validator(z.object({ q: z.string().min(2).max(200) }))
  .handler(async ({ data }): Promise<ResultadoBusca[]> => {
    await exigirUsuario();
    const out: ResultadoBusca[] = [];
    try {
      const res = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(data.q)}&maxResults=8&langRestrict=pt&country=BR`,
        { signal: AbortSignal.timeout(8000) }
      );
      if (res.ok) {
        const json = (await res.json()) as {
          items?: Array<{ id: string; volumeInfo?: Record<string, unknown> }>;
        };
        for (const it of json.items ?? []) {
          const vi = (it.volumeInfo ?? {}) as {
            title?: string;
            authors?: string[];
            publisher?: string;
            publishedDate?: string;
            pageCount?: number;
            imageLinks?: { thumbnail?: string; smallThumbnail?: string };
            description?: string;
            categories?: string[];
          };
          if (!vi.title) continue;
          let capa = vi.imageLinks?.thumbnail || vi.imageLinks?.smallThumbnail || null;
          if (capa) capa = capa.replace("http://", "https://").replace("&edge=curl", "");
          out.push({
            titulo: vi.title,
            autor: vi.authors?.join(", ") ?? "",
            editora: vi.publisher ?? null,
            ano: vi.publishedDate ? Number(vi.publishedDate.slice(0, 4)) || null : null,
            paginas: vi.pageCount ?? null,
            capa,
            sinopse: vi.description ? vi.description.replace(/<[^>]+>/g, "").slice(0, 600) : null,
            genero: vi.categories?.[0] ?? null,
          });
        }
      }
    } catch {
      // segue para o fallback
    }
    if (out.length === 0) {
      try {
        const res = await fetch(
          `https://openlibrary.org/search.json?q=${encodeURIComponent(data.q)}&limit=8&fields=title,author_name,publisher,first_publish_year,number_of_pages_median,cover_i`,
          { signal: AbortSignal.timeout(8000) }
        );
        if (res.ok) {
          const json = (await res.json()) as {
            docs?: Array<{
              title?: string;
              author_name?: string[];
              publisher?: string[];
              first_publish_year?: number;
              number_of_pages_median?: number;
              cover_i?: number;
            }>;
          };
          for (const d of json.docs ?? []) {
            if (!d.title) continue;
            out.push({
              titulo: d.title,
              autor: d.author_name?.[0] ?? "",
              editora: d.publisher?.[0] ?? null,
              ano: d.first_publish_year ?? null,
              paginas: d.number_of_pages_median ?? null,
              capa: d.cover_i ? `https://covers.openlibrary.org/b/id/${d.cover_i}-L.jpg` : null,
              sinopse: null,
              genero: null,
            });
          }
        }
      } catch {
        // sem resultados
      }
    }
    return out;
  });

export const sincronizarPlanilhaGoogle = createServerFn({ method: "POST" })
  .handler(async () => {
    const u = await exigirUsuario();
    // Usa id do usuario (imutavel) em vez do username (pode mudar)
    if (u.id !== 1) {
      throw new Error("Não autorizado");
    }

    const res = await fetch(
      "https://docs.google.com/spreadsheets/d/1wpuAfQ8WpWhZiXlC0Ovr3OAANWP4ZuAHNem8Ql22qno/export?format=csv",
      { signal: AbortSignal.timeout(10000) }
    );
    if (!res.ok) {
      throw new Error("Não foi possível acessar a planilha do Google");
    }

    const text = await res.text();
    const rows = parseCSV(text);

    // Busca a segunda aba (resenhas). gid=1088747500
    const mapaResenhas = new Map<string, string>();
    try {
      const resResenhas = await fetch(
        "https://docs.google.com/spreadsheets/d/1wpuAfQ8WpWhZiXlC0Ovr3OAANWP4ZuAHNem8Ql22qno/export?format=csv&gid=1088747500",
        { signal: AbortSignal.timeout(10000) }
      );
      if (resResenhas.ok) {
        const textResenhas = await resResenhas.text();
        const rowsResenhas = parseCSV(textResenhas);
        // Estrutura: col 0 = texto da resenha, col 1 = titulo do livro
        for (const row of rowsResenhas) {
          const resenha = row[0]?.trim();
          const titulo = row[1]?.trim();
          if (titulo && resenha) {
            // Normaliza acentos para matching robusto (E==e, a==ã, etc.)
            const chaveNorm = titulo.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
            mapaResenhas.set(chaveNorm, resenha);
          }
        }
      }
    } catch { /* ignora erros na segunda aba, nao bloqueia o sync */ }

    const livrosParaInserir: Array<{
      usuario_id: number;
      titulo: string;
      autor: string;
      pais: string | null;
      genero: string | null;
      editora: string | null;
      ano: number | null;
      paginas: number | null;
      status: "quero_ler" | "lendo" | "lido" | "abandonado";
      formato: string;
      ano_leitura: number | null;
      inicio: string | null;
      fim: string | null;
      nota: number | null;
      palavra: string | null;
      resenha: string | null;
      adaptacao: number;
      vi_adaptacao: number;
      valor: number | null;
      capa: string | null;
      sinopse: string | null;
      pagina_atual: number | null;
      privado: number;
      criado_em: string;
    }> = [];

    // O cabeçalho é a segunda linha (index 1), dados começam no index 2
    for (let i = 2; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0) continue;

      const titulo = row[0]?.trim();
      const autor = row[1]?.trim();

      if (!titulo || !autor) continue;
      if (
        titulo.toUpperCase().startsWith("TOTAL/MÉDIA") ||
        titulo.toUpperCase().startsWith("MÁXIMO") ||
        titulo.toUpperCase().startsWith("MÍNIMO")
      ) {
        continue;
      }

      const pais = row[2]?.trim() || null;
      const genero = row[4]?.trim() || null;
      const editora = row[5]?.trim() || null;
      const ano = parseInt(row[6], 10) || null;
      const paginas = parseInt(row[7], 10) || null;

      const lidoVal = row[8]?.trim();
      const inicioStr = row[10]?.trim();
      const fimStr = row[11]?.trim();

      let status: "quero_ler" | "lendo" | "lido" | "abandonado" = "quero_ler";
      let formato = "Físico";

      if (lidoVal) {
        status = "lido";
        if (lidoVal === "K") formato = "Kindle";
        else if (lidoVal === "S") formato = "Audiobook";
        else formato = "Físico";
      } else if (inicioStr && inicioStr !== "0") {
        status = "lendo";
        formato = "Kindle";
      } else {
        status = "quero_ler";
      }

      const ano_leitura = parseInt(row[9], 10) || null;

      const helperParseDate = (s: string) => {
        if (!s || s === "0" || s.trim() === "") return null;
        const parts = s.split("/");
        if (parts.length !== 3) return null;
        const d = parts[0].padStart(2, "0");
        const m = parts[1].padStart(2, "0");
        const y = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
        return `${y}-${m}-${d}`;
      };

      const inicio = helperParseDate(inicioStr);
      const fim = helperParseDate(fimStr);

      let nota: number | null = null;
      const notaStr = row[13]?.trim();
      if (notaStr && notaStr !== "0") {
        nota = parseFloat(notaStr.replace(",", "."));
        if (Number.isNaN(nota)) nota = null;
      }

      const palavra = row[14]?.trim() || null;
      // Col 15 ("Resenha") na planilha contem "Livros" (local de armazenamento), nao texto de resenha.
      // Ignoramos esse valor e preservamos a resenha real que esta no banco de dados.
      const resenhaRaw = row[15]?.trim();
      const resenha = (resenhaRaw && resenhaRaw !== "Livros") ? resenhaRaw : null;
      const adaptacao = row[16]?.trim().toUpperCase() === "SIM" ? 1 : 0;
      const vi_adaptacao = row[17]?.trim().toUpperCase() === "TRUE" ? 1 : 0;

      let valor: number | null = null;
      const valorStr = row[18]?.trim();
      if (valorStr) {
        const cleanVal = valorStr.replace("R$", "").replace(/\s/g, "").replace(",", ".").trim();
        valor = parseFloat(cleanVal);
        if (Number.isNaN(valor)) valor = null;
      }

      livrosParaInserir.push({
        usuario_id: u.id,
        titulo,
        autor,
        pais,
        genero,
        editora,
        ano,
        paginas,
        status,
        formato,
        ano_leitura,
        inicio,
        fim,
        nota,
        palavra,
        resenha,
        adaptacao,
        vi_adaptacao,
        valor,
        capa: null,
        sinopse: null,
        pagina_atual: null,
        privado: 0,
        criado_em: new Date().toISOString(),
      });
    }

    if (livrosParaInserir.length === 0) {
      throw new Error("Nenhum livro válido encontrado na planilha");
    }

    const database = db();

    // Busca livros existentes para preservar capa, sinopse e resenha
    const { results: livrosExistentes } = await database
      .prepare("SELECT titulo, autor, capa, sinopse, resenha FROM livros WHERE usuario_id = ?")
      .bind(u.id)
      .all<{ titulo: string; autor: string; capa: string | null; sinopse: string | null; resenha: string | null }>();

    // Mapa de chave (titulo+autor em minúsculas) → dados enriquecidos existentes
    const mapaExistentes = new Map<string, { capa: string | null; sinopse: string | null; resenha: string | null }>();
    for (const l of livrosExistentes) {
      const chave = `${l.titulo.toLowerCase()}|||${l.autor.toLowerCase()}`;
      mapaExistentes.set(chave, { capa: l.capa, sinopse: l.sinopse, resenha: l.resenha });
    }

    // Enriquecer livros da planilha com dados já existentes no site + resenhas da segunda aba
    for (const l of livrosParaInserir) {
      const chave = `${l.titulo.toLowerCase()}|||${l.autor.toLowerCase()}`;
      const existente = mapaExistentes.get(chave);
      if (existente) {
        if (!l.capa && existente.capa) l.capa = existente.capa;
        if (!l.sinopse && existente.sinopse) l.sinopse = existente.sinopse;
        // Preserva resenha do banco se a planilha nao tem review real
        if (existente.resenha && !l.resenha) {
          l.resenha = existente.resenha;
        }
      }
      // Resenha da segunda aba tem prioridade sobre tudo
      // Usa normalizacao de acentos para matching robusto (E==e, a==a, etc.)
      const tituloNorm = l.titulo.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
      const resenhaAba2 = mapaResenhas.get(tituloNorm);
      if (resenhaAba2) {
        l.resenha = resenhaAba2;
      }
    }

    // Busca capas na Google Books API para livros ainda sem capa
    const semCapa = livrosParaInserir.filter(l => !l.capa);
    const BATCH_SIZE = 8;
    for (let i = 0; i < semCapa.length; i += BATCH_SIZE) {
      const batch = semCapa.slice(i, i + BATCH_SIZE);
      const results = await Promise.allSettled(
        batch.map(l => fetchCapaGoogleBooks(l.titulo, l.autor, l.editora))
      );
      for (let j = 0; j < batch.length; j++) {
        const r = results[j];
        if (r.status === "fulfilled" && r.value) {
          batch[j].capa = r.value;
        }
      }
    }

    await database.prepare("DELETE FROM livros WHERE usuario_id = ?").bind(u.id).run();

    const insertStmt = database.prepare(
      `INSERT INTO livros (
        usuario_id, titulo, autor, pais, genero, editora, ano, paginas, status, formato,
        ano_leitura, inicio, fim, nota, palavra, resenha, adaptacao, vi_adaptacao, valor,
        capa, sinopse, pagina_atual, privado, criado_em
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );

    for (const l of livrosParaInserir) {
      await insertStmt
        .bind(
          l.usuario_id,
          l.titulo,
          l.autor,
          l.pais,
          l.genero,
          l.editora,
          l.ano,
          l.paginas,
          l.status,
          l.formato,
          l.ano_leitura,
          l.inicio,
          l.fim,
          l.nota,
          l.palavra,
          l.resenha,
          l.adaptacao,
          l.vi_adaptacao,
          l.valor,
          l.capa,
          l.sinopse,
          l.pagina_atual,
          l.privado,
          l.criado_em
        )
        .run();
    }

    return { ok: true, count: livrosParaInserir.length };
  });

/** Remove acentos e lowercases para comparacao de titulos. */
function normTitle(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

/**
 * Verifica se o resultado retornado pela API corresponde ao titulo buscado.
 * Aceita matches parciais (>60% das palavras em comum).
 */
function titleMatches(buscado: string, retornado: string): boolean {
  const nb = normTitle(buscado);
  const nr = normTitle(retornado);
  if (nr.includes(nb) || nb.includes(nr)) return true;
  const wordsB = nb.split(/\s+/).filter(w => w.length > 2);
  const wordsR = nr.split(/\s+/).filter(w => w.length > 2);
  if (wordsB.length === 0) return true;
  const matches = wordsB.filter(w => wordsR.includes(w)).length;
  return matches / wordsB.length >= 0.6;
}

/**
 * Busca capa em iTunes BR (country=BR).
 * Verifica se o titulo e a editora/autor do resultado correspondem ao buscado.
 */
async function fetchITunes(query: string, tituloRef: string, titleCheck = true): Promise<string | null> {
  try {
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&country=BR&media=ebook&entity=ebook&limit=5`;
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) return null;
    const data = await res.json() as { results?: Array<{ artworkUrl100?: string; trackName?: string }> };
    for (const item of data?.results ?? []) {
      if (titleCheck && item.trackName && !titleMatches(tituloRef, item.trackName)) continue;
      const art = item.artworkUrl100;
      if (art) return art.replace("100x100bb", "512x512bb");
    }
  } catch { /* segue */ }
  return null;
}

/** Busca capa no Open Library. Retorna a primeira que tiver cover_i. */
async function fetchOpenLibrary(query: string): Promise<string | null> {
  try {
    const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=5&fields=cover_i,isbn,title`;
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) return null;
    const data = await res.json() as { docs?: Array<{ cover_i?: number; isbn?: string[]; title?: string }> };
    for (const doc of data?.docs ?? []) {
      if (doc.cover_i) return `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`;
      if (doc.isbn?.[0]) return `https://covers.openlibrary.org/b/isbn/${doc.isbn[0]}-M.jpg`;
    }
  } catch { /* segue */ }
  return null;
}

/**
 * Busca capa com estratégias precisas priorizando Editora BR:
 * 1. iTunes BR com titulo + autor + editora
 * 2. iTunes BR com titulo + autor
 * 3. Open Library com titulo normalizado + editora
 * 4. Open Library com titulo normalizado + autor
 */
async function fetchCapaGoogleBooks(titulo: string, autor: string, editora?: string | null): Promise<string | null> {
  const tituloNorm = normTitle(titulo);
  const ed = editora?.trim() || "";

  // Estratégia 1: iTunes BR com titulo + autor + editora
  if (ed) {
    const r0 = await fetchITunes(`${titulo} ${autor} ${ed}`, titulo, true);
    if (r0) return r0;
  }

  // Estratégia 2: iTunes BR com titulo + autor
  const r1 = await fetchITunes(`${titulo} ${autor}`, titulo, true);
  if (r1) return r1;

  // Estratégia 3: Open Library com titulo normalizado + editora
  if (ed) {
    const r2 = await fetchOpenLibrary(`${tituloNorm} ${ed}`);
    if (r2) return r2;
  }

  // Estratégia 4: Open Library com titulo normalizado + autor
  const r3 = await fetchOpenLibrary(`${tituloNorm} ${autor}`);
  if (r3) return r3;

  // Estratégia 5: Open Library somente com titulo normalizado
  const r4 = await fetchOpenLibrary(tituloNorm);
  if (r4) return r4;

  return null;
}

function parseCSV(text: string): string[][] {
  const lines: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        cell += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      row.push(cell.trim());
      cell = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") i++;
      row.push(cell.trim());
      lines.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  if (cell || row.length > 0) {
    row.push(cell.trim());
    lines.push(row);
  }
  return lines;
}

