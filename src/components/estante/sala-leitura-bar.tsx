import { useState, useRef, useEffect } from "react";
import type { SalaLeituraDetalhes } from "../../lib/api/sala-leitura.functions";
import { AvatarLeitor } from "./avatar";

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

  return (
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

        {/* Centro: Avatares com Indicadores de Prontidão */}
        <div className="flex items-center gap-2.5 overflow-visible py-1 shrink-0">
          {sala.participantes.map((p) => {
            const estaPronto = p.paginaPronta >= paginaAtual;
            const isHost = p.usuarioId === sala.hostUsuarioId;

            return (
              <div
                key={p.usuarioId}
                className="relative shrink-0 flex items-center justify-center p-0.5"
                title={`${p.nome} (${isHost ? "Host · " : ""}${estaPronto ? "Pronto ✓" : "Lendo..."})`}
              >
                <AvatarLeitor nome={p.nome} tamanho="sm" />
                {isHost && (
                  <span className="absolute -top-1.5 -right-1 text-xs select-none" title="Host da sala">
                    👑
                  </span>
                )}
                <span
                  className={`absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold ring-2 ring-papel shadow-xs select-none ${
                    estaPronto
                      ? "bg-emerald-500 text-white"
                      : "bg-amber-500 text-white animate-pulse"
                  }`}
                >
                  {estaPronto ? "✓" : "…"}
                </span>
              </div>
            );
          })}
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
          {confirmarSaida ? (
            <div className="flex items-center gap-1.5 animate-in fade-in">
              <button
                type="button"
                onClick={souHost ? onEncerrar : onSair}
                className="rounded-full bg-rose-600 px-3 py-1 text-xs font-medium text-white hover:bg-rose-700 transition-colors cursor-pointer shadow-xs"
              >
                {souHost ? "Encerrar" : "Sair"}
              </button>
              <button
                type="button"
                onClick={() => setConfirmarSaida(false)}
                className="rounded-full border border-papel-3 px-2 py-1 text-xs text-tinta-2 hover:bg-papel-2 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );
}
