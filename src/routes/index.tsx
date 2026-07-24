import { createFileRoute, Link, redirect, useRouter } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

import { listarLivros, atualizarProgresso } from "../lib/api/livros.functions";
import { cartaStatus } from "../lib/api/auth.functions";
import {
  calcularEstatisticas,
  brl,
  notaFmt,
  diasDeLeitura,
  dataCurta,
  type Livro,
} from "../lib/livros";
import { CapaLivro } from "../components/estante/capa-livro";
import { Estrelas } from "../components/estante/estrelas";
import { Cabecalho } from "../components/estante/cabecalho";
import { exigirLogin } from "../lib/exigir-login";

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    await exigirLogin();
    // A dona da primeira estante vê a carta de boas-vindas antes de tudo.
    const status = await cartaStatus();
    if (status.dona && !status.vista) throw redirect({ to: "/carta" });
  },
  loader: () => listarLivros(),
  component: PaginaEstante,
});

function CartaoLendoAgora({ livro }: { livro: Livro }) {
  const router = useRouter();
  const [pagina, setPagina] = useState<string>(livro.pagina_atual?.toString() ?? "");
  const [salvando, setSalvando] = useState(false);

  const progresso =
    livro.paginas && livro.pagina_atual ? Math.min(100, Math.round((livro.pagina_atual / livro.paginas) * 100)) : 0;
  const diasLendo = livro.inicio
    ? Math.max(0, Math.round((Date.now() - new Date(livro.inicio + "T12:00:00").getTime()) / 86400000))
    : null;

  async function salvarPagina() {
    const n = parseInt(pagina, 10);
    if (Number.isNaN(n)) return;
    setSalvando(true);
    try {
      await atualizarProgresso({ data: { id: livro.id, pagina_atual: n } });
      await router.invalidate();
    } finally {
      setSalvando(false);
    }
  }

  return (
    <section className="surgir mx-auto mt-8 max-w-6xl px-4 sm:px-6">
      <div className="overflow-hidden rounded-2xl border border-papel-3 bg-papel-2 textura-papel">
        <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:gap-8 sm:p-8">
          <Link to="/livro/$livroId" params={{ livroId: String(livro.id) }} className="mx-auto w-36 shrink-0 sm:mx-0 sm:w-44">
            <CapaLivro titulo={livro.titulo} autor={livro.autor} capa={livro.capa} />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-amora">Lendo agora</p>
            <h1 className="mt-1 font-display text-3xl font-semibold leading-tight tracking-tight text-tinta md:text-4xl">
              {livro.titulo}
            </h1>
            <p className="mt-1 text-tinta-2">{livro.autor}</p>
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 font-num text-sm text-tinta-2">
              {livro.inicio && <span>começou em {dataCurta(livro.inicio)}</span>}
              {diasLendo !== null && (
                <span>
                  {diasLendo === 0 ? "hoje" : `${diasLendo} ${diasLendo === 1 ? "dia" : "dias"} de leitura`}
                </span>
              )}
              {livro.paginas && <span>{livro.paginas} páginas</span>}
            </div>

            <div className="mt-5 max-w-md">
              <div className="fita-progresso">
                <span style={{ width: `${progresso}%` }} />
              </div>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-sm text-tinta-2">
                  na página
                  <input
                    inputMode="numeric"
                    value={pagina}
                    onChange={(e) => setPagina(e.target.value.replace(/\D/g, ""))}
                    onKeyDown={(e) => e.key === "Enter" && salvarPagina()}
                    className="w-20 rounded-lg border border-papel-3 bg-papel px-2 py-1 font-num text-sm text-tinta focus:border-amora focus:outline-none"
                    placeholder="0"
                    aria-label="Página atual"
                  />
                  <button
                    onClick={salvarPagina}
                    disabled={salvando}
                    className="rounded-lg border border-tinta-3 px-3 py-1 text-sm text-tinta transition-colors hover:border-amora hover:text-amora active:scale-[0.98] disabled:opacity-50"
                  >
                    {salvando ? "salvando" : "marcar"}
                  </button>
                  {livro.paginas ? <span className="font-num text-tinta-3">{progresso}%</span> : null}
                </label>
                <Link
                  to="/livro/$livroId"
                  params={{ livroId: String(livro.id) }}
                  search={{ concluir: true }}
                  className="group inline-flex items-center gap-1.5 text-sm font-medium text-amora"
                >
                  <span className="border-b border-amora/40 pb-px transition-colors group-hover:border-amora">
                    Terminei este livro
                  </span>
                  <span aria-hidden className="transition-transform duration-300 motion-safe:group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FaixaNumeros({ livros }: { livros: Livro[] }) {
  const anoAtual = new Date().getFullYear();
  const est = calcularEstatisticas(livros, anoAtual);
  const itens = [
    { rotulo: `livros em ${anoAtual}`, valor: String(est.livros) },
    { rotulo: "páginas", valor: est.paginas.toLocaleString("pt-BR") },
    { rotulo: "nota média", valor: est.notaMedia ? notaFmt(est.notaMedia) : "sem nota" },
    { rotulo: "investidos", valor: brl(est.gasto) },
  ];
  return (
    <section className="mx-auto mt-8 max-w-6xl px-4 sm:px-6">
      <div className="grid grid-cols-2 gap-y-6 border-y border-papel-3 py-6 sm:grid-cols-4">
        {itens.map((i) => (
          <div key={i.rotulo} className="text-center">
            <p className="font-num text-2xl text-tinta md:text-3xl">{i.valor}</p>
            <p className="mt-1 text-sm text-tinta-2">{i.rotulo}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 text-right">
        <Link
          to="/retrospectiva/$ano"
          params={{ ano: String(anoAtual) }}
          className="text-sm text-amora underline decoration-amora/40 underline-offset-4 hover:decoration-amora"
        >
          ver a retrospectiva completa
        </Link>
      </div>
    </section>
  );
}

function CardLivro({ livro }: { livro: Livro }) {
  const dias = diasDeLeitura(livro);
  return (
    <Link
      to="/livro/$livroId"
      params={{ livroId: String(livro.id) }}
      className="livro-hover group block w-32 shrink-0 snap-start sm:w-36"
    >
      <CapaLivro titulo={livro.titulo} autor={livro.autor} capa={livro.capa} />
      <div className="mt-3 px-0.5">
        <p className="truncate text-sm font-medium text-tinta" title={livro.titulo}>
          {livro.titulo}
        </p>
        <div className="mt-0.5 flex items-center justify-between gap-2">
          <Estrelas nota={livro.nota} className="text-[11px]" />
          {dias !== null && <span className="font-num text-[11px] text-tinta-3">{dias === 0 ? "1 dia" : `${dias}d`}</span>}
        </div>
        {livro.palavra && <p className="mt-0.5 truncate font-display text-xs italic text-amora">“{livro.palavra}”</p>}
      </div>
    </Link>
  );
}

function PaginaEstante() {
  const livros = Route.useLoaderData();
  const [busca, setBusca] = useState("");
  const [genero, setGenero] = useState<string | null>(null);
  const [limiteExibicao, setLimiteExibicao] = useState(24);

  // Resetar o limite quando a busca ou gênero mudarem
  useEffect(() => {
    setLimiteExibicao(24);
  }, [busca, genero]);

  // Intersection Observer para rolar infinitamente
  useEffect(() => {
    const sentinela = document.getElementById("sentinela-estante");
    if (!sentinela) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setLimiteExibicao((prev) => prev + 24);
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(sentinela);
    return () => observer.disconnect();
  }, [busca, genero]);

  const lendo = livros.filter((l) => l.status === "lendo");
  const queroLer = livros.filter((l) => l.status === "quero_ler");

  const generos = useMemo(() => {
    const s = new Set<string>();
    for (const l of livros) if (l.genero) s.add(l.genero);
    return [...s].sort();
  }, [livros]);

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return livros.filter((l) => {
      if (l.status !== "lido" && l.status !== "abandonado") return false;
      if (genero && l.genero !== genero) return false;
      if (q && !`${l.titulo} ${l.autor}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [livros, busca, genero]);

  const porAno = useMemo(() => {
    const m = new Map<number, Livro[]>();
    for (const l of filtrados) {
      const ano = l.ano_leitura ?? 0;
      if (!m.has(ano)) m.set(ano, []);
      m.get(ano)!.push(l);
    }
    return [...m.entries()].sort((a, b) => b[0] - a[0]);
  }, [filtrados]);

  // Fatiar livros exibidos de acordo com o limite acumulado por ano
  const porAnoLimitado = useMemo(() => {
    let totalRenderizados = 0;
    return porAno
      .map(([ano, doAno]) => {
        const limiteRestante = Math.max(0, limiteExibicao - totalRenderizados);
        const livrosExibir = doAno.slice(0, limiteRestante);
        totalRenderizados += livrosExibir.length;
        return [ano, livrosExibir, doAno.length] as const;
      })
      .filter(([, livrosExibir]) => livrosExibir.length > 0);
  }, [porAno, limiteExibicao]);

  return (
    <div className="min-h-dvh pb-24">
      <Cabecalho paginaAtiva="estante" />

      {lendo.length > 0 ? (
        lendo.map((l) => <CartaoLendoAgora key={l.id} livro={l} />)
      ) : (
        <section className="surgir mx-auto mt-8 max-w-6xl px-4 sm:px-6">
          <div className="rounded-2xl border border-dashed border-tinta-3 p-8 text-center">
            <p className="font-display text-2xl text-tinta">Nenhuma leitura em andamento</p>
            <p className="mt-2 text-tinta-2">Escolha o próximo livro e comece um novo capítulo.</p>
          </div>
        </section>
      )}

      <FaixaNumeros livros={livros} />

      <main className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-tinta">Sua estante</h2>
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar título ou autor"
            aria-label="Buscar na estante"
            className="w-full max-w-xs rounded-full border border-papel-3 bg-white/60 px-4 py-2 text-sm text-tinta placeholder:text-tinta-3 focus:border-amora focus:outline-none"
          />
        </div>

        {generos.length > 1 && (
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => setGenero(null)}
              className={`rounded-full px-3 py-1 text-sm transition-colors ${
                genero === null ? "bg-tinta text-papel" : "bg-papel-2 text-tinta-2 hover:bg-papel-3"
              }`}
            >
              Todos
            </button>
            {generos.map((g) => (
              <button
                key={g}
                onClick={() => setGenero(genero === g ? null : g)}
                className={`rounded-full px-3 py-1 text-sm transition-colors ${
                  genero === g ? "bg-amora text-papel" : "bg-papel-2 text-tinta-2 hover:bg-papel-3"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        )}

        {porAno.length === 0 && livros.length === 0 && (
          <div className="mt-10 rounded-2xl border border-dashed border-tinta-3 p-10 text-center">
            <p className="font-display text-2xl text-tinta">Sua estante começa com o primeiro livro</p>
            <p className="mt-2 text-tinta-2">Toque em "Adicionar livro" e conte o que você está lendo.</p>
          </div>
        )}
        {porAno.length === 0 && livros.length > 0 && (
          <p className="mt-10 text-tinta-2">Nenhum livro encontrado com esses filtros.</p>
        )}

        {porAnoLimitado.map(([ano, doAno, totalDoAno]) => (
          <section key={ano} className="mt-10">
            <div className="flex items-baseline gap-3">
              <h3 className="font-num text-lg text-amora">{ano || "sem ano"}</h3>
              <span className="text-sm text-tinta-3">
                {totalDoAno} {totalDoAno === 1 ? "livro" : "livros"}
              </span>
            </div>
            <div className="prateleira mt-4 mb-8 flex snap-x gap-5 overflow-x-auto pb-2 [scrollbar-width:thin] sm:flex-wrap sm:overflow-visible">
              {doAno.map((l) => (
                <CardLivro key={l.id} livro={l} />
              ))}
            </div>
          </section>
        ))}

        {/* Sentinel element to trigger load-more scroll */}
        {filtrados.length > limiteExibicao && (
          <div id="sentinela-estante" className="flex items-center justify-center gap-2 py-8 text-sm text-tinta-3 font-num">
            <svg className="animate-spin h-4 w-4 text-amora" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Carregando mais livros...
          </div>
        )}

        {queroLer.length > 0 && (
          <section className="mt-14">
            <h3 className="font-display text-2xl font-semibold tracking-tight text-tinta">Quero ler</h3>
            <div className="prateleira mt-4 mb-8 flex snap-x gap-5 overflow-x-auto pb-2 [scrollbar-width:thin] sm:flex-wrap sm:overflow-visible">
              {queroLer.map((l) => (
                <CardLivro key={l.id} livro={l} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
