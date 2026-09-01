import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import type { SalaLeituraDetalhes } from "../../lib/api/sala-leitura.functions";
import { AvatarLeitor } from "./avatar";
import { ModalConvidarSala } from "./modal-convidar-sala";
import { notificar } from "../../lib/toast";

const REACOES_DISPONIVEIS = [
  { emoji: "❤️", label: "Amei" },
  { emoji: "😱", label: "Chocada" },
  { emoji: "😭", label: "Emocionante" },
  { emoji: "🔥", label: "Incrível" },
  { emoji: "💡", label: "Reflexão" },
  { emoji: "☕", label: "Pausa" },
];

export function SalaLeituraBar({
  sala,
  paginaAtual,
  onReagir,
  onSair,
  onEncerrar,
  souHost,
}: {
  sala: SalaLeituraDetalhes;
  paginaAtual: number;
  onReagir: (emoji: string) => void;
  onSair: () => void;
  onEncerrar: () => void;
  souHost: boolean;
}) {
  const [menuReacoesAberto, setMenuReacoesAberto] = useState(false);
  const [confirmarSaida, setConfirmarSaida] = useState(false);
  const [modalConviteAberto, setModalConviteAberto] = useState(false);
  const reacoesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuReacoesAberto) return;
    function handleClickOutside(e: MouseEvent) {
      if (reacoesRef.current && !reacoesRef.current.contains(e.target as Node)) {
        setMenuReacoesAberto(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuReacoesAberto]);

  const numProntos = sala.participantes.filter((p) => p.paginaPronta >= paginaAtual).length;
  const total = Math.max(1, sala.participantes.length);
  const todosProntos = numProntos >= total;

  async function handleCopiarConvite() {
    try {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      notificar("Link da sala de leitura copiado! Envie para outros leitores entrarem.", "sucesso");
    } catch {
      notificar("Não foi possível copiar o link automaticamente.", "erro");
    }
  }

  return (
    <>
      <div className="relative z-40 w-full bg-papel-2/95 border-b border-papel-3/90 backdrop-blur-md px-3 sm:px-6 py-2.5 transition-all shadow-xs">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
        {/* Esquerda: Identificação da Sala & Host */}
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amora-clara text-amora text-base shadow-xs shrink-0 select-none">
            🛋️
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-display text-xs sm:text-sm font-semibold text-tinta truncate">
                Leitura Coletiva
              </span>
              <span className="rounded-full bg-amora/15 border border-amora/30 px-2 py-0.2 text-[10px] font-medium text-amora">
                {souHost ? "Você é o Host" : `Host: ${sala.hostNome}`}
              </span>
            </div>
            <p className="text-[11px] text-tinta-3 truncate">
              {todosProntos ? (
                <span className="text-emerald-500 font-medium dark:text-emerald-400">
                  ✓ Todos prontos para a próxima página!
                </span>
              ) : (
                <span>
                  {numProntos} de {total} leitores prontos na pág. {paginaAtual}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Centro: Avatares com Indicadores de Prontidão + Botão de Convidar */}
        <div className="flex items-center gap-2 overflow-visible py-1.5 shrink-0">
          {sala.participantes.map((p) => {
            const estaPronto = p.paginaPronta >= paginaAtual;
            const isHost = p.usuarioId === sala.hostUsuarioId;

            return (
              <div
                key={p.usuarioId}
                className="relative shrink-0 flex items-center justify-center pt-2 px-0.5"
                title={`${p.nome} (${isHost ? "Host · " : ""}${estaPronto ? "Pronto ✓" : "Lendo..."})`}
              >
                {isHost && (
                  <span
                    className="absolute -top-1 left-1/2 -translate-x-1/2 text-[10px] leading-none select-none pointer-events-none filter drop-shadow-xs"
                    title="Host da sala"
                  >
                    👑
                  </span>
                )}
                
                <AvatarLeitor
                  nome={p.nome}
                  status={p.estaConectado ? (estaPronto ? "online" : "lendo") : "offline"}
                  tamanho="sm"
                />

                {estaPronto && (
                  <div className="absolute -bottom-1 -right-0.5 bg-emerald-500 rounded-full w-4 h-4 flex items-center justify-center shadow-sm border-2 border-papel z-10" title="Pronto para a próxima página!">
                    <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                )}
              </div>
            );
          })}

          {/* Botão Convidar Participantes */}
          <button
            type="button"
            onClick={() => setModalConviteAberto(true)}
            className="spring-bounce flex h-7 sm:h-8 items-center gap-1 sm:gap-1.5 rounded-full border border-dashed border-amora/50 bg-amora/10 hover:bg-amora hover:text-papel px-2.5 sm:px-3 text-[11px] sm:text-xs font-semibold text-amora transition-all active:scale-95 cursor-pointer shadow-xs ml-1 select-none"
            title="Convidar outros leitores da casa"
          >
            <span className="text-sm font-bold leading-none">+</span>
            <span className="hidden sm:inline">Convidar</span>
          </button>
        </div>

        {/* Direita: Botões de Reação & Sair */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Menu de Reações Rápidas */}
          <div className="relative" ref={reacoesRef}>
            <button
              type="button"
              onClick={() => setMenuReacoesAberto((v) => !v)}
              className="spring-bounce flex items-center gap-1.5 rounded-full border border-papel-3 bg-papel px-3 py-1.5 text-xs font-medium text-tinta transition-all hover:border-amora hover:text-amora active:scale-95 cursor-pointer shadow-xs"
              title="Reagir ao vivo"
            >
              <span>❤️</span>
              <span className="hidden sm:inline">Reagir</span>
            </button>

            {menuReacoesAberto && (
              <div className="absolute right-0 top-full mt-2 z-[100] flex items-center gap-1.5 rounded-2xl border border-papel-3 bg-papel p-1.5 shadow-2xl ring-1 ring-tinta/10 animate-in fade-in zoom-in-95">
                {REACOES_DISPONIVEIS.map((r) => (
                  <button
                    key={r.emoji}
                    type="button"
                    onClick={() => {
                      onReagir(r.emoji);
                      setMenuReacoesAberto(false);
                    }}
                    className="flex h-9 w-9 items-center justify-center rounded-xl text-lg hover:bg-papel-2 hover:scale-125 active:scale-95 transition-all cursor-pointer select-none"
                    title={r.label}
                  >
                    {r.emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Botão Sair / Encerrar */}
          <button
            type="button"
            onClick={() => setConfirmarSaida(true)}
            className="spring-bounce flex items-center gap-1 rounded-full border border-papel-3 px-2.5 py-1.5 text-xs text-tinta-3 hover:border-rose-300 hover:text-rose-500 hover:bg-rose-50/50 dark:hover:bg-rose-950/30 transition-all cursor-pointer"
            title={souHost ? "Encerrar leitura coletiva" : "Sair da leitura coletiva"}
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span className="hidden sm:inline">{souHost ? "Encerrar" : "Sair"}</span>
          </button>
        </div>
      </div>
    </div>

    {/* Modal de Convidar Leitores da Casa */}
      <ModalConvidarSala
        aberto={modalConviteAberto}
        onClose={() => setModalConviteAberto(false)}
        sala={sala}
      />

      {/* Modal de Confirmação de Saída/Encerramento */}
      {confirmarSaida && createPortal(
        <div 
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans animate-in fade-in"
          onClick={() => setConfirmarSaida(false)}
        >
          <div 
            className="w-full max-w-sm rounded-2xl border border-papel-3 bg-papel p-6 shadow-2xl text-tinta space-y-4 animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-rose-500">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <h2 className="text-lg font-bold">
                {souHost ? "Encerrar Sala?" : "Sair da Sala?"}
              </h2>
            </div>
            
            <p className="text-sm text-tinta-2 leading-relaxed">
              {souHost 
                ? "Você é o host da sessão. Ao encerrar, a leitura coletiva será finalizada para todos os participantes. Deseja mesmo encerrar?" 
                : "Você está saindo da leitura coletiva. O host e os demais participantes continuarão na sala. Deseja mesmo sair?"}
            </p>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-papel-3/50">
              <button
                type="button"
                onClick={() => setConfirmarSaida(false)}
                className="rounded-xl border border-papel-3 px-4 py-2 text-xs font-medium text-tinta hover:bg-papel-2 transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmarSaida(false);
                  souHost ? onEncerrar() : onSair();
                }}
                className="rounded-xl bg-rose-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-rose-700 active:scale-95 transition-all cursor-pointer"
              >
                {souHost ? "Sim, encerrar" : "Sim, sair"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
