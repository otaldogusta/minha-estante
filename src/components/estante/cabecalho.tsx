import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

import { contarCartasNovas } from "../../lib/api/cartas.functions";

// CTA primário "Adicionar livro": pill amora com o "+" que gira ao hover.
export function BotaoAdicionar() {
  return (
    <Link
      to="/novo"
      className="group spring-bounce inline-flex h-8 items-center justify-center gap-1.5 rounded-full bg-amora px-2.5 sm:px-4 text-xs sm:text-sm font-medium text-papel shadow-[0_4px_14px_-4px_rgba(122,59,82,0.55)] hover:bg-amora-escura hover:shadow-[0_6px_18px_-4px_rgba(122,59,82,0.65)] shrink-0 cursor-pointer"
      title="Adicionar livro"
    >
      <span
        aria-hidden
        className="inline-flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-white/20 text-sm sm:text-base leading-none transition-transform duration-350 motion-safe:group-hover:rotate-90"
      >
        +
      </span>
      <span className="hidden sm:inline">Adicionar livro</span>
    </Link>
  );
}

let posScrollCabecalhoGlobal = 0;

export function Cabecalho({
  paginaAtiva,
}: {
  paginaAtiva?: "estante" | "retrospectiva" | "cartas" | "leitores" | "conta";
}) {
  const [novas, setNovas] = useState(0);
  const [tema, setTema] = useState<"light" | "dark">("light");
  const navRef = useRef<HTMLElement>(null);

  // Restaurar posição de scroll ao trocar de página sem resetar
  useEffect(() => {
    if (navRef.current && posScrollCabecalhoGlobal > 0) {
      navRef.current.scrollLeft = posScrollCabecalhoGlobal;
    }
  }, []);

  const salvarScroll = () => {
    if (navRef.current) {
      posScrollCabecalhoGlobal = navRef.current.scrollLeft;
    }
  };

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

  // Deslizar suavemente apenas se a aba ativa estiver cortada nas bordas
  useEffect(() => {
    if (!navRef.current) return;
    const container = navRef.current;
    const activeEl = container.querySelector<HTMLElement>("[data-active='true']");
    if (!activeEl) return;

    const elLeft = activeEl.offsetLeft;
    const elWidth = activeEl.offsetWidth;
    const containerWidth = container.clientWidth;
    const containerScrollLeft = container.scrollLeft;

    const elRight = elLeft + elWidth;
    const containerScrollRight = containerScrollLeft + containerWidth;
    const padding = 12;

    let targetLeft = containerScrollLeft;

    if (elLeft - padding < containerScrollLeft) {
      targetLeft = Math.max(0, elLeft - padding);
    } else if (elRight + padding > containerScrollRight) {
      targetLeft = elRight + padding - containerWidth;
    } else {
      return;
    }

    container.scrollTo({
      left: Math.max(0, targetLeft),
      behavior: "smooth",
    });
  }, [paginaAtiva]);

  function alternarTema() {
    const novoTema = tema === "light" ? "dark" : "light";
    setTema(novoTema);
    localStorage.setItem("minha-estante-theme", novoTema);
    document.documentElement.setAttribute("data-theme", novoTema);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-papel-3/45 bg-papel/85 backdrop-blur-lg shadow-xs">
      <div className="mx-auto flex h-14 sm:h-16 max-w-6xl items-center justify-between gap-1 px-2 sm:gap-3 sm:px-6">
        
        {/* Esquerda: Logo Minha Estante */}
        <Link to="/" className="flex items-center gap-1.5 shrink-0" title="Minha Estante - Página Inicial">
          <span aria-hidden className="inline-flex gap-[2.5px]">
            <span className="inline-block h-4.5 w-[4px] sm:h-5 sm:w-[5px] rounded-sm bg-amora" />
            <span className="inline-block h-3.5 w-[4px] sm:h-4 sm:w-[5px] translate-y-1 rounded-sm bg-tinta-2" />
            <span className="inline-block h-4.5 w-[4px] sm:h-5 sm:w-[5px] rounded-sm bg-tinta" />
          </span>
          <span className="hidden md:inline font-display text-lg sm:text-xl font-semibold tracking-tight text-tinta">
            Minha Estante
          </span>
        </Link>

        {/* Centro: Abas de Navegação (Scroll horizontal suave sem corte nem pulo) */}
        <nav
          ref={navRef}
          onScroll={salvarScroll}
          className="flex-1 min-w-0 mx-1 sm:mx-3 flex items-center justify-start sm:justify-center overflow-x-auto no-scrollbar py-1.5 scroll-smooth"
        >
          <div className="flex items-center gap-0.5 sm:gap-1.5 whitespace-nowrap">
            <Link
              to="/"
              data-active={paginaAtiva === "estante"}
              className={`shrink-0 transition-colors duration-200 rounded-full px-2.5 py-1 text-xs sm:px-3 sm:py-1.5 sm:text-sm cursor-pointer ${
                paginaAtiva === "estante"
                  ? "font-semibold text-amora bg-amora-clara/65 shadow-xs"
                  : "text-tinta-2 hover:bg-papel-2/70 hover:text-tinta"
              }`}
            >
              Estante
            </Link>
            <Link
              to="/retrospectiva/$ano"
              params={{ ano: String(new Date().getFullYear()) }}
              data-active={paginaAtiva === "retrospectiva"}
              className={`shrink-0 transition-colors duration-200 rounded-full px-2.5 py-1 text-xs sm:px-3 sm:py-1.5 sm:text-sm cursor-pointer ${
                paginaAtiva === "retrospectiva"
                  ? "font-semibold text-amora bg-amora-clara/65 shadow-xs"
                  : "text-tinta-2 hover:bg-papel-2/70 hover:text-tinta"
              }`}
            >
              <span className="sm:hidden">Retro</span>
              <span className="hidden sm:inline">Retrospectiva</span>
            </Link>
            <Link
              to="/cartas"
              aria-label="Cartas"
              data-active={paginaAtiva === "cartas"}
              className={`shrink-0 transition-colors duration-200 relative rounded-full px-2.5 py-1 text-xs sm:px-3 sm:py-1.5 sm:text-sm cursor-pointer ${
                paginaAtiva === "cartas"
                  ? "font-semibold text-amora bg-amora-clara/65 shadow-xs"
                  : "text-tinta-2 hover:bg-papel-2/70 hover:text-tinta"
              }`}
            >
              Cartas
              {novas > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-amora px-1 font-num text-[9px] font-bold text-papel">
                  {novas}
                </span>
              )}
            </Link>
            <Link
              to="/leitores"
              data-active={paginaAtiva === "leitores"}
              className={`shrink-0 transition-colors duration-200 rounded-full px-2.5 py-1 text-xs sm:px-3 sm:py-1.5 sm:text-sm cursor-pointer ${
                paginaAtiva === "leitores"
                  ? "font-semibold text-amora bg-amora-clara/65 shadow-xs"
                  : "text-tinta-2 hover:bg-papel-2/70 hover:text-tinta"
              }`}
            >
              Leitores
            </Link>
          </div>
        </nav>

        {/* Direita: ( Modo claro/escuro - Perfil - + Add ) */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
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
            className={`spring-bounce inline-flex h-8 w-8 items-center justify-center rounded-full border text-tinta-2 shrink-0 cursor-pointer ${
              paginaAtiva === "conta"
                ? "border-amora text-amora bg-amora-clara/65"
                : "border-papel-3 hover:border-amora hover:text-amora hover:bg-papel-2/50"
            }`}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
              <circle cx="12" cy="8" r="3.4" />
              <path d="M4.5 19.5c1.6-3.2 4.3-4.6 7.5-4.6s5.9 1.4 7.5 4.6" strokeLinecap="round" />
            </svg>
          </Link>

          <div className="shrink-0">
            <BotaoAdicionar />
          </div>
        </div>

      </div>
    </header>
  );
}
