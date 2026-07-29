import React, { useState } from "react";
import { createPortal } from "react-dom";
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

  const query = encodeURIComponent(livro.titulo);
  return `https://covers.openlibrary.org/b/isbn/${query}-L.jpg`;
}

// Preset de paletas elegantes e ricas para lombadas derivadas da capa
const PALETAS_LOMBADA = [
  { bg: "from-rose-900 via-rose-950 to-stone-950", border: "border-rose-400/30", text: "text-rose-100", accent: "#f43f5e" },
  { bg: "from-emerald-900 via-emerald-950 to-stone-950", border: "border-emerald-400/30", text: "text-emerald-100", accent: "#10b981" },
  { bg: "from-sky-900 via-blue-950 to-stone-950", border: "border-sky-400/30", text: "text-sky-100", accent: "#38bdf8" },
  { bg: "from-amber-800 via-amber-950 to-stone-950", border: "border-amber-400/30", text: "text-amber-100", accent: "#f59e0b" },
  { bg: "from-purple-900 via-purple-950 to-stone-950", border: "border-purple-400/30", text: "text-purple-100", accent: "#a855f7" },
  { bg: "from-slate-800 via-slate-900 to-zinc-950", border: "border-slate-400/30", text: "text-slate-100", accent: "#94a3b8" },
  { bg: "from-amber-950 via-stone-900 to-amber-900", border: "border-amber-500/30", text: "text-amber-200", accent: "#d97706" },
  { bg: "from-teal-900 via-teal-950 to-stone-950", border: "border-teal-400/30", text: "text-teal-100", accent: "#14b8a6" },
];

function getPaleta(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const idx = Math.abs(hash) % PALETAS_LOMBADA.length;
  return PALETAS_LOMBADA[idx];
}

