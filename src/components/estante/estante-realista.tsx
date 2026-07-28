import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import type { Livro } from "@/lib/api/livros.functions";
import { SleepingLottieCat } from "./sleeping-lottie-cat";

interface EstanteRealistaProps {
  livros: Livro[];
  onSelectLivro?: (livro: Livro) => void;
}

// Dicionário de Capas Reais de Alta Resolução para Bestsellers
const CAPAS_REAIS_PRESETS: Record<string, string> = {
  "a hipótese do amor": "https://m.media-amazon.com/images/I/71wL4S0G2zL._AC_UF1000,1000_QL80_.jpg",
  "táticas do amor": "https://m.media-amazon.com/images/I/71WbZ92lOSL._AC_UF1000,1000_QL80_.jpg",
  "herdeira do fogo": "https://m.media-amazon.com/images/I/81C6c-z1WXL._AC_UF1000,1000_QL80_.jpg",
  "a lâmina da assassina": "https://m.media-amazon.com/images/I/81x1U3ZJ9JL._AC_UF1000,1000_QL80_.jpg",
  "suicidas": "https://m.media-amazon.com/images/I/81fHn6m76SL._AC_UF1000,1000_QL80_.jpg",
  "é assim que acaba": "https://m.media-amazon.com/images/I/81Iz2LMTpAL._AC_UF1000,1000_QL80_.jpg",
  "verity": "https://m.media-amazon.com/images/I/81K0uX6B60L._AC_UF1000,1000_QL80_.jpg",
  "a vegetariana": "https://m.media-amazon.com/images/I/81ZgN19P7hL._AC_UF1000,1000_QL80_.jpg",
  "não perturbe": "https://m.media-amazon.com/images/I/71X8k4L8x0L._AC_UF1000,1000_QL80_.jpg",
  "uma família feliz": "https://m.media-amazon.com/images/I/81C3dG-qL9L._AC_UF1000,1000_QL80_.jpg",
  "o meu pé de laranja lima": "https://m.media-amazon.com/images/I/81D3L7+SAML._AC_UF1000,1000_QL80_.jpg",
  "a morte de ivan ilitch": "https://m.media-amazon.com/images/I/71C+l7n2JmL._AC_UF1000,1000_QL80_.jpg",
  "chama de ferro": "https://m.media-amazon.com/images/I/91t+hXFkO1L._AC_UF1000,1000_QL80_.jpg",
  "quarta asa": "https://m.media-amazon.com/images/I/91y3D-dEFTL._AC_UF1000,1000_QL80_.jpg",
  "a paciente silenciosa": "https://m.media-amazon.com/images/I/81dD3B-RzJL._AC_UF1000,1000_QL80_.jpg",
  "lado feio do amor": "https://m.media-amazon.com/images/I/81H+mYF1k8L._AC_UF1000,1000_QL80_.jpg",
  "para sempre seu": "https://m.media-amazon.com/images/I/71-0pY-hWvL._AC_UF1000,1000_QL80_.jpg",
  "a última casa da rua": "https://m.media-amazon.com/images/I/81TjF0M7SBL._AC_UF1000,1000_QL80_.jpg",
  "relatos de um gato": "https://m.media-amazon.com/images/I/81-0T+d0-nL._AC_UF1000,1000_QL80_.jpg",
  "a última festa": "https://m.media-amazon.com/images/I/81B4+kO6+DL._AC_UF1000,1000_QL80_.jpg",
  "a mulher no espelho": "https://m.media-amazon.com/images/I/81kQ9N0O04L._AC_UF1000,1000_QL80_.jpg",
  "áticas do amor": "https://m.media-amazon.com/images/I/71WbZ92lOSL._AC_UF1000,1000_QL80_.jpg",
  "cademia dos casos": "https://m.media-amazon.com/images/I/81dD3B-RzJL._AC_UF1000,1000_QL80_.jpg",
  "menina má": "https://m.media-amazon.com/images/I/71QhHq-wN0L._AC_UF1000,1000_QL80_.jpg",
  "o peso do pássaro": "https://m.media-amazon.com/images/I/81-9RzZ7LML._AC_UF1000,1000_QL80_.jpg",
  "layla": "https://m.media-amazon.com/images/I/81nZ-T6WcFL._AC_UF1000,1000_QL80_.jpg",
  "pinóquio": "https://m.media-amazon.com/images/I/81g1F+B+9bL._AC_UF1000,1000_QL80_.jpg",
  "com amor, mamãe": "https://m.media-amazon.com/images/I/81H+mYF1k8L._AC_UF1000,1000_QL80_.jpg",
  "rainha das sombras": "https://m.media-amazon.com/images/I/81kF90U9NPL._AC_UF1000,1000_QL80_.jpg",
  "como arruinar um": "https://m.media-amazon.com/images/I/71X8k4L8x0L._AC_UF1000,1000_QL80_.jpg",
  "tudo que deixamos": "https://m.media-amazon.com/images/I/81ZgN19P7hL._AC_UF1000,1000_QL80_.jpg",
  "tempestade de guerra": "https://m.media-amazon.com/images/I/81C6c-z1WXL._AC_UF1000,1000_QL80_.jpg",
  "cantar secreto": "https://m.media-amazon.com/images/I/71wL4S0G2zL._AC_UF1000,1000_QL80_.jpg",
  "nadando no escuro": "https://m.media-amazon.com/images/I/81K0uX6B60L._AC_UF1000,1000_QL80_.jpg",
  "o vilarejo": "https://m.media-amazon.com/images/I/81fHn6m76SL._AC_UF1000,1000_QL80_.jpg",
  "o detento": "https://m.media-amazon.com/images/I/81Iz2LMTpAL._AC_UF1000,1000_QL80_.jpg",
  "dias perfeitos": "https://m.media-amazon.com/images/I/81fHn6m76SL._AC_UF1000,1000_QL80_.jpg",
  "melhor do que nos": "https://m.media-amazon.com/images/I/71wL4S0G2zL._AC_UF1000,1000_QL80_.jpg",
  "os dois morrem no": "https://m.media-amazon.com/images/I/81nZ-T6WcFL._AC_UF1000,1000_QL80_.jpg",
  "massacre da família": "https://m.media-amazon.com/images/I/81C3dG-qL9L._AC_UF1000,1000_QL80_.jpg",
  "há vida pequena": "https://m.media-amazon.com/images/I/81g1F+B+9bL._AC_UF1000,1000_QL80_.jpg",
  "desenhos ocultos": "https://m.media-amazon.com/images/I/81x1U3ZJ9JL._AC_UF1000,1000_QL80_.jpg",
  "a empregada": "https://m.media-amazon.com/images/I/81K0uX6B60L._AC_UF1000,1000_QL80_.jpg",
  "tudo é rio": "https://m.media-amazon.com/images/I/81ZgN19P7hL._AC_UF1000,1000_QL80_.jpg",
  "coroa da meia-noite": "https://m.media-amazon.com/images/I/81C6c-z1WXL._AC_UF1000,1000_QL80_.jpg",
  "nunca minta": "https://m.media-amazon.com/images/I/81dD3B-RzJL._AC_UF1000,1000_QL80_.jpg",
  "trono de vidro": "https://m.media-amazon.com/images/I/81C6c-z1WXL._AC_UF1000,1000_QL80_.jpg",
  "daisy jones & the": "https://m.media-amazon.com/images/I/81nZ-T6WcFL._AC_UF1000,1000_QL80_.jpg"
};

