import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
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

// Seletor interativo de ano por arrasto vertical / scroll / setas
function SeletorAnoVertical({ anoAtual, anos }: { anoAtual: number; anos: number[] }) {
  const navigate = useNavigate();
  const [arrastando, setArrastando] = useState(false);
  const [startY, setStartY] = useState(0);
  const [direcao, setDirecao] = useState<"up" | "down">("up");

  const idx = anos.indexOf(anoAtual);
  // anos ordenado do mais recente para o mais antigo: [2026, 2025, 2024]
  const temAnterior = idx > 0;
  const temProximo = idx < anos.length - 1;

  function irPara(novoAno: number, dir: "up" | "down") {
    if (novoAno === anoAtual) return;
    setDirecao(dir);
    navigate({ to: "/retrospectiva/$ano", params: { ano: String(novoAno) } });
  }

  function subir() {
    if (temAnterior) irPara(anos[idx - 1], "down");
  }

  function descer() {
    if (temProximo) irPara(anos[idx + 1], "up");
  }

  // Arraste por Mouse
  const handleMouseDown = (e: React.MouseEvent) => {
    setArrastando(true);
    setStartY(e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!arrastando) return;
    const diff = e.clientY - startY;
    if (diff < -25) {
      setArrastando(false);
      descer();
    } else if (diff > 25) {
      setArrastando(false);
      subir();
    }
  };

  const handleMouseUp = () => setArrastando(false);

  // Arraste por Toque Mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const diff = e.touches[0].clientY - startY;
    if (diff < -25) {
      descer();
    } else if (diff > 25) {
      subir();
    }
  };

  // Scroll com a roda do Mouse
  const handleWheel = (e: React.WheelEvent) => {
    if (e.deltaY > 15) {
      descer();
    } else if (e.deltaY < -15) {
      subir();
    }
  };

  return (
    <div
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onWheel={handleWheel}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowUp") subir();
        if (e.key === "ArrowDown") descer();
      }}
      className="group relative inline-flex items-center gap-2.5 cursor-ns-resize select-none focus:outline-none py-1"
      title="Arraste para cima/baixo ou use o scroll para mudar de ano"
    >
      <div className="relative overflow-hidden h-14 sm:h-16 flex items-center pr-1">
        <h1
          key={anoAtual}
          className={`font-display text-5xl sm:text-6xl font-semibold tracking-tight text-amora inline-block ${
            direcao === "up" ? "animate-slide-up" : "animate-slide-down"
          }`}
        >
          {anoAtual}
        </h1>
      </div>

      <div className="flex flex-col text-amora/35 group-hover:text-amora transition-colors">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            subir();
          }}
          disabled={!temAnterior}
          className="p-0.5 hover:text-amora-escura disabled:opacity-15 cursor-pointer transition-opacity"
          title="Ano mais recente"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 15l-6-6-6 6" />
          </svg>
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            descer();
          }}
          disabled={!temProximo}
          className="p-0.5 hover:text-amora-escura disabled:opacity-15 cursor-pointer transition-opacity"
          title="Ano anterior"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </div>
    </div>
  );
}

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

function Destaque({ rotulo, titulo, detalhe }: { rotulo: string; titulo: string; detalhe: string }) {
  return (
    <div className="card-surface spring-bounce flex flex-col justify-between rounded-2xl border border-papel-3 bg-papel-2/60 p-3.5 sm:p-5 shadow-sm transition-all hover:border-amora min-w-0">
      <div>
        <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-amora">{rotulo}</p>
        <p className="mt-1 font-display text-sm sm:text-lg font-semibold leading-snug text-tinta line-clamp-2" title={titulo}>
          {titulo}
        </p>
      </div>
      <p className="mt-2 font-num text-xs sm:text-sm text-tinta-2">{detalhe}</p>
    </div>
  );
}

