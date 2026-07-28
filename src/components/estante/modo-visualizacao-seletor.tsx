import React from "react";

export type ModoVisualizacao = "capas" | "estante" | "lista";

interface ModoVisualizacaoSeletorProps {
  modo: ModoVisualizacao;
  onChange: (modo: ModoVisualizacao) => void;
}

export function ModoVisualizacaoSeletor({ modo, onChange }: ModoVisualizacaoSeletorProps) {
  return (
    <div className="inline-flex items-center gap-1 rounded-xl border border-papel-3/80 bg-papel-2/80 p-1 backdrop-blur-md shadow-xs">
      <button
        type="button"
        onClick={() => onChange("capas")}
        className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
          modo === "capas"
            ? "bg-amora text-papel shadow-xs"
            : "text-tinta-2 hover:bg-papel-3/60 hover:text-tinta"
        }`}
        title="Visualização em Grade de Capas"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
        <span>Capas</span>
      </button>

      <button
        type="button"
        onClick={() => onChange("estante")}
        className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
          modo === "estante"
            ? "bg-amora text-papel shadow-xs"
            : "text-tinta-2 hover:bg-papel-3/60 hover:text-tinta"
        }`}
        title="Visualização em Estante Física Realista"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span>Estante</span>
      </button>

      <button
        type="button"
        onClick={() => onChange("lista")}
        className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
          modo === "lista"
            ? "bg-amora text-papel shadow-xs"
            : "text-tinta-2 hover:bg-papel-3/60 hover:text-tinta"
        }`}
        title="Visualização em Lista Compacta"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <span>Lista</span>
      </button>
    </div>
  );
}
