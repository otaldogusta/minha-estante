import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

import { listarLivros } from "../lib/api/livros.functions";
import { calcularEstatisticas, obterAnoLeitura, notaFmt, brl, type Livro } from "../lib/livros";
import { compartilharPoster } from "../lib/poster";
import { Cabecalho } from "../components/estante/cabecalho";
import { CapaLivro } from "../components/estante/capa-livro";
import { Estrelas } from "../components/estante/estrelas";
import { exigirLogin } from "../lib/exigir-login";

export const Route = createFileRoute("/retrospectiva/$ano")({
  beforeLoad: () => exigirLogin(),
  loader: () => listarLivros(),
  component: PaginaRetrospectiva,
});

// Contador animado (re-executa em toda navegação ou quando o ano muda).
function Contador({ ate, formatar }: { ate: number; formatar?: (n: number) => string }) {
  const [valor, setValor] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") {
      setValor(ate);
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || ate === 0) {
      setValor(ate);
      return;
    }

    const duracao = 1000;
    const t0 = performance.now();
    let raf = 0;

    const passo = (t: number) => {
      const p = Math.min(1, (t - t0) / duracao);
      const eased = 1 - Math.pow(1 - p, 3);
      setValor(Math.round(ate * eased));
      if (p < 1) {
        raf = requestAnimationFrame(passo);
      }
    };

    raf = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(raf);
  }, [ate]);

  return <>{formatar ? formatar(valor) : valor.toLocaleString("pt-BR")}</>;
}

function Destaque({
  rotulo,
  titulo,
  detalhe,
  icone,
}: {
  rotulo: string;
  titulo: string;
  detalhe: string;
  icone?: React.ReactNode;
}) {
  return (
    <div className="card-surface spring-bounce flex items-center justify-between gap-3.5 rounded-2xl border border-papel-3 bg-papel-2/60 p-4 sm:p-5 shadow-sm transition-all hover:border-amora">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-amora">{rotulo}</p>
        <p className="mt-1 font-display text-base sm:text-lg font-semibold leading-snug text-tinta truncate" title={titulo}>
          {titulo}
        </p>
        <p className="mt-1 font-num text-xs sm:text-sm text-tinta-2">{detalhe}</p>
      </div>
      {icone && (
        <div className="rounded-xl bg-amora-clara p-2.5 sm:p-3 shrink-0 text-amora shadow-xs">
          {icone}
        </div>
      )}
    </div>
  );
}