function BotaoSocialKokonut({
  onBaixarPoster,
  gerandoPoster,
  livrosCount,
  anoNum,
}: {
  onBaixarPoster: () => void;
  gerandoPoster: boolean;
  livrosCount: number;
  anoNum: number;
}) {
  const [expandido, setExpandido] = useState(false);
  const [copiado, setCopiado] = useState(false);

  const url = typeof window !== "undefined" ? window.location.href : "";
  const mensagem = `Confira minha retrospectiva de leitura de ${anoNum} no Minha Estante! 📚 (${livrosCount} livros lidos)`;

  function copiarLink() {
    navigator.clipboard.writeText(url);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  function compartilharWhatsApp() {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`${mensagem} ${url}`)}`, "_blank");
  }

  function compartilharTwitter() {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(mensagem)}&url=${encodeURIComponent(url)}`,
      "_blank"
    );
  }

  return (
    <div
      className="relative inline-flex items-center"
      onMouseEnter={() => setExpandido(true)}
      onMouseLeave={() => setExpandido(false)}
    >
      <div
        className={`flex items-center rounded-full border border-amora/60 bg-papel-2/90 backdrop-blur-md p-1 shadow-sm transition-all duration-350 ease-out ${
          expandido ? "gap-2 px-2 border-amora shadow-md" : "gap-1 px-3 py-1"
        }`}
      >
        {/* Botão Principal / Toggle */}
        <button
          type="button"
          onClick={() => setExpandido(!expandido)}
          className="flex items-center gap-2 rounded-full px-2.5 py-1.5 text-xs sm:text-sm font-medium text-amora hover:text-amora-escura transition-colors cursor-pointer shrink-0"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M12 15V4m0 0L8 8m4-4l4 4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M5 14v4a2 2 0 002 2h10a2 2 0 002-2v-4" strokeLinecap="round" />
          </svg>
          <span>{gerandoPoster ? "Preparando o pôster..." : "Compartilhar meu ano"}</span>
        </button>

        {/* Ícones de Redes Sociais Expandíveis com Animação Kokonut UI */}
        {expandido && (
          <div className="flex items-center gap-1 sm:gap-1.5 pl-1.5 border-l border-papel-3/60">
            {/* WhatsApp */}
            <button
              type="button"
              onClick={compartilharWhatsApp}
              className="group spring-bounce flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/25 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all cursor-pointer shadow-xs"
              title="Compartilhar no WhatsApp"
            >
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
              </svg>
            </button>

            {/* Baixar Pôster */}
            <button
              type="button"
              onClick={onBaixarPoster}
              disabled={gerandoPoster}
              className="group spring-bounce flex h-8 w-8 items-center justify-center rounded-full bg-amora/15 text-amora dark:bg-amora/25 hover:bg-amora hover:text-papel transition-all cursor-pointer shadow-xs disabled:opacity-50"
              title="Baixar Pôster da Retrospectiva"
            >
              {gerandoPoster ? (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>

            {/* Copiar Link */}
            <button
              type="button"
              onClick={copiarLink}
              className={`group spring-bounce flex h-8 w-8 items-center justify-center rounded-full transition-all cursor-pointer shadow-xs ${
                copiado
                  ? "bg-green-600 text-white"
                  : "bg-papel-3/60 text-tinta-2 hover:bg-tinta hover:text-papel"
              }`}
              title={copiado ? "Link copiado!" : "Copiar link"}
            >
              {copiado ? (
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" strokeLinecap="round" />
                  <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" strokeLinecap="round" />
                </svg>
              )}
            </button>

            {/* X / Twitter */}
            <button
              type="button"
              onClick={compartilharTwitter}
              className="group spring-bounce flex h-8 w-8 items-center justify-center rounded-full bg-sky-500/15 text-sky-600 dark:bg-sky-500/25 dark:text-sky-400 hover:bg-sky-500 hover:text-white transition-all cursor-pointer shadow-xs"
              title="Compartilhar no X (Twitter)"
            >
              <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </button>
          </div>
        )}
      </div>
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
            <SeletorAnoVertical anoAtual={anoNum} anos={abasAnos} />
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
            <div className="surgir mt-10 grid grid-cols-4 gap-1 sm:gap-4 rounded-3xl bg-tinta px-1.5 py-6 text-papel sm:px-6 sm:py-8">
              {[
                { rotulo: "livros lidos", n: est.livros, f: undefined as ((n: number) => string) | undefined },
                { rotulo: "páginas viradas", n: est.paginas, f: undefined },
                { rotulo: "nota média", n: Math.round((est.notaMedia ?? 0) * 10), f: (v: number) => notaFmt(v / 10) },
                { rotulo: "investidos em livros", n: Math.round(est.gasto), f: (v: number) => brl(v) },
              ].map((i) => (
                <div key={i.rotulo} className="text-center min-w-0 px-0.5 flex flex-col justify-center items-center">
                  <p className="font-num text-[11px] min-[380px]:text-xs sm:text-2xl md:text-3xl lg:text-4xl font-medium whitespace-nowrap tracking-tight">
                    <Contador ate={i.n} formatar={i.f} />
                  </p>
                  <p className="mt-1 text-[10px] sm:text-sm text-papel/75 leading-tight">{i.rotulo}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 flex justify-end">
              <BotaoSocialKokonut
                onBaixarPoster={compartilhar}
                gerandoPoster={gerandoPoster}
                livrosCount={est.livros}
                anoNum={anoNum}
              />
            </div>

            <div className="mt-8 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {est.maisRapido && (
                <Destaque
                  rotulo="Leitura mais rápida"
                  titulo={est.maisRapido.titulo}
                  detalhe={est.maisRapido.dias <= 1 ? "em 1 dia" : `em ${est.maisRapido.dias} dias`}
                />
              )}
              {est.maisLongo && (
                <Destaque
                  rotulo="Companhia mais longa"
                  titulo={est.maisLongo.titulo}
                  detalhe={`${est.maisLongo.dias} dias juntos`}
                />
              )}
              {est.autorTop && est.autorTop.qtd > 1 && (
                <Destaque
                  rotulo="Autor do ano"
                  titulo={est.autorTop.nome}
                  detalhe={`${est.autorTop.qtd} livros`}
                />
              )}
              {est.maiorLivro && (
                <Destaque
                  rotulo="Maior calhamaço"
                  titulo={est.maiorLivro.titulo}
                  detalhe={`${est.maiorLivro.paginas} páginas`}
                />
              )}
              {est.melhorNota && (
                <Destaque
                  rotulo="Favorito do ano"
                  titulo={est.melhorNota.titulo}
                  detalhe={`nota ${notaFmt(est.melhorNota.nota)}`}
                />
              )}
              {est.diasMedio !== null && (
                <Destaque
                  rotulo="Ritmo"
                  titulo={`${Math.round(est.diasMedio)} dias por livro`}
                  detalhe="tempo médio de leitura"
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
