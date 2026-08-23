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
  const kindleInputRef = useRef<HTMLInputElement>(null);
  const complementarInputRef = useRef<HTMLInputElement>(null);

  function handleKindleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onFotoKindleUpload(file);
  }

  function handleComplementarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onFotoComplementarUpload(file);
  }

  function aplicarResumoOpiniao() {
    if (!resenhaOriginal) return;
    const trecho = resenhaOriginal.slice(0, 240);
    const pontuacao = trecho.lastIndexOf(".");
    const resumido = pontuacao > 80 ? trecho.slice(0, pontuacao + 1) : trecho + "...";
    onChangeConfig({ opiniao: resumido });
  }

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

      {/* SEÇÃO DE FOTOS ADICIONAIS */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-tinta-2">
          Fotos da Leitura (Opcionais)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Foto Kindle */}
          <div className="rounded-2xl border border-papel-3 bg-papel-2/50 p-4 flex flex-col justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amora/10 text-amora">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
                  <line x1="12" y1="18" x2="12.01" y2="18" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-tinta">Foto do Kindle / Livro</p>
                <p className="text-[11px] text-tinta-3">Seu cantinho de leitura</p>
              </div>
            </div>

            <input
              ref={kindleInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleKindleChange}
            />

            {config.fotoKindleUrl ? (
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-papel-3">
                <button
                  type="button"
                  onClick={() => {
                    kindleInputRef.current?.click();
                    onChangePaginaAtiva(2);
                  }}
                  className="text-xs text-amora hover:underline cursor-pointer"
                >
                  Trocar foto
                </button>
                <button
                  type="button"
                  onClick={onRemoverFotoKindle}
                  className="text-xs text-red-500 hover:underline cursor-pointer"
                >
                  Remover
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  kindleInputRef.current?.click();
                  onChangePaginaAtiva(2);
                }}
                className="w-full rounded-xl border border-dashed border-papel-3 hover:border-amora py-2 text-xs font-medium text-tinta-2 hover:text-amora transition-colors cursor-pointer"
              >
                + Adicionar foto
              </button>
            )}
          </div>

          {/* Foto Complementar / Print */}
          <div className="rounded-2xl border border-papel-3 bg-papel-2/50 p-4 flex flex-col justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-500/10 text-pink-500">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 20V10M12 20V4M6 20v-6" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-tinta">Print do Skoob / Foto</p>
                <p className="text-[11px] text-tinta-3">Print do Skoob, trecho ou citação</p>
              </div>
            </div>

            <input
              ref={complementarInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleComplementarChange}
            />

            {config.fotoComplementarUrl ? (
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-papel-3">
                <button
                  type="button"
                  onClick={() => {
                    complementarInputRef.current?.click();
                    onChangePaginaAtiva(2);
                  }}
                  className="text-xs text-amora hover:underline cursor-pointer"
                >
                  Trocar imagem
                </button>
                <button
                  type="button"
                  onClick={onRemoverFotoComplementar}
                  className="text-xs text-red-500 hover:underline cursor-pointer"
                >
                  Remover
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  complementarInputRef.current?.click();
                  onChangePaginaAtiva(2);
                }}
                className="w-full rounded-xl border border-dashed border-papel-3 hover:border-amora py-2 text-xs font-medium text-tinta-2 hover:text-amora transition-colors cursor-pointer"
              >
                + Adicionar print
              </button>
            )}
          </div>
        </div>
      </div>

      {/* SEÇÃO DE OPINIÃO INTELIGENTE */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="opiniao-story" className="text-xs font-semibold uppercase tracking-wider text-tinta-2">
            Minha Opinião para o Story
          </label>
          <span className="text-[11px] text-tinta-3 font-mono">
            {config.opiniao.length} caracteres
          </span>
        </div>

        <textarea
          id="opiniao-story"
          rows={3}
          value={config.opiniao}
          onChange={(e) => onChangeConfig({ opiniao: e.target.value })}
          placeholder="O que achou da história? O que mais te marcou?"
          maxLength={400}
          className="w-full rounded-2xl border border-papel-3 bg-papel px-3.5 py-2.5 text-sm text-tinta placeholder:text-tinta-3 focus:border-amora focus:outline-none resize-none transition-colors"
        />

        {resenhaOriginal && resenhaOriginal.length > 200 && (
          <div className="flex items-center justify-between text-xs pt-1">
            <button
              type="button"
              onClick={aplicarResumoOpiniao}
              className="text-amora hover:underline cursor-pointer font-medium"
            >
              ✂ Resumir resenha para Story
            </button>
            <button
              type="button"
              onClick={() => onChangeConfig({ opiniao: resenhaOriginal.slice(0, 380) })}
              className="text-tinta-3 hover:text-tinta cursor-pointer"
            >
              Usar resenha original
            </button>
          </div>
        )}
      </div>

      {/* ELEMENTOS VISÍVEIS */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-tinta-2">
          Elementos Visíveis
        </h3>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <label className="flex items-center gap-2 rounded-xl border border-papel-3 bg-papel px-3 py-2 cursor-pointer hover:border-amora transition-colors">
            <input
              type="checkbox"
              checked={config.mostrarAutor}
              onChange={(e) => onChangeConfig({ mostrarAutor: e.target.checked })}
              className="accent-amora h-4 w-4 rounded"
            />
            <span>Autor</span>
          </label>

          <label className="flex items-center gap-2 rounded-xl border border-papel-3 bg-papel px-3 py-2 cursor-pointer hover:border-amora transition-colors">
            <input
              type="checkbox"
              checked={config.mostrarDatas}
              onChange={(e) => onChangeConfig({ mostrarDatas: e.target.checked })}
              className="accent-amora h-4 w-4 rounded"
            />
            <span>Datas (Início/Fim)</span>
          </label>

          <label className="flex items-center gap-2 rounded-xl border border-papel-3 bg-papel px-3 py-2 cursor-pointer hover:border-amora transition-colors">
            <input
              type="checkbox"
              checked={config.mostrarNota}
              onChange={(e) => onChangeConfig({ mostrarNota: e.target.checked })}
              className="accent-amora h-4 w-4 rounded"
            />
            <span>Nota & Estrelas</span>
          </label>

          <label className="flex items-center gap-2 rounded-xl border border-papel-3 bg-papel px-3 py-2 cursor-pointer hover:border-amora transition-colors">
            <input
              type="checkbox"
              checked={config.mostrarPaginas}
              onChange={(e) => onChangeConfig({ mostrarPaginas: e.target.checked })}
              className="accent-amora h-4 w-4 rounded"
            />
            <span>Nº de Páginas</span>
          </label>

          <label className="flex items-center gap-2 rounded-xl border border-papel-3 bg-papel px-3 py-2 cursor-pointer hover:border-amora transition-colors">
            <input
              type="checkbox"
              checked={config.mostrarFotoKindle}
              onChange={(e) => onChangeConfig({ mostrarFotoKindle: e.target.checked })}
              className="accent-amora h-4 w-4 rounded"
            />
            <span>Foto do Kindle</span>
          </label>

          <label className="flex items-center gap-2 rounded-xl border border-papel-3 bg-papel px-3 py-2 cursor-pointer hover:border-amora transition-colors">
            <input
              type="checkbox"
              checked={config.mostrarPrintSkoob}
              onChange={(e) => onChangeConfig({ mostrarPrintSkoob: e.target.checked })}
              className="accent-amora h-4 w-4 rounded"
            />
            <span>Print do Skoob</span>
          </label>
        </div>
      </div>

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
