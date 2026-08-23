import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { StoryBookData, StoryPersonalizacao } from "../../lib/story/story-types";
import {
  StoryPagina1Resumo,
  StoryPagina2Fotos,
  StoryPagina3Opiniao,
  StoryTemplateEditorial,
} from "./story-template-editorial";
import { StoryControls } from "./story-controls";
import { exportarStoryPng, compartilharOuBaixarStory, baixarBlob } from "../../lib/story/export-story";
import { obterCapaDataUrl } from "../../lib/api/story.functions";
import { notificar } from "../../lib/toast";

interface StoryGeneratorModalProps {
  livro: StoryBookData;
  aberto: boolean;
  onClose: () => void;
}

export function StoryGeneratorModal({ livro, aberto, onClose }: StoryGeneratorModalProps) {
  const [paginaAtiva, setPaginaAtiva] = useState<1 | 2 | 3>(1);

  const [config, setConfig] = useState<StoryPersonalizacao>(() => {
    const resenhaTexto = livro.resenha || "";
    const opiniaoInicial =
      resenhaTexto.length > 280 ? resenhaTexto.slice(0, 240) + "..." : resenhaTexto;

    return {
      modo: "rapido",
      fotoKindleUrl: null,
      fotoComplementarUrl: null,
      opiniao: opiniaoInicial,
      mostrarAutor: true,
      mostrarDatas: Boolean(livro.inicio || livro.fim),
      mostrarNota: Boolean(livro.nota !== null && livro.nota !== undefined),
      mostrarPaginas: Boolean(livro.paginas),
      mostrarOpiniao: Boolean(resenhaTexto.trim()),
      mostrarFotoKindle: false,
      mostrarPrintSkoob: false,
      tema: "editorial-escuro",
    };
  });

  const [capaDataUrl, setCapaDataUrl] = useState<string | null>(null);
  const [gerando, setGerando] = useState(false);
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);

  const exportPagina1Ref = useRef<HTMLDivElement>(null);
  const exportPagina2Ref = useRef<HTMLDivElement>(null);
  const exportPagina3Ref = useRef<HTMLDivElement>(null);

  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [previewScale, setPreviewScale] = useState(0.32);

  // Carrega a capa via proxy seguro de servidor
  useEffect(() => {
    if (!aberto) return;

    let ativo = true;
    if (livro.capa) {
      obterCapaDataUrl({ data: { url: livro.capa } })
        .then((res) => {
          if (ativo && res?.dataUrl) {
            setCapaDataUrl(res.dataUrl);
          }
        })
        .catch(() => {});
    }

    return () => {
      ativo = false;
    };
  }, [aberto, livro.capa]);

  // Bloqueio de scroll do body e evento de tecla ESC
  useEffect(() => {
    if (!aberto) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !gerando) {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [aberto, gerando, onClose]);

  // Calcula escala responsiva do preview
  useEffect(() => {
    if (!aberto) return;

    function atualizarEscala() {
      if (!previewContainerRef.current) return;
      const { clientWidth, clientHeight } = previewContainerRef.current;
      const escalaX = clientWidth / 1080;
      const escalaY = clientHeight / 1920;
      const escala = Math.min(escalaX, escalaY, 0.45);
      setPreviewScale(Math.max(0.20, escala));
    }

    atualizarEscala();
    window.addEventListener("resize", atualizarEscala);
    return () => window.removeEventListener("resize", atualizarEscala);
  }, [aberto, paginaAtiva]);

  // Limpeza de Object URLs ao desmontar
  useEffect(() => {
    return () => {
      if (config.fotoKindleUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(config.fotoKindleUrl);
      }
      if (config.fotoComplementarUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(config.fotoComplementarUrl);
      }
    };
  }, [config.fotoKindleUrl, config.fotoComplementarUrl]);

  function handleChangeConfig(novos: Partial<StoryPersonalizacao>) {
    setConfig((prev) => ({ ...prev, ...novos }));
  }

  function handleFotoKindleUpload(file: File) {
    if (config.fotoKindleUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(config.fotoKindleUrl);
    }
    const url = URL.createObjectURL(file);
    setConfig((prev) => ({ ...prev, fotoKindleUrl: url, mostrarFotoKindle: true }));
  }

  function handleRemoverFotoKindle() {
    if (config.fotoKindleUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(config.fotoKindleUrl);
    }
    setConfig((prev) => ({ ...prev, fotoKindleUrl: null, mostrarFotoKindle: false }));
  }

  function handleFotoComplementarUpload(file: File) {
    if (config.fotoComplementarUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(config.fotoComplementarUrl);
    }
    const url = URL.createObjectURL(file);
    setConfig((prev) => ({ ...prev, fotoComplementarUrl: url, mostrarPrintSkoob: true }));
  }

  function handleRemoverFotoComplementar() {
    if (config.fotoComplementarUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(config.fotoComplementarUrl);
    }
    setConfig((prev) => ({ ...prev, fotoComplementarUrl: null, mostrarPrintSkoob: false }));
  }

  async function handleGerarStory(apenasPaginaAtual = false) {
    if (gerando) return;
    setGerando(true);
    setMensagemErro(null);

    try {
      if (apenasPaginaAtual || config.modo === "rapido") {
        // Exporta somente 1 Story
        let alvoNode: HTMLElement | null = null;
        let sufixo = "resumo";

        if (config.modo === "rapido" || paginaAtiva === 1) {
          alvoNode = exportPagina1Ref.current;
          sufixo = "resumo";
        } else if (paginaAtiva === 2) {
          alvoNode = exportPagina2Ref.current;
          sufixo = "leitura";
        } else {
          alvoNode = exportPagina3Ref.current;
          sufixo = "opiniao";
        }

        if (!alvoNode) throw new Error("Elemento não encontrado para renderização");

        const { blob, nomeArquivo } = await exportarStoryPng(alvoNode, `${livro.titulo}-${sufixo}`);
        await compartilharOuBaixarStory(blob, `${livro.titulo} (${sufixo})`, nomeArquivo);
        notificar("Story exportado com sucesso!", "sucesso");
      } else {
        // Exporta a SEQUÊNCIA COMPLETA (3 Stories)
        const nodes = [
          { node: exportPagina1Ref.current, sufixo: "1-resumo" },
          { node: exportPagina2Ref.current, sufixo: "2-leitura" },
          { node: exportPagina3Ref.current, sufixo: "3-opiniao" },
        ];

        const blobsGerados: { blob: Blob; nome: string }[] = [];

        for (const item of nodes) {
          if (item.node) {
            const res = await exportarStoryPng(item.node, `${livro.titulo}-${item.sufixo}`);
            blobsGerados.push({ blob: res.blob, nome: res.nomeArquivo });
          }
        }

        // Tenta compartilhar todos juntos no mobile se suportado
        const files = blobsGerados.map((b) => new File([b.blob], b.nome, { type: "image/png" }));
        if (typeof navigator !== "undefined" && navigator.canShare && navigator.canShare({ files })) {
          try {
            await navigator.share({
              title: `Stories — ${livro.titulo}`,
              text: `Leitura finalizada: ${livro.titulo}`,
              files,
            });
            notificar("3 Stories prontos para compartilhar!", "sucesso");
            return;
          } catch {}
        }

        // Download individual com pequenos delays
        for (let i = 0; i < blobsGerados.length; i++) {
          setTimeout(() => {
            baixarBlob(blobsGerados[i].blob, blobsGerados[i].nome);
          }, i * 300);
        }

        notificar("Sequência de 3 Stories baixada com sucesso!", "sucesso");
      }
    } catch (e: any) {
      console.error("Erro ao gerar Story:", e);
      setMensagemErro("Não foi possível exportar a imagem. Tente novamente.");
      notificar("Erro ao gerar imagem do Story", "erro");
    } finally {
      setGerando(false);
    }
  }

  if (!aberto || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div
        className="absolute inset-0"
        onClick={() => !gerando && onClose()}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-story-title"
        className="relative z-10 w-full max-w-5xl max-h-[94vh] flex flex-col rounded-3xl border border-papel-3 bg-papel shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-papel-3 bg-papel-2/40">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amora/10 text-amora">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </div>
            <div>
              <h2 id="modal-story-title" className="font-display text-lg font-bold text-tinta">
                Criar Stories para Instagram
              </h2>
              <p className="text-xs text-tinta-2">
                {config.modo === "completo"
                  ? "Sequência editorial de 3 páginas • 1080 × 1920 px (9:16)"
                  : "Story único completo • 1080 × 1920 px (9:16)"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={gerando}
            aria-label="Fechar"
            className="flex h-8 w-8 items-center justify-center rounded-full text-tinta-2 hover:bg-papel-3 hover:text-tinta transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* CORPO */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

            {/* PREVIEW 9:16 */}
            <div className="lg:col-span-6 flex flex-col items-center justify-center rounded-2xl bg-black/50 border border-white/10 p-4 min-h-[500px]">
              {/* Controles de Navegação de Página no Topo do Preview */}
              {config.modo === "completo" ? (
                <div className="flex items-center justify-between w-full max-w-[340px] mb-3 px-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setPaginaAtiva((p) => (p > 1 ? ((p - 1) as 1 | 2 | 3) : 3))}
                    className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    title="Página anterior"
                  >
                    ‹ Anterior
                  </button>

                  <div className="flex items-center gap-1.5 font-mono text-neutral-300">
                    <span className="font-bold text-pink-400">Página {paginaAtiva}</span>
                    <span className="text-neutral-500">/ 3</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setPaginaAtiva((p) => (p < 3 ? ((p + 1) as 1 | 2 | 3) : 1))}
                    className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    title="Próxima página"
                  >
                    Próxima ›
                  </button>
                </div>
              ) : (
                <p className="text-[11px] font-mono text-neutral-400 uppercase tracking-widest mb-3">
                  Preview em Tempo Real (9:16)
                </p>
              )}

              {/* Contêiner de Preview */}
              <div
                ref={previewContainerRef}
                className="relative flex items-center justify-center overflow-hidden rounded-2xl shadow-2xl border border-white/10"
                style={{
                  width: "100%",
                  maxWidth: "340px",
                  height: "600px",
                }}
              >
                <div
                  style={{
                    width: "1080px",
                    height: "1920px",
                    transform: `scale(${previewScale})`,
                    transformOrigin: "center center",
                  }}
                  className="shrink-0"
                >
                  <StoryTemplateEditorial
                    book={livro}
                    config={config}
                    capaDataUrl={capaDataUrl}
                    paginaAtiva={config.modo === "rapido" ? 1 : paginaAtiva}
                  />
                </div>
              </div>
            </div>

            {/* CONTROLES */}
            <div className="lg:col-span-6">
              <StoryControls
                config={config}
                resenhaOriginal={livro.resenha}
                paginaAtiva={paginaAtiva}
                onChangePaginaAtiva={setPaginaAtiva}
                onChangeConfig={handleChangeConfig}
                onFotoKindleUpload={handleFotoKindleUpload}
                onRemoverFotoKindle={handleRemoverFotoKindle}
                onFotoComplementarUpload={handleFotoComplementarUpload}
                onRemoverFotoComplementar={handleRemoverFotoComplementar}
                onGerarStory={handleGerarStory}
                gerando={gerando}
                mensagemErro={mensagemErro}
              />
            </div>
          </div>
        </div>
      </div>

      {/* NÓS OFF-SCREEN FIXOS EM 1080×1920 PARA EXPORTAÇÃO DAS 3 PÁGINAS */}
      <div
        className="fixed top-0 left-[-9999px] pointer-events-none z-[-1] overflow-hidden"
        style={{ width: "1080px", height: "1920px" }}
      >
        <StoryPagina1Resumo
          ref={exportPagina1Ref}
          book={livro}
          config={config}
          capaDataUrl={capaDataUrl}
        />
      </div>

      <div
        className="fixed top-0 left-[-9999px] pointer-events-none z-[-1] overflow-hidden"
        style={{ width: "1080px", height: "1920px" }}
      >
        <StoryPagina2Fotos
          ref={exportPagina2Ref}
          book={livro}
          config={config}
        />
      </div>

      <div
        className="fixed top-0 left-[-9999px] pointer-events-none z-[-1] overflow-hidden"
        style={{ width: "1080px", height: "1920px" }}
      >
        <StoryPagina3Opiniao
          ref={exportPagina3Ref}
          book={livro}
          config={config}
          capaDataUrl={capaDataUrl}
        />
      </div>
    </div>,
    document.body
  );
}
