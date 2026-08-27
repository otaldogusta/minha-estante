import { createFileRoute, Link, redirect, useRouter } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import { listarLivros, atualizarProgresso, excluirLivro, alterarStatusLivro } from "../lib/api/livros.functions";
import { matchSearch } from "../lib/utils";
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
import { ModoVisualizacaoSeletor, type ModoVisualizacao } from "../components/estante/modo-visualizacao-seletor";
import { EstanteRealista } from "../components/estante/estante-realista";
import { exigirLogin } from "../lib/exigir-login";
import { notificar } from "../lib/toast";

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

interface ModalConfirmacaoProps {
  aberto: boolean;
  titulo: string;
  descricao: string;
  nomeLivro: string;
  tipo: "excluir" | "pausar";
  textoConfirmar: string;
  carregando?: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
}

function ModalConfirmacaoAcao({
  aberto,
  titulo,
  descricao,
  nomeLivro,
  tipo,
  textoConfirmar,
  carregando,
  onConfirmar,
  onCancelar,
}: ModalConfirmacaoProps) {
  if (!aberto || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md rounded-2xl border border-papel-3 bg-papel p-6 sm:p-7 shadow-2xl animate-in zoom-in-95 duration-200 text-left"
      >
        <div className="flex items-start gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
              tipo === "excluir"
                ? "bg-red-500/10 text-red-600 dark:text-red-400"
                : "bg-amora-clara text-amora"
            }`}
          >
            {tipo === "excluir" ? (
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="font-display text-lg font-bold text-tinta">{titulo}</h3>
            <p className="mt-1.5 text-sm text-tinta-2 leading-relaxed">
              {descricao} <strong className="font-semibold text-tinta">“{nomeLivro}”</strong>?
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancelar}
            disabled={carregando}
            className="rounded-xl border border-papel-3 px-4 py-2.5 text-sm font-medium text-tinta-2 hover:bg-papel-2 hover:text-tinta transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            disabled={carregando}
            className={`rounded-xl px-5 py-2.5 text-sm font-medium text-papel transition-all cursor-pointer shadow-xs ${
              tipo === "excluir"
                ? "bg-red-600 hover:bg-red-700 active:scale-95"
                : "bg-amora hover:bg-amora-escura active:scale-95"
            }`}
          >
            {carregando ? "Aguarde..." : textoConfirmar}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function CartaoLendoAgora({ livros }: { livros: Livro[] }) {
  const router = useRouter();
  const [indexAtivo, setIndexAtivo] = useState(0);
  const [animState, setAnimState] = useState<"visible" | "exit-left" | "exit-right" | "enter-left" | "enter-right">("visible");
  const [direcao, setDirecao] = useState<"next" | "prev">("next");

  const totalLendo = livros.length;
  const seguroIndex = indexAtivo >= totalLendo ? 0 : indexAtivo;
  const livro = livros[seguroIndex];

  const [pagina, setPagina] = useState<string>(livro?.pagina_atual?.toString() ?? "");
  const [salvando, setSalvando] = useState(false);

  const [modalAcao, setModalAcao] = useState<"excluir" | "pausar" | null>(null);
  const [executandoAcao, setExecutandoAcao] = useState(false);

  async function pausarLeitura() {
    if (!livro) return;
    setExecutandoAcao(true);
    try {
      await alterarStatusLivro({ data: { id: livro.id, status: "quero_ler" } });
      notificar(`Leitura de "${livro.titulo}" pausada — movido para Quero Ler`, "info");
      setModalAcao(null);
      await router.invalidate();
    } catch {
      notificar("Erro ao pausar leitura", "erro");
    } finally {
      setExecutandoAcao(false);
    }
  }

  async function excluirLivroLendo() {
    if (!livro) return;
    setExecutandoAcao(true);
    try {
      await excluirLivro({ data: { id: livro.id } });
      notificar(`"${livro.titulo}" removido da sua estante`, "info");
      setModalAcao(null);
      await router.invalidate();
    } catch {
      notificar("Erro ao remover livro", "erro");
    } finally {
      setExecutandoAcao(false);
    }
  }

  useEffect(() => {
    if (livro) {
      setPagina(livro.pagina_atual?.toString() ?? "");
      setModalAcao(null);
    }
  }, [livro?.id, livro?.pagina_atual]);

  if (!livro) return null;

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

  function trocarCard(novoIndex: number, dir: "next" | "prev") {
    if (animState !== "visible") return;
    setDirecao(dir);
    // 1) dispara o exit na direção correta
    setAnimState(dir === "next" ? "exit-left" : "exit-right");
    setTimeout(() => {
      // 2) troca o conteúdo e posiciona o enter no lado oposto (fora da tela)
      setIndexAtivo(novoIndex);
      setAnimState(dir === "next" ? "enter-right" : "enter-left");
      // 3) no próximo frame, anima para visible
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAnimState("visible");
        });
      });
    }, 220);
  }

  function proximoLivro() {
    trocarCard((seguroIndex + 1) % totalLendo, "next");
  }

  function livroAnterior() {
    trocarCard((seguroIndex - 1 + totalLendo) % totalLendo, "prev");
  }

  function irPara(idx: number) {
    if (idx === seguroIndex) return;
    trocarCard(idx, idx > seguroIndex ? "next" : "prev");
  }

  // Livros adicionais para o efeito visual de cartas empilhadas atrás
  const proximoLivro1 = totalLendo > 1 ? livros[(seguroIndex + 1) % totalLendo] : null;
  const proximoLivro2 = totalLendo > 2 ? livros[(seguroIndex + 2) % totalLendo] : null;

  // Classes de animação para o conteúdo interno
  const contentAnimClass = {
    visible:      "opacity-100 translate-x-0  scale-100",
    "exit-left":  "opacity-0   -translate-x-6 scale-[0.97]",
    "exit-right": "opacity-0    translate-x-6 scale-[0.97]",
    "enter-left": "opacity-0   -translate-x-6 scale-[0.97]",
    "enter-right":"opacity-0    translate-x-6 scale-[0.97]",
  }[animState];

  return (
    <section className="surgir mx-auto mt-6 max-w-6xl px-4 sm:px-6">

      {/* Controles de navegação — sempre estáveis, fora da área animada */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amora-clara/60 px-3 py-1 text-xs font-semibold text-amora">
          <span className="h-2 w-2 rounded-full bg-amora animate-pulse" />
          Lendo agora
          {totalLendo > 1 && (
            <span className="ml-1.5 rounded-full bg-amora px-2 py-0.5 text-[10px] font-bold text-papel shadow-xs">
              +{totalLendo - 1}
            </span>
          )}
        </span>

        {totalLendo > 1 && (
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1 text-xs font-medium text-tinta-2 font-num">
              <span>{seguroIndex + 1}</span>
              <span className="text-tinta-3">/</span>
              <span>{totalLendo}</span>
            </div>
            <div className="flex items-center gap-1 rounded-full border border-papel-3 bg-papel/90 p-0.5 shadow-xs">
              <button
                onClick={livroAnterior}
                aria-label="Livro anterior"
                title="Livro anterior"
                className="flex h-7 w-7 items-center justify-center rounded-full text-tinta-2 transition-colors hover:bg-amora-clara/50 hover:text-amora active:scale-95 cursor-pointer"
              >
                ‹
              </button>

              <div className="flex items-center gap-1 px-1">
                {livros.map((l, idx) => (
                  <button
                    key={l.id}
                    onClick={() => irPara(idx)}
                    title={l.titulo}
                    aria-label={`Ir para ${l.titulo}`}
                    className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                      idx === seguroIndex
                        ? "w-5 bg-amora"
                        : "w-2 bg-tinta-3/40 hover:bg-tinta-3"
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={proximoLivro}
                aria-label="Próximo livro"
                title="Próximo livro"
                className="flex h-7 w-7 items-center justify-center rounded-full text-tinta-2 transition-colors hover:bg-amora-clara/50 hover:text-amora active:scale-95 cursor-pointer"
              >
                ›
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Conteúdo animado — sem card, sem borda, sem fundo */}
      <div
        className={`group transition-all duration-[240ms] ease-out will-change-transform ${contentAnimClass}`}
      >
        {/* Layout: pilha de capas à esquerda + info à direita */}
        <div className="flex items-start gap-5 sm:gap-8">

          {/* Stack 3D de Capas dos livros */}
          <div className="relative w-28 sm:w-40 md:w-44 shrink-0">
            {/* Capa 2 — atrás de tudo */}
            {proximoLivro2 && (
              <div className="absolute inset-0 translate-x-5 translate-y-1 rotate-6 scale-90 opacity-50 transition-transform duration-300 group-hover:rotate-8 group-hover:translate-x-6">
                <CapaLivro titulo={proximoLivro2.titulo} autor={proximoLivro2.autor} capa={proximoLivro2.capa} />
              </div>
            )}
            {/* Capa 1 — intermediária */}
            {proximoLivro1 && (
              <div className="absolute inset-0 translate-x-2.5 translate-y-0.5 rotate-3 scale-95 opacity-80 transition-transform duration-300 group-hover:rotate-5 group-hover:translate-x-4">
                <CapaLivro titulo={proximoLivro1.titulo} autor={proximoLivro1.autor} capa={proximoLivro1.capa} />
              </div>
            )}
            {/* Capa ativa — frente com Ações Rápidas no Hover */}
            <div className="group/capa-ativa relative z-10 block">
              <Link
                to="/livro/$livroId"
                params={{ livroId: String(livro.id) }}
                className="block spring-bounce"
              >
                <CapaLivro titulo={livro.titulo} autor={livro.autor} capa={livro.capa} />
              </Link>

              {/* Botões de Ação Rápida Flutuantes no Hover da Capa */}
              <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover/capa-ativa:opacity-100 transition-all duration-200 z-30">
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setModalAcao("pausar"); }}
                  disabled={executandoAcao}
                  title="Parar de ler (mover para Quero Ler)"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-black/80 backdrop-blur-md text-white border border-white/20 shadow-lg hover:bg-amora hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="6" y="4" width="4" height="16" />
                    <rect x="14" y="4" width="4" height="16" />
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setModalAcao("excluir"); }}
                  disabled={executandoAcao}
                  title="Excluir livro da estante"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-black/80 backdrop-blur-md text-white border border-white/20 shadow-lg hover:bg-red-600 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Info do livro */}
          <div className="min-w-0 flex-1 pt-1">
            <h1
              title={livro.titulo}
              className="font-display text-xl sm:text-2xl md:text-3xl font-semibold leading-snug tracking-tight text-tinta line-clamp-2"
            >
              {livro.titulo}
            </h1>
            <p title={livro.autor} className="mt-1 text-xs sm:text-sm font-medium text-tinta-2 truncate">
              {livro.autor}
            </p>

            {/* Badges */}
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              {livro.genero && (
                <span className="rounded-md border border-papel-3 bg-papel px-2 py-0.5 text-[11px] font-medium text-tinta-2">
                  {livro.genero}
                </span>
              )}
              {livro.formato && (
                <span className="rounded-md border border-papel-3 bg-papel px-2 py-0.5 text-[11px] font-medium text-tinta-2">
                  {livro.formato}
                </span>
              )}
            </div>

            {/* Meta info */}
            <div className="mt-3.5 space-y-0.5 text-xs text-tinta-2 font-num">
              {livro.inicio && (
                <div className="flex items-center gap-1.5">
                  <span className="text-tinta-3">Início:</span>
                  <span>{dataCurta(livro.inicio)}</span>
                  {diasLendo !== null && (
                    <span className="text-tinta-3">
                      ({diasLendo === 0 ? "hoje" : `${diasLendo} ${diasLendo === 1 ? "dia" : "dias"}`})
                    </span>
                  )}
                </div>
              )}
              {livro.paginas && (
                <div className="flex items-center gap-1.5">
                  <span className="text-tinta-3">Tamanho:</span>
                  <span>{livro.paginas} páginas</span>
                </div>
              )}
            </div>

            {/* Barra de progresso */}
            <div className="mt-5">
              <div className="flex items-center justify-between text-xs font-semibold text-tinta-2 mb-1.5 font-num">
                <span>{progresso}% concluído</span>
                {livro.paginas && (
                  <span>{livro.pagina_atual || 0} / {livro.paginas} págs</span>
                )}
              </div>
              
              <div className="fita-progresso">
                <span style={{ width: `${progresso}%` }} />
              </div>
              
              <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-papel-3/20 pt-3">
                {/* Lado Esquerdo: Atualizar Progresso */}
                <div className="flex items-center gap-2 text-xs text-tinta-2">
                  <span>Atualizar pág:</span>
                  <input
                    inputMode="numeric"
                    value={pagina}
                    onChange={(e) => setPagina(e.target.value.replace(/\D/g, ""))}
                    onKeyDown={(e) => e.key === "Enter" && salvarPagina()}
                    className="w-12 rounded-lg border border-papel-3 bg-papel px-2 py-1 text-center font-num text-xs text-tinta focus:border-amora focus:outline-none"
                    placeholder="0"
                    aria-label="Página atual"
                  />
                  {pagina !== (livro.pagina_atual?.toString() ?? "") && (
                    <button
                      onClick={salvarPagina}
                      disabled={salvando}
                      className="rounded-lg bg-amora px-2.5 py-1 text-[11px] font-semibold text-papel hover:bg-amora-escura transition-all cursor-pointer shadow-xs"
                    >
                      {salvando ? "..." : "Salvar"}
                    </button>
                  )}
                </div>

                {/* Lado Direito: Ações e Conclusão */}
                <div className="flex items-center gap-3.5 text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => setModalAcao("pausar")}
                    disabled={executandoAcao}
                    className="text-tinta-3 hover:text-amora transition-colors cursor-pointer"
                    title="Pausar leitura e mover para Quero Ler"
                  >
                    Pausar
                  </button>
                  <span className="text-tinta-3/30">|</span>
                  <button
                    type="button"
                    onClick={() => setModalAcao("excluir")}
                    disabled={executandoAcao}
                    className="text-tinta-3 hover:text-red-500 transition-colors cursor-pointer"
                    title="Excluir livro da estante"
                  >
                    Excluir
                  </button>
                  <span className="text-tinta-3/30">|</span>

                  <Link
                    to="/livro/$livroId"
                    params={{ livroId: String(livro.id) }}
                    search={{ concluir: true }}
                    className="font-semibold text-amora hover:text-amora-escura transition-colors"
                  >
                    Concluir →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Confirmação Oficial do App */}
      <ModalConfirmacaoAcao
        aberto={modalAcao !== null}
        tipo={modalAcao || "excluir"}
        titulo={modalAcao === "excluir" ? "Remover da Estante" : "Pausar Leitura"}
        descricao={
          modalAcao === "excluir"
            ? "Tem certeza que deseja remover da sua estante o livro"
            : "Deseja parar de ler agora e mover para a sua lista de Quero Ler o livro"
        }
        nomeLivro={livro.titulo}
        textoConfirmar={modalAcao === "excluir" ? "Sim, remover da estante" : "Pausar leitura"}
        carregando={executandoAcao}
        onConfirmar={modalAcao === "excluir" ? excluirLivroLendo : pausarLeitura}
        onCancelar={() => setModalAcao(null)}
      />
    </section>
  );
}

function ModalPlanejamentoMes({
  mesIndex,
  nomeMes,
  livros,
  planejados,
  onAlternarPlanejado,
  onClose,
}: {
  mesIndex: number;
  nomeMes: string;
  livros: Livro[];
  planejados: Record<number, number[]>;
  onAlternarPlanejado: (livroId: number, mesIdx: number) => void;
  onClose: () => void;
}) {
  const [selecionandoLivro, setSelecionandoLivro] = useState(false);
  const anoAtual = new Date().getFullYear();

  // Livros concluídos/iniciados neste mês no banco
  const livrosDoMes = useMemo(() => {
    return livros.filter((l) => {
      if (l.status === "lido" && l.ano_leitura === anoAtual) {
        if (l.fim) return parseInt(l.fim.slice(5, 7), 10) - 1 === mesIndex;
        if (l.inicio) return parseInt(l.inicio.slice(5, 7), 10) - 1 === mesIndex;
      }
      if (l.status === "lendo" && l.inicio) {
        return parseInt(l.inicio.slice(5, 7), 10) - 1 === mesIndex;
      }
      return false;
    });
  }, [livros, mesIndex, anoAtual]);

  // Livros marcados manualmente para o planejamento deste mês
  const idsPlanejadosDoMes = planejados[mesIndex] || [];
  const livrosPlanejados = useMemo(() => {
    return livros.filter((l) => idsPlanejadosDoMes.includes(l.id));
  }, [livros, idsPlanejadosDoMes]);

  // Livros disponíveis para adicionar ao mês
  const livrosDisponiveis = useMemo(() => {
    return livros.filter(
      (l) => !idsPlanejadosDoMes.includes(l.id) && !livrosDoMes.some((lm) => lm.id === l.id)
    );
  }, [livros, idsPlanejadosDoMes, livrosDoMes]);

  // Bloqueio do scroll da página de trás & suporte à tecla ESC
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 surgir cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-papel-3/80 bg-papel-2/95 backdrop-blur-2xl p-5 sm:p-6 shadow-2xl texture-papel cursor-default"
      >
        {/* Ambient Glow Top */}
        <div className="pointer-events-none absolute -inset-x-20 -top-20 h-40 bg-gradient-to-r from-amora/15 via-emerald-500/10 to-amora/15 blur-3xl" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 dark:via-white/10 to-transparent" />

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between border-b border-papel-3/60 pb-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-amora">Meta {anoAtual}</span>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-tinta">
              Planejamento de {nomeMes}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-tinta-2 hover:bg-papel-3 hover:text-tinta transition-colors cursor-pointer"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="relative z-10 mt-4 max-h-[60vh] overflow-y-auto pr-1 space-y-6">
          {/* Seção 1: Livros lidos/em leitura no mês */}
          <div>
            <h3 className="text-xs font-semibold text-tinta-2 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              Leituras do Mês ({livrosDoMes.length})
            </h3>
            {livrosDoMes.length === 0 ? (
              <p className="text-xs text-tinta-3 italic bg-papel-3/30 rounded-xl p-3 text-center border border-papel-3/40">
                Nenhum livro concluído ou iniciado neste mês ainda.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {livrosDoMes.map((l) => (
                  <Link
                    key={l.id}
                    to="/livro/$livroId"
                    params={{ livroId: String(l.id) }}
                    className="flex items-center gap-3 rounded-2xl border border-papel-3/60 bg-papel/80 p-3 hover:border-amora/40 transition-all group"
                  >
                    <div className="w-10 h-14 shrink-0 overflow-hidden rounded-lg shadow-xs">
                      <CapaLivro titulo={l.titulo} autor={l.autor} capa={l.capa} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-xs text-tinta truncate group-hover:text-amora">{l.titulo}</p>
                      <p className="text-[11px] text-tinta-3 truncate">{l.autor}</p>
                      <span className="inline-block mt-1 text-[10px] font-semibold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        {l.status === "lido" ? "✓ Concluído" : "Lendo agora"}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Seção 2: Livros Planejados para o Mês */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-tinta-2 uppercase tracking-wide flex items-center gap-1.5">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-amora" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                </svg>
                Planejados para {nomeMes} ({livrosPlanejados.length})
              </h3>
              <button
                type="button"
                onClick={() => setSelecionandoLivro(!selecionandoLivro)}
                className="text-xs font-medium text-amora hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>+ Planejar Livro</span>
              </button>
            </div>

            {/* Menu de Seleção de Livro para Planejar */}
            {selecionandoLivro && (
              <div className="mb-3 p-3 rounded-2xl border border-amora/30 bg-amora/5 space-y-2 surgir">
                <p className="text-xs font-medium text-tinta">Selecione um livro da sua estante para ler em {nomeMes}:</p>
                {livrosDisponiveis.length === 0 ? (
                  <p className="text-xs text-tinta-3 italic">Todos os seus livros já estão alocados!</p>
                ) : (
                  <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                    {livrosDisponiveis.map((ld) => (
                      <button
                        key={ld.id}
                        type="button"
                        onClick={() => {
                          onAlternarPlanejado(ld.id, mesIndex);
                          setSelecionandoLivro(false);
                        }}
                        className="w-full text-left flex items-center justify-between p-2 rounded-xl hover:bg-papel-2 transition-colors cursor-pointer text-xs"
                      >
                        <span className="font-medium text-tinta truncate">{ld.titulo} <span className="text-tinta-3 text-[11px]">({ld.autor})</span></span>
                        <span className="text-amora text-xs font-semibold hover:underline">+ Adicionar</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {livrosPlanejados.length === 0 ? (
              <p className="text-xs text-tinta-3 italic bg-papel-3/30 rounded-xl p-3 text-center border border-papel-3/40">
                Nenhum livro planejado para {nomeMes} ainda. Clique no botão acima para escolher o que você quer ler neste mês!
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {livrosPlanejados.map((lp) => (
                  <div
                    key={lp.id}
                    className="flex items-center gap-3 rounded-2xl border border-papel-3/60 bg-papel/80 p-3 relative group"
                  >
                    <div className="w-10 h-14 shrink-0 overflow-hidden rounded-lg shadow-xs">
                      <CapaLivro titulo={lp.titulo} autor={lp.autor} capa={lp.capa} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-xs text-tinta truncate">{lp.titulo}</p>
                      <p className="text-[11px] text-tinta-3 truncate">{lp.autor}</p>
                      <span className="inline-block mt-1 text-[10px] font-semibold text-amora bg-amora/10 px-2 py-0.5 rounded-full">
                        Planejado para {nomeMes}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onAlternarPlanejado(lp.id, mesIndex)}
                      className="p-1.5 text-tinta-3 hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer"
                      title="Remover do planejamento deste mês"
                    >
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 mt-6 pt-4 border-t border-papel-3/60 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-amora px-4 py-2 text-xs font-semibold text-papel hover:bg-amora-escura transition-all cursor-pointer shadow-xs"
          >
            Concluído
          </button>
        </div>
      </div>
    </div>
  );
}

function MetaLeituraMinimalista({
  livros,
  lidosAno,
  metaInicial = 12,
}: {
  livros: Livro[];
  lidosAno: number;
  metaInicial?: number;
}) {
  const [meta, setMeta] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const salvacao = localStorage.getItem("minha-estante-meta-ano");
      if (salvacao) return parseInt(salvacao, 10) || metaInicial;
    }
    return metaInicial;
  });
  const [editando, setEditando] = useState(false);
  const [tempMeta, setTempMeta] = useState(String(meta));
  const [mostrarPopover, setMostrarPopover] = useState(false);
  const [mesSelecionadoModal, setMesSelecionadoModal] = useState<number | null>(null);

  // Planejamento dos meses salvo no localStorage
  const [planejados, setPlanejados] = useState<Record<number, number[]>>(() => {
    if (typeof window !== "undefined") {
      const salvacao = localStorage.getItem("minha-estante-planejamento-2026");
      if (salvacao) {
        try {
          return JSON.parse(salvacao);
        } catch {}
      }
    }
    return {};
  });

  function alternarLivroPlanejado(livroId: number, mesIdx: number) {
    setPlanejados((prev) => {
      const listaAtual = prev[mesIdx] || [];
      const jaExiste = listaAtual.includes(livroId);
      const novaLista = jaExiste ? listaAtual.filter((id) => id !== livroId) : [...listaAtual, livroId];
      const proximo = { ...prev, [mesIdx]: novaLista };
      if (typeof window !== "undefined") {
        localStorage.setItem("minha-estante-planejamento-2026", JSON.stringify(proximo));
      }
      notificar(jaExiste ? "Livro removido do mês!" : "Livro planejado para o mês!");
      return proximo;
    });
  }

  function salvarMeta() {
    const n = parseInt(tempMeta.trim(), 10);
    if (!isNaN(n) && n > 0 && n <= 500) {
      setMeta(n);
      if (typeof window !== "undefined") {
        localStorage.setItem("minha-estante-meta-ano", String(n));
      }
      notificar(`Meta atualizada para ${n} livros!`);
    }
    setEditando(false);
  }

  const mesAtual = new Date().getMonth() + 1; // 1 to 12
  const fracaoAno = mesAtual / 12;
  const metaEsperada = Math.round(meta * fracaoAno);
  const diferenca = lidosAno - metaEsperada;

  // Projeção estimada para 31 de dezembro
  const ritmoMensal = mesAtual > 0 ? lidosAno / mesAtual : 0;
  const projecaoFinalAno = Math.round(ritmoMensal * 12);

  // Cálculo da trilha de 12 meses (Bklit Sparkdots)
  const NOMES_MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const livrosPorMes = useMemo(() => {
    const contagem = Array(12).fill(0);
    const anoAtual = new Date().getFullYear();
    for (const l of livros) {
      if (l.status === "lido" && l.ano_leitura === anoAtual) {
        if (l.fim) {
          const m = parseInt(l.fim.slice(5, 7), 10) - 1;
          if (m >= 0 && m < 12) contagem[m]++;
        } else if (l.inicio) {
          const m = parseInt(l.inicio.slice(5, 7), 10) - 1;
          if (m >= 0 && m < 12) contagem[m]++;
        }
      }
    }
    return contagem;
  }, [livros]);

  let badgeRitmo = {
    texto: "No ritmo",
    classe: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    icone: (
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
  };

  if (diferenca > 0) {
    badgeRitmo = {
      texto: `+${diferenca} à frente`,
      classe: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
      icone: (
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-emerald-500 fill-emerald-500/20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
        </svg>
      ),
    };
  } else if (diferenca < 0) {
    badgeRitmo = {
      texto: `${diferenca} p/ meta`,
      classe: "bg-amber-500/15 text-amber-600 border-amber-500/30",
      icone: (
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-amber-500" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
        </svg>
      ),
    };
  }

  const percentual = Math.min(100, Math.round((lidosAno / meta) * 100));

  return (
    <>
      <div className="group relative mb-6 rounded-2xl border border-papel-3/80 bg-papel-2/60 backdrop-blur-xl p-4 sm:p-5 transition-all duration-300 hover:border-amora/50 hover:shadow-[0_8px_30px_rgb(122,59,82,0.12)] z-10 overflow-visible">
        {/* KokonutUI Liquid Glass Specular & Ambient Glow (Clips inner glow while keeping card overflow-visible) */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
          <div className="pointer-events-none absolute -inset-x-20 -top-20 h-40 bg-gradient-to-r from-amora/10 via-emerald-500/5 to-amora/10 blur-2xl transition-opacity opacity-50 group-hover:opacity-100" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent" />
        </div>

        <div className="relative z-10 flex items-center justify-between gap-3">
          <span className="font-display text-sm font-semibold text-tinta">Meta {new Date().getFullYear()}</span>

          {/* Edição Inline de Livros Lidos / Meta (Sem botão extra) */}
          {editando ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                salvarMeta();
              }}
              className="flex items-center gap-1.5"
            >
              <span className="text-xs text-tinta-2 font-medium">{lidosAno} de</span>
              <input
                type="number"
                min="1"
                max="500"
                value={tempMeta}
                onChange={(e) => setTempMeta(e.target.value)}
                className="w-14 rounded-lg border border-amora bg-papel px-2 py-0.5 text-center font-num text-xs font-semibold text-tinta focus:outline-none shadow-inner"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    salvarMeta();
                  }
                  if (e.key === "Escape") setEditando(false);
                }}
              />
              <span className="text-xs text-tinta-2 font-medium">livros</span>
              <button
                type="submit"
                onClick={(e) => {
                  e.preventDefault();
                  salvarMeta();
                }}
                className="rounded-lg bg-amora px-3 py-1 text-xs text-papel font-semibold hover:bg-amora-escura active:scale-95 transition-all cursor-pointer shadow-xs"
              >
                OK
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => {
                setTempMeta(String(meta));
                setEditando(true);
              }}
              className="group/btn flex items-center gap-1 text-xs text-tinta-2 hover:text-amora transition-colors cursor-pointer"
              title="Clique para editar sua meta do ano"
            >
              <span className="font-num font-semibold text-tinta group-hover/btn:text-amora">{lidosAno}</span>
              <span>de</span>
              <span className="font-num text-tinta group-hover/btn:text-amora font-semibold underline decoration-dashed underline-offset-2">{meta} livros</span>
            </button>
          )}
        </div>

        {/* Magic UI Animated Beam Progress Bar com Popover ao Passar o Mouse na frente de tudo */}
        <div className="relative mt-3.5 z-30">
          <div
            onMouseEnter={() => setMostrarPopover(true)}
            onMouseLeave={() => setMostrarPopover(false)}
            onClick={() => setMostrarPopover(!mostrarPopover)}
            className="group/bar relative h-2.5 w-full rounded-full bg-papel-3/80 overflow-hidden shadow-inner cursor-pointer"
          >
            {/* Barra de Progresso Real */}
            <div
              className="relative h-full rounded-full bg-gradient-to-r from-amora via-amora-escura to-amora transition-all duration-500 ease-out overflow-hidden"
              style={{ width: `${percentual}%` }}
            >
              {/* Light Beam Sweep */}
              <div
                className="absolute inset-0 w-full bg-gradient-to-r from-transparent via-white/50 to-transparent"
                style={{
                  animation: "shimmer 2.5s infinite linear",
                }}
              />
            </div>

            {/* Marcador Visual de Ritmo Esperado (Ponteiro do Mês Atual) */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-tinta/70 z-20 shadow-[0_0_6px_rgba(255,255,255,0.8)]"
              style={{ left: `${Math.min(100, Math.round(fracaoAno * 100))}%` }}
            />
          </div>

          {/* KokonutUI Glass Floating Tooltip ao passar o mouse na barra (Posicionado no topo, na frente de tudo) */}
          {mostrarPopover && (
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2.5 z-50 w-64 rounded-2xl border border-papel-3 bg-papel/95 backdrop-blur-2xl p-3.5 shadow-2xl surgir text-xs text-tinta space-y-1.5 pointer-events-none drop-shadow-2xl">
              <div className="flex items-center justify-between font-semibold border-b border-papel-3/60 pb-1.5">
                <span>Progresso Anual</span>
                <span className="text-amora font-num font-bold">{percentual}% ({lidosAno}/{meta})</span>
              </div>
              <div className="text-[11px] text-tinta-2 space-y-1">
                <p className="flex justify-between">
                  <span>Ritmo esperado para hoje:</span>
                  <strong className="text-tinta font-num">{Math.round(fracaoAno * 100)}% ({metaEsperada} livros)</strong>
                </p>
                <p className="flex justify-between border-t border-papel-3/40 pt-1">
                  <span>Projeção até 31/12:</span>
                  <strong className="text-amora font-num">~{projecaoFinalAno} livros</strong>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Trilha Minimalista de 12 Meses (Bklit Sparkdots sem números, z-40 para flutuar sobre a barra de progresso) */}
        <div className="relative mt-4 flex items-center justify-between pt-2 border-t border-papel-3/40 z-40">
          {NOMES_MESES.map((nomeMes, idx) => {
            const mesIndex = idx + 1;
            const ehMesAtual = mesIndex === mesAtual;
            const totalNoMes = livrosPorMes[idx];
            const totalPlanejados = (planejados[idx] || []).length;
            const temLeitura = totalNoMes > 0 || totalPlanejados > 0;

            return (
              <button
                key={nomeMes}
                type="button"
                onClick={() => setMesSelecionadoModal(idx)}
                className="group/dot relative flex flex-col items-center cursor-pointer hover:scale-110 hover:z-50 transition-transform"
                title={`Clique para abrir o planejamento de ${nomeMes}`}
              >
                <span
                  className={`relative h-2.5 w-2.5 rounded-full transition-all duration-300 ${
                    temLeitura
                      ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] scale-110"
                      : ehMesAtual
                      ? "bg-amora ring-2 ring-amora/40 animate-pulse"
                      : "bg-papel-3/60 group-hover/dot:bg-tinta-3"
                  }`}
                />
                <span
                  className={`mt-1 text-[9px] font-num transition-colors ${
                    ehMesAtual ? "font-bold text-amora" : temLeitura ? "text-tinta font-medium" : "text-tinta-3/70"
                  }`}
                >
                  {nomeMes}
                </span>

                {/* Tooltip Flutuante estilo Bklit em frente de tudo (z-50) */}
                <div className="absolute bottom-full mb-1.5 hidden group-hover/dot:flex flex-col items-center z-50 whitespace-nowrap pointer-events-none surgir drop-shadow-xl">
                  <div className="rounded-lg border border-papel-3 bg-papel/95 backdrop-blur-xl px-2.5 py-1 text-[10px] font-medium text-tinta shadow-xl">
                    <span>{nomeMes}</span>
                    <span className="text-tinta-3 ml-1">
                      • {totalNoMes} lidos {totalPlanejados > 0 ? `, ${totalPlanejados} planejados` : ""}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Modal de Detalhes e Planejamento do Mês Escolhido via Portal */}
      {mesSelecionadoModal !== null &&
        typeof document !== "undefined" &&
        createPortal(
          <ModalPlanejamentoMes
            mesIndex={mesSelecionadoModal}
            nomeMes={NOMES_MESES[mesSelecionadoModal]}
            livros={livros}
            planejados={planejados}
            onAlternarPlanejado={alternarLivroPlanejado}
            onClose={() => setMesSelecionadoModal(null)}
          />,
          document.body
        )}
    </>
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
      <MetaLeituraMinimalista livros={livros} lidosAno={est.livros} />
      <div className="grid grid-cols-2 gap-x-2 gap-y-6 border-y border-papel-3 py-6 sm:grid-cols-4">
        {itens.map((i) => (
          <div key={i.rotulo} className="text-center px-1 min-w-0">
            <p className="font-num text-xl sm:text-2xl md:text-3xl text-tinta truncate">{i.valor}</p>
            <p className="mt-1 text-xs sm:text-sm text-tinta-2">{i.rotulo}</p>
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
  const router = useRouter();
  const dias = diasDeLeitura(livro);
  const [modalAcao, setModalAcao] = useState<"excluir" | "pausar" | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function handleExcluir() {
    setCarregando(true);
    try {
      await excluirLivro({ data: { id: livro.id } });
      notificar(`"${livro.titulo}" removido da sua estante`, "info");
      setModalAcao(null);
      await router.invalidate();
    } catch {
      notificar("Erro ao remover livro", "erro");
    } finally {
      setCarregando(false);
    }
  }

  async function handlePausar() {
    setCarregando(true);
    try {
      await alterarStatusLivro({ data: { id: livro.id, status: "quero_ler" } });
      notificar(`Leitura de "${livro.titulo}" pausada`, "info");
      setModalAcao(null);
      await router.invalidate();
    } catch {
      notificar("Erro ao pausar leitura", "erro");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <>
      <div className="livro-hover group relative block w-32 shrink-0 snap-start sm:w-36">
        <Link
          to="/livro/$livroId"
          params={{ livroId: String(livro.id) }}
          className="block"
        >
          <div className="relative">
            <CapaLivro titulo={livro.titulo} autor={livro.autor} capa={livro.capa} />

            {/* Botões de Ação Rápida no Hover da Capa */}
            <div className="absolute top-1.5 right-1.5 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-30">
              {livro.status === "lendo" && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setModalAcao("pausar");
                  }}
                  disabled={carregando}
                  title="Parar de ler (mover para Quero Ler)"
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-black/80 backdrop-blur-md text-white border border-white/20 shadow-md hover:bg-amora hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="6" y="4" width="4" height="16" />
                    <rect x="14" y="4" width="4" height="16" />
                  </svg>
                </button>
              )}

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setModalAcao("excluir");
                }}
                disabled={carregando}
                title="Excluir livro da estante"
                className="flex h-7 w-7 items-center justify-center rounded-full bg-black/80 backdrop-blur-md text-white border border-white/20 shadow-md hover:bg-red-600 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            </div>
          </div>

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
      </div>

      {/* Modal de Confirmação Oficial do App */}
      <ModalConfirmacaoAcao
        aberto={modalAcao !== null}
        tipo={modalAcao || "excluir"}
        titulo={modalAcao === "excluir" ? "Remover da Estante" : "Pausar Leitura"}
        descricao={
          modalAcao === "excluir"
            ? "Tem certeza que deseja remover da sua estante o livro"
            : "Deseja parar de ler agora e mover para a sua lista de Quero Ler o livro"
        }
        nomeLivro={livro.titulo}
        textoConfirmar={modalAcao === "excluir" ? "Sim, remover da estante" : "Pausar leitura"}
        carregando={carregando}
        onConfirmar={modalAcao === "excluir" ? handleExcluir : handlePausar}
        onCancelar={() => setModalAcao(null)}
      />
    </>
  );
}

function PaginaEstante() {
  const livros = Route.useLoaderData();
  const [busca, setBusca] = useState("");
  const [genero, setGenero] = useState<string | null>(null);
  const [limiteExibicao, setLimiteExibicao] = useState(24);
  const [modoView, setModoView] = useState<ModoVisualizacao>(() => {
    if (typeof window !== "undefined") {
      const salvo = localStorage.getItem("minha-estante-modo-view");
      if (salvo === "estante" || salvo === "lista" || salvo === "capas") return salvo;
    }
    return "estante"; // Padrão realista
  });

  const alterarModoView = (novoModo: ModoVisualizacao) => {
    setModoView(novoModo);
    if (typeof window !== "undefined") {
      localStorage.setItem("minha-estante-modo-view", novoModo);
    }
  };

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
    return livros.filter((l) => {
      if (l.status !== "lido" && l.status !== "abandonado") return false;
      if (genero && l.genero !== genero) return false;
      if (busca && !matchSearch(busca, l.titulo, l.autor)) return false;
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
        <CartaoLendoAgora livros={lendo} />
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
          <div className="flex items-center gap-3">
            <h2 className="font-display text-2xl font-semibold tracking-tight text-tinta">Sua estante</h2>
            <ModoVisualizacaoSeletor modo={modoView} onChange={alterarModoView} />
          </div>

          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar título ou autor"
            aria-label="Buscar na estante"
            className="w-full max-w-xs rounded-full border border-papel-3 bg-papel-2/70 px-4 py-2 text-sm text-tinta placeholder:text-tinta-3 focus:border-amora focus:bg-papel focus:outline-none transition-colors"
          />
        </div>

        {generos.length > 1 && (
          <div className="mt-4 flex flex-nowrap items-center gap-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-1 px-0.5">
            <button
              onClick={() => setGenero(null)}
              className={`flex-shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                genero === null ? "bg-tinta text-papel shadow-xs" : "bg-papel-2/80 text-tinta-2 hover:bg-papel-3/70 hover:text-tinta border border-papel-3/40"
              }`}
            >
              Todos
            </button>
            {generos.map((g) => (
              <button
                key={g}
                onClick={() => setGenero(genero === g ? null : g)}
                className={`flex-shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  genero === g ? "bg-amora text-papel shadow-xs" : "bg-papel-2/80 text-tinta-2 hover:bg-papel-3/70 hover:text-tinta border border-papel-3/40"
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

        {/* MODO ESTANTE REALISTA (Ilustrada 3D) */}
        {modoView === "estante" && (
          <EstanteRealista livros={filtrados} />
        )}

        {/* MODO CAPAS (Grade de Capas Padrão) */}
        {modoView === "capas" &&
          porAnoLimitado.map(([ano, doAno, totalDoAno]) => (
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

        {/* MODO LISTA COMPACTA */}
        {modoView === "lista" && (
          <div className="mt-8 divide-y divide-papel-3/60 border-t border-b border-papel-3/60">
            {filtrados.map((l) => (
              <Link
                key={l.id}
                to="/livro/$livroId"
                params={{ livroId: String(l.id) }}
                className="flex items-center justify-between py-3 px-2 hover:bg-papel-2/60 transition-colors rounded-lg group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {l.capa ? (
                    <img src={l.capa} alt={l.titulo} className="w-9 h-12 object-cover rounded-sm border border-papel-3" />
                  ) : (
                    <div className="w-9 h-12 rounded-sm bg-papel-3/60 flex items-center justify-center text-[9px] text-tinta-3">Livro</div>
                  )}
                  <div className="min-w-0">
                    <h4 className="font-semibold text-sm text-tinta group-hover:text-amora transition-colors truncate">{l.titulo}</h4>
                    <p className="text-xs text-tinta-2 truncate">{l.autor || "Autor não informado"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs font-num text-tinta-2">
                  <span>{l.ano_leitura || "-"}</span>
                  <span className="text-amber-400 font-bold">{l.nota ? `★ ${l.nota}` : "-"}</span>
                </div>
              </Link>
            ))}
          </div>
        )}

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
