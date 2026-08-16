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

export type Conquista = {
  chave: string;
  titulo: string;
  descricao: string;
  icone: string;
  pontos: number;
  desbloqueada: boolean;
  desbloqueada_em?: string | null;
};

export type DesafioSemanal = {
  titulo: string;
  descricao: string;
  metaDias: number;
  diasConcluidos: number;
  concluido: boolean;
  recompensaResgatada: boolean;
  premio: string;
};

export type LivroAcervo = {
  id: number;
  titulo: string;
  autor: string;
  capaUrl: string;
  paginas: number;
  ano: number;
  genero: string;
  idioma: string;
  gutenbergId?: number;
  epubUrl?: string;
  textoUrl?: string;
  amostraTexto?: string;
};

// Clássicos curados em Domínio Público com texto e metadados completos
export const CLASSICOS_CURADOS: LivroAcervo[] = [
  {
    id: 55752,
    gutenbergId: 55752,
    titulo: "Dom Casmurro",
    autor: "Machado de Assis",
    capaUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80",
    paginas: 256,
    ano: 1899,
    genero: "Romance",
    idioma: "pt",
    epubUrl: "https://www.gutenberg.org/ebooks/55752.epub.noimages",
    textoUrl: "https://www.gutenberg.org/files/55752/55752-0.txt",
    amostraTexto: "Uma noite destas, vindo da cidade para o Engenho Novo, encontrei no trem da Central um rapaz aqui do bairro, que eu conheço de vista e de chapéu. Cumprimentou-me, sentou-se ao pé de mim, falou da lua e dos ministros, e acabou recitando-me versos..."
  },
  {
    id: 54829,
    gutenbergId: 54829,
    titulo: "Memórias Póstumas de Brás Cubas",
    autor: "Machado de Assis",
    capaUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80",
    paginas: 210,
    ano: 1881,
    genero: "Ficção",
    idioma: "pt",
    epubUrl: "https://www.gutenberg.org/ebooks/54829.epub.noimages",
    textoUrl: "https://www.gutenberg.org/files/54829/54829-0.txt",
    amostraTexto: "Ao verme que primeiro roeu as frias carnes do meu cadáver dedico como saudosa lembrança estas memórias póstumas. Que me conste, ainda nenhum autor defunto escreveu as suas memórias com tanta sinceridade..."
  },
  {
    id: 57971,
    gutenbergId: 57971,
    titulo: "O Alienista",
    autor: "Machado de Assis",
    capaUrl: "https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&w=600&q=80",
    paginas: 110,
    ano: 1882,
    genero: "Suspense",
    idioma: "pt",
    epubUrl: "https://www.gutenberg.org/ebooks/57971.epub.noimages",
    textoUrl: "https://www.gutenberg.org/files/57971/57971-0.txt",
    amostraTexto: "As crônicas da vila de Itaguaí dizem que em tempos remotos um médico ilustre, o Dr. Simão Bacamarte, filho da nobreza da terra e o maior dos médicos do Brasil, de Portugal e das Espanhas, resolveu fundar a Casa Verde..."
  },
  {
    id: 1661,
    gutenbergId: 1661,
    titulo: "The Adventures of Sherlock Holmes",
    autor: "Arthur Conan Doyle",
    capaUrl: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=600&q=80",
    paginas: 307,
    ano: 1892,
    genero: "Suspense",
    idioma: "en",
    epubUrl: "https://www.gutenberg.org/ebooks/1661.epub.noimages",
    textoUrl: "https://www.gutenberg.org/files/1661/1661-0.txt",
    amostraTexto: "To Sherlock Holmes she is always THE woman. I have seldom heard him mention her under any other name. In his eyes she eclipses and predominates the whole of her sex..."
  },
  {
    id: 1342,
    gutenbergId: 1342,
    titulo: "Pride and Prejudice",
    autor: "Jane Austen",
    capaUrl: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80",
    paginas: 279,
    ano: 1813,
    genero: "Romance",
    idioma: "en",
    epubUrl: "https://www.gutenberg.org/ebooks/1342.epub.noimages",
    textoUrl: "https://www.gutenberg.org/files/1342/1342-0.txt",
    amostraTexto: "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife..."
  },
  {
    id: 11,
    gutenbergId: 11,
    titulo: "Alice's Adventures in Wonderland",
    autor: "Lewis Carroll",
    capaUrl: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80",
    paginas: 120,
    ano: 1865,
    genero: "Fantasia",
    idioma: "en",
    epubUrl: "https://www.gutenberg.org/ebooks/11.epub.noimages",
    textoUrl: "https://www.gutenberg.org/files/11/11-0.txt",
    amostraTexto: "Alice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do: once or twice she had peeped into the book her sister was reading, but it had no pictures or conversations in it..."
  }
];

