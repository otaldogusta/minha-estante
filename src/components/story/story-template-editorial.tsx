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
      className="relative overflow-hidden font-sans text-neutral-100 flex flex-col justify-between p-12 select-none box-border"
    >
      {/* Topo: Plantas & Detalhes Decorativos */}
      <div className="absolute top-8 left-12 flex items-center gap-2 pointer-events-none opacity-90">
        <div className="w-16 h-18 bg-amber-950/80 rounded-t-lg rounded-b-xl border-t border-amber-600/30 flex items-center justify-center shadow-lg relative">
          <span className="text-3xl">🌵</span>
          <div className="absolute -bottom-2 w-18 h-2 bg-amber-900 rounded-xs shadow-md" />
        </div>
      </div>

      <div className="absolute top-6 right-12 flex flex-col items-end pointer-events-none opacity-90">
        <span className="text-6xl -mr-2 drop-shadow-md">🌿</span>
        <span className="text-4xl -mt-4 mr-2 opacity-70">🍃</span>
      </div>

      <div className="absolute top-28 left-36 text-pink-300/40 text-3xl pointer-events-none">✦</div>
      <div className="absolute top-20 right-44 text-pink-300/60 text-4xl pointer-events-none">✦</div>

      {/* CABEÇALHO */}
      <header className="relative z-10 flex flex-col items-center text-center mt-2">
        <div className="inline-flex items-center gap-3 px-7 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-xs">
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
          <span className="text-pink-400 text-base">♡</span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-pink-400/40 to-transparent" />
        </div>

        <p className="mt-2 text-base font-mono text-neutral-400 tracking-widest uppercase">
          • mais uma história que ficou comigo •
        </p>
      </header>

      {/* ÁREA CENTRAL EM GRID (IGUAL À IMAGEM DE REFERÊNCIA 2) */}
      <main className="relative z-10 my-auto flex flex-col gap-5 w-full max-w-[980px] mx-auto py-2">

        {/* 2 COLUNAS SUPERIORES */}
        <div className="grid grid-cols-2 gap-5 w-full">

          {/* COLUNA DA ESQUERDA: CAPA + PRINT SKOOB */}
          <div className="flex flex-col gap-5 justify-between">
            {/* Box 1: Capa do Livro */}
            <div className="h-[440px] rounded-3xl border-2 border-dashed border-pink-400/35 bg-gradient-to-b from-white/[0.08] to-white/[0.02] p-4 flex flex-col items-center justify-center relative overflow-hidden group shadow-lg">
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
            <div className="h-[250px] rounded-3xl border-2 border-dashed border-pink-400/35 bg-gradient-to-b from-white/[0.08] to-white/[0.02] p-4 flex flex-col items-center justify-center relative overflow-hidden shadow-lg">
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
          </div>

          {/* COLUNA DA DIREITA: FOTO KINDLE + MINHAS INFORMAÇÕES */}
          <div className="flex flex-col gap-5 justify-between">
            {/* Box 3: Foto do Kindle */}
            <div className="h-[440px] rounded-3xl border border-white/15 bg-gradient-to-b from-white/[0.08] to-white/[0.02] p-4 flex flex-col items-center justify-center relative overflow-hidden shadow-lg">
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

            {/* Box 4: Minhas Informações */}
            <div className="h-[250px] rounded-3xl border border-white/15 bg-gradient-to-b from-white/[0.08] to-white/[0.02] p-5 flex flex-col justify-between shadow-lg relative">
              {/* Badge Header */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-pink-400/20 border border-pink-300/30 text-pink-300 text-sm font-medium w-fit">
                <span>🔖</span>
                <span>minhas informações</span>
              </div>

              {/* Lista de Metadados */}
              <div className="space-y-2 text-sm text-neutral-200 pt-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-neutral-300 shrink-0">
                    <span>📖</span>
                    <span className="font-medium">Título</span>
                  </span>
                  <span className="font-bold text-neutral-100 truncate text-right">{book.titulo}</span>
                </div>

                {config.mostrarAutor && (
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2 text-neutral-300 shrink-0">
                      <span>👤</span>
                      <span className="font-medium">Autor</span>
                    </span>
                    <span className="text-neutral-200 truncate text-right font-serif italic">{book.autor || "—"}</span>
                  </div>
                )}

                {config.mostrarDatas && (
                  <>
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2 text-neutral-300 shrink-0">
                        <span>📅</span>
                        <span className="font-medium">Comecei em</span>
                      </span>
                      <span className="font-mono text-neutral-300">{dataInicioFmt || "__/__/____"}</span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2 text-neutral-300 shrink-0">
                        <span>📅</span>
                        <span className="font-medium">Terminei em</span>
                      </span>
                      <span className="font-mono text-neutral-300">{dataFimFmt || "__/__/____"}</span>
                    </div>
                  </>
                )}

                {config.mostrarNota && (
                  <div className="flex items-center justify-between gap-2 pt-0.5">
                    <span className="flex items-center gap-2 text-neutral-300 shrink-0">
                      <span>⭐</span>
                      <span className="font-medium">Nota</span>
                    </span>
                    <EstrelasStory nota={book.nota} />
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* LINHA INFERIOR COMPLETA: MINHA OPINIÃO */}
        <div className="w-full rounded-3xl border border-white/15 bg-gradient-to-br from-white/[0.09] to-white/[0.03] p-6 relative flex flex-col justify-between shadow-xl min-h-[220px]">
          {/* Badge Header */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-pink-400/20 border border-pink-300/30 text-pink-300 text-sm font-medium w-fit mb-2">
            <span>💬</span>
            <span>minha opinião</span>
          </div>

          {/* Aspas e Conteúdo da Opinião */}
          <div className="relative z-10 px-6 py-2 my-auto">
            <span className="absolute -top-4 -left-2 font-serif text-6xl text-pink-400/40 leading-none">“</span>
            <p className="font-serif italic text-2xl text-neutral-100 leading-relaxed max-h-[120px] overflow-hidden text-ellipsis line-clamp-3">
              {config.opiniao || "conte aqui o que achou da leitura, o que mais te marcou, o que sentiu..."}
            </p>
            <span className="absolute -bottom-6 right-36 font-serif text-6xl text-pink-400/40 leading-none">”</span>
          </div>

          {/* Ilustração da Xícara de Café na Prateleira no Canto Inferior Direito */}
          <div className="absolute bottom-4 right-6 flex flex-col items-center pointer-events-none">
            <span className="text-[10px] text-neutral-400/60 -mb-1 animate-pulse font-mono">~ ~</span>
            <div className="w-9 h-8 rounded-b-lg rounded-t-xs bg-gradient-to-r from-pink-300 to-rose-300 border border-white/30 shadow-md flex items-center justify-center relative">
              <span className="text-[10px] text-pink-900 font-bold">♥</span>
              <div className="absolute -right-2 top-1.5 w-2.5 h-4 border-2 border-pink-300 rounded-r-full" />
            </div>
            <div className="w-20 h-2.5 bg-amber-900 rounded-xs border-t border-amber-600/40 shadow-xs mt-0.5" />
          </div>
        </div>

      </main>

      {/* RODAPÉ */}
      <footer className="relative z-10 flex flex-col items-center mt-2">
        <div className="w-full h-4 bg-gradient-to-b from-amber-900 via-amber-950 to-stone-950 rounded-sm border-t border-amber-500/40 shadow-[0_14px_28px_rgba(0,0,0,0.9)] mb-4" />

        <div className="relative px-9 py-3 rounded-full bg-black/40 border border-dashed border-pink-400/40 backdrop-blur-xl flex items-center gap-6 shadow-xl text-center">
          <span className="text-pink-400 text-lg">✦</span>
          <div className="text-center">
            <p className="text-[11px] font-mono text-neutral-400 uppercase tracking-widest">
              registrado com carinho no
            </p>
            <p className="font-display text-base font-semibold text-neutral-100 flex items-center justify-center gap-1.5 mt-0.5">
              <span className="inline-flex items-center gap-0.5">
                <span className="w-1.5 h-3.5 bg-pink-400 rounded-full" />
                <span className="w-1.5 h-4 bg-pink-200 rounded-full" />
                <span className="w-1.5 h-3 bg-pink-400 rounded-full" />
              </span>
              <span>Minha Estante</span>
            </p>
            <p className="text-[11px] text-neutral-400 font-sans mt-0.5">
              seu app para organizar e lembrar de cada história
            </p>
          </div>
          <span className="text-pink-400 text-lg">♡</span>
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
          <div className="mx-auto inline-flex items-center gap-4 px-8 py-3 rounded-full bg-black/60 border border-white/15 backdrop-blur-md text-lg font-mono text-neutral-200">
            <span>📖 {book.paginas} páginas</span>
            {book.formato && <span>• {book.formato}</span>}
          </div>
        )}
      </main>

      {/* RODAPÉ */}
      <footer className="relative z-10 flex flex-col items-center mt-2">
        <div className="w-full h-5 bg-gradient-to-b from-amber-900 via-amber-950 to-stone-950 rounded-sm border-t border-amber-500/40 shadow-[0_14px_28px_rgba(0,0,0,0.9)] mb-6" />
        <div className="relative px-9 py-3.5 rounded-full bg-black/40 border border-white/10 backdrop-blur-xl flex items-center gap-4 shadow-xl">
          <span className="text-pink-400 text-base">✦</span>
          <span className="font-mono text-sm text-neutral-300 uppercase tracking-widest">
            Minha Estante • Compartilhando Histórias
          </span>
          <span className="text-pink-400 text-base">✦</span>
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
              <span className="text-xs text-neutral-400/60 -mb-1 animate-pulse">~ ~</span>
              <div className="w-12 h-10 rounded-b-xl rounded-t-sm bg-gradient-to-r from-pink-300 to-rose-300 border border-white/20 shadow-md flex items-center justify-center">
                <span className="text-xs text-pink-900 font-bold">♥</span>
              </div>
            </div>
            <div className="w-20 h-4 bg-amber-900 rounded-sm border-t border-amber-600/40 shadow-xs" />
          </div>
          <div className="w-full h-5 bg-gradient-to-b from-amber-900 via-amber-950 to-stone-950 rounded-sm border-t border-amber-500/40 shadow-[0_14px_28px_rgba(0,0,0,0.9)]" />
        </div>

        <div className="relative px-9 py-3.5 rounded-full bg-black/40 border border-white/10 backdrop-blur-xl flex items-center gap-4 shadow-xl">
          <span className="text-pink-400 text-base">✦</span>
          <p className="font-display text-base font-semibold text-neutral-100 flex items-center justify-center gap-1.5">
            <span className="inline-flex items-center gap-0.5">
              <span className="w-1.5 h-3.5 bg-pink-400 rounded-full" />
              <span className="w-1.5 h-4 bg-pink-200 rounded-full" />
              <span className="w-1.5 h-3 bg-pink-400 rounded-full" />
            </span>
            <span>Minha Estante</span>
          </p>
          <span className="text-pink-400 text-sm">♡</span>
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