export function obterCapaReal(livro: Livro): string | null {
  if (livro.capa && livro.capa.trim().startsWith("http")) return livro.capa;
  if ((livro as any).capaUrl && (livro as any).capaUrl.trim().startsWith("http")) return (livro as any).capaUrl;

  const tNorm = livro.titulo.toLowerCase().trim();
  for (const [key, url] of Object.entries(CAPAS_REAIS_PRESETS)) {
    if (tNorm.includes(key) || key.includes(tNorm)) {
      return url;
    }
  }

  // Fallback inteligente para Open Library por título
  const query = encodeURIComponent(livro.titulo);
  return `https://covers.openlibrary.org/b/isbn/${query}-L.jpg`;
}

// Preset de paletas elegantes e aconchegantes para lombadas e capas de livros
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
    <div className="relative flex flex-col items-center justify-end h-16 w-10 mx-1 sm:mx-2 pointer-events-none opacity-90 select-none flex-shrink-0">
      <svg className="w-8 h-12 text-emerald-500/80 drop-shadow-md" viewBox="0 0 24 36" fill="currentColor">
        <path d="M5 24 L7 34 L17 34 L19 24 Z" fill="#d97706" className="dark:fill-amber-700" />
        <rect x="4" y="22" width="16" height="3" rx="1" fill="#b45309" />
        <rect x="9" y="4" width="6" height="18" rx="3" fill="#10b981" />
        <path d="M5 10 h4 v3 h-4 v-3" fill="#10b981" />
        <rect x="4" y="7" width="3" height="6" rx="1.5" fill="#10b981" />
        <path d="M15 13 h4 v3 h-4 v-3" fill="#10b981" />
        <rect x="17" y="9" width="3" height="7" rx="1.5" fill="#10b981" />
        <circle cx="12" cy="3" r="2" fill="#f43f5e" />
      </svg>
    </div>
  );
}

