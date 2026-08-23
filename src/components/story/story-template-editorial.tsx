import React from "react";
import type { StoryBookData, StoryPersonalizacao } from "../../lib/story/story-types";

interface StoryTemplateProps {
  book: StoryBookData;
  config: StoryPersonalizacao;
  capaDataUrl?: string | null;
  paginaAtiva?: 1 | 2 | 3;
}

function formatarDataPtBr(dataStr?: string | null): string {
  if (!dataStr) return "";
  try {
    const d = new Date(dataStr + "T12:00:00");
    if (isNaN(d.getTime())) return dataStr;
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return dataStr;
  }
}

function EstrelasStory({ nota }: { nota?: number | null }) {
  const valor = Math.max(0, Math.min(5, nota ?? 0));

  return (
    <div className="flex items-center gap-2.5 text-pink-400">
      {[1, 2, 3, 4, 5].map((estrela) => {
        const preenchimento = valor >= estrela ? "cheia" : valor >= estrela - 0.5 ? "meia" : "vazia";

        return (
          <span key={estrela} className="relative inline-block w-10 h-10">
            {preenchimento === "cheia" && (
              <svg viewBox="0 0 24 24" className="w-10 h-10 fill-pink-400 stroke-pink-400">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            )}
            {preenchimento === "meia" && (
              <svg viewBox="0 0 24 24" className="w-10 h-10 stroke-pink-400 fill-none">
                <defs>
                  <linearGradient id={`half-star-${estrela}`}>
                    <stop offset="50%" stopColor="#f472b6" />
                    <stop offset="50%" stopColor="transparent" />
                  </linearGradient>
                </defs>
                <polygon
                  fill={`url(#half-star-${estrela})`}
                  points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                />
              </svg>
            )}
            {preenchimento === "vazia" && (
              <svg viewBox="0 0 24 24" className="w-10 h-10 stroke-pink-400/40 fill-none" strokeWidth="1.6">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            )}
          </span>
        );
      })}
    </div>
  );
}

/* ==========================================================================
   STORY ÚNICO COMPLETO (ELEGÂNCIA EDITORIAL - REFERÊNCIA FOTO 2)
   ========================================================================== */
export const StoryPagina1Resumo = React.forwardRef<
  HTMLDivElement,
  { book: StoryBookData; config: StoryPersonalizacao; capaDataUrl?: string | null }
