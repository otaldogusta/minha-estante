// Tipos e helpers compartilhados do domínio "livro".

export type Livro = {
  id: number;
  usuario_id: number;
  privado: number;
  titulo: string;
  autor: string;
  pais: string | null;
  genero: string | null;
  editora: string | null;
  ano: number | null;
  paginas: number | null;
  formato: string | null;
  status: "quero_ler" | "lendo" | "lido" | "abandonado";
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
};

export const GENEROS = [
  "Romance",
  "Suspense",
  "Fantasia",
  "Ficção",
  "Drama",
  "Terror",
  "Infantil",
  "Não ficção",
  "Poesia",
  "Outro",
];

export const FORMATOS = ["Físico", "Kindle", "Audiobook"];

export function diasDeLeitura(l: Pick<Livro, "inicio" | "fim">): number | null {
  if (!l.inicio || !l.fim) return null;
  const a = new Date(l.inicio + "T12:00:00");
  const b = new Date(l.fim + "T12:00:00");
  const d = Math.round((b.getTime() - a.getTime()) / 86400000);
  return d >= 0 ? d : null;
}

export function brl(v: number | null | undefined): string {
  if (v === null || v === undefined) return "";
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function dataCurta(iso: string | null): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y.slice(2)}`;
}

export function notaFmt(n: number | null): string {
  if (n === null || n === undefined) return "";
  return n.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

// Paleta de fallback para capas tipográficas, estável por título.
const CORES_CAPA = ["#7A3B52", "#3E4A3D", "#43405C", "#5C4632", "#2F4858", "#6E3B3B"];
export function corDaCapa(titulo: string): string {
  let h = 0;
  for (let i = 0; i < titulo.length; i++) h = (h * 31 + titulo.charCodeAt(i)) >>> 0;
  return CORES_CAPA[h % CORES_CAPA.length];
}

export type Estatisticas = {
  ano: number;
  livros: number;
  paginas: number;
  gasto: number;
  notaMedia: number | null;
  diasMedio: number | null;
  maisRapido: { titulo: string; dias: number } | null;
  maisLongo: { titulo: string; dias: number } | null;
  autorTop: { nome: string; qtd: number } | null;
  generoTop: { nome: string; qtd: number } | null;
  melhorNota: { titulo: string; nota: number } | null;
  maiorLivro: { titulo: string; paginas: number } | null;
};

export function calcularEstatisticas(livros: Livro[], ano: number): Estatisticas {
  const doAno = livros.filter((l) => l.status === "lido" && l.ano_leitura === ano);
  const paginas = doAno.reduce((s, l) => s + (l.paginas ?? 0), 0);
  const gasto = doAno.reduce((s, l) => s + (l.valor ?? 0), 0);
  const notas = doAno.filter((l) => l.nota !== null);
  const notaMedia = notas.length ? notas.reduce((s, l) => s + (l.nota ?? 0), 0) / notas.length : null;

  const comDias = doAno
    .map((l) => ({ titulo: l.titulo, dias: diasDeLeitura(l) }))
    .filter((x): x is { titulo: string; dias: number } => x.dias !== null);
  const diasMedio = comDias.length ? comDias.reduce((s, x) => s + x.dias, 0) / comDias.length : null;
  const maisRapido = comDias.length ? comDias.reduce((a, b) => (b.dias < a.dias ? b : a)) : null;
  const maisLongo = comDias.length ? comDias.reduce((a, b) => (b.dias > a.dias ? b : a)) : null;

  const contar = (key: (l: Livro) => string | null) => {
    const m = new Map<string, number>();
    for (const l of doAno) {
      const k = key(l);
      if (k) m.set(k, (m.get(k) ?? 0) + 1);
    }
    let top: { nome: string; qtd: number } | null = null;
    for (const [nome, qtd] of m) if (!top || qtd > top.qtd) top = { nome, qtd };
    return top;
  };

  const comNota = doAno.filter((l) => l.nota !== null);
  const melhor = comNota.length
    ? comNota.reduce((a, b) => ((b.nota ?? 0) > (a.nota ?? 0) ? b : a))
    : null;
  const comPag = doAno.filter((l) => l.paginas !== null);
  const maior = comPag.length
    ? comPag.reduce((a, b) => ((b.paginas ?? 0) > (a.paginas ?? 0) ? b : a))
    : null;

  return {
    ano,
    livros: doAno.length,
    paginas,
    gasto,
    notaMedia,
    diasMedio,
    maisRapido,
    maisLongo,
    autorTop: contar((l) => l.autor),
    generoTop: contar((l) => l.genero),
    melhorNota: melhor ? { titulo: melhor.titulo, nota: melhor.nota ?? 0 } : null,
    maiorLivro: maior ? { titulo: maior.titulo, paginas: maior.paginas ?? 0 } : null,
  };
}
