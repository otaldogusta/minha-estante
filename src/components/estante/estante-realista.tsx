import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import type { Livro } from "@/lib/api/livros.functions";
import { SleepingLottieCat } from "./sleeping-lottie-cat";

interface EstanteRealistaProps {
  livros: Livro[];
  onSelectLivro?: (livro: Livro) => void;
}

// Preset de paletas elegantes e aconchegantes para lombadas de livros
const PALETAS_LOMBADA = [
  { bg: "from-rose-900 via-rose-950 to-amber-950", border: "border-rose-400/40", text: "text-rose-100", accent: "#f43f5e" },
  { bg: "from-emerald-900 via-emerald-950 to-teal-950", border: "border-emerald-400/40", text: "text-emerald-100", accent: "#10b981" },
  { bg: "from-sky-900 via-blue-950 to-indigo-950", border: "border-sky-400/40", text: "text-sky-100", accent: "#38bdf8" },
  { bg: "from-amber-800 via-amber-900 to-yellow-950", border: "border-amber-400/40", text: "text-amber-100", accent: "#f59e0b" },
  { bg: "from-purple-900 via-purple-950 to-stone-950", border: "border-purple-400/40", text: "text-purple-100", accent: "#a855f7" },
  { bg: "from-slate-800 via-slate-900 to-zinc-950", border: "border-slate-400/40", text: "text-slate-100", accent: "#94a3b8" },
  { bg: "from-amber-950 via-stone-900 to-amber-900", border: "border-amber-500/40", text: "text-amber-200", accent: "#d97706" },
  { bg: "from-teal-900 via-teal-950 to-cyan-950", border: "border-teal-400/40", text: "text-teal-100", accent: "#14b8a6" },
];

function getPaleta(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const idx = Math.abs(hash) % PALETAS_LOMBADA.length;
  return PALETAS_LOMBADA[idx];
}

// Elementos decorativos estilo ilustração aconchegante (Cacto, Óculos, Caneca, Globo, Planta Pendente)
function DecorCacto() {
  return (
    <div className="relative flex flex-col items-center justify-end h-16 w-10 mx-2 pointer-events-none opacity-90 select-none">
      <svg className="w-8 h-12 text-emerald-500/80 drop-shadow-md" viewBox="0 0 24 36" fill="currentColor">
        {/* Vaso */}
        <path d="M5 24 L7 34 L17 34 L19 24 Z" fill="#d97706" className="dark:fill-amber-700" />
        <rect x="4" y="22" width="16" height="3" rx="1" fill="#b45309" />
        {/* Cacto principal */}
        <rect x="9" y="4" width="6" height="18" rx="3" fill="#10b981" />
        {/* Braço esquerdo */}
        <path d="M5 10 h4 v3 h-4 v-3" fill="#10b981" />
        <rect x="4" y="7" width="3" height="6" rx="1.5" fill="#10b981" />
        {/* Braço direito */}
        <path d="M15 13 h4 v3 h-4 v-3" fill="#10b981" />
        <rect x="17" y="9" width="3" height="7" rx="1.5" fill="#10b981" />
        {/* Florzinha rosa no topo */}
        <circle cx="12" cy="3" r="2" fill="#f43f5e" />
      </svg>
    </div>
  );
}

function DecorCaneca() {
  return (
    <div className="relative flex flex-col items-center justify-end h-14 w-9 mx-2 pointer-events-none opacity-90 select-none">
      <style>{`
        @keyframes steam-rise-1 {
          0% { opacity: 0; transform: translateY(0px) scaleX(1); }
          50% { opacity: 0.7; transform: translateY(-7px) scaleX(1.3); }
          100% { opacity: 0; transform: translateY(-14px) scaleX(1.6); }
        }
        @keyframes steam-rise-2 {
          0% { opacity: 0; transform: translateY(0px) scaleX(1); }
          50% { opacity: 0.6; transform: translateY(-8px) scaleX(1.2); }
          100% { opacity: 0; transform: translateY(-16px) scaleX(1.8); }
        }
      `}</style>
      <svg className="w-8 h-10 text-rose-600 drop-shadow-sm overflow-visible" viewBox="0 0 28 28" fill="none">
        {/* Fumaça / Vapor de Café Subindo Suavemente */}
        <path
          d="M 8 6 C 7 3, 9 1, 8 -2"
          stroke="var(--color-papel-3)"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.75"
          style={{ animation: "steam-rise-1 3s infinite ease-out" }}
        />
        <path
          d="M 13 5 C 14 2, 12 0, 13 -3"
          stroke="var(--color-papel-3)"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.65"
          style={{ animation: "steam-rise-2 3s 1.2s infinite ease-out" }}
        />
        {/* Caneca Aconchegante */}
        <rect x="4" y="9" width="14" height="16" rx="3.5" fill="var(--color-amora)" />
        <path d="M 18 12 h 4 a 3 3 0 0 1 0 6 h -4" stroke="var(--color-amora)" strokeWidth="2.5" fill="none" />
        <rect x="6" y="11" width="10" height="2" rx="1" fill="var(--color-papel-2)" opacity="0.6" />
      </svg>
    </div>
  );
}