>(({ book, config, capaDataUrl }, ref) => {
  const imagemCapa = capaDataUrl || book.capa;
  const dataInicioFmt = formatarDataPtBr(book.inicio);
  const dataFimFmt = formatarDataPtBr(book.fim);

  const exibeKindle = config.mostrarFotoKindle;
  const exibePrint = config.mostrarPrintSkoob;

  return (
    <div
      ref={ref}
      style={{
        width: "1080px",
        height: "1920px",
        backgroundColor: "#120e15",
        backgroundImage: `
          radial-gradient(circle at 50% 0%, rgba(162, 59, 98, 0.35) 0%, transparent 55%),
          radial-gradient(circle at 100% 100%, rgba(94, 33, 56, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 0% 50%, rgba(45, 20, 30, 0.5) 0%, transparent 50%)
        `,
      }}
      className="relative overflow-hidden font-sans text-neutral-100 flex flex-col justify-between p-14 select-none box-border"
    >
      {/* Topo: Detalhes Decorativos Botânicos em Vetor (Sem emojis de IA) */}
      <div className="absolute top-10 left-12 flex items-center gap-2 pointer-events-none opacity-80">
        <svg viewBox="0 0 24 24" className="w-12 h-12 stroke-amber-400/60 fill-none" strokeWidth="1.2">
          <path d="M12 22V12" />
          <path d="M12 12C9 9 5 10 5 10c0 4 3 8 7 8" />
          <path d="M12 16c3-3 7-2 7-2 0 4-3 8-7 8" />
          <path d="M12 12c-2-3-2-7-2-7 4 0 7 3 7 7" />
        </svg>
      </div>

      <div className="absolute top-10 right-12 flex items-center gap-2 pointer-events-none opacity-80">
        <svg viewBox="0 0 24 24" className="w-14 h-14 stroke-pink-400/50 fill-none" strokeWidth="1.2">
          <path d="M12 2a10 10 0 0 0 10 10c-5.52 0-10 4.48-10 10C12 16.48 7.52 12 2 12c5.52 0 10-4.48 10-10z" />
        </svg>
      </div>

      <svg viewBox="0 0 24 24" className="absolute top-28 left-36 w-8 h-8 fill-pink-300/40 pointer-events-none">
        <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
      </svg>
      <svg viewBox="0 0 24 24" className="absolute top-20 right-44 w-10 h-10 fill-pink-300/50 pointer-events-none">
        <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
      </svg>

      {/* CABEÇALHO */}
      <header className="relative z-10 flex flex-col items-center text-center mt-4 mb-2">
        <div className="inline-flex items-center gap-3 px-8 py-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-5 bg-pink-400 rounded-full" />
            <span className="w-2 h-6 bg-pink-200 rounded-full" />
            <span className="w-2 h-4.5 bg-pink-400 rounded-full" />
          </span>
          <span className="font-display font-medium text-2xl tracking-wider text-neutral-200">
            Minha Estante
          </span>
        </div>

        <h1 className="mt-6 font-display text-7xl tracking-tight leading-none text-neutral-100 font-semibold">
          Leitura <span className="font-serif italic font-normal text-pink-300 drop-shadow-sm">finalizada</span>
        </h1>

        <div className="mt-4 flex items-center justify-center gap-4 w-96">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-pink-400/40 to-transparent" />
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-pink-400 stroke-pink-400">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-pink-400/40 to-transparent" />
        </div>

        <p className="mt-3 text-base font-mono text-neutral-400 tracking-widest uppercase">
          • mais uma história que ficou comigo •
        </p>
      </header>

      {/* ÁREA CENTRAL EM GRID (DINÂMICO E PREENCHENDO O ESPAÇO HARMONIOSAMENTE) */}
      <main className="relative z-10 my-auto flex flex-col gap-6 w-full max-w-[980px] mx-auto">

        {/* 2 COLUNAS SUPERIORES */}
        <div className="grid grid-cols-2 gap-6 w-full items-stretch">

          {/* COLUNA DA ESQUERDA: CAPA + (PRINT SKOOB Opcional) */}
          <div className="flex flex-col gap-6 justify-between">
            {/* Box 1: Capa do Livro */}
            <div className={`rounded-3xl border-2 border-dashed border-pink-400/35 bg-gradient-to-b from-white/[0.08] to-white/[0.02] p-6 flex flex-col items-center justify-center relative overflow-hidden group shadow-lg ${exibePrint ? "h-[540px]" : "h-[880px]"}`}>
              {imagemCapa ? (
                <img
                  src={imagemCapa}
                  alt={book.titulo}
                  className="h-full w-auto max-w-full object-contain rounded-2xl shadow-2xl border border-white/20"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-center gap-3 text-neutral-400/80">
                  <svg viewBox="0 0 24 24" className="w-16 h-16 stroke-pink-300/50 fill-none" strokeWidth="1.5">
                    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                  </svg>
                  <span className="font-serif italic text-2xl text-neutral-300">capa do livro</span>
                </div>
              )}
            </div>

            {/* Box 2: Print do Skoob / Print Complementar */}
            {exibePrint && (
              <div className="h-[320px] rounded-3xl border-2 border-dashed border-pink-400/35 bg-gradient-to-b from-white/[0.08] to-white/[0.02] p-4 flex flex-col items-center justify-center relative overflow-hidden shadow-lg">
                {config.fotoComplementarUrl ? (
                  <img
                    src={config.fotoComplementarUrl}
                    alt="Print do Skoob"
                    className="w-full h-full object-contain rounded-2xl bg-black/40 shadow-md"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center gap-3 text-neutral-400/80">
                    <svg viewBox="0 0 24 24" className="w-12 h-12 stroke-pink-300/50 fill-none" strokeWidth="1.5">
                      <path d="M18 20V10M12 20V4M6 20v-6" />
                    </svg>
                    <span className="font-serif italic text-2xl text-neutral-300">print do Skoob</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* COLUNA DA DIREITA: (FOTO KINDLE Opcional) + MINHAS INFORMAÇÕES */}
          <div className="flex flex-col gap-6 justify-between">
            {/* Box 3: Foto do Kindle */}
            {exibeKindle && (
              <div className="h-[540px] rounded-3xl border border-white/15 bg-gradient-to-b from-white/[0.08] to-white/[0.02] p-4 flex flex-col items-center justify-center relative overflow-hidden shadow-lg">
                {config.fotoKindleUrl ? (
                  <img
                    src={config.fotoKindleUrl}
                    alt="Foto do Kindle"
                    className="w-full h-full object-cover rounded-2xl shadow-md"
                  />
                ) : (
                  <div className="w-full h-full rounded-2xl bg-black/30 border border-white/10 flex flex-col items-center justify-center gap-3 p-6 text-neutral-400/80">
                    <svg viewBox="0 0 24 24" className="w-16 h-16 stroke-pink-300/50 fill-none" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                    <span className="font-serif italic text-2xl text-neutral-300">foto do Kindle</span>
                  </div>
                )}
              </div>
            )}

            {/* Box 4: Minhas Informações */}
            <div className={`rounded-3xl border border-white/15 bg-gradient-to-b from-white/[0.08] to-white/[0.02] flex flex-col justify-between shadow-lg relative ${exibeKindle ? "h-[320px] p-6" : "h-[880px] p-10"}`}>
              {/* Badge Header */}
              <div className={`inline-flex items-center gap-2.5 rounded-full bg-pink-400/20 border border-pink-300/30 text-pink-300 font-medium w-fit ${exibeKindle ? "px-4 py-1.5 text-sm" : "px-5 py-2.5 text-base"}`}>
                <svg viewBox="0 0 24 24" className="w-4.5 h-4.5 fill-pink-300 stroke-pink-300">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
                <span>minhas informações</span>
              </div>

              {/* Lista de Metadados */}
              <div className={`space-y-${exibeKindle ? "3 text-base" : "6 text-xl"} text-neutral-200 pt-2`}>
                <div className="flex items-center justify-between gap-4">
                  <span className="flex items-center gap-3 text-neutral-300 shrink-0">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-pink-400 fill-none" strokeWidth="2">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                    </svg>
                    <span className="font-medium">Título</span>
                  </span>
                  <span className={`font-bold text-neutral-100 truncate text-right ${exibeKindle ? "text-base" : "text-2xl"}`}>{book.titulo}</span>
                </div>

                {config.mostrarAutor && (
                  <div className="flex items-center justify-between gap-4">
                    <span className="flex items-center gap-3 text-neutral-300 shrink-0">
                      <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-pink-400 fill-none" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      <span className="font-medium">Autor</span>
                    </span>
                    <span className={`text-neutral-200 truncate text-right font-serif italic ${exibeKindle ? "text-base" : "text-xl"}`}>{book.autor || "—"}</span>
                  </div>
                )}

                {config.mostrarPaginas && (book.paginas || book.formato) && (
                  <div className="flex items-center justify-between gap-4">
                    <span className="flex items-center gap-3 text-neutral-300 shrink-0">
                      <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-pink-400 fill-none" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                      <span className="font-medium">Páginas</span>
                    </span>
                    <span className="font-mono text-neutral-200">
                      {book.paginas ? `${book.paginas} págs` : ""}
                      {book.paginas && book.formato ? " • " : ""}
                      {book.formato || ""}
                    </span>
                  </div>
                )}

                {config.mostrarDatas && (
                  <>
                    <div className="flex items-center justify-between gap-4">
                      <span className="flex items-center gap-3 text-neutral-300 shrink-0">
                        <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-pink-400 fill-none" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        <span className="font-medium">Comecei em</span>
                      </span>
                      <span className="font-mono text-neutral-300">{dataInicioFmt || "__/__/____"}</span>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <span className="flex items-center gap-3 text-neutral-300 shrink-0">
                        <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-pink-400 fill-none" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        <span className="font-medium">Terminei em</span>
                      </span>
                      <span className="font-mono text-neutral-300">{dataFimFmt || "__/__/____"}</span>
                    </div>
                  </>
                )}

                {config.mostrarNota && (
                  <div className="flex items-center justify-between gap-4 pt-1">
                    <span className="flex items-center gap-3 text-neutral-300 shrink-0">
                      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-pink-400 stroke-pink-400" strokeWidth="1.5">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                      <span className="font-medium">Nota</span>
                    </span>
                    <div className="flex items-center gap-3">
                      <EstrelasStory nota={book.nota} />
                      {book.nota !== null && book.nota !== undefined && (
                        <span className="font-mono font-bold text-pink-300 text-2xl">
                          {book.nota.toFixed(1).replace(".", ",")}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* LINHA INFERIOR COMPLETA: MINHA OPINIÃO */}
        <div className="w-full rounded-3xl border border-white/15 bg-gradient-to-br from-white/[0.09] to-white/[0.03] p-8 relative flex flex-col justify-between shadow-xl min-h-[280px]">
          {/* Badge Header */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-pink-400/20 border border-pink-300/30 text-pink-300 text-sm font-medium w-fit mb-3">
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-pink-300 stroke-pink-300">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span>minha opinião</span>
          </div>

          {/* Aspas e Conteúdo da Opinião */}
          <div className="relative z-10 px-8 py-3 my-auto">
            <span className="absolute -top-6 -left-2 font-serif text-7xl text-pink-400/35 leading-none">“</span>
            <p className="font-serif italic text-3xl text-neutral-100 leading-relaxed max-h-[160px] overflow-hidden text-ellipsis line-clamp-4">
              {config.opiniao || "conte aqui o que achou da leitura, o que mais te marcou, o que sentiu..."}
            </p>
            <span className="absolute -bottom-8 right-36 font-serif text-7xl text-pink-400/35 leading-none">”</span>
          </div>

          {/* Ilustração da Xícara de Café na Prateleira em Vetor SVG */}
          <div className="absolute bottom-5 right-8 flex flex-col items-center pointer-events-none opacity-80">
            <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-pink-300/60 fill-none -mb-1 animate-pulse" strokeWidth="1.5">
              <path d="M8 4c0 1.5 1 2 1 3s-1 1.5-1 3M12 4c0 1.5 1 2 1 3s-1 1.5-1 3M16 4c0 1.5 1 2 1 3s-1 1.5-1 3" />
            </svg>
            <svg viewBox="0 0 24 24" className="w-10 h-10 stroke-pink-300 fill-pink-400/20" strokeWidth="1.5">
              <path d="M17 8h1a4 4 0 0 1 0 8h-1" />
              <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z" />
              <line x1="6" y1="2" x2="6" y2="4" />
              <line x1="10" y1="2" x2="10" y2="4" />
              <line x1="14" y1="2" x2="14" y2="4" />
            </svg>
          </div>
        </div>

      </main>

      {/* RODAPÉ */}
      <footer className="relative z-10 flex flex-col items-center mt-4">
        <div className="w-full h-4 bg-gradient-to-b from-amber-900 via-amber-950 to-stone-950 rounded-sm border-t border-amber-500/40 shadow-[0_14px_28px_rgba(0,0,0,0.9)] mb-5" />

        <div className="relative px-10 py-3.5 rounded-full bg-black/40 border border-dashed border-pink-400/40 backdrop-blur-xl flex items-center gap-6 shadow-xl text-center">
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-pink-400">
            <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
          </svg>
          <div className="text-center">
            <p className="text-xs font-mono text-neutral-400 uppercase tracking-widest">
              registrado com carinho no
            </p>
            <p className="font-display text-lg font-semibold text-neutral-100 flex items-center justify-center gap-2 mt-0.5">
              <span className="inline-flex items-center gap-0.5">
                <span className="w-1.5 h-3.5 bg-pink-400 rounded-full" />
                <span className="w-1.5 h-4 bg-pink-200 rounded-full" />
                <span className="w-1.5 h-3 bg-pink-400 rounded-full" />
              </span>
              <span>Minha Estante</span>
            </p>
            <p className="text-xs text-neutral-400 font-sans mt-0.5">
              seu app para organizar e lembrar de cada história
            </p>
          </div>
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-pink-400 stroke-pink-400">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>
      </footer>
    </div>
  );
});
StoryPagina1Resumo.displayName = "StoryPagina1Resumo";

/* ==========================================================================
   STORY 2 — MEU MOMENTO DE LEITURA (FOTOS GRANDES: KINDLE + PRINT)
   ========================================================================== */
export const StoryPagina2Fotos = React.forwardRef<
  HTMLDivElement,
  { book: StoryBookData; config: StoryPersonalizacao }
>(({ book, config }, ref) => {
  const temKindle = Boolean(config.fotoKindleUrl);
  const temPrint = Boolean(config.fotoComplementarUrl);
  const qtdFotos = (temKindle ? 1 : 0) + (temPrint ? 1 : 0);

  return (
    <div
      ref={ref}
      style={{
        width: "1080px",
        height: "1920px",
        backgroundColor: "#110e13",
        backgroundImage: `
          radial-gradient(circle at 50% 0%, rgba(162, 59, 98, 0.32) 0%, transparent 60%),
          radial-gradient(circle at 100% 100%, rgba(94, 33, 56, 0.25) 0%, transparent 50%),
          radial-gradient(circle at 0% 50%, rgba(45, 20, 30, 0.5) 0%, transparent 55%)
        `,
      }}
      className="relative overflow-hidden font-sans text-neutral-100 flex flex-col justify-between p-14 select-none box-border"
    >
      {/* CABEÇALHO */}
      <header className="relative z-10 flex flex-col items-center text-center mt-3">
        <div className="inline-flex items-center gap-3 px-7 py-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-xs">
          <span className="font-display font-medium text-2xl tracking-wider text-neutral-200">
            Minha Estante
          </span>
        </div>

        <h1 className="mt-8 font-display text-7xl tracking-tight leading-none text-neutral-100 font-semibold">
          Meu momento <span className="font-serif italic font-normal text-pink-400 drop-shadow-sm">de leitura</span>
        </h1>

        <p className="mt-4 text-2xl font-serif italic text-neutral-300">
          “{book.titulo}”
        </p>
      </header>

      {/* CONTEÚDO DE FOTOS GRANDES (Sem encolher!) */}
      <main className="relative z-10 my-auto flex flex-col gap-8 w-full max-w-[960px] mx-auto py-2">
        {/* Caso Tenha Kindle */}
        {temKindle && (
          <div className={`relative rounded-3xl p-4 bg-gradient-to-b from-white/[0.14] to-white/[0.04] border border-white/20 shadow-2xl overflow-hidden ${qtdFotos === 1 ? "h-[850px]" : "h-[560px]"}`}>
            <img
              src={config.fotoKindleUrl!}
              alt="Momento Kindle"
              className="w-full h-full object-cover rounded-2xl shadow-md"
            />
          </div>
        )}

        {/* Caso Tenha Foto Complementar / Print */}
        {temPrint && (
          <div className={`relative rounded-3xl p-4 bg-gradient-to-b from-white/[0.14] to-white/[0.04] border border-white/20 shadow-2xl overflow-hidden ${qtdFotos === 1 ? "h-[850px]" : "h-[560px]"}`}>
            <img
              src={config.fotoComplementarUrl!}
              alt="Foto Complementar ou Print"
              className="w-full h-full object-contain rounded-2xl shadow-md bg-black/40"
            />
          </div>
        )}

        {/* Fallback Elegante caso nenhuma foto tenha sido adicionada */}
        {!temKindle && !temPrint && (
          <div className="rounded-3xl border border-dashed border-pink-400/40 bg-white/[0.04] p-20 text-center space-y-6 my-auto">
            <svg viewBox="0 0 24 24" className="w-28 h-28 stroke-pink-400/60 mx-auto" fill="none" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <p className="font-display text-3xl text-neutral-200">
              Adicione a foto do seu Kindle ou print das anotações no editor
            </p>
          </div>
        )}

        {/* Badge Informativo no Centro das Fotos */}
        {book.paginas && (
          <div className="mx-auto inline-flex items-center gap-3 px-8 py-3 rounded-full bg-black/60 border border-white/15 backdrop-blur-md text-lg font-mono text-neutral-200">
            <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-pink-400 fill-none" strokeWidth="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            <span>{book.paginas} páginas</span>
            {book.formato && <span>• {book.formato}</span>}
          </div>
        )}
      </main>

      {/* RODAPÉ */}
      <footer className="relative z-10 flex flex-col items-center mt-2">
        <div className="w-full h-5 bg-gradient-to-b from-amber-900 via-amber-950 to-stone-950 rounded-sm border-t border-amber-500/40 shadow-[0_14px_28px_rgba(0,0,0,0.9)] mb-6" />
        <div className="relative px-9 py-3.5 rounded-full bg-black/40 border border-white/10 backdrop-blur-xl flex items-center gap-4 shadow-xl">
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-pink-400">
            <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
          </svg>
          <span className="font-mono text-sm text-neutral-300 uppercase tracking-widest">
            Minha Estante • Compartilhando Histórias
          </span>
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-pink-400">
            <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
          </svg>
        </div>
      </footer>
    </div>
  );
});
StoryPagina2Fotos.displayName = "StoryPagina2Fotos";

/* ==========================================================================
   STORY 3 — MINHA OPINIÃO (EDITORIAL COM ASPAS GRANDES E ACONCHEGO)
   ========================================================================== */
export const StoryPagina3Opiniao = React.forwardRef<
  HTMLDivElement,
  { book: StoryBookData; config: StoryPersonalizacao; capaDataUrl?: string | null }
>(({ book, config, capaDataUrl }, ref) => {
  const imagemCapa = capaDataUrl || book.capa;

  return (
    <div
      ref={ref}
      style={{
        width: "1080px",
        height: "1920px",
        backgroundColor: "#110e13",
        backgroundImage: `
          radial-gradient(circle at 50% 0%, rgba(162, 59, 98, 0.32) 0%, transparent 60%),
          radial-gradient(circle at 100% 100%, rgba(94, 33, 56, 0.25) 0%, transparent 50%),
          radial-gradient(circle at 0% 50%, rgba(45, 20, 30, 0.5) 0%, transparent 55%)
        `,
      }}
      className="relative overflow-hidden font-sans text-neutral-100 flex flex-col justify-between p-14 select-none box-border"
    >
      {/* CABEÇALHO */}
      <header className="relative z-10 flex flex-col items-center text-center mt-3">
        <div className="inline-flex items-center gap-3 px-7 py-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-xs">
          <span className="font-display font-medium text-2xl tracking-wider text-neutral-200">
            Minha Estante
          </span>
        </div>

        <h1 className="mt-8 font-display text-7xl tracking-tight leading-none text-neutral-100 font-semibold">
          Minha <span className="font-serif italic font-normal text-pink-400 drop-shadow-sm">opinião</span>
        </h1>

        <div className="mt-6 flex items-center justify-center gap-4 bg-white/5 border border-white/10 rounded-2xl px-6 py-3 backdrop-blur-md">
          {imagemCapa && (
            <img
              src={imagemCapa}
              alt={book.titulo}
              className="w-12 h-18 object-cover rounded-lg shadow-md border border-white/15"
            />
          )}
          <div className="text-left">
            <p className="font-display text-2xl font-bold text-neutral-100 line-clamp-1">{book.titulo}</p>
            <p className="text-base font-serif italic text-neutral-400">{book.autor}</p>
          </div>
        </div>
      </header>

      {/* ÁREA DA OPINIÃO COM ASPAS GRANDES */}
      <main className="relative z-10 my-auto flex flex-col items-center justify-center w-full max-w-[960px] mx-auto py-4">
        <div className="relative w-full rounded-3xl p-14 sm:p-18 bg-gradient-to-br from-white/[0.12] to-white/[0.04] border border-white/20 backdrop-blur-md shadow-2xl min-h-[520px] flex items-center justify-center">
          <span className="absolute -top-8 left-8 font-serif text-9xl text-pink-400/50 leading-none">“</span>

          <p className="font-serif italic text-4xl sm:text-5xl text-neutral-100 leading-relaxed max-h-[750px] overflow-hidden text-ellipsis line-clamp-8 text-center px-4">
            {config.opiniao || "Uma leitura inesquecível que tocou o coração e trouxe reflexões que levarei comigo."}
          </p>

          <span className="absolute -bottom-14 right-8 font-serif text-9xl text-pink-400/50 leading-none">”</span>
        </div>

        {/* Nota com Estrelas */}
        {config.mostrarNota && book.nota !== undefined && book.nota !== null && (
          <div className="flex items-center justify-center gap-4 mt-10">
            <EstrelasStory nota={book.nota} />
            <span className="text-3xl font-mono font-bold text-pink-300">
              {book.nota.toFixed(1).replace(".", ",")}
            </span>
          </div>
        )}
      </main>

      {/* RODAPÉ COM CANECA ACONCHEGANTE */}
      <footer className="relative z-10 flex flex-col items-center mt-2">
        <div className="relative w-full mb-6">
          <div className="absolute -top-14 right-20 flex items-end gap-2 pointer-events-none">
            <div className="relative flex flex-col items-center">
              <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-pink-300/60 fill-none -mb-1 animate-pulse" strokeWidth="1.5">
                <path d="M8 4c0 1.5 1 2 1 3s-1 1.5-1 3M12 4c0 1.5 1 2 1 3s-1 1.5-1 3M16 4c0 1.5 1 2 1 3s-1 1.5-1 3" />
              </svg>
              <div className="w-12 h-10 rounded-b-xl rounded-t-sm bg-gradient-to-r from-pink-300 to-rose-300 border border-white/20 shadow-md flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-pink-900 stroke-pink-900">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </div>
            </div>
            <div className="w-20 h-4 bg-amber-900 rounded-sm border-t border-amber-600/40 shadow-xs" />
          </div>
          <div className="w-full h-5 bg-gradient-to-b from-amber-900 via-amber-950 to-stone-950 rounded-sm border-t border-amber-500/40 shadow-[0_14px_28px_rgba(0,0,0,0.9)]" />
        </div>

        <div className="relative px-9 py-3.5 rounded-full bg-black/40 border border-white/10 backdrop-blur-xl flex items-center gap-4 shadow-xl">
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-pink-400">
            <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
          </svg>
          <p className="font-display text-base font-semibold text-neutral-100 flex items-center justify-center gap-1.5">
            <span className="inline-flex items-center gap-0.5">
              <span className="w-1.5 h-3.5 bg-pink-400 rounded-full" />
              <span className="w-1.5 h-4 bg-pink-200 rounded-full" />
              <span className="w-1.5 h-3 bg-pink-400 rounded-full" />
            </span>
            <span>Minha Estante</span>
          </p>
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-pink-400 stroke-pink-400">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>
      </footer>
    </div>
  );
});
StoryPagina3Opiniao.displayName = "StoryPagina3Opiniao";

/* ==========================================================================
   ROTEADOR DO TEMPLATE (Exibe a página selecionada)
   ========================================================================== */
export const StoryTemplateEditorial = React.forwardRef<HTMLDivElement, StoryTemplateProps>(
  ({ book, config, capaDataUrl, paginaAtiva = 1 }, ref) => {
    if (paginaAtiva === 2) {
      return <StoryPagina2Fotos ref={ref} book={book} config={config} />;
    }
    if (paginaAtiva === 3) {
      return <StoryPagina3Opiniao ref={ref} book={book} config={config} capaDataUrl={capaDataUrl} />;
    }
    return <StoryPagina1Resumo ref={ref} book={book} config={config} capaDataUrl={capaDataUrl} />;
  }
);

StoryTemplateEditorial.displayName = "StoryTemplateEditorial";