function DecorCaneca() {
  return (
    <div className="relative flex flex-col items-center justify-end h-14 w-9 mx-1 sm:mx-2 pointer-events-none opacity-90 select-none flex-shrink-0">
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
        <rect x="4" y="9" width="14" height="16" rx="3.5" fill="var(--color-amora)" />
        <path d="M 18 12 h 4 a 3 3 0 0 1 0 6 h -4" stroke="var(--color-amora)" strokeWidth="2.5" fill="none" />
        <rect x="6" y="11" width="10" height="2" rx="1" fill="var(--color-papel-2)" opacity="0.6" />
      </svg>
    </div>
  );
}

function DecorOculos() {
  return (
    <div className="relative flex items-center justify-center h-8 w-12 mx-1 sm:mx-1.5 pointer-events-none opacity-85 select-none flex-shrink-0">
      <style>{`
        @keyframes glasses-glint {
          0%, 88%, 100% { opacity: 0.15; transform: translateX(-4px); }
          93% { opacity: 0.75; transform: translateX(4px); }
        }
      `}</style>
      <svg className="w-10 h-6 text-amber-300 drop-shadow-xs overflow-visible" viewBox="0 0 32 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="9" cy="8" r="6" stroke="currentColor" fill="rgba(255,255,255,0.12)" />
        <circle cx="23" cy="8" r="6" stroke="currentColor" fill="rgba(255,255,255,0.12)" />
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
    <div className="relative flex flex-col items-center justify-start h-20 w-10 mx-1 sm:mx-2 pointer-events-none opacity-90 select-none flex-shrink-0">
      <style>{`
        @keyframes vine-sway {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(2.5deg); }
        }
      `}</style>
      <svg className="w-8 h-18 text-emerald-400 drop-shadow-md overflow-visible" viewBox="0 0 24 40" fill="none">
        <path d="M6 8 L18 8 L16 16 L8 16 Z" fill="#b45309" />
        <line x1="12" y1="0" x2="8" y2="8" stroke="#d97706" strokeWidth="1" />
        <line x1="12" y1="0" x2="16" y2="8" stroke="#d97706" strokeWidth="1" />
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
    <div className="relative flex flex-col items-center justify-end h-16 w-11 mx-1 sm:mx-2 pointer-events-none opacity-85 select-none flex-shrink-0">
      <style>{`
        @keyframes globe-tilt {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-3deg); }
        }
      `}</style>
      <svg className="w-9 h-14 text-amber-500 drop-shadow-sm overflow-visible" viewBox="0 0 28 36" fill="none">
        <path d="M 8 34 L 20 34 L 18 31 L 10 31 Z" fill="#b45309" />
        <line x1="14" y1="31" x2="14" y2="25" stroke="#d97706" strokeWidth="2" />
        <path d="M 6 15 A 11 11 0 0 0 22 15" stroke="#d97706" strokeWidth="1.8" fill="none" />
        <g style={{ animation: "globe-tilt 12s infinite ease-in-out", transformOrigin: "14px 14px" }}>
          <circle cx="14" cy="14" r="9" fill="#0284c7" opacity="0.85" />
          <path d="M 9 12 Q 12 10, 15 13 Q 13 17, 10 16 Z" fill="#10b981" opacity="0.9" />
          <path d="M 15 14 Q 18 16, 20 13 Q 19 18, 16 17 Z" fill="#10b981" opacity="0.9" />
          <ellipse cx="14" cy="14" rx="9" ry="3" stroke="#fef3c7" strokeWidth="0.75" fill="none" opacity="0.5" />
        </g>
      </svg>
    </div>
  );
}

// Subcomponente 1: Livro exibido de frente (Capa Frontal REAL em Mini-Display de Estante)
interface LivroCapaFrontalProps {
  livro: Livro;
  onMouseEnter: (e: React.MouseEvent<HTMLAnchorElement>, livro: Livro) => void;
  onMouseLeave: () => void;
  onSelectLivro?: (livro: Livro) => void;
}