function PaginaRetrospectiva() {
  const livros = Route.useLoaderData();
  const { ano } = Route.useParams();
  const anoNum = Number(ano) || new Date().getFullYear();
  const [gerandoPoster, setGerandoPoster] = useState(false);

  const est = calcularEstatisticas(livros, anoNum);

  async function compartilhar() {
    setGerandoPoster(true);
    try {
      await compartilharPoster(livros, est);
    } finally {
      setGerandoPoster(false);
    }
  }

  const anosDisponiveis = [
    ...new Set(
      livros
        .filter((l) => l.status === "lido")
        .map((l) => obterAnoLeitura(l))
        .filter((a): a is number => a !== null)
    ),
  ].sort((a, b) => b - a);

  // Garantir que 2026, 2025, 2024 estejam sempre presentes nas abas se houverem livros
  const abasAnos = anosDisponiveis.length > 0 ? anosDisponiveis : [new Date().getFullYear()];

  const doAno = livros
    .filter((l) => l.status === "lido" && obterAnoLeitura(l) === anoNum)
    .sort((a, b) => (b.nota ?? 0) - (a.nota ?? 0));

  const generos = new Map<string, number>();
  for (const l of doAno) if (l.genero) generos.set(l.genero, (generos.get(l.genero) ?? 0) + 1);
  const generosOrd = [...generos.entries()].sort((a, b) => b[1] - a[1]);
  const maxGenero = generosOrd[0]?.[1] ?? 1;

  const palavras = doAno.filter((l) => l.palavra).map((l) => l.palavra as string);

  return (
    <div className="min-h-dvh pb-24">
      <Cabecalho paginaAtiva="retrospectiva" />
      <main className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="mt-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-tinta-2">Retrospectiva de leitura</p>
            <h1 className="font-display text-5xl font-semibold tracking-tight text-amora md:text-6xl">{anoNum}</h1>
          </div>
          <div className="flex gap-2">
            {abasAnos.map((a) => (
              <Link
                key={a}
                to="/retrospectiva/$ano"
                params={{ ano: String(a) }}
                className={`rounded-full px-4 py-1.5 font-num text-sm transition-colors ${
                  a === anoNum ? "bg-amora text-papel" : "bg-papel-2 text-tinta-2 hover:bg-papel-3"
                }`}
              >
                {a}
              </Link>
            ))}
          </div>
        </div>

        {est.livros === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-tinta-3 p-10 text-center">
            <p className="font-display text-2xl text-tinta">Nenhum livro terminado em {anoNum} ainda</p>
            <p className="mt-2 text-tinta-2">Quando as leituras forem concluídas, a retrospectiva ganha vida aqui.</p>
          </div>
        ) : (
          <>
            <div className="surgir mt-10 grid grid-cols-4 gap-1 sm:gap-4 rounded-3xl bg-tinta px-2 py-6 text-papel sm:px-6 sm:py-8">
              {[
                { rotulo: "livros lidos", n: est.livros, f: undefined as ((n: number) => string) | undefined },
                { rotulo: "páginas viradas", n: est.paginas, f: undefined },
                { rotulo: "nota média", n: Math.round((est.notaMedia ?? 0) * 10), f: (v: number) => notaFmt(v / 10) },
                { rotulo: "investidos em livros", n: Math.round(est.gasto), f: (v: number) => brl(v) },
              ].map((i) => (
                <div key={i.rotulo} className="text-center min-w-0 px-0.5">
                  <p className="font-num text-base sm:text-3xl md:text-4xl truncate font-medium">
                    <Contador ate={i.n} formatar={i.f} />
                  </p>
                  <p className="mt-1 text-[10px] sm:text-sm text-papel/75 leading-tight">{i.rotulo}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 text-right">
              <button
                onClick={compartilhar}
                disabled={gerandoPoster}
                className="group inline-flex items-center gap-2 rounded-full border border-amora px-5 py-2.5 text-sm font-medium text-amora transition-all hover:bg-amora hover:text-papel active:translate-y-[1px] disabled:opacity-60"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                  <path d="M12 15V4m0 0L8 8m4-4l4 4" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M5 14v4a2 2 0 002 2h10a2 2 0 002-2v-4" strokeLinecap="round" />
                </svg>
                {gerandoPoster ? "Preparando o pôster..." : "Compartilhar meu ano"}
              </button>
            </div>

            <div className="mt-8 grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
              {est.maisRapido && (
                <Destaque
                  rotulo="Leitura mais rápida"
                  titulo={est.maisRapido.titulo}
                  detalhe={est.maisRapido.dias <= 1 ? "em 1 dia" : `em ${est.maisRapido.dias} dias`}
                  icone={
                    <svg viewBox="0 0 24 24" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                    </svg>
                  }
                />
              )}
              {est.maisLongo && (
                <Destaque
                  rotulo="Companhia mais longa"
                  titulo={est.maisLongo.titulo}
                  detalhe={`${est.maisLongo.dias} dias juntos`}
                  icone={
                    <svg viewBox="0 0 24 24" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  }
                />
              )}
              {est.autorTop && est.autorTop.qtd > 1 && (
                <Destaque
                  rotulo="Autor do ano"
                  titulo={est.autorTop.nome}
                  detalhe={`${est.autorTop.qtd} livros`}
                  icone={
                    <svg viewBox="0 0 24 24" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  }
                />
              )}
              {est.maiorLivro && (
                <Destaque
                  rotulo="Maior calhamaço"
                  titulo={est.maiorLivro.titulo}
                  detalhe={`${est.maiorLivro.paginas} páginas`}
                  icone={
                    <svg viewBox="0 0 24 24" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                    </svg>
                  }
                />
              )}
              {est.melhorNota && (
                <Destaque
                  rotulo="Favorito do ano"
                  titulo={est.melhorNota.titulo}
                  detalhe={`nota ${notaFmt(est.melhorNota.nota)}`}
                  icone={
                    <svg viewBox="0 0 24 24" className="h-5 w-5 sm:h-6 sm:w-6 text-amora" fill="currentColor">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                  }
                />
              )}
              {est.diasMedio !== null && (
                <Destaque
                  rotulo="Ritmo"
                  titulo={`${Math.round(est.diasMedio)} dias por livro`}
                  detalhe="tempo médio de leitura"
                  icone={
                    <svg viewBox="0 0 24 24" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                    </svg>
                  }
                />
              )}
            </div>

            {generosOrd.length > 0 && (
              <section className="mt-12">
                <h2 className="font-display text-2xl font-semibold tracking-tight text-tinta">Para onde a leitura te levou</h2>
                <div className="mt-5 space-y-3">
                  {generosOrd.map(([g, qtd]) => (
                    <div key={g} className="flex items-center gap-3">
                      <span className="w-24 shrink-0 text-sm text-tinta-2">{g}</span>
                      <div className="h-6 flex-1 overflow-hidden rounded-full bg-papel-2">
                        <div
                          className="flex h-full items-center rounded-full bg-amora pl-3 font-num text-xs text-papel motion-safe:transition-[width] motion-safe:duration-700"
                          style={{ width: `${Math.max(9, (qtd / maxGenero) * 100)}%` }}
                        >
                          {qtd}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {palavras.length > 0 && (
              <section className="mt-12 rounded-3xl bg-amora-clara px-6 py-8">
                <h2 className="font-display text-2xl font-semibold tracking-tight text-amora-escura">O ano em palavras</h2>
                <p className="mt-1 text-sm text-amora-escura/70">Uma palavra por livro, escolhidas por você.</p>
                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
                  {palavras.map((p, i) => (
                    <span key={i} className="font-display text-xl italic text-amora-escura" style={{ opacity: 0.65 + ((i * 7) % 5) * 0.09 }}>
                      {p}
                    </span>
                  ))}
                </div>
              </section>
            )}

            <section className="mt-12">
              <h2 className="font-display text-2xl font-semibold tracking-tight text-tinta">Todos os livros de {anoNum}</h2>
              <div className="prateleira mt-5 mb-8 grid grid-cols-3 gap-5 sm:grid-cols-5 md:grid-cols-6">
                {doAno.map((l: Livro) => (
                  <Link key={l.id} to="/livro/$livroId" params={{ livroId: String(l.id) }} className="livro-hover group block">
                    <CapaLivro titulo={l.titulo} autor={l.autor} capa={l.capa} />
                    <div className="mt-2">
                      <Estrelas nota={l.nota} className="text-[10px]" />
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