export const obterConquistasEAcervo = createServerFn({ method: "GET" }).handler(async () => {
  const u = await exigirUsuario();

  // Tenta garantir que as tabelas existem
  try {
    await db().prepare(`
      CREATE TABLE IF NOT EXISTS conquistas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_id INTEGER NOT NULL,
        chave TEXT NOT NULL,
        titulo TEXT NOT NULL,
        descricao TEXT NOT NULL,
        icone TEXT NOT NULL,
        pontos INTEGER NOT NULL DEFAULT 10,
        desbloqueada_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (usuario_id, chave)
      )
    `).run();
  } catch {}

  // Busca dados de leitura do usuário para cálculo de conquistas
  const { results: livros } = await db()
    .prepare("SELECT * FROM livros WHERE usuario_id = ?")
    .bind(u.id)
    .all<Livro>();

  const lidos = livros.filter((l) => l.status === "lido");
  const totalPaginas = lidos.reduce((acc, cur) => acc + (cur.paginas || 0), 0);
  const paises = new Set(lidos.map((l) => l.pais?.trim().toUpperCase()).filter(Boolean));

  // Verifica se leu algum livro em até 7 dias
  let leuEm7Dias = false;
  for (const l of lidos) {
    if (l.inicio && l.fim) {
      const d1 = new Date(l.inicio + "T12:00:00");
      const d2 = new Date(l.fim + "T12:00:00");
      const diff = Math.round((d2.getTime() - d1.getTime()) / 86400000);
      if (diff >= 0 && diff <= 7) {
        leuEm7Dias = true;
        break;
      }
    }
  }

  // Lista base de conquistas com validação
  const DEFINICOES = [
    {
      chave: "leitor_7_dias",
      titulo: "⚡ Leitor Relâmpago",
      descricao: "Completou um livro do início ao fim em 7 dias ou menos",
      icone: "⚡",
      pontos: 50,
      atingida: leuEm7Dias,
    },
    {
      chave: "primeiro_livro",
      titulo: "🌱 Primeira Conquista",
      descricao: "Marcou seu primeiro livro como lido na estante",
      icone: "🌱",
      pontos: 20,
      atingida: lidos.length >= 1,
    },
    {
      chave: "devorador_500",
      titulo: "📚 Devorador de Páginas",
      descricao: "Leu mais de 500 páginas acumuladas",
      icone: "📚",
      pontos: 30,
      atingida: totalPaginas >= 500,
    },
    {
      chave: "viajante_3_paises",
      titulo: "🌍 Cidadão do Mundo",
      descricao: "Leu livros de autores de 3 ou mais países diferentes",
      icone: "🌍",
      pontos: 40,
      atingida: paises.size >= 3,
    },
    {
      chave: "guardiao_classicos",
      titulo: "🏛️ Guardião dos Clássicos",
      descricao: "Possui clássicos da literatura na sua estante",
      icone: "🏛️",
      pontos: 25,
      atingida: livros.some((l) => (l.ano && l.ano < 1930) || l.gutenberg_id),
    },
  ];

  // Busca conquistas já salvas
  let salvas: Array<{ chave: string; desbloqueada_em: string }> = [];
  try {
    const res = await db()
      .prepare("SELECT chave, desbloqueada_em FROM conquistas WHERE usuario_id = ?")
      .bind(u.id)
      .all<{ chave: string; desbloqueada_em: string }>();
    salvas = res.results;
  } catch {}

  const salvasMap = new Map(salvas.map((s) => [s.chave, s.desbloqueada_em]));

  // Auto-desbloqueia as que foram atingidas agora
  for (const def of DEFINICOES) {
    if (def.atingida && !salvasMap.has(def.chave)) {
      try {
        await db()
          .prepare(
            `INSERT INTO conquistas (usuario_id, chave, titulo, descricao, icone, pontos)
             VALUES (?, ?, ?, ?, ?, ?)`
          )
          .bind(u.id, def.chave, def.titulo, def.descricao, def.icone, def.pontos)
          .run();
        salvasMap.set(def.chave, new Date().toISOString());
      } catch {}
    }
  }

  const conquistasFormatadas: Conquista[] = DEFINICOES.map((d) => ({
    chave: d.chave,
    titulo: d.titulo,
    descricao: d.descricao,
    icone: d.icone,
    pontos: d.pontos,
    desbloqueada: salvasMap.has(d.chave) || d.atingida,
    desbloqueada_em: salvasMap.get(d.chave) || null,
  }));

  const pontosTotais = conquistasFormatadas
    .filter((c) => c.desbloqueada)
    .reduce((acc, c) => acc + c.pontos, 0);

  // Desafio Semanal
  const lendoAgora = livros.find((l) => l.status === "lendo");
  let diasLendo = 0;
  if (lendoAgora?.inicio) {
    const dInicio = new Date(lendoAgora.inicio + "T12:00:00");
    const dHoje = new Date();
    diasLendo = Math.max(0, Math.round((dHoje.getTime() - dInicio.getTime()) / 86400000));
  }

  const desafioSemanal: DesafioSemanal = {
    titulo: "Desafio Semanal: Leitor Veloz",
    descricao: "Conclua seu livro atual em até 7 dias para desbloquear +1 clássico raro para a sua estante.",
    metaDias: 7,
    diasConcluidos: Math.min(diasLendo, 7),
    concluido: leuEm7Dias,
    recompensaResgatada: salvasMap.has("leitor_7_dias"),
    premio: "Medalha Leitor Relâmpago + 50 Pontos de Leitura",
  };

  return {
    conquistas: conquistasFormatadas,
    pontosTotais,
    desafioSemanal,
    livrosAcervo: CLASSICOS_CURADOS,
    totalLidos: lidos.length,
    totalPaginas,
  };
});