function LivroCapaFrontal({ livro, onMouseEnter, onMouseLeave, onSelectLivro }: LivroCapaFrontalProps) {
  const paleta = getPaleta(livro.titulo + (livro.autor || ""));
  const estaLendo = livro.status === "Lendo";
  const capaImg = obterCapaReal(livro);
  const [imgError, setImgError] = useState(false);

  return (
    <Link
      to="/livro/$livroId"
      params={{ livroId: String(livro.id) }}
      onMouseEnter={(e) => onMouseEnter(e, livro)}
      onMouseLeave={onMouseLeave}
      onClick={() => onSelectLivro?.(livro)}
      className="group/capa-frontal relative flex flex-col items-center justify-end flex-shrink-0 cursor-pointer transition-all duration-300 hover:-translate-y-3.5 hover:scale-[1.05] z-20 hover:z-50 mx-1 sm:mx-2"
    >
      {/* Suporte de Expositor de Madeira sob o Livro */}
      <div className="absolute -bottom-1 w-[90%] h-2.5 bg-amber-950/80 rounded-sm border-t border-amber-500/30 shadow-md pointer-events-none z-0" />

      {/* Livro Exibido de Frente (Cover Frame 3D com Espessura Lateral) */}
      <div className="relative w-28 sm:w-32 md:w-36 h-40 sm:h-44 md:h-48 rounded-md shadow-[0_12px_24px_rgba(0,0,0,0.6)] overflow-hidden border border-white/20 dark:border-white/10 transition-shadow group-hover/capa-frontal:shadow-[0_18px_36px_rgba(0,0,0,0.8)] flex flex-col justify-between p-2 z-10 bg-stone-900">
        {/* Imagem da Capa Real */}
        {capaImg && !imgError ? (
          <img
            src={capaImg}
            alt={livro.titulo}
            onError={() => setImgError(true)}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover/capa-frontal:scale-105"
          />
        ) : (
          /* Fallback com Capa Ilustrativa Tipográfica */
          <div className={`absolute inset-0 bg-gradient-to-br ${paleta.bg} p-3 flex flex-col justify-between`}>
            <div className="w-full h-0.5 bg-amber-300/40" />
            <div className="space-y-1 my-auto text-center">
              <h4 className={`font-display text-xs sm:text-sm font-bold ${paleta.text} uppercase tracking-wider line-clamp-3 leading-snug drop-shadow-sm`}>
                {livro.titulo}
              </h4>
              <p className="text-[9px] text-white/70 truncate font-serif italic">{livro.autor || "Autor"}</p>
            </div>
            <div className="w-full h-0.5 bg-amber-300/40" />
          </div>
        )}

        {/* Efeito 3D de Lombada e Espessura Real da Capa de Livro */}
        <div className="absolute inset-y-0 left-0 w-2 bg-white/25 backdrop-blur-xs border-r border-black/30 pointer-events-none z-10" />
        <div className="absolute inset-0 bg-gradient-to-tr from-black/50 via-transparent to-white/20 pointer-events-none z-10" />

        {/* Tag de Destaque Editorial ("Lendo Agora" ou "Destaque ★") */}
        <div className="relative z-20 flex items-center justify-between w-full">
          {estaLendo ? (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/90 text-white font-sans text-[8px] font-bold tracking-wider shadow-md uppercase backdrop-blur-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              Lendo
            </span>
          ) : livro.avaliacao ? (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-500/90 text-stone-950 font-num text-[9px] font-bold shadow-md backdrop-blur-xs ml-auto">
              ★ {livro.avaliacao}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

// Subcomponente 2: Pilha Horizontal de Livros Deitados
interface PilhaLivrosProps {
  livrosPilha: Livro[];
  onMouseEnter: (e: React.MouseEvent<HTMLAnchorElement>, livro: Livro) => void;
  onMouseLeave: () => void;
  onSelectLivro?: (livro: Livro) => void;
}

function PilhaLivros({ livrosPilha, onMouseEnter, onMouseLeave, onSelectLivro }: PilhaLivrosProps) {
  if (livrosPilha.length === 0) return null;

  return (
    <div className="relative flex flex-col justify-end items-center flex-shrink-0 mx-1 sm:mx-2 group/pilha z-10 hover:z-40">
      {livrosPilha.map((livro, idx) => {
        const paleta = getPaleta(livro.titulo + (livro.autor || ""));
        const larguraClass = idx === 0 ? "w-28 sm:w-32 md:w-36 h-7" : "w-24 sm:w-28 md:w-32 h-6.5 -mb-0.5";

        return (
          <Link
            key={livro.id}
            to="/livro/$livroId"
            params={{ livroId: String(livro.id) }}
            onMouseEnter={(e) => onMouseEnter(e, livro)}
            onMouseLeave={onMouseLeave}
            onClick={() => onSelectLivro?.(livro)}
            className={`relative rounded-xs bg-gradient-to-r ${paleta.bg} border-b border-r ${paleta.border} shadow-md flex items-center justify-between px-2.5 text-[10px] ${paleta.text} font-medium truncate cursor-pointer transition-transform duration-200 hover:-translate-y-1.5 ${larguraClass}`}
          >
            <span className="truncate max-w-[90px] font-semibold">{livro.titulo}</span>
            {livro.avaliacao ? (
              <span className="text-[8px] font-num opacity-80">★ {livro.avaliacao}</span>
            ) : (
              <span className="text-[8px] opacity-50">•</span>
            )}
          </Link>
        );
      })}
    </div>
  );
}

// Subcomponente 3: Lombada Vertical Tradicional
interface LombadaVerticalProps {
  livro: Livro;
  idxLivro: number;
  onMouseEnter: (e: React.MouseEvent<HTMLAnchorElement>, livro: Livro) => void;
  onMouseLeave: () => void;
  onSelectLivro?: (livro: Livro) => void;
}

function LombadaVertical({ livro, idxLivro, onMouseEnter, onMouseLeave, onSelectLivro }: LombadaVerticalProps) {
  const paleta = getPaleta(livro.titulo + (livro.autor || ""));
  const paginas = livro.paginas || 200;
  
  const alturaPx = Math.min(200, Math.max(140, 140 + (paginas % 60)));
  const larguraPx = Math.min(48, Math.max(28, 28 + Math.floor(paginas / 20)));
  const ehInclinado = idxLivro % 7 === 3;

  return (
    <Link
      to="/livro/$livroId"
      params={{ livroId: String(livro.id) }}
      style={{
        height: `${alturaPx}px`,
        width: `${larguraPx}px`,
        transform: ehInclinado ? "rotate(9deg) translateY(3px)" : "none",
      }}
      onMouseEnter={(e) => onMouseEnter(e, livro)}
      onMouseLeave={onMouseLeave}
      onClick={() => onSelectLivro?.(livro)}
      className={`group/spine relative flex-shrink-0 flex flex-col justify-between items-center py-3 px-1 rounded-sm bg-gradient-to-b ${paleta.bg} border-l border-r ${paleta.border} shadow-lg cursor-pointer transition-all duration-300 hover:-translate-y-4 hover:shadow-[0_12px_24px_rgba(0,0,0,0.5)] z-10 hover:z-50 hover:scale-105 mx-0.5`}
    >
      {/* Fita Marcador de Página saindo pelo topo */}
      {idxLivro % 3 === 0 && (
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 w-1.5 h-4 rounded-b-xs shadow-xs pointer-events-none"
          style={{ backgroundColor: paleta.accent }}
        />
      )}

      {/* Friso Dourado Superior */}
      <div className="w-full h-1 border-y border-amber-300/30 bg-amber-400/10 pointer-events-none" />

      {/* Título Vertical na Lombada */}
      <div className="flex-1 flex items-center justify-center overflow-hidden py-2 pointer-events-none">
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
      <div className="w-full flex flex-col items-center gap-1 pointer-events-none">
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
}

export function EstanteRealista({ livros, onSelectLivro }: EstanteRealistaProps) {
  const [livroHover, setLivroHover] = useState<Livro | null>(null);
  const [posPopover, setPosPopover] = useState<{ x: number; y: number } | null>(null);

  const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>, livro: Livro) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setLivroHover(livro);
    setPosPopover({ x: rect.left + rect.width / 2, y: rect.top });
  };

  const handleMouseLeave = () => {
    setLivroHover(null);
    setPosPopover(null);
  };

  // Agrupa os livros em prateleiras densas e ricas de 9 livros por fileira
  const tamanhoPrateleira = 9;
  const livrosPorPrateleira: Livro[][] = [];
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
    <div className="relative mt-6 space-y-14 pb-12 select-none">
      {livrosPorPrateleira.map((prateleira, idxPrateleira) => {
        let idxLivroDestaque = prateleira.findIndex((l) => l.status === "Lendo");
        if (idxLivroDestaque === -1) {
          idxLivroDestaque = prateleira.findIndex((l) => l.avaliacao === 5);
        }
        if (idxLivroDestaque === -1) {
          idxLivroDestaque = Math.min(3, prateleira.length - 1);
        }

        const livroDestaque = prateleira[idxLivroDestaque];
        const livrosLombadasAntes = prateleira.slice(0, idxLivroDestaque);
        const livrosAposDestaque = prateleira.slice(idxLivroDestaque + 1);

        const temPilha = livrosAposDestaque.length >= 3;
        const livrosPilha = temPilha ? livrosAposDestaque.slice(0, 2) : [];
        const livrosLombadasDepois = temPilha ? livrosAposDestaque.slice(2) : livrosAposDestaque;

        return (
          <div key={idxPrateleira} className="relative group/prateleira">
            {/* Nicho / Conteúdo da Prateleira com livros e decorações curadas */}
            <div className="relative flex items-end justify-between px-3 sm:px-6 min-h-[220px] pt-4">
              {/* Objeto Decorativo Esquerdo (Curado por Prateleira) */}
              {idxPrateleira === 0 && <DecorCacto />}
              {idxPrateleira === 1 && <DecorPlantaPendente />}
              {idxPrateleira === 2 && <DecorCaneca />}
              {idxPrateleira > 2 && <div className="w-2" />}

              {/* Arrranjo Híbrido de Livros (Lombadas + Capa Frontal + Pilhas) */}
              <div className="flex items-end justify-center gap-1 sm:gap-2 flex-1 mx-1 sm:mx-3 overflow-visible">
                {/* Bloco A: Lombadas Verticais Iniciais */}
                {livrosLombadasAntes.map((livro, idx) => (
                  <LombadaVertical
                    key={livro.id}
                    livro={livro}
                    idxLivro={idx}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    onSelectLivro={onSelectLivro}
                  />
                ))}

                {/* Bloco B: Livro de Destaque em Capa Frontal Visível (Com Capas Reais de Alta Resolução) */}
                {livroDestaque && (
                  <LivroCapaFrontal
                    livro={livroDestaque}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    onSelectLivro={onSelectLivro}
                  />
                )}

                {/* Bloco C: Pilha Horizontal de Deitados */}
                {temPilha && (
                  <PilhaLivros
                    livrosPilha={livrosPilha}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    onSelectLivro={onSelectLivro}
                  />
                )}

                {/* Bloco D: Lombadas Verticais Finais */}
                {livrosLombadasDepois.map((livro, idx) => (
                  <LombadaVertical
                    key={livro.id}
                    livro={livro}
                    idxLivro={idx + 10}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    onSelectLivro={onSelectLivro}
                  />
                ))}

                {/* Gatinho Dormindo na Prateleira 1 (Apoio na Madeira) */}
                {idxPrateleira === 0 && <SleepingLottieCat />}
              </div>

              {/* Objeto Decorativo Direito (Curado por Prateleira) */}
              {idxPrateleira === 1 && <DecorGlobo />}
              {idxPrateleira === 2 && <DecorOculos />}
            </div>

            {/* A PRATELEIRA FÍSICA DE MADEIRA (Shelf Plank with Bevel & Shadow) */}
            <div className="relative h-4.5 w-full rounded-sm bg-gradient-to-r from-amber-950 via-stone-900 to-amber-950 border-t-2 border-amber-600/40 shadow-[0_8px_16px_rgba(0,0,0,0.6)]">
              <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-amber-400/20 via-amber-200/40 to-amber-400/20" />
              <div className="absolute top-full inset-x-2 h-3.5 bg-black/40 blur-md pointer-events-none" />
            </div>
          </div>
        );
      })}

      {/* Popover Flutuante de Capa ao Passar o Mouse */}
      {livroHover && posPopover && (
        <div
          className="fixed z-50 -translate-x-1/2 -translate-y-full mb-3 w-64 rounded-2xl border border-papel-3 bg-papel/95 backdrop-blur-2xl p-3 shadow-2xl surgir pointer-events-none drop-shadow-2xl flex gap-3 items-center"
          style={{ left: `${posPopover.x}px`, top: `${posPopover.y}px` }}
        >
          {obterCapaReal(livroHover) ? (
            <img
              src={obterCapaReal(livroHover)!}
              alt={livroHover.titulo}
              className="h-20 w-14 object-cover rounded-md shadow-md border border-papel-3"
            />
          ) : (
            <div className="h-20 w-14 rounded-md bg-papel-3/60 flex items-center justify-center text-[10px] text-tinta-3 text-center p-1">
              Sem Capa
            </div>
          )}

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