function DecorOculos() {
  return (
    <div className="relative flex items-center justify-center h-8 w-12 mx-1.5 pointer-events-none opacity-85 select-none">
      <style>{`
        @keyframes glasses-glint {
          0%, 88%, 100% { opacity: 0.15; transform: translateX(-4px); }
          93% { opacity: 0.75; transform: translateX(4px); }
        }
      `}</style>
      <svg className="w-10 h-6 text-amber-300 drop-shadow-xs overflow-visible" viewBox="0 0 32 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="9" cy="8" r="6" stroke="currentColor" fill="rgba(255,255,255,0.12)" />
        <circle cx="23" cy="8" r="6" stroke="currentColor" fill="rgba(255,255,255,0.12)" />
        {/* Brilhozinho raro de lente */}
        <line
          x1="6" y1="5" x2="12" y2="11"
          stroke="white" strokeWidth="1.5" strokeLinecap="round"
          style={{ animation: "glasses-glint 14s infinite ease-in-out" }}
        />
        <path d="M15 8 Q 16 6, 17 8" stroke="currentColor" />
        <path d="M3 8 L 0 5" stroke="currentColor" />
        <path d="M29 8 L 32 5" stroke="currentColor" />
      </svg>
    </div>
  );
}

function DecorPlantaPendente() {
  return (
    <div className="relative flex flex-col items-center justify-start h-20 w-10 mx-2 pointer-events-none opacity-90 select-none">
      <style>{`
        @keyframes vine-sway {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(2.5deg); }
        }
      `}</style>
      <svg className="w-8 h-18 text-emerald-400 drop-shadow-md overflow-visible" viewBox="0 0 24 40" fill="none">
        {/* Vaso suspenso */}
        <path d="M6 8 L18 8 L16 16 L8 16 Z" fill="#b45309" />
        <line x1="12" y1="0" x2="8" y2="8" stroke="#d97706" strokeWidth="1" />
        <line x1="12" y1="0" x2="16" y2="8" stroke="#d97706" strokeWidth="1" />
        {/* Folhas caídas com balanço suave */}
        <g style={{ animation: "vine-sway 7s infinite ease-in-out", transformOrigin: "12px 16px" }}>
          <path d="M10 16 Q 6 22, 4 30 Q 8 28, 11 20" fill="#10b981" />
          <path d="M14 16 Q 18 24, 20 34 Q 16 30, 13 22" fill="#059669" />
          <path d="M12 16 Q 10 26, 11 38 Q 14 32, 13 20" fill="#34d399" />
        </g>
      </svg>
    </div>
  );
}

function DecorGlobo() {
  return (
    <div className="relative flex flex-col items-center justify-end h-16 w-11 mx-2 pointer-events-none opacity-85 select-none">
      <style>{`
        @keyframes globe-tilt {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-3deg); }
        }
      `}</style>
      <svg className="w-9 h-14 text-amber-500 drop-shadow-sm overflow-visible" viewBox="0 0 28 36" fill="none">
        {/* Base do Globo */}
        <path d="M 8 34 L 20 34 L 18 31 L 10 31 Z" fill="#b45309" />
        <line x1="14" y1="31" x2="14" y2="25" stroke="#d97706" strokeWidth="2" />
        {/* Arco do Globo */}
        <path d="M 6 15 A 11 11 0 0 0 22 15" stroke="#d97706" strokeWidth="1.8" fill="none" />
        {/* Esfera do Globo com giro sutil */}
        <g style={{ animation: "globe-tilt 12s infinite ease-in-out", transformOrigin: "14px 14px" }}>
          <circle cx="14" cy="14" r="9" fill="#0284c7" opacity="0.85" />
          {/* Continentes minimalistas */}
          <path d="M 9 12 Q 12 10, 15 13 Q 13 17, 10 16 Z" fill="#10b981" opacity="0.9" />
          <path d="M 15 14 Q 18 16, 20 13 Q 19 18, 16 17 Z" fill="#10b981" opacity="0.9" />
          {/* Linha do equador */}
          <ellipse cx="14" cy="14" rx="9" ry="3" stroke="#fef3c7" strokeWidth="0.75" fill="none" opacity="0.5" />
        </g>
      </svg>
    </div>
  );
}