// Elementos Decorativos Físicos e Proporcionais (Cacto, Planta Pendente, Conjunto Caneca+Óculos)
function DecorCacto() {
  return (
    <div className="relative flex flex-col items-center justify-end h-16 w-10 mx-2 pointer-events-none opacity-90 select-none flex-shrink-0">
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

function DecorPlantaPendente() {
  return (
    <div className="relative flex flex-col items-center justify-start h-20 w-10 mx-2 pointer-events-none opacity-90 select-none flex-shrink-0">
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

// Conjunto Aconchegante Unificado: Caneca de Café com Vapor + Óculos de Leitura
function DecorCanecaEOculos() {
  return (
    <div className="relative flex items-end justify-start gap-1.5 h-14 w-20 mx-2 pointer-events-none opacity-90 select-none flex-shrink-0">
      <style>{`
        @keyframes steam-rise-1 {
          0% { opacity: 0; transform: translateY(0px) scaleX(1); }
          50% { opacity: 0.7; transform: translateY(-6px) scaleX(1.2); }
          100% { opacity: 0; transform: translateY(-12px) scaleX(1.5); }
        }
        @keyframes glasses-glint {
          0%, 88%, 100% { opacity: 0.15; transform: translateX(-3px); }
          93% { opacity: 0.75; transform: translateX(3px); }
        }
      `}</style>

      {/* Caneca Aconchegante */}
      <div className="relative flex flex-col items-center justify-end h-12 w-9">
        <svg className="w-8 h-10 text-rose-600 drop-shadow-sm overflow-visible" viewBox="0 0 28 28" fill="none">
          <path
            d="M 8 6 C 7 3, 9 1, 8 -2"
            stroke="var(--color-papel-3)"
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.75"
            style={{ animation: "steam-rise-1 3s infinite ease-out" }}
          />
          <rect x="4" y="9" width="14" height="16" rx="3.5" fill="var(--color-amora)" />
          <path d="M 18 12 h 4 a 3 3 0 0 1 0 6 h -4" stroke="var(--color-amora)" strokeWidth="2.5" fill="none" />
          <rect x="6" y="11" width="10" height="2" rx="1" fill="var(--color-papel-2)" opacity="0.6" />
        </svg>
      </div>

      {/* Óculos de Leitura apoiados na madeira */}
      <div className="relative flex items-center justify-center h-6 w-10 mb-0.5">
        <svg className="w-9 h-5 text-amber-300 drop-shadow-xs overflow-visible" viewBox="0 0 32 16" fill="none" stroke="currentColor" strokeWidth="1.5">
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
    </div>
  );
}

// Subcomponente 1: Capa Frontal Proporcional em Mini-Display de Estante
interface LivroCapaFrontalProps {
  livro: Livro;
  tamanhoMenor?: boolean;
  onMouseEnter: (e: React.MouseEvent<HTMLAnchorElement>, livro: Livro) => void;
  onMouseLeave: () => void;
  onSelectLivro?: (livro: Livro) => void;
}

function LivroCapaFrontal({ livro, tamanhoMenor = false, onMouseEnter, onMouseLeave, onSelectLivro }: LivroCapaFrontalProps) {
  const paleta = getPaleta(livro.titulo + (livro.autor || ""));
  const estaLendo = livro.status === "Lendo";
  const capaImg = obterCapaReal(livro);
  const [imgError, setImgError] = useState(false);

  // Proporção harmônica em relação às lombadas (1.5x a 1.7x a altura média da lombada)
  const dimensoesClass = tamanhoMenor
    ? "w-22 sm:w-26 md:w-28 h-32 sm:h-36 md:h-40"
    : "w-24 sm:w-28 md:w-32 h-36 sm:h-40 md:h-44";

  return (
    <Link
      to="/livro/$livroId"
      params={{ livroId: String(livro.id) }}
      onMouseEnter={(e) => onMouseEnter(e, livro)}
      onMouseLeave={onMouseLeave}
      onClick={() => onSelectLivro?.(livro)}
      className="group/capa-frontal relative flex flex-col items-center justify-end flex-shrink-0 cursor-pointer transition-all duration-300 hover:-translate-y-3 hover:scale-[1.04] z-20 hover:z-50 mx-1 sm:mx-2"
    >
      {/* Suporte de Expositor de Madeira sob o Livro */}
      <div className="absolute -bottom-1 w-[90%] h-2 bg-amber-950/90 rounded-sm border-t border-amber-500/30 shadow-md pointer-events-none z-0" />

      {/* Moldura da Capa Frontal 3D */}
      <div className={`relative ${dimensoesClass} rounded-md shadow-[0_10px_20px_rgba(0,0,0,0.6)] overflow-hidden border border-white/20 dark:border-white/10 transition-shadow group-hover/capa-frontal:shadow-[0_16px_30px_rgba(0,0,0,0.8)] flex flex-col justify-between p-2 z-10 bg-stone-900`}>
        {capaImg && !imgError ? (
          <img
            src={capaImg}
            alt={livro.titulo}
            onError={() => setImgError(true)}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover/capa-frontal:scale-105"
          />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${paleta.bg} p-2.5 flex flex-col justify-between`}>
            <div className="w-full h-0.5 bg-amber-300/40" />
            <div className="space-y-1 my-auto text-center">
              <h4 className={`font-display text-xs font-bold ${paleta.text} uppercase tracking-wider line-clamp-3 leading-snug drop-shadow-sm`}>
                {livro.titulo}
              </h4>
              <p className="text-[9px] text-white/70 truncate font-serif italic">{livro.autor || "Autor"}</p>
            </div>
            <div className="w-full h-0.5 bg-amber-300/40" />
          </div>
        )}

        {/* Efeito 3D de Lombada e Espessura da Capa */}
        <div className="absolute inset-y-0 left-0 w-2 bg-white/25 backdrop-blur-xs border-r border-black/30 pointer-events-none z-10" />
        <div className="absolute inset-0 bg-gradient-to-tr from-black/50 via-transparent to-white/20 pointer-events-none z-10" />

        {/* Tag de Destaque Editorial ("Lendo Agora" ou "★ Nota") */}
        <div className="relative z-20 flex items-center justify-between w-full">
          {estaLendo ? (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/90 text-white font-sans text-[8px] font-bold tracking-wider shadow-md uppercase backdrop-blur-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              Lendo
            </span>
          ) : livro.nota ? (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-500/90 text-stone-950 font-num text-[9px] font-bold shadow-md backdrop-blur-xs ml-auto">
              ★ {livro.nota}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

// Subcomponente 2: Pilhas Horizontais de Livros Reais (Com Espessura 3D e Corte de Páginas)
interface PilhaLivrosProps {
  livrosPilha: Livro[];
  onMouseEnter: (e: React.MouseEvent<HTMLAnchorElement>, livro: Livro) => void;
  onMouseLeave: () => void;
  onSelectLivro?: (livro: Livro) => void;
}

function PilhaLivros({ livrosPilha, onMouseEnter, onMouseLeave, onSelectLivro }: PilhaLivrosProps) {
  if (livrosPilha.length === 0) return null;

  return (
    <div className="relative flex flex-col justify-end items-start flex-shrink-0 mx-2 sm:mx-3 group/pilha z-10 hover:z-40">
      {livrosPilha.map((livro, idx) => {
        const paleta = getPaleta(livro.titulo + (livro.autor || ""));
        const capaImg = obterCapaReal(livro);

        // Livro deitado: largura = altura de um livro em pé (~150px), espessura = lombada (~38-42px)
        const larguraPx = idx === 0 ? 152 : 140;
        const espessuraPx = idx === 0 ? 40 : 36;
        const deslocamento = idx === 0 ? 0 : 6;

        return (
          <LivroDeitadoItem
            key={livro.id}
            livro={livro}
            capaImg={capaImg}
            paleta={paleta}
            larguraPx={larguraPx}
            espessuraPx={espessuraPx}
            deslocamento={deslocamento}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onSelectLivro={onSelectLivro}
          />
        );
      })}
    </div>
  );
}

// Item individual de livro deitado (precisa de useState, por isso componente separado)
function LivroDeitadoItem({
  livro, capaImg, paleta, larguraPx, espessuraPx, deslocamento,
  onMouseEnter, onMouseLeave, onSelectLivro
}: {
  livro: Livro;
  capaImg: string | null;
  paleta: ReturnType<typeof getPaleta>;
  larguraPx: number;
  espessuraPx: number;
  deslocamento: number;
  onMouseEnter: (e: React.MouseEvent<HTMLAnchorElement>, livro: Livro) => void;
  onMouseLeave: () => void;
  onSelectLivro?: (livro: Livro) => void;
}) {
  const [imgError, setImgError] = useState(false);
  const temCapa = capaImg && !imgError;

  return (
    <Link
      to="/livro/$livroId"
      params={{ livroId: String(livro.id) }}
      onMouseEnter={(e) => onMouseEnter(e, livro)}
      onMouseLeave={onMouseLeave}
      onClick={() => onSelectLivro?.(livro)}
      style={{ width: `${larguraPx}px`, height: `${espessuraPx}px`, marginLeft: `${deslocamento}px` }}
      className={`relative rounded-[2px] border-b border-r ${paleta.border} shadow-[0_3px_8px_rgba(0,0,0,0.55)] cursor-pointer transition-transform duration-200 hover:-translate-y-1 overflow-hidden`}
    >
      {/* Gradiente da paleta (fallback) */}
      <div className={`absolute inset-0 bg-gradient-to-b ${paleta.bg}`} />

      {/*
        Capa rotacionada -90°: o livro em pé tinha (espessuraPx)×(larguraPx).
        Rotacionado fica (larguraPx)×(espessuraPx) — encaixe perfeito no container deitado.
        translate(-50%, -50%) centraliza antes da rotação.
      */}
      {temCapa ? (
        <img
          src={capaImg!}
          alt={livro.titulo}
          onError={() => setImgError(true)}
          style={{
            position: "absolute",
            width: `${espessuraPx}px`,
            height: `${larguraPx}px`,
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%) rotate(-90deg)",
            objectFit: "cover",
          }}
        />
      ) : null}

      {/* Sombra nas extremidades para efeito 3D de espessura */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-transparent to-black/25 pointer-events-none" />

      {/* Corte de páginas em bege no lado direito (lombo do livro) */}
      <div className="absolute right-0 inset-y-0 w-3 bg-gradient-to-l from-amber-100/35 to-transparent border-l border-black/20 pointer-events-none" />

      {/* Reflexo de luz na borda superior */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none" />
    </Link>
  );
}





// Subcomponente 3: Lombada Vertical REALISTA com Cor Derivada Limpa
interface LombadaVerticalProps {
  livro: Livro;
  idxLivro: number;
  inclinada?: boolean;
  onMouseEnter: (e: React.MouseEvent<HTMLAnchorElement>, livro: Livro) => void;
  onMouseLeave: () => void;
  onSelectLivro?: (livro: Livro) => void;
}

function LombadaVertical({ livro, idxLivro, inclinada = false, onMouseEnter, onMouseLeave, onSelectLivro }: LombadaVerticalProps) {
  const paleta = getPaleta(livro.titulo + (livro.autor || ""));
  const capaImg = obterCapaReal(livro);
  const [imgError, setImgError] = useState(false);
  const paginas = livro.paginas || 200;

  const alturaPx = Math.min(195, Math.max(140, 140 + (paginas % 55)));
  const larguraPx = Math.min(46, Math.max(28, 28 + Math.floor(paginas / 22)));
  const temCapaReal = capaImg && !imgError;

  return (
    <Link
      to="/livro/$livroId"
      params={{ livroId: String(livro.id) }}
      style={{
        height: `${alturaPx}px`,
        width: `${larguraPx}px`,
        transform: inclinada ? "rotate(8deg) translateY(3px)" : "none",
      }}
      onMouseEnter={(e) => onMouseEnter(e, livro)}
      onMouseLeave={onMouseLeave}
      onClick={() => onSelectLivro?.(livro)}
      className={`group/spine relative flex-shrink-0 rounded-sm border-l border-r ${paleta.border} shadow-[0_8px_16px_rgba(0,0,0,0.5)] cursor-pointer transition-all duration-300 hover:-translate-y-3.5 hover:shadow-[0_14px_28px_rgba(0,0,0,0.7)] z-10 hover:z-50 hover:scale-105 mx-0.5 overflow-hidden bg-stone-950`}
    >
      {/* Gradiente da paleta (fallback) */}
      <div className={`absolute inset-0 bg-gradient-to-b ${paleta.bg}`} />

      {/* Capa real dominando */}
      {temCapaReal ? (
        <img
          src={capaImg!}
          alt={livro.titulo}
          onError={() => setImgError(true)}
          className="absolute inset-0 w-full h-full object-cover opacity-85 group-hover/spine:opacity-100 transition-opacity duration-300"
        />
      ) : null}

      {/* Sombra lateral esquerda (efeito 3D de lombada) */}
      <div className="absolute inset-y-0 left-0 w-2 bg-gradient-to-r from-black/55 to-transparent pointer-events-none z-10" />
      {/* Sombra lateral direita */}
      <div className="absolute inset-y-0 right-0 w-2 bg-gradient-to-l from-black/45 to-transparent pointer-events-none z-10" />
      {/* Reflexo de luz na borda esquerda */}
      <div className="absolute inset-y-0 left-0 w-[2px] bg-white/20 pointer-events-none z-10" />

      {/* Fita marcador no topo (detalhe físico) */}
      {idxLivro % 3 === 0 && (
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 w-1.5 h-4 rounded-b-xs shadow-md pointer-events-none z-20"
          style={{ backgroundColor: paleta.accent }}
        />
      )}
    </Link>
  );
}


export type EstiloLivro = "vertical" | "frontal" | "deitado" | "inclinado";
type LayoutMap = Record<number, EstiloLivro>;

const LAYOUT_STORAGE_KEY = "minha_estante_layout_v2";
const ORDEM_STORAGE_KEY = "minha_estante_ordem_v2";

function carregarLayout(): LayoutMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(LAYOUT_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return {};
}

function salvarLayout(map: LayoutMap) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(map));
  } catch (e) {}
}

function carregarOrdem(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ORDEM_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return [];
}

function salvarOrdem(ids: number[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ORDEM_STORAGE_KEY, JSON.stringify(ids));
  } catch (e) {}
}

// Barra de Ações Flutuante sobre o livro no Modo Edição
function ToolbarEdicaoLivro({
  livroId,
  estiloAtual,
  onChangeEstilo,
  onMover,
}: {
  livroId: number;
  estiloAtual: EstiloLivro;
  onChangeEstilo: (id: number, estilo: EstiloLivro) => void;
  onMover: (id: number, direcao: -1 | 1) => void;
}) {
  return (
    <div
      onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}
      className="absolute -top-10 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 p-1 rounded-xl bg-stone-950/95 border border-amber-500/60 shadow-2xl text-[11px] backdrop-blur-md select-none pointer-events-auto"
    >
      <button
        type="button"
        title="Em pé (Vertical)"
        onClick={() => onChangeEstilo(livroId, "vertical")}
        className={`px-1.5 py-0.5 rounded-md font-bold transition-all ${
          estiloAtual === "vertical" ? "bg-amber-500 text-stone-950 shadow-xs scale-105" : "text-stone-300 hover:bg-stone-800"
        }`}
      >
        ❚
      </button>
      <button
        type="button"
        title="Capa Frontal"
        onClick={() => onChangeEstilo(livroId, "frontal")}
        className={`px-1.5 py-0.5 rounded-md font-bold transition-all ${
          estiloAtual === "frontal" ? "bg-amber-500 text-stone-950 shadow-xs scale-105" : "text-stone-300 hover:bg-stone-800"
        }`}
      >
        📖
      </button>
      <button
        type="button"
        title="Deitado"
        onClick={() => onChangeEstilo(livroId, "deitado")}
        className={`px-1.5 py-0.5 rounded-md font-bold transition-all ${
          estiloAtual === "deitado" ? "bg-amber-500 text-stone-950 shadow-xs scale-105" : "text-stone-300 hover:bg-stone-800"
        }`}
      >
        ▔
      </button>
      <button
        type="button"
        title="Inclinado"
        onClick={() => onChangeEstilo(livroId, "inclinado")}
        className={`px-1.5 py-0.5 rounded-md font-bold transition-all ${
          estiloAtual === "inclinado" ? "bg-amber-500 text-stone-950 shadow-xs scale-105" : "text-stone-300 hover:bg-stone-800"
        }`}
      >
        ⧸
      </button>
      <span className="w-[1px] h-3.5 bg-stone-700 mx-0.5" />
      <button
        type="button"
        title="Mover para esquerda"
        onClick={() => onMover(livroId, -1)}
        className="px-1.5 py-0.5 text-stone-300 hover:bg-stone-800 rounded-md font-bold transition-colors"
      >
        ←
      </button>
      <button
        type="button"
        title="Mover para direita"
        onClick={() => onMover(livroId, 1)}
        className="px-1.5 py-0.5 text-stone-300 hover:bg-stone-800 rounded-md font-bold transition-colors"
      >
        →
      </button>
    </div>
  );
}

// Renderizador individual de livro de acordo com o formato resolvido
function RenderLivroItem({
  livro,
  estilo,
  idxLivro,
  modoEdicao,
  onChangeEstilo,
  onMoverLivro,
  onMouseEnter,
  onMouseLeave,
  onSelectLivro,
}: {
  livro: Livro;
  estilo: EstiloLivro;
  idxLivro: number;
  modoEdicao: boolean;
  onChangeEstilo: (id: number, estilo: EstiloLivro) => void;
  onMoverLivro: (id: number, dir: -1 | 1) => void;
  onMouseEnter: (e: React.MouseEvent<HTMLAnchorElement>, livro: Livro) => void;
  onMouseLeave: () => void;
  onSelectLivro?: (livro: Livro) => void;
}) {
  const paleta = getPaleta(livro.titulo + (livro.autor || ""));
  const capaImg = obterCapaReal(livro);

  return (
    <div className="relative group/item-livro flex flex-col justify-end flex-shrink-0">
      {modoEdicao && (
        <ToolbarEdicaoLivro
          livroId={livro.id}
          estiloAtual={estilo}
          onChangeEstilo={onChangeEstilo}
          onMover={onMoverLivro}
        />
      )}

      {estilo === "frontal" && (
        <LivroCapaFrontal
          livro={livro}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          onSelectLivro={onSelectLivro}
        />
      )}

      {estilo === "deitado" && (
        <LivroDeitadoItem
          livro={livro}
          capaImg={capaImg}
          paleta={paleta}
          larguraPx={148}
          espessuraPx={38}
          deslocamento={0}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          onSelectLivro={onSelectLivro}
        />
      )}

      {estilo === "inclinado" && (
        <LombadaVertical
          livro={livro}
          idxLivro={idxLivro}
          inclinada={true}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          onSelectLivro={onSelectLivro}
        />
      )}

      {estilo === "vertical" && (
        <LombadaVertical
          livro={livro}
          idxLivro={idxLivro}
          inclinada={false}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          onSelectLivro={onSelectLivro}
        />
      )}
    </div>
  );
}

export function EstanteRealista({ livros, onSelectLivro }: EstanteRealistaProps) {
  const [livroHover, setLivroHover] = useState<Livro | null>(null);
  const [posPopover, setPosPopover] = useState<{ x: number; y: number } | null>(null);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [layoutCustom, setLayoutCustom] = useState<LayoutMap>(() => carregarLayout());
  const [ordemCustom, setOrdemCustom] = useState<number[]>(() => carregarOrdem());

  const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>, livro: Livro) => {
    if (modoEdicao) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setLivroHover(livro);
    setPosPopover({
      x: rect.left + rect.width / 2 + window.scrollX,
      y: rect.top + window.scrollY - 30,
    });
  };

  const handleMouseLeave = () => {
    setLivroHover(null);
    setPosPopover(null);
  };

  const handleChangeEstilo = (id: number, novoEstilo: EstiloLivro) => {
    const nextMap = { ...layoutCustom, [id]: novoEstilo };
    setLayoutCustom(nextMap);
    salvarLayout(nextMap);
  };

  // Reordena o livro movendo para esquerda (-1) ou direita (1)
  const handleMoverLivro = (livroId: number, direcao: -1 | 1) => {
    const idsAtuais = listaOrdenada.map((l) => l.id);
    const idx = idsAtuais.indexOf(livroId);
    if (idx === -1) return;
    const targetIdx = idx + direcao;
    if (targetIdx < 0 || targetIdx >= idsAtuais.length) return;

    const copy = [...idsAtuais];
    const temp = copy[idx];
    copy[idx] = copy[targetIdx];
    copy[targetIdx] = temp;

    setOrdemCustom(copy);
    salvarOrdem(copy);
  };

  const handleRestaurarPadrao = () => {
    setLayoutCustom({});
    setOrdemCustom([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem(LAYOUT_STORAGE_KEY);
      localStorage.removeItem(ORDEM_STORAGE_KEY);
    }
  };

  if (livros.length === 0) {
    return (
      <div className="mt-8 rounded-2xl border border-dashed border-papel-3 p-10 text-center text-tinta-2">
        Sua estante está vazia. Adicione livros para montar sua prateleira realista!
      </div>
    );
  }

  // Ordena lista de livros com base em ordemCustom
  const listaOrdenada = [...livros].sort((a, b) => {
    if (ordemCustom.length === 0) return 0;
    const idxA = ordemCustom.indexOf(a.id);
    const idxB = ordemCustom.indexOf(b.id);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return 0;
  });

  // 1. CÁLCULO DINÂMICO DA QUANTIDADE DE PRATELEIRAS
  const totalLivros = listaOrdenada.length;
  let numPrateleiras = 1;
  if (totalLivros >= 9 && totalLivros <= 16) {
    numPrateleiras = 2;
  } else if (totalLivros >= 17) {
    numPrateleiras = Math.min(3, Math.ceil(totalLivros / 7));
    if (totalLivros > 26) {
      numPrateleiras = Math.ceil(totalLivros / 8);
    }
  }

  // Distribui os livros entre as prateleiras necessárias
  const livrosPorPrateleira: Livro[][] = Array.from({ length: numPrateleiras }, () => []);
  listaOrdenada.forEach((livro, i) => {
    const prateleiraIdx = i % numPrateleiras;
    livrosPorPrateleira[prateleiraIdx].push(livro);
  });

  const temCustomizacao = Object.keys(layoutCustom).length > 0 || ordemCustom.length > 0;

  // Função para resolver o estilo de um livro (customizado vs padrão curado)
  const getEstiloResolvido = (livroId: number, globalIdx: number): EstiloLivro => {
    if (layoutCustom[livroId]) return layoutCustom[livroId];
    if (globalIdx === 4 || globalIdx === 16) return "frontal";
    if (globalIdx === 5 || globalIdx === 6 || globalIdx === 10 || globalIdx === 11) return "deitado";
    if (globalIdx === 12) return "inclinado";
    return "vertical";
  };

  let globalCount = 0;

  return (
    <div className="relative mt-4 space-y-10 pb-12 select-none">
      {/* BANNER DE CONTROLE DO MODO EDIÇÃO */}
      <div className="flex items-center justify-between px-2 sm:px-6 mb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setModoEdicao(!modoEdicao)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-sm transition-all duration-200 cursor-pointer ${
              modoEdicao
                ? "bg-amber-500 text-stone-950 ring-2 ring-amber-400 ring-offset-2 ring-offset-stone-950 font-bold"
                : "bg-stone-800/80 hover:bg-stone-700 text-stone-200 border border-white/10"
            }`}
          >
            <span>{modoEdicao ? "✓ Concluir Edição" : "✏️ Personalizar Estante"}</span>
          </button>

          {temCustomizacao && (
            <button
              type="button"
              onClick={handleRestaurarPadrao}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium text-stone-400 hover:text-amber-400 bg-stone-900/60 hover:bg-stone-800 border border-stone-800 transition-colors"
            >
              🔄 Restaurar Padrão
            </button>
          )}
        </div>

        {modoEdicao && (
          <span className="text-[11px] text-amber-400 font-medium animate-pulse hidden sm:inline">
            Clique nos botões sobre cada livro para mudar o estilo (❚ 📖 ▔ ⧸) ou mover (← →)!
          </span>
        )}
      </div>

      {livrosPorPrateleira.map((prateleira, idxPrateleira) => {
        return (
          <div key={idxPrateleira} className="relative group/prateleira">
            {/* Conteúdo da Prateleira com Blocos Compactos e Naturais */}
            <div className="relative flex items-end justify-between px-2 sm:px-6 min-h-[245px] pt-6">

              {/* PRATELEIRA 1 */}
              {idxPrateleira === 0 && (
                <>
                  <DecorCacto />

                  <div className="flex items-end justify-start gap-2 flex-1 mx-2 overflow-x-auto [scrollbar-width:none] pt-10 pb-1">
                    {prateleira.map((livro) => {
                      const idxAtual = globalCount++;
                      const estilo = getEstiloResolvido(livro.id, idxAtual);
                      return (
                        <RenderLivroItem
                          key={livro.id}
                          livro={livro}
                          estilo={estilo}
                          idxLivro={idxAtual}
                          modoEdicao={modoEdicao}
                          onChangeEstilo={handleChangeEstilo}
                          onMoverLivro={handleMoverLivro}
                          onMouseEnter={handleMouseEnter}
                          onMouseLeave={handleMouseLeave}
                          onSelectLivro={onSelectLivro}
                        />
                      );
                    })}
                    <SleepingLottieCat />
                  </div>
                </>
              )}

              {/* PRATELEIRA 2 */}
              {idxPrateleira === 1 && (
                <>
                  <div className="w-2" />

                  <div className="flex items-end justify-start gap-2.5 flex-1 mx-2 overflow-x-auto [scrollbar-width:none] pt-10 pb-1">
                    {prateleira.map((livro) => {
                      const idxAtual = globalCount++;
                      const estilo = getEstiloResolvido(livro.id, idxAtual);
                      return (
                        <RenderLivroItem
                          key={livro.id}
                          livro={livro}
                          estilo={estilo}
                          idxLivro={idxAtual}
                          modoEdicao={modoEdicao}
                          onChangeEstilo={handleChangeEstilo}
                          onMoverLivro={handleMoverLivro}
                          onMouseEnter={handleMouseEnter}
                          onMouseLeave={handleMouseLeave}
                          onSelectLivro={onSelectLivro}
                        />
                      );
                    })}
                  </div>

                  <DecorPlantaPendente />
                </>
              )}

              {/* PRATELEIRA 3 */}
              {idxPrateleira === 2 && (
                <>
                  <DecorCanecaEOculos />

                  <div className="flex items-end justify-start gap-2 flex-1 mx-2 overflow-x-auto [scrollbar-width:none] pt-10 pb-1">
                    {prateleira.map((livro) => {
                      const idxAtual = globalCount++;
                      const estilo = getEstiloResolvido(livro.id, idxAtual);
                      return (
                        <RenderLivroItem
                          key={livro.id}
                          livro={livro}
                          estilo={estilo}
                          idxLivro={idxAtual}
                          modoEdicao={modoEdicao}
                          onChangeEstilo={handleChangeEstilo}
                          onMoverLivro={handleMoverLivro}
                          onMouseEnter={handleMouseEnter}
                          onMouseLeave={handleMouseLeave}
                          onSelectLivro={onSelectLivro}
                        />
                      );
                    })}
                  </div>

                  <div className="w-2" />
                </>
              )}

              {/* DEMAIS PRATELEIRAS */}
              {idxPrateleira > 2 && (
                <div className="flex items-end justify-start gap-2 flex-1 mx-2 overflow-x-auto [scrollbar-width:none] pt-10 pb-1">
                  {prateleira.map((livro) => {
                    const idxAtual = globalCount++;
                    const estilo = getEstiloResolvido(livro.id, idxAtual);
                    return (
                      <RenderLivroItem
                        key={livro.id}
                        livro={livro}
                        estilo={estilo}
                        idxLivro={idxAtual}
                        modoEdicao={modoEdicao}
                        onChangeEstilo={handleChangeEstilo}
                        onMoverLivro={handleMoverLivro}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        onSelectLivro={onSelectLivro}
                      />
                    );
                  })}
                </div>
              )}
            </div>

            {/* A PRATELEIRA FÍSICA DE MADEIRA (Shelf Plank with Bevel & Shadow) */}
            <div className="relative h-4 w-full rounded-sm bg-gradient-to-r from-amber-950 via-stone-900 to-amber-950 border-t-2 border-amber-600/40 shadow-[0_8px_16px_rgba(0,0,0,0.6)]">
              <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-amber-400/20 via-amber-200/40 to-amber-400/20" />
              <div className="absolute top-full inset-x-2 h-3.5 bg-black/40 blur-md pointer-events-none" />
            </div>
          </div>
        );
      })}

      {/* Popover Flutuante via React Portal */}
      {!modoEdicao && livroHover && posPopover && typeof document !== "undefined" && createPortal(
        <div
          className="absolute z-[9999] pointer-events-none w-44 rounded-xl border border-papel-3 bg-papel/95 backdrop-blur-2xl px-3 py-2 shadow-xl surgir drop-shadow-xl"
          style={{
            left: `${posPopover.x}px`,
            top: `${posPopover.y}px`,
            transform: "translateX(-50%) translateY(-100%)",
          }}
        >
          <p className="font-display text-[11px] font-bold text-tinta truncate leading-tight">{livroHover.titulo}</p>
          <p className="text-[10px] text-tinta-2 truncate mt-0.5">{livroHover.autor || "Autor desconhecido"}</p>
          <div className="flex items-center justify-between mt-1.5 pt-1 border-t border-papel-3/50 text-[10px]">
            <span className="font-num text-amora font-semibold">
              {livroHover.nota ? `★ ${livroHover.nota}/5` : "Sem nota"}
            </span>
            <span className="text-tinta-3 font-num">{livroHover.paginas || 0} págs</span>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

