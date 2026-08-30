import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { atualizarProgresso } from "../../lib/api/livros.functions";
import { notificar } from "../../lib/toast";
import type { Livro } from "../../lib/livros";
import { obterConteudoLocal } from "../../lib/db-local";

type TemaLeitor = "claro" | "sepia" | "noturno";

export function LeitorDigital({
  livro,
  conteudoTexto,
}: {
  livro: Livro;
  conteudoTexto?: string;
}) {
  const navigate = useNavigate();
  const [tema, setTema] = useState<TemaLeitor>("sepia");
  const [tamanhoFonte, setTamanhoFonte] = useState<number>(18); // 16, 18, 20, 22px
  const [paginaAtual, setPaginaAtual] = useState<number>(livro.pagina_atual || 1);
  const [salvando, setSalvando] = useState<boolean>(false);
  const [sincronizado, setSincronizado] = useState<boolean>(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const [textoLocal, setTextoLocal] = useState<string | null>(null);
  const [carregandoLocal, setCarregandoLocal] = useState<boolean>(true);

  // Carrega o conteúdo textual do IndexedDB se existir
  useEffect(() => {
    async function carregar() {
      try {
        const txt = await obterConteudoLocal(livro.id);
        if (txt) {
          setTextoLocal(txt);
        }
      } catch (e) {
        console.error("Erro ao carregar texto local:", e);
      } finally {
        setCarregandoLocal(false);
      }
    }
    carregar();
  }, [livro.id]);

  // Calcula total de páginas estimadas ou usa o do livro
  const totalPaginas = Math.max(livro.paginas || 50, 1);
  const progresso = Math.min(100, Math.round((paginaAtual / totalPaginas) * 100));

  // Texto do livro (prioriza texto local/IndexedDB, depois carregado online/gutenberg, depois sinopse/conteudo salvo)
  const temTextoReal = Boolean(textoLocal || conteudoTexto || (livro.sinopse && livro.sinopse.length > 50));
  
  const textoBase =
    textoLocal ||
    conteudoTexto ||
    livro.sinopse ||
    `Sobre este Livro\n\n"${livro.titulo}" de ${livro.autor}.\n\nEste livro foi adicionado à sua estante pessoal no formato ${livro.formato || "Físico"}.\n\nVocê pode usar este leitor digital para acompanhar o número de páginas e sincronizar o marcador de leitura em tempo real com a sua estante. Para ler o texto completo diretamente na tela, adicione um dos clássicos abertos do Acervo ou faça o upload do seu arquivo EPUB/PDF.`;

  // Divide o texto em blocos de parágrafos para simular páginas
  const paragrafos = textoBase.split("\n\n").filter(Boolean);
  const paragrafosPorPagina = Math.max(1, Math.ceil(paragrafos.length / totalPaginas));
  const inicioIdx = ((paginaAtual - 1) * paragrafosPorPagina) % paragrafos.length;
  const textoPaginaAtual = paragrafos.slice(inicioIdx, inicioIdx + 3).join("\n\n") || paragrafos[0];

  // Sincroniza página atual com a estante via debounce
  function mudarPagina(novaPag: number) {
    if (novaPag < 1 || novaPag > totalPaginas) return;
    setPaginaAtual(novaPag);
    setSincronizado(false);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSalvando(true);
      try {
        await atualizarProgresso({ data: { id: livro.id, pagina_atual: novaPag } });
        setSincronizado(true);
        setTimeout(() => setSincronizado(false), 3000);
      } catch {
        // Silencioso
      } finally {
        setSalvando(false);
      }
    }, 600);
  }

  // Navegação por teclado
  useEffect(() => {
    function tratarTeclado(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") {
        e.preventDefault();
        mudarPagina(paginaAtual + 1);
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        mudarPagina(paginaAtual - 1);
      }
    }
    window.addEventListener("keydown", tratarTeclado);
    return () => window.removeEventListener("keydown", tratarTeclado);
  }, [paginaAtual, totalPaginas]);

  // Estilos de temas de leitura
  const temaStyles = {
    claro: "bg-[#fbf7ee] text-[#221d16] border-[#ece3cf]",
    sepia: "bg-[#f5efe1] text-[#2b221a] border-[#e8ddc9]",
    noturno: "bg-[#151218] text-[#e8dff0] border-[#2b2434]",
  };

  const papelCard = {
    claro: "bg-[#ffffff]/90 shadow-sm border-[#ede3d1]",
    sepia: "bg-[#fbf7ee]/95 shadow-md border-[#e5d8c0]",
    noturno: "bg-[#1e1924] shadow-md border-[#32293d]",
  };

  if (carregandoLocal) {
    return (
      <div className={`min-h-dvh flex items-center justify-center transition-colors duration-300 ${temaStyles[tema]} font-sans`}>
        <div className="text-center space-y-4">
          <div className="h-8 w-8 border-3 border-amora border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium opacity-80">Carregando conteúdo do livro...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-dvh transition-colors duration-300 ${temaStyles[tema]} flex flex-col font-serif`}>
      {/* Top Header do Leitor */}
      <header className="sticky top-0 z-40 border-b px-4 py-3 backdrop-blur-md flex items-center justify-between gap-4 border-inherit bg-inherit/90">
        <div className="flex items-center gap-3">
          <Link
            to="/livro/$livroId"
            params={{ livroId: String(livro.id) }}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-sans font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/10"
          >
            ← Voltar para a Estante
          </Link>
          <div className="hidden sm:block">
            <h1 className="text-sm font-semibold truncate max-w-xs">{livro.titulo}</h1>
            <p className="text-xs opacity-70 truncate font-sans">{livro.autor}</p>
          </div>
        </div>

        {/* Controles de Fonte e Tema */}
        <div className="flex items-center gap-3 font-sans">
          {/* Ajuste de Fonte */}
          <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 rounded-lg p-1 text-xs">
            <button
              onClick={() => setTamanhoFonte((f) => Math.max(14, f - 2))}
              className="h-6 w-6 rounded flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 font-bold"
              title="Diminuir fonte"
            >
              A-
            </button>
            <span className="px-1 font-num text-[11px]">{tamanhoFonte}px</span>
            <button
              onClick={() => setTamanhoFonte((f) => Math.min(26, f + 2))}
              className="h-6 w-6 rounded flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 font-bold"
              title="Aumentar fonte"
            >
              A+
            </button>
          </div>

          {/* Seletor de Tema */}
          <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 rounded-lg p-1 text-xs">
            <button
              onClick={() => setTema("claro")}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
                tema === "claro" ? "bg-white text-black shadow-xs" : "opacity-70 hover:opacity-100"
              }`}
            >
              Claro
            </button>
            <button
              onClick={() => setTema("sepia")}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
                tema === "sepia" ? "bg-[#eadecc] text-[#2b221a] shadow-xs" : "opacity-70 hover:opacity-100"
              }`}
            >
              Sépia
            </button>
            <button
              onClick={() => setTema("noturno")}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
                tema === "noturno" ? "bg-[#2c2436] text-white shadow-xs" : "opacity-70 hover:opacity-100"
              }`}
            >
              Noturno
            </button>
          </div>
        </div>
      </header>

      {/* Área Principal de Leitura */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 sm:py-12 flex flex-col justify-between">
        <article
          className={`rounded-2xl border p-6 sm:p-12 transition-all leading-relaxed ${papelCard[tema]}`}
          style={{ fontSize: `${tamanhoFonte}px`, lineHeight: 1.8 }}
        >
          <div className="font-display text-center text-sm uppercase tracking-widest opacity-60 mb-8 font-sans">
            Página {paginaAtual} de {totalPaginas}
          </div>

          <div className="whitespace-pre-line text-justify selection:bg-[#7a3b52]/20">
            {textoPaginaAtual}
          </div>
        </article>

        {/* Botões de navegação e ação */}
        <div className="mt-8 flex flex-col gap-4 font-sans">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => mudarPagina(paginaAtual - 1)}
              disabled={paginaAtual <= 1}
              className="rounded-xl border border-current/20 px-4 py-2.5 text-xs sm:text-sm font-medium transition-all hover:border-current/50 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            >
              ← Página anterior
            </button>

            <div className="text-center font-num text-xs opacity-75">
              <span>{progresso}% lido</span>
              {salvando && <span className="ml-2 text-xs animate-pulse">• salvando...</span>}
              {sincronizado && <span className="ml-2 text-xs text-emerald-600 dark:text-emerald-400">✓ Sincronizado</span>}
            </div>

            {paginaAtual < totalPaginas ? (
              <button
                onClick={() => mudarPagina(paginaAtual + 1)}
                className="rounded-xl bg-[#7a3b52] text-white px-5 py-2.5 text-xs sm:text-sm font-medium transition-all hover:bg-[#5e2c3f] shadow-xs cursor-pointer"
              >
                Próxima página →
              </button>
            ) : (
              <Link
                to="/livro/$livroId"
                params={{ livroId: String(livro.id) }}
                search={{ concluir: true }}
                className="rounded-xl bg-emerald-700 text-white px-5 py-2.5 text-xs sm:text-sm font-medium transition-all hover:bg-emerald-800 shadow-md cursor-pointer inline-flex items-center gap-1.5"
              >
                <span>Concluir Livro</span>
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </Link>
            )}
          </div>
        </div>
      </main>

      {/* Barra Inferior com Fita de Progresso */}
      <footer className="sticky bottom-0 border-t px-4 py-2.5 backdrop-blur-md flex items-center justify-between text-xs font-sans border-inherit bg-inherit/90">
        <div className="flex items-center gap-2">
          <span className="font-num">Página {paginaAtual} / {totalPaginas}</span>
        </div>
        <div className="flex-1 mx-4 max-w-xs">
          <div className="h-1.5 w-full rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-[#7a3b52] transition-all duration-300"
              style={{ width: `${progresso}%` }}
            />
          </div>
        </div>
        <div className="flex items-center gap-1 text-[11px] opacity-70">
          <svg viewBox="0 0 24 24" className="h-3 w-3 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>Sincronização ativa</span>
        </div>
      </footer>
    </div>
  );
}