export function EstanteRealista({ livros, onSelectLivro }: EstanteRealistaProps) {
  const [livroHover, setLivroHover] = useState<Livro | null>(null);
  const [posPopover, setPosPopover] = useState<{ x: number; y: number } | null>(null);

  // Agrupa os livros em prateleiras de ~7 livros cada
  const livrosPorPrateleira: Livro[][] = [];
  const tamanhoPrateleira = 7;
  for (let i = 0; i < livros.length; i += tamanhoPrateleira) {
    livrosPorPrateleira.push(livros.slice(i, i + tamanhoPrateleira));
  }

  if (livros.length === 0) {
    return (
      <div className="mt-8 rounded-2xl border border-dashed border-papel-3 p-10 text-center text-tinta-2">
        Sua estante está vazia. Adicione livros para montar sua prateleira realista!
      </div>
    );
  }

  return (
    <div className="relative mt-6 space-y-12 pb-12 select-none">
      {livrosPorPrateleira.map((prateleira, idxPrateleira) => {
        // Alterna elementos decorativos por prateleira
        const temCacto = idxPrateleira % 3 === 0;
        const temCaneca = idxPrateleira % 3 === 1;
        const temPlantaPendente = idxPrateleira % 3 === 2;

        return (
          <div key={idxPrateleira} className="relative group/prateleira">
            {/* Prateleira Falsa de Fundo (Parede de Madeira / Sombra) */}
            <div className="relative flex items-end justify-between px-4 sm:px-8 min-h-[220px] pt-4">
              {/* Decor Esquerdo por Prateleira */}
              {idxPrateleira === 0 && <DecorCacto />}
              {idxPrateleira === 1 && <DecorPlantaPendente />}
              {idxPrateleira === 2 && <DecorCaneca />}
              {idxPrateleira > 2 && <div className="w-4" />}

              {/* Fileira de Livros na Prateleira */}
              <div className="flex items-end justify-center gap-1.5 sm:gap-2.5 flex-1 mx-2">
                {prateleira.map((livro, idxLivro) => {
                  const paleta = getPaleta(livro.titulo + (livro.autor || ""));
                  const paginas = livro.paginas || 200;
                  
                  // Calcula altura proporcional da lombada (140px a 200px)
                  const alturaPx = Math.min(200, Math.max(140, 140 + (paginas % 60)));
                  // Calcula largura da lombada (28px a 50px)
                  const larguraPx = Math.min(50, Math.max(28, 28 + Math.floor(paginas / 20)));

                  // Variações realistas: 1 em cada 6 livros fica empilhado horizontalmente
                  const ehEmpilhado = idxLivro % 6 === 4 && idxLivro < prateleira.length - 1;
                  // 1 em cada 7 fica inclinado em ~12 graus
                  const ehInclinado = !ehEmpilhado && idxLivro % 7 === 3;

                  // Se for empilhado, vamos combinar o livro atual com o próximo para formar uma pilha horizontal
                  if (ehEmpilhado) {
                    return (
                      <Link
                        key={livro.id}
                        to="/livro/$livroId"
                        params={{ livroId: String(livro.id) }}
                        className="relative flex flex-col justify-end items-center mb-0.5 cursor-pointer group/stack hover:-translate-y-2 transition-transform duration-300 z-10 hover:z-50"
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setLivroHover(livro);
                          setPosPopover({ x: rect.left + rect.width / 2, y: rect.top });
                        }}
                        onMouseLeave={() => {
                          setLivroHover(null);
                          setPosPopover(null);
                        }}
                        onClick={() => onSelectLivro?.(livro)}
                      >
                        {/* Livro de cima na pilha */}
                        <div
                          className={`h-7 w-28 rounded-sm bg-gradient-to-r ${paleta.bg} border-b border-r ${paleta.border} shadow-md flex items-center justify-between px-2 text-[10px] ${paleta.text} font-medium truncate`}
                        >
                          <span className="truncate max-w-[80px] font-semibold">{livro.titulo}</span>
                          <span className="text-[8px] opacity-75">★ {livro.avaliacao || "-"}</span>
                        </div>
                        {/* Base da pilha */}
                        <div
                          className="h-8 w-32 rounded-sm bg-gradient-to-r from-stone-800 via-amber-950 to-stone-900 border-b border-r border-amber-500/30 shadow-lg flex items-center justify-between px-2 text-[10px] text-amber-200 font-medium truncate -mt-0.5"
                        >
                          <span className="truncate max-w-[90px]">Leitura</span>
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        </div>
                      </Link>
                    );
                  }

                  return (
                    <Link
                      key={livro.id}
                      to="/livro/$livroId"
                      params={{ livroId: String(livro.id) }}
                      style={{
                        height: `${alturaPx}px`,
                        width: `${larguraPx}px`,
                        transform: ehInclinado ? "rotate(10deg) translateY(4px)" : "none",
                      }}
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setLivroHover(livro);
                        setPosPopover({ x: rect.left + rect.width / 2, y: rect.top });
                      }}
                      onMouseLeave={() => {
                        setLivroHover(null);
                        setPosPopover(null);
                      }}
                      onClick={() => onSelectLivro?.(livro)}
                      className={`group/spine relative flex flex-col justify-between items-center py-3 px-1 rounded-sm bg-gradient-to-b ${paleta.bg} border-l border-r ${paleta.border} shadow-lg cursor-pointer transition-all duration-300 hover:-translate-y-4 hover:shadow-[0_12px_24px_rgba(0,0,0,0.5)] z-10 hover:z-50 hover:scale-105`}
                    >
                      {/* Fita Marcador de Página saindo pelo topo com suave balanço */}
                      {idxLivro % 3 === 0 && (
                        <div
                          className="absolute -top-3 left-1/2 -translate-x-1/2 w-1.5 h-4 rounded-b-xs shadow-xs"
                          style={{ backgroundColor: paleta.accent }}
                        />
                      )}

                      {/* Friso Dourado Superior */}
                      <div className="w-full h-1 border-y border-amber-300/30 bg-amber-400/10" />

                      {/* Título Vertical na Lombada */}
                      <div className="flex-1 flex items-center justify-center overflow-hidden py-2">
                        <span
                          className={`font-display text-[11px] font-bold tracking-wider ${paleta.text} uppercase truncate max-h-[140px]`}
                          style={{
                            writingMode: "vertical-rl",
                            textTransform: "uppercase",
                            transform: "rotate(180deg)",
                            letterSpacing: "0.05em",
                          }}
                        >
                          {livro.titulo}
                        </span>
                      </div>

                      {/* Friso Dourado Inferior & Avaliação */}
                      <div className="w-full flex flex-col items-center gap-1">
                        <div className="w-full h-1 border-y border-amber-300/30 bg-amber-400/10" />
                        {livro.avaliacao ? (
                          <span className="text-[9px] font-num font-bold text-amber-300/90">
                            ★ {livro.avaliacao}
                          </span>
                        ) : (
                          <span className="text-[8px] font-num text-white/40">•</span>
                        )}
                      </div>
                    </Link>
                  );
                })}

                {/* Gatinho Dormindo Aconchegado na Primeira Prateleira (Diretamente ao Lado dos Livros) */}
                {idxPrateleira === 0 && <SleepingLottieCat />}
              </div>

              {/* Decor Direito por Prateleira */}
              {idxPrateleira === 1 && <DecorGlobo />}
              {idxPrateleira === 2 && <DecorOculos />}
            </div>

            {/* A PRATELEIRA FÍSICA DE MADEIRA (Shelf Plank with Bevel & Shadow) */}
            <div className="relative h-4 w-full rounded-sm bg-gradient-to-r from-amber-950 via-stone-900 to-amber-950 border-t-2 border-amber-600/40 shadow-[0_8px_16px_rgba(0,0,0,0.6)]">
              {/* Brilho da Borda Frontal da Madeira */}
              <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-amber-400/20 via-amber-200/40 to-amber-400/20" />
              {/* Sombra Sob a Prateleira */}
              <div className="absolute top-full inset-x-2 h-3 bg-black/40 blur-md pointer-events-none" />
            </div>
          </div>
        );
      })}

      {/* Popover Flutuante de Capa ao Passar o Mouse na Lombada */}
      {livroHover && posPopover && (
        <div
          className="fixed z-50 -translate-x-1/2 -translate-y-full mb-3 w-64 rounded-2xl border border-papel-3 bg-papel/95 backdrop-blur-2xl p-3 shadow-2xl surgir pointer-events-none drop-shadow-2xl flex gap-3 items-center"
          style={{ left: `${posPopover.x}px`, top: `${posPopover.y}px` }}
        >
          {/* Mini Capa do Livro */}
          {livroHover.capaUrl ? (
            <img
              src={livroHover.capaUrl}
              alt={livroHover.titulo}
              className="h-20 w-14 object-cover rounded-md shadow-md border border-papel-3"
            />
          ) : (
            <div className="h-20 w-14 rounded-md bg-papel-3/60 flex items-center justify-center text-[10px] text-tinta-3 text-center p-1">
              Sem Capa
            </div>
          )}

          {/* Informações Rápida */}
          <div className="flex-1 min-w-0 space-y-1">
            <h4 className="font-display text-xs font-bold text-tinta truncate">{livroHover.titulo}</h4>
            <p className="text-[11px] text-tinta-2 truncate">{livroHover.autor || "Autor desconhecido"}</p>
            <div className="flex items-center justify-between pt-1 border-t border-papel-3/50 text-[10px]">
              <span className="font-num text-amora font-semibold">
                {livroHover.avaliacao ? `★ ${livroHover.avaliacao}/5` : "Sem nota"}
              </span>
              <span className="text-tinta-3 font-num">{livroHover.paginas || 0} págs</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
