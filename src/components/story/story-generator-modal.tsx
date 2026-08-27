import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { StoryBookData, StoryPersonalizacao } from "../../lib/story/story-types";
import { StoryPagina1Resumo, StoryTemplateEditorial } from "./story-template-editorial";
import { exportarStoryPng, compartilharOuBaixarStory, baixarBlob } from "../../lib/story/export-story";
import { obterCapaDataUrl } from "../../lib/api/story.functions";
import { notificar } from "../../lib/toast";
import { ModalGerenciadorCapa } from "../estante/formulario-livro";

interface StoryGeneratorModalProps {
  livro: StoryBookData;
  aberto: boolean;
  onClose: () => void;
}

export function StoryGeneratorModal({ livro, aberto, onClose }: StoryGeneratorModalProps) {
  const [bookState, setBookState] = useState<StoryBookData>(livro);

  useEffect(() => {
    if (aberto) {
      setBookState(livro);
    }
  }, [aberto, livro]);

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
  const [modalCapaAberto, setModalCapaAberto] = useState(false);
  const [fundoUrl, setFundoUrl] = useState<string>("https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&q=80&w=1080");
  const [fundoDataUrl, setFundoDataUrl] = useState<string | null>(null);
  const [modalFundoAberto, setModalFundoAberto] = useState(false);

  const exportPagina1Ref = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [previewScale, setPreviewScale] = useState(0.32);

  // Carrega a capa via proxy seguro de servidor
  useEffect(() => {
    if (!aberto) return;

    let ativo = true;
    if (bookState.capa) {
      // Se a capa já for um data URL ou blob local, usa diretamente no client
      if (bookState.capa.startsWith("data:") || bookState.capa.startsWith("blob:")) {
        setCapaDataUrl(bookState.capa);
        return;
      }

      obterCapaDataUrl({ data: { url: bookState.capa } })
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
  }, [aberto, bookState.capa]);

  // Carrega o fundo via proxy seguro de servidor
  useEffect(() => {
    if (!aberto) return;

    let ativo = true;
    if (fundoUrl) {
      if (fundoUrl.startsWith("data:") || fundoUrl.startsWith("blob:")) {
        setFundoDataUrl(fundoUrl);
        return;
      }

      obterCapaDataUrl({ data: { url: fundoUrl } })
        .then((res) => {
          if (ativo && res?.dataUrl) {
            setFundoDataUrl(res.dataUrl);
          }
        })
        .catch(() => {});
    }

    return () => {
      ativo = false;
    };
  }, [aberto, fundoUrl]);

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
  }, [aberto]);

  function handleChangeConfig(novos: Partial<StoryPersonalizacao>) {
    setConfig((prev) => ({ ...prev, ...novos }));
  }

  const [compartilhando, setCompartilhando] = useState(false);

  async function handleCompartilharStory() {
    if (compartilhando || gerando) return;
    setCompartilhando(true);
    setMensagemErro(null);

    try {
      const alvoNode = exportPagina1Ref.current;
      if (!alvoNode) throw new Error("Elemento não encontrado para renderização");

      const { blob, nomeArquivo } = await exportarStoryPng(alvoNode, `${bookState.titulo}-story`);
      await compartilharOuBaixarStory(blob, `${bookState.titulo} (Story)`, nomeArquivo);
      notificar("Story compartilhado com sucesso!", "sucesso");
    } catch (e: any) {
      console.error("Erro ao compartilhar Story:", e);
      setMensagemErro("Não foi possível compartilhar a imagem. Tente novamente.");
      notificar("Erro ao compartilhar o Story", "erro");
    } finally {
      setCompartilhando(false);
    }
  }

  async function handleGerarStory() {
    if (gerando || compartilhando) return;
    setGerando(true);
    setMensagemErro(null);

    try {
      const alvoNode = exportPagina1Ref.current;
      if (!alvoNode) throw new Error("Elemento não encontrado para renderização");

      const { blob, nomeArquivo } = await exportarStoryPng(alvoNode, `${bookState.titulo}-story`);
      baixarBlob(blob, nomeArquivo);
      notificar("Story baixado com sucesso!", "sucesso");
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
        className="relative z-10 w-full max-w-[500px] max-h-[96vh] flex flex-col rounded-3xl border border-papel-3 bg-papel shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-papel-3 bg-papel-2/40">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amora/10 text-amora shrink-0">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </div>
            <div className="min-w-0">
              <h2 id="modal-story-title" className="font-display text-sm font-bold text-tinta truncate leading-tight">
                Criar Story
              </h2>
              <p className="text-[10px] text-tinta-2 truncate">
                1080 × 1920 px (9:16)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {typeof navigator !== "undefined" && navigator.share && (
              <button
                type="button"
                onClick={handleCompartilharStory}
                disabled={gerando || compartilhando}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-papel-3 hover:bg-papel-3 text-tinta text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                {compartilhando ? "Enviando..." : "Compartilhar"}
              </button>
            )}

            <button
              type="button"
              onClick={handleGerarStory}
              disabled={gerando || compartilhando}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amora text-papel hover:bg-amora/90 text-xs font-semibold shadow-xs disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              {gerando ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5 text-papel" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Gerando...</span>
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current" strokeWidth="2.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  <span>Baixar Story</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              disabled={gerando}
              aria-label="Fechar"
              className="flex h-8 w-8 items-center justify-center rounded-full text-tinta-2 hover:bg-papel-3 hover:text-tinta transition-colors cursor-pointer font-bold text-sm"
            >
              ✕
            </button>
          </div>
        </div>

        {/* CORPO - EXCLUSIVAMENTE VERTICAL */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col items-center justify-center bg-papel-2/20">
          <div
            ref={previewContainerRef}
            className="relative flex items-center justify-center overflow-hidden rounded-2xl shadow-2xl border border-white/10"
            style={{
              width: "100%",
              maxWidth: "420px",
              height: "746px",
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
                book={bookState}
                config={config}
                capaDataUrl={capaDataUrl}
                paginaAtiva={1}
                isEditable={true}
                onUpdateBook={(novos) => setBookState((prev) => ({ ...prev, ...novos }))}
                onUpdateConfig={handleChangeConfig}
                onCapaUpload={(dataUrl) => {
                  setCapaDataUrl(dataUrl);
                  setBookState((prev) => ({ ...prev, capa: dataUrl }));
                }}
                onClickCapa={() => setModalCapaAberto(true)}
                fundoDataUrl={fundoDataUrl}
                onClickFundo={() => setModalFundoAberto(true)}
              />
            </div>
          </div>

          {mensagemErro && (
            <p className="mt-4 text-xs text-red-500 font-medium text-center">{mensagemErro}</p>
          )}
        </div>
      </div>

      {/* NÓS OFF-SCREEN FIXOS EM 1080×1920 PARA EXPORTAÇÃO */}
      <div
        className="fixed top-0 left-0 pointer-events-none opacity-0 z-[-9999] overflow-hidden"
        style={{ width: "1080px", height: "1920px", transform: "translate(-9999px, -9999px)" }}
      >
        <StoryPagina1Resumo
          ref={exportPagina1Ref}
          book={bookState}
          config={config}
          capaDataUrl={capaDataUrl}
          fundoDataUrl={fundoDataUrl}
        />
      </div>

      {modalCapaAberto && (
        <ModalGerenciadorCapa
          aberto={modalCapaAberto}
          aoFechar={() => setModalCapaAberto(false)}
          aoAplicarCapa={(novaCapa) => {
            setCapaDataUrl(novaCapa || null);
            setBookState((prev) => ({ ...prev, capa: novaCapa || null }));
          }}
          capaAtual={bookState.capa ?? null}
          titulo={bookState.titulo || ""}
          autor={bookState.autor || ""}
          editora={bookState.editora || null}
        />
      )}

      {modalFundoAberto && (
        <ModalGerenciadorFundo
          aberto={modalFundoAberto}
          aoFechar={() => setModalFundoAberto(false)}
          aoAplicarFundo={(novoFundo) => {
            setFundoUrl(novoFundo);
          }}
          fundoAtual={fundoUrl}
        />
      )}
    </div>,
    document.body
  );
}

function ModalGerenciadorFundo({
  aberto,
  aoFechar,
  aoAplicarFundo,
  fundoAtual,
}: {
  aberto: boolean;
  aoFechar: () => void;
  aoAplicarFundo: (url: string) => void;
  fundoAtual: string;
}) {
  const [aba, setAba] = useState<"upload" | "url">("upload");
  const [urlInput, setUrlInput] = useState(fundoAtual.startsWith("data:") ? "" : fundoAtual);
  const [preview, setPreview] = useState<string | null>(fundoAtual);
  const [arrastando, setArrastando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  if (!aberto || typeof document === "undefined") return null;

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErro("Por favor, selecione um arquivo de imagem.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setPreview(reader.result);
        setErro(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const padraoUrl = "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&q=80&w=1080";

  return createPortal(
    <div className="modal-backdrop z-[120]" onClick={aoFechar}>
      <div
        className="relative w-full max-w-lg my-auto rounded-3xl border border-papel-3 bg-papel p-6 shadow-2xl surgir space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-papel-3/50 pb-4">
          <div>
            <h3 className="font-display text-xl font-semibold text-tinta">Alterar imagem de fundo</h3>
            <p className="text-xs text-tinta-2 mt-0.5">Selecione uma imagem de fundo para o seu Story</p>
          </div>
          <button
            type="button"
            onClick={aoFechar}
            className="rounded-full p-1.5 text-tinta-3 hover:bg-papel-2 hover:text-tinta transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Seleção de Aba */}
        <div className="flex rounded-xl bg-papel-2 p-1 text-sm font-medium">
          <button
            type="button"
            onClick={() => setAba("upload")}
            className={`flex-1 flex items-center justify-center rounded-lg py-2 transition-all cursor-pointer ${
              aba === "upload" ? "bg-papel text-amora shadow-xs font-semibold" : "text-tinta-3 hover:text-tinta"
            }`}
          >
            Carregar arquivo
          </button>
          <button
            type="button"
            onClick={() => setAba("url")}
            className={`flex-1 flex items-center justify-center rounded-lg py-2 transition-all cursor-pointer ${
              aba === "url" ? "bg-papel text-amora shadow-xs font-semibold" : "text-tinta-3 hover:text-tinta"
            }`}
          >
            Link (URL)
          </button>
        </div>

        {aba === "upload" ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setArrastando(true); }}
            onDragLeave={() => setArrastando(false)}
            onDrop={(e) => {
              e.preventDefault();
              setArrastando(false);
              if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
            }}
            className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-7 text-center transition-all cursor-pointer ${
              arrastando ? "border-amora bg-amora-clara/30 scale-[1.01]" : "border-papel-3 hover:border-amora/60 bg-papel-2/40"
            }`}
          >
            <input
              type="file"
              accept="image/*"
              className="hidden"
              id="bg-file-input"
              onChange={(e) => {
                if (e.target.files?.[0]) handleFile(e.target.files[0]);
              }}
            />
            <label htmlFor="bg-file-input" className="cursor-pointer flex flex-col items-center w-full">
              <div className="rounded-2xl bg-amora-clara/70 p-4 mb-3 text-amora shadow-xs">
                <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4m4-5l5-5 5 5m-5-5v12" />
                </svg>
              </div>
              <p className="font-semibold text-tinta text-sm">Arraste e solte o fundo aqui</p>
              <p className="text-xs text-tinta-2 mt-1">ou clique para escolher do seu dispositivo</p>
            </label>
          </div>
        ) : (
          <div className="space-y-3">
            <label className="block text-xs font-medium text-tinta-2">
              URL da imagem de fundo
              <input
                type="url"
                value={urlInput}
                onChange={(e) => {
                  setUrlInput(e.target.value);
                  setPreview(e.target.value || null);
                }}
                placeholder="https://exemplo.com/fundo.jpg"
                className="w-full mt-1.5 rounded-xl border border-papel-3 bg-papel px-3.5 py-2 text-sm text-tinta focus:border-amora focus:outline-none"
              />
            </label>
          </div>
        )}

        {erro && <p className="text-xs text-rose-500 font-medium">{erro}</p>}

        {preview && (
          <div className="flex items-center gap-4 rounded-2xl border border-papel-3 bg-papel-2 p-3">
            <div className="w-14 h-14 shrink-0 overflow-hidden rounded-lg shadow-md bg-papel-3">
              <img src={preview} alt="Prévia do fundo" className="h-full w-full object-cover" />
            </div>
            <div>
              <p className="text-xs font-semibold text-tinta">Prévia selecionada</p>
              <p className="text-[11px] text-tinta-2 mt-0.5">Imagem de fundo.</p>
            </div>
          </div>
        )}

        {/* Botões do Modal */}
        <div className="flex items-center justify-between border-t border-papel-3/50 pt-4">
          <button
            type="button"
            onClick={() => {
              aoAplicarFundo(padraoUrl);
              aoFechar();
            }}
            className="text-xs text-tinta-3 hover:text-amora transition-colors flex items-center gap-1 cursor-pointer font-medium"
          >
            Usar fundo padrão
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={aoFechar}
              className="rounded-xl px-4 py-2 text-sm font-medium text-tinta-2 hover:bg-papel-2 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => {
                if (preview) {
                  aoAplicarFundo(preview);
                  aoFechar();
                } else {
                  setErro("Nenhuma imagem selecionada.");
                }
              }}
              disabled={!preview}
              className="rounded-xl bg-amora px-5 py-2 text-sm font-medium text-papel hover:bg-amora-escura cursor-pointer transition-colors shadow-sm disabled:opacity-50"
            >
              Aplicar fundo
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
