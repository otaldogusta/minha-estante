import React, { useRef } from "react";
import type { StoryPersonalizacao, ModoStory } from "../../lib/story/story-types";

interface StoryControlsProps {
  config: StoryPersonalizacao;
  resenhaOriginal?: string | null;
  paginaAtiva: 1 | 2 | 3;
  onChangePaginaAtiva: (p: 1 | 2 | 3) => void;
  onChangeConfig: (nova: Partial<StoryPersonalizacao>) => void;
  onFotoKindleUpload: (file: File) => void;
  onRemoverFotoKindle: () => void;
  onFotoComplementarUpload: (file: File) => void;
  onRemoverFotoComplementar: () => void;
  onGerarStory: (apenasPaginaAtual?: boolean) => void;
  gerando: boolean;
  mensagemErro: string | null;
}

export function StoryControls({
  config,
  resenhaOriginal,
  paginaAtiva,
  onChangePaginaAtiva,
  onChangeConfig,
  onFotoKindleUpload,
  onRemoverFotoKindle,
  onFotoComplementarUpload,
  onRemoverFotoComplementar,
  onGerarStory,
  gerando,
  mensagemErro,
}: StoryControlsProps) {
  return (
    <div className="flex flex-col gap-6 text-tinta">
      {/* SELETOR DE MODO: RÁPIDO (1 STORY) OU COMPLETO (3 STORIES) */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-tinta-2">
          Formato de Publicação
        </label>
        <div className="grid grid-cols-2 gap-2 p-1 bg-papel-2/80 rounded-2xl border border-papel-3">
          <button
            type="button"
            onClick={() => {
              onChangeConfig({ modo: "rapido" });
              onChangePaginaAtiva(1);
            }}
            className={`py-2.5 px-3 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              config.modo === "rapido"
                ? "bg-amora text-papel shadow-sm"
                : "text-tinta-2 hover:text-tinta"
            }`}
          >
            ✦ Story Único (1 Página)
          </button>
          <button
            type="button"
            onClick={() => onChangeConfig({ modo: "completo" })}
            className={`py-2.5 px-3 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              config.modo === "completo"
                ? "bg-amora text-papel shadow-sm"
                : "text-tinta-2 hover:text-tinta"
            }`}
          >
            ★ Sequência (3 Stories)
          </button>
        </div>
      </div>

      {/* SELETOR DE PÁGINA (Aparece se for Sequência Completa) */}
      {config.modo === "completo" && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-tinta-2">
              Visualizar & Editar Página
            </span>
            <span className="text-xs font-mono text-amora font-bold">
              {paginaAtiva} de 3
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => onChangePaginaAtiva(1)}
              className={`py-2 px-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                paginaAtiva === 1
                  ? "border-amora bg-amora/10 text-amora font-bold"
                  : "border-papel-3 bg-papel hover:border-amora/40 text-tinta-2"
              }`}
            >
              1. Capa & Nota
            </button>
            <button
              type="button"
              onClick={() => onChangePaginaAtiva(2)}
              className={`py-2 px-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                paginaAtiva === 2
                  ? "border-amora bg-amora/10 text-amora font-bold"
                  : "border-papel-3 bg-papel hover:border-amora/40 text-tinta-2"
              }`}
            >
              2. Fotos
            </button>
            <button
              type="button"
              onClick={() => onChangePaginaAtiva(3)}
              className={`py-2 px-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                paginaAtiva === 3
                  ? "border-amora bg-amora/10 text-amora font-bold"
                  : "border-papel-3 bg-papel hover:border-amora/40 text-tinta-2"
              }`}
            >
              3. Opinião
            </button>
          </div>
        </div>
      )}

      {mensagemErro && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-500">
          {mensagemErro}
        </div>
      )}

      {/* BOTÕES DE AÇÃO */}
      <div className="pt-2 flex flex-col gap-2.5">
        <button
          type="button"
          onClick={() => onGerarStory(false)}
          disabled={gerando}
          className="w-full rounded-2xl bg-amora hover:bg-amora-escura text-papel py-3.5 px-6 font-medium text-sm shadow-md transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2.5"
        >
          {gerando ? (
            <>
              <svg className="animate-spin h-4 w-4 text-papel" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Exportando Stories em 1080×1920...</span>
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>
                {config.modo === "completo"
                  ? "Baixar Sequência (3 Stories PNG)"
                  : "Gerar Story & Baixar PNG"}
              </span>
            </>
          )}
        </button>

        {config.modo === "completo" && (
          <button
            type="button"
            onClick={() => onGerarStory(true)}
            disabled={gerando}
            className="w-full rounded-xl border border-papel-3 hover:border-amora py-2.5 px-4 text-xs font-medium text-tinta-2 hover:text-amora transition-colors cursor-pointer text-center"
          >
            Baixar somente Página {paginaAtiva} atual
          </button>
        )}
      </div>
    </div>
  );
}
