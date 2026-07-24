import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { contarCartasNovas } from "../../lib/api/cartas.functions";

// CTA primário "Adicionar livro": pill amora com o "+" que gira ao hover.
export function BotaoAdicionar() {
  return (
    <Link
      to="/novo"
      className="group spring-bounce inline-flex items-center gap-2 rounded-full bg-amora py-1.5 px-2.5 sm:py-2 sm:pl-4 sm:pr-5 text-xs sm:text-sm font-medium text-papel shadow-[0_4px_14px_-4px_rgba(122,59,82,0.55)] hover:bg-amora-escura hover:shadow-[0_6px_18px_-4px_rgba(122,59,82,0.65)]"
    >
      <span
        aria-hidden
        className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-base leading-none transition-transform duration-350 motion-safe:group-hover:rotate-90"
      >
        +
      </span>
      <span className="hidden sm:inline">Adicionar livro</span>
    </Link>
  );
}

export function Cabecalho({
  paginaAtiva,
}: {
  paginaAtiva?: "estante" | "retrospectiva" | "cartas" | "leitores" | "conta";
}) {
  const [novas, setNovas] = useState(0);
  const [tema, setTema] = useState<"light" | "dark">("light");

  useEffect(() => {
    let ativo = true;
    contarCartasNovas()
      .then((r) => {
        if (ativo) setNovas(r.novas);
      })
      .catch(() => {});

    // Ler tema inicial
    const t = (localStorage.getItem("minha-estante-theme") as "light" | "dark") || "light";
    setTema(t);

    return () => {
      ativo = false;
    };
  }, []);

  function alternarTema() {
    const novoTema = tema === "light" ? "dark" : "light";
    setTema(novoTema);
    localStorage.setItem("minha-estante-theme", novoTema);
    document.documentElement.setAttribute("data-theme", novoTema);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-papel-3/45 bg-papel/75 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-3 sm:gap-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 spring-bounce shrink-0">
          <span aria-hidden className="inline-flex gap-[3px]">
            <span className="inline-block h-5 w-[5px] rounded-sm bg-amora" />
            <span className="inline-block h-4 w-[5px] translate-y-1 rounded-sm bg-tinta-2" />
            <span className="inline-block h-5 w-[5px] rounded-sm bg-tinta" />
          </span>
          <span className="hidden xs:inline sm:inline font-display text-lg sm:text-xl font-semibold tracking-tight text-tinta">Minha Estante</span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto overflow-y-hidden no-scrollbar py-1 sm:overflow-visible">
          <Link
            to="/"
            className={`spring-bounce rounded-full px-2.5 py-1 text-xs sm:px-3 sm:py-1.5 sm:text-sm shrink-0 ${
              paginaAtiva === "estante" 
                ? "font-semibold text-amora bg-amora-clara/60" 
                : "text-tinta-2 hover:bg-papel-2/70 hover:text-tinta"
            }`}
          >
            Estante
          </Link>
          <Link
            to="/retrospectiva/$ano"
            params={{ ano: String(new Date().getFullYear()) }}
            className={`spring-bounce rounded-full px-2.5 py-1 text-xs sm:px-3 sm:py-1.5 sm:text-sm shrink-0 ${
              paginaAtiva === "retrospectiva" 
                ? "font-semibold text-amora bg-amora-clara/60" 
                : "text-tinta-2 hover:bg-papel-2/70 hover:text-tinta"
            }`}
          >
            Retrospectiva
          </Link>
          <Link
            to="/cartas"
            aria-label="Cartas"
            className={`relative spring-bounce rounded-full px-2.5 py-1 text-xs sm:px-3 sm:py-1.5 sm:text-sm shrink-0 ${
              paginaAtiva === "cartas" 
                ? "font-semibold text-amora bg-amora-clara/60" 
                : "text-tinta-2 hover:bg-papel-2/70 hover:text-tinta"
            }`}
          >
            Cartas
            {novas > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amora px-1 font-num text-[10px] font-bold text-papel">
                {novas}
              </span>
            )}
          </Link>
          <Link
            to="/leitores"
            className={`spring-bounce rounded-full px-2.5 py-1 text-xs sm:px-3 sm:py-1.5 sm:text-sm shrink-0 ${
              paginaAtiva === "leitores" 
                ? "font-semibold text-amora bg-amora-clara/60" 
                : "text-tinta-2 hover:bg-papel-2/70 hover:text-tinta"
            }`}
          >
            Leitores
          </Link>

          {/* Alternador de Tema */}
          <button
            onClick={alternarTema}
            className="spring-bounce inline-flex h-8 w-8 items-center justify-center rounded-full border border-papel-3 text-tinta-2 hover:border-amora hover:text-amora hover:bg-papel-2/50 cursor-pointer shrink-0"
            title={tema === "light" ? "Mudar para Modo Noturno" : "Mudar para Modo Claro"}
          >
            {tema === "light" ? (
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" strokeLinecap="round" />
              </svg>
            )}
          </button>

          <Link
            to="/conta"
            aria-label="Minha conta"
            title="Minha conta"
            className={`spring-bounce inline-flex h-8 w-8 items-center justify-center rounded-full border text-tinta-2 shrink-0 ${
              paginaAtiva === "conta" 
                ? "border-amora text-amora bg-amora-clara/60" 
                : "border-papel-3 hover:border-amora hover:text-amora hover:bg-papel-2/50"
            }`}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
              <circle cx="12" cy="8" r="3.4" />
              <path d="M4.5 19.5c1.6-3.2 4.3-4.6 7.5-4.6s5.9 1.4 7.5 4.6" strokeLinecap="round" />
            </svg>
          </Link>
          <div className="ml-1 sm:ml-2 shrink-0">
            <BotaoAdicionar />
          </div>
        </nav>
      </div>
    </header>
  );
}
