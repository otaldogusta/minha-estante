import React from "react";
import type { StoryBookData, StoryPersonalizacao } from "../../lib/story/story-types";

interface StoryTemplateProps {
  book: StoryBookData;
  config: StoryPersonalizacao;
  capaDataUrl?: string | null;
  paginaAtiva?: 1 | 2 | 3;
  isEditable?: boolean;
  onUpdateBook?: (novos: Partial<StoryBookData>) => void;
  onUpdateConfig?: (novas: Partial<StoryPersonalizacao>) => void;
  onCapaUpload?: (dataUrl: string) => void;
  onFotoKindleUpload?: (file: File) => void;
  onFotoComplementarUpload?: (file: File) => void;
  onClickCapa?: () => void;
  fundoDataUrl?: string | null;
  onClickFundo?: () => void;
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

function EstrelasStory({
  nota,
  corEstrela = "pink",
  isEditable = false,
  onRate,
}: {
  nota?: number | null;
  corEstrela?: "pink" | "white";
  isEditable?: boolean;
  onRate?: (nota: number) => void;
}) {
  const valor = Math.max(0, Math.min(5, nota ?? 0));
  const fillClass = corEstrela === "white" ? "fill-white stroke-white" : "fill-pink-400 stroke-pink-400";
  const strokeClass = corEstrela === "white" ? "stroke-white fill-none" : "stroke-pink-400 fill-none";
  const emptyClass = corEstrela === "white" ? "stroke-white/40 fill-none" : "stroke-pink-400/40 fill-none";
  const halfColor = corEstrela === "white" ? "#ffffff" : "#f472b6";

  return (
    <div className={`flex items-center gap-2.5 ${corEstrela === "white" ? "text-white" : "text-pink-400"}`}>
      {[1, 2, 3, 4, 5].map((estrela) => {
        const preenchimento = valor >= estrela ? "cheia" : valor >= estrela - 0.5 ? "meia" : "vazia";

        return (
          <span
            key={estrela}
            className={`relative inline-block w-10 h-10 ${isEditable ? "cursor-pointer hover:scale-120 transition-transform active:scale-95" : ""}`}
            onClick={isEditable ? () => onRate?.(estrela) : undefined}
          >
            {preenchimento === "cheia" && (
              <svg viewBox="0 0 24 24" className={`w-10 h-10 ${fillClass}`}>
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            )}
            {preenchimento === "meia" && (
              <svg viewBox="0 0 24 24" className={`w-10 h-10 ${strokeClass}`}>
                <defs>
                  <linearGradient id={`half-star-${corEstrela}-${estrela}`}>
                    <stop offset="50%" stopColor={halfColor} />
                    <stop offset="50%" stopColor="transparent" />
                  </linearGradient>
                </defs>
                <polygon
                  fill={`url(#half-star-${corEstrela}-${estrela})`}
                  points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                />
              </svg>
            )}
            {preenchimento === "vazia" && (
              <svg viewBox="0 0 24 24" className={`w-10 h-10 ${emptyClass}`} strokeWidth="1.6">
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
  {
    book: StoryBookData;
    config: StoryPersonalizacao;
    capaDataUrl?: string | null;
    isEditable?: boolean;
    onUpdateBook?: (novos: Partial<StoryBookData>) => void;
    onUpdateConfig?: (novas: Partial<StoryPersonalizacao>) => void;
    onCapaUpload?: (dataUrl: string) => void;
    onClickCapa?: () => void;
    fundoDataUrl?: string | null;
    onClickFundo?: () => void;
  }
>(({ book, config, capaDataUrl, isEditable = false, onUpdateBook, onUpdateConfig, onCapaUpload, onClickCapa, fundoDataUrl, onClickFundo }, ref) => {
  const imagemCapa = capaDataUrl || book.capa;
  const dataInicioFmt = formatarDataPtBr(book.inicio);
  const dataFimFmt = formatarDataPtBr(book.fim);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const diasLidos = React.useMemo(() => {
    if (!book.inicio || !book.fim) return null;
    try {
      const d1 = new Date(book.inicio + "T00:00:00");
      const d2 = new Date(book.fim + "T00:00:00");
      if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return null;
      const diffTime = d2.getTime() - d1.getTime();
      if (diffTime < 0) return null;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays;
    } catch {
      return null;
    }
  }, [book.inicio, book.fim]);

  return (
    <div
      ref={ref}
      style={{
        width: "1080px",
        height: "1920px",
        backgroundColor: "#120e15",
      }}
      className="relative overflow-hidden font-sans text-neutral-100 flex flex-col items-center justify-between py-16 px-12 select-none box-border"
    >
      {/* Imagem de Fundo (Stack de livros em grayscale) */}
      <img
        src={fundoDataUrl || "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&q=80&w=1080"}
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover filter grayscale brightness-[0.22] z-0 pointer-events-none"
        crossOrigin="anonymous"
      />

      {isEditable && onClickFundo && (
        <button
          type="button"
          onClick={onClickFundo}
          className="absolute top-10 right-10 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-black/60 border border-white/20 text-white hover:bg-black/80 transition-all cursor-pointer shadow-lg active:scale-95"
          title="Alterar imagem de fundo"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </button>
      )}

      {/* Container Principal (Capa + Estrelas + Círculo) */}
      <div className="relative z-10 w-[780px] h-[1260px] rounded-[40px] border border-white/10 bg-black/25 backdrop-blur-md p-10 flex flex-col items-center justify-between shadow-2xl mt-12">
        {/* Capa do Livro */}
        <div
          onClick={isEditable ? (onClickCapa || (() => fileInputRef.current?.click())) : undefined}
          className={`flex-1 w-full flex items-center justify-center overflow-hidden mb-6 relative group ${isEditable ? "cursor-pointer" : ""}`}
        >
          {isEditable && (
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file && onCapaUpload) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    if (typeof reader.result === "string") {
                      onCapaUpload(reader.result);
                    }
                  };
                  reader.readAsDataURL(file);
                }
              }}
              className="hidden"
            />
          )}

          {imagemCapa ? (
            <img
              src={imagemCapa}
              alt={book.titulo}
              className="h-full max-h-[960px] w-auto max-w-full object-contain rounded-3xl shadow-2xl border border-white/15"
              crossOrigin="anonymous"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-center gap-4 text-neutral-400">
              <svg viewBox="0 0 24 24" className="w-24 h-24 stroke-white/40 fill-none" strokeWidth="1.5">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
              </svg>
              <span className="font-serif italic text-3xl text-neutral-300">Sem capa disponível</span>
            </div>
          )}

          {isEditable && (
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200 rounded-3xl">
              <div className="bg-black/60 border border-white/20 px-6 py-3 rounded-full text-white text-lg font-medium flex items-center gap-2">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <span>Alterar Capa</span>
              </div>
            </div>
          )}
        </div>

        {/* Estrelas (Centralizadas) */}
        <div className="flex items-center justify-center w-full py-4 border-t border-white/5">
          <EstrelasStory
            nota={book.nota}
            corEstrela="white"
            isEditable={isEditable}
            onRate={(n) => onUpdateBook?.({ nota: n })}
          />
        </div>
      </div>

      {/* Caixa de Feedback Opcional sobre o livro */}
      {config.mostrarOpiniao && (
        <div className="relative z-10 w-[780px] rounded-3xl p-6 bg-black/25 border border-white/10 backdrop-blur-md shadow-xl flex items-center justify-center text-center mb-6">
          {isEditable && (
            <button
              type="button"
              onClick={() => onUpdateConfig?.({ mostrarOpiniao: false })}
              className="absolute top-3.5 right-3.5 text-neutral-400 hover:text-white text-2xl cursor-pointer font-bold w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/10"
              title="Ocultar comentário"
            >
              ✕
            </button>
          )}
          {isEditable ? (
            <textarea
              value={config.opiniao}
              onChange={(e) => onUpdateConfig?.({ opiniao: e.target.value })}
              className="w-full bg-transparent text-neutral-100 font-serif italic text-3xl text-center leading-normal border-none focus:outline-none resize-none focus:ring-0"
              rows={2}
              placeholder="Escreva aqui sua opinião rápida sobre a leitura..."
              maxLength={200}
            />
          ) : (
            <p className="font-serif italic text-3xl text-neutral-100 leading-normal px-4">
              {config.opiniao || "Uma leitura inesquecível que tocou o coração."}
            </p>
          )}
        </div>
      )}

      {!config.mostrarOpiniao && isEditable && (
        <button
          type="button"
          onClick={() => onUpdateConfig?.({ mostrarOpiniao: true })}
          className="relative z-10 w-[780px] py-4 rounded-3xl border border-dashed border-white/20 bg-white/[0.02] hover:bg-white/[0.05] text-neutral-400 hover:text-neutral-200 text-2xl font-serif italic transition-all cursor-pointer mb-6"
        >
          + Adicionar comentário sobre a leitura
        </button>
      )}

      {/* Container Secundário (Datas e Duração) */}
      <div className="relative z-10 w-[780px] h-[180px] rounded-3xl border border-white/10 bg-black/25 backdrop-blur-md p-6 flex items-center justify-around shadow-xl mb-20">
        <div className="flex flex-col items-center flex-1">
          <span className="text-sm uppercase tracking-widest text-neutral-400 font-semibold mb-2">Início</span>
          {isEditable ? (
            <input
              type="date"
              value={book.inicio || ""}
              onChange={(e) => onUpdateBook?.({ inicio: e.target.value || null })}
              className="bg-transparent border-b border-dashed border-white/20 text-neutral-100 font-mono text-2xl text-center focus:outline-none focus:border-white w-full max-w-[240px] py-1 cursor-pointer"
              style={{ colorScheme: "dark" }}
            />
          ) : (
            <span className="font-mono text-2xl font-bold text-neutral-100">{dataInicioFmt || "—"}</span>
          )}
        </div>
        <div className="w-px h-12 bg-white/10" />
        <div className="flex flex-col items-center flex-1">
          <span className="text-sm uppercase tracking-widest text-neutral-400 font-semibold mb-2">Término</span>
          {isEditable ? (
            <input
              type="date"
              value={book.fim || ""}
              onChange={(e) => onUpdateBook?.({ fim: e.target.value || null })}
              className="bg-transparent border-b border-dashed border-white/20 text-neutral-100 font-mono text-2xl text-center focus:outline-none focus:border-white w-full max-w-[240px] py-1 cursor-pointer"
              style={{ colorScheme: "dark" }}
            />
          ) : (
            <span className="font-mono text-2xl font-bold text-neutral-100">{dataFimFmt || "—"}</span>
          )}
        </div>
        <div className="w-px h-12 bg-white/10" />
        <div className="flex flex-col items-center flex-1">
          <span className="text-sm uppercase tracking-widest text-neutral-400 font-semibold mb-2">Duração</span>
          <span className="font-mono text-2xl font-bold text-neutral-100">
            {diasLidos !== null ? `${diasLidos} ${diasLidos === 1 ? "dia" : "dias"}` : "—"}
          </span>
        </div>
      </div>
    </div>
  );
});
StoryPagina1Resumo.displayName = "StoryPagina1Resumo";

/* ==========================================================================
   STORY 2 — MEU MOMENTO DE LEITURA (FOTOS GRANDES: KINDLE + PRINT)
   ========================================================================== */
export const StoryPagina2Fotos = React.forwardRef<
  HTMLDivElement,
  {
    book: StoryBookData;
    config: StoryPersonalizacao;
    isEditable?: boolean;
    onFotoKindleUpload?: (file: File) => void;
    onRemoverFotoKindle?: () => void;
    onFotoComplementarUpload?: (file: File) => void;
    onRemoverFotoComplementar?: () => void;
  }
>(({ book, config, isEditable = false, onFotoKindleUpload, onRemoverFotoKindle, onFotoComplementarUpload, onRemoverFotoComplementar }, ref) => {
  const temKindle = Boolean(config.fotoKindleUrl);
  const temPrint = Boolean(config.fotoComplementarUrl);
  const qtdFotos = (temKindle ? 1 : 0) + (temPrint ? 1 : 0);

  const kindleInputRef = React.useRef<HTMLInputElement>(null);
  const complementarInputRef = React.useRef<HTMLInputElement>(null);

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
      {isEditable && (
        <>
          <input
            ref={kindleInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file && onFotoKindleUpload) onFotoKindleUpload(file);
            }}
          />
          <input
            ref={complementarInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file && onFotoComplementarUpload) onFotoComplementarUpload(file);
            }}
          />
        </>
      )}

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
        {temKindle ? (
          <div
            onClick={isEditable ? () => kindleInputRef.current?.click() : undefined}
            className={`relative rounded-3xl p-4 bg-gradient-to-b from-white/[0.14] to-white/[0.04] border border-white/20 shadow-2xl overflow-hidden group ${isEditable ? "cursor-pointer" : ""} ${qtdFotos === 1 ? "h-[850px]" : "h-[560px]"}`}
          >
            <img
              src={config.fotoKindleUrl!}
              alt="Momento Kindle"
              className="w-full h-full object-cover rounded-2xl shadow-md"
            />
            {isEditable && (
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-3 transition-opacity duration-200 rounded-3xl">
                <span className="bg-black/60 border border-white/20 px-4 py-2 rounded-full text-white text-sm font-medium">Alterar Foto do Kindle</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoverFotoKindle?.();
                  }}
                  className="bg-red-600/80 hover:bg-red-700 border border-red-500/20 px-3.5 py-1.5 rounded-full text-white text-xs font-semibold mt-2"
                >
                  Remover Foto
                </button>
              </div>
            )}
          </div>
        ) : (
          isEditable && (
            <div
              onClick={() => kindleInputRef.current?.click()}
              className="rounded-3xl border-2 border-dashed border-white/20 bg-white/[0.02] hover:bg-white/[0.05] p-10 text-center flex flex-col items-center justify-center gap-3 cursor-pointer h-[260px] transition-all"
            >
              <svg viewBox="0 0 24 24" className="w-12 h-12 stroke-white/40 fill-none" strokeWidth="1.5">
                <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
              </svg>
              <span className="text-sm text-neutral-400">Adicionar Foto do Kindle</span>
            </div>
          )
        )}

        {/* Caso Tenha Foto Complementar / Print */}
        {temPrint ? (
          <div
            onClick={isEditable ? () => complementarInputRef.current?.click() : undefined}
            className={`relative rounded-3xl p-4 bg-gradient-to-b from-white/[0.14] to-white/[0.04] border border-white/20 shadow-2xl overflow-hidden group ${isEditable ? "cursor-pointer" : ""} ${qtdFotos === 1 ? "h-[850px]" : "h-[560px]"}`}
          >
            <img
              src={config.fotoComplementarUrl!}
              alt="Foto Complementar ou Print"
              className="w-full h-full object-contain rounded-2xl shadow-md bg-black/40"
            />
            {isEditable && (
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity duration-200 rounded-3xl">
                <span className="bg-black/60 border border-white/20 px-4 py-2 rounded-full text-white text-sm font-medium">Alterar Print do Skoob</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoverFotoComplementar?.();
                  }}
                  className="bg-red-600/80 hover:bg-red-700 border border-red-500/20 px-3.5 py-1.5 rounded-full text-white text-xs font-semibold mt-2"
                >
                  Remover Print
                </button>
              </div>
            )}
          </div>
        ) : (
          isEditable && (
            <div
              onClick={() => complementarInputRef.current?.click()}
              className="rounded-3xl border-2 border-dashed border-white/20 bg-white/[0.02] hover:bg-white/[0.05] p-10 text-center flex flex-col items-center justify-center gap-3 cursor-pointer h-[260px] transition-all"
            >
              <svg viewBox="0 0 24 24" className="w-12 h-12 stroke-white/40 fill-none" strokeWidth="1.5">
                <path d="M18 20V10M12 20V4M6 20v-6" />
              </svg>
              <span className="text-sm text-neutral-400">Adicionar Print do Skoob</span>
            </div>
          )
        )}

        {/* Fallback Elegante caso nenhuma foto tenha sido adicionada */}
        {!temKindle && !temPrint && !isEditable && (
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
  {
    book: StoryBookData;
    config: StoryPersonalizacao;
    capaDataUrl?: string | null;
    isEditable?: boolean;
    onUpdateBook?: (novos: Partial<StoryBookData>) => void;
    onUpdateConfig?: (novas: Partial<StoryPersonalizacao>) => void;
  }
>(({ book, config, capaDataUrl, isEditable = false, onUpdateBook, onUpdateConfig }, ref) => {
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

          {isEditable ? (
            <textarea
              value={config.opiniao}
              onChange={(e) => onUpdateConfig?.({ opiniao: e.target.value })}
              className="w-full bg-transparent text-neutral-100 font-serif italic text-4xl sm:text-5xl text-center leading-relaxed border-none focus:outline-none resize-none text-center focus:ring-0"
              rows={6}
              placeholder="conte aqui o que achou da leitura, o que mais te marcou, o que sentiu..."
              maxLength={400}
            />
          ) : (
            <p className="font-serif italic text-4xl sm:text-5xl text-neutral-100 leading-relaxed max-h-[750px] overflow-hidden text-ellipsis line-clamp-8 text-center px-4">
              {config.opiniao || "Uma leitura inesquecível que tocou o coração e trouxe reflexões que levarei comigo."}
            </p>
          )}

          <span className="absolute -bottom-14 right-8 font-serif text-9xl text-pink-400/50 leading-none">”</span>
        </div>

        {/* Nota com Estrelas */}
        {config.mostrarNota && book.nota !== undefined && book.nota !== null && (
          <div className="flex items-center justify-center gap-4 mt-10">
            <EstrelasStory
              nota={book.nota}
              isEditable={isEditable}
              onRate={(nota) => onUpdateBook?.({ nota })}
            />
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
  (
    {
      book,
      config,
      capaDataUrl,
      paginaAtiva = 1,
      isEditable = false,
      onUpdateBook,
      onUpdateConfig,
      onCapaUpload,
      onFotoKindleUpload,
      onRemoverFotoKindle,
      onFotoComplementarUpload,
      onRemoverFotoComplementar,
      onClickCapa,
      fundoDataUrl,
      onClickFundo,
    },
    ref
  ) => {
    if (paginaAtiva === 2) {
      return (
        <StoryPagina2Fotos
          ref={ref}
          book={book}
          config={config}
          isEditable={isEditable}
          onFotoKindleUpload={onFotoKindleUpload}
          onRemoverFotoKindle={onRemoverFotoKindle}
          onFotoComplementarUpload={onFotoComplementarUpload}
          onRemoverFotoComplementar={onRemoverFotoComplementar}
        />
      );
    }
    if (paginaAtiva === 3) {
      return (
        <StoryPagina3Opiniao
          ref={ref}
          book={book}
          config={config}
          capaDataUrl={capaDataUrl}
          isEditable={isEditable}
          onUpdateBook={onUpdateBook}
          onUpdateConfig={onUpdateConfig}
        />
      );
    }
    return (
      <StoryPagina1Resumo
        ref={ref}
        book={book}
        config={config}
        capaDataUrl={capaDataUrl}
        isEditable={isEditable}
        onUpdateBook={onUpdateBook}
        onUpdateConfig={onUpdateConfig}
        onCapaUpload={onCapaUpload}
        onClickCapa={onClickCapa}
        fundoDataUrl={fundoDataUrl}
        onClickFundo={onClickFundo}
      />
    );
  }
);
StoryTemplateEditorial.displayName = "StoryTemplateEditorial";