export const adicionarLivroDoAcervo = createServerFn({ method: "POST" })
  .validator(z.object({ acervoId: z.number().int() }))
  .handler(async ({ data }) => {
    const u = await exigirUsuario();
    const item = CLASSICOS_CURADOS.find((c) => c.id === data.acervoId);
    if (!item) throw new Error("Livro não encontrado no acervo");

    const res = await db()
      .prepare(
        `INSERT INTO livros (usuario_id, titulo, autor, ano, paginas, genero, formato, status, capa, sinopse, gutenberg_id, arquivo_url)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'quero_ler', ?, ?, ?, ?)`
      )
      .bind(
        u.id,
        item.titulo,
        item.autor,
        item.ano,
        item.paginas,
        item.genero,
        "Kindle",
        item.capaUrl,
        item.amostraTexto ?? null,
        item.gutenbergId ?? null,
        item.textoUrl ?? null
      )
      .run();

    return { id: Number(res.meta.last_row_id) };
  });

export const carregarTextoGutenberg = createServerFn({ method: "GET" })
  .validator(z.object({ gutenbergId: z.number().int() }))
  .handler(async ({ data }) => {
    const item = CLASSICOS_CURADOS.find((c) => c.gutenbergId === data.gutenbergId);
    if (item?.amostraTexto) {
      return { texto: item.amostraTexto, titulo: item.titulo, autor: item.autor };
    }
    try {
      const res = await fetch(`https://www.gutenberg.org/files/${data.gutenbergId}/${data.gutenbergId}-0.txt`);
      if (res.ok) {
        const full = await res.text();
        return { texto: full.slice(0, 15000), titulo: "Clássico", autor: "" };
      }
    } catch {}
    return { texto: "Não foi possível carregar o texto completo online no momento.", titulo: "", autor: "" };
  });
