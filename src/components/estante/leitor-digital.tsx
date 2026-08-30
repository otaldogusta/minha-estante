import { useState, useEffect, useRef, useMemo } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { atualizarProgresso } from "../../lib/api/livros.functions";
import { notificar } from "../../lib/toast";
import type { Livro } from "../../lib/livros";
import { obterConteudoLocal, salvarConteudoLocal } from "../../lib/db-local";
import { extrairDadosDeArquivo } from "../../lib/file-parser";

type TemaLeitor = "claro" | "sepia" | "noturno";

function paginarTexto(texto: string, limite = 1200): { paginas: string[], mapeamento: { [path: string]: number } } {
  const mapeamento: { [path: string]: number } = {};
  if (texto.startsWith("[") && texto.endsWith("]")) {
    try {
      const fileGroups = JSON.parse(texto);
      if (Array.isArray(fileGroups)) {
        const paginas: string[] = [];
        
        // Verifica se é o formato estruturado [{ path, blocks }]
        const isNewFormat = typeof fileGroups[0] === "object" && fileGroups[0] !== null && "blocks" in fileGroups[0];
        
        if (isNewFormat) {
          for (const groupObj of fileGroups) {
            const path = groupObj.path || "";
            const group = groupObj.blocks || [];
            
            // Registra o mapeamento para o arquivo atual
            const fileKey = path.toLowerCase();
            const fileNameOnly = path.split("/").pop()?.toLowerCase() || "";
            
            mapeamento[fileKey] = paginas.length;
            mapeamento[fileNameOnly] = paginas.length;

            let paginaAtual: string[] = [];
            let lengthAtual = 0;
            
            for (const block of group) {
              let peso = 0;
              if (block.includes("<img")) {
                peso = 400;
              } else {
                peso = block.replace(/<[^>]*>/g, "").length;
              }
              
              if (paginaAtual.length > 0 && (lengthAtual + peso) > limite) {
                paginas.push(paginaAtual.join("\n"));
                paginaAtual = [block];
                lengthAtual = peso;
              } else {
                paginaAtual.push(block);
                lengthAtual += peso;
              }
            }
            if (paginaAtual.length > 0) {
              paginas.push(paginaAtual.join("\n"));
            }
          }
          return { paginas: paginas.filter(Boolean), mapeamento };
        }

        // Formato legado: string[][] ou string[]
        const isGroupedByFile = Array.isArray(fileGroups[0]);
        const groups = isGroupedByFile ? fileGroups : [fileGroups];
        
        for (const group of groups) {
          if (!Array.isArray(group)) continue;
          
          let paginaAtual: string[] = [];
          let lengthAtual = 0;
          
          for (const block of group) {
            let peso = 0;
            if (block.includes("<img")) {
              peso = 400;
            } else {
              peso = block.replace(/<[^>]*>/g, "").length;
            }
            
            if (paginaAtual.length > 0 && (lengthAtual + peso) > limite) {
              paginas.push(paginaAtual.join("\n"));
              paginaAtual = [block];
              lengthAtual = peso;
            } else {
              paginaAtual.push(block);
              lengthAtual += peso;
            }
          }
          if (paginaAtual.length > 0) {
            paginas.push(paginaAtual.join("\n"));
          }
        }
        return { paginas: paginas.filter(Boolean), mapeamento };
      }
    } catch (e) {
      console.error("Erro ao paginar blocos JSON:", e);
    }
  }

  // Fallback para texto plano
  const paragrafos = texto.split("\n\n").filter(Boolean);
  const paragrafosAgrupados: string[] = [];
  let acumulado = "";

  for (const para of paragrafos) {
    const p = para.trim();
    if (!p) continue;
    
    if (acumulado) {
      acumulado += "\n\n" + p;
      if (acumulado.length > 150) {
        paragrafosAgrupados.push(acumulado);
        acumulado = "";
      }
    } else if (p.length < 80) {
      acumulado = p;
    } else {
      paragrafosAgrupados.push(p);
    }
  }
  if (acumulado) {
    paragrafosAgrupados.push(acumulado);
  }

  const paginas: string[] = [];
  let paginaAtual = "";
  
  for (const para of paragrafosAgrupados) {
    if ((paginaAtual + "\n\n" + para).length > limite) {
      if (paginaAtual) {
        paginas.push(paginaAtual);
        paginaAtual = para;
      } else {
        const frases = para.split(". ");
        let subPagina = "";
        for (const frase of frases) {
          const fraseFormatada = frase.trim() + (frase.endsWith(".") ? "" : ".");
          if ((subPagina + " " + fraseFormatada).length > limite) {
            if (subPagina) {
              paginas.push(subPagina.trim());
              subPagina = fraseFormatada;
            } else {
              paginas.push(fraseFormatada);
              subPagina = "";
            }
          } else {
            subPagina = subPagina ? subPagina + " " + fraseFormatada : fraseFormatada;
          }
        }
        if (subPagina) {
          paginaAtual = subPagina;
        }
      }
    } else {
      if (paginaAtual) {
        paginaAtual += "\n\n" + para;
      } else {
        paginaAtual = para;
      }
    }
  }
  
  if (paginaAtual) {
    paginas.push(paginaAtual);
  }
  
  return { paginas: paginas.filter(Boolean), mapeamento };
}

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

  const [processandoArquivoLocal, setProcessandoArquivoLocal] = useState<boolean>(false);

  // Manipulador para carregar o arquivo localmente caso o leitor mude de dispositivo
  async function handleFileSelectLocal(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || !e.target.files[0]) return;
    setProcessandoArquivoLocal(true);
    try {
      notificar("Lendo e extraindo conteúdo do arquivo...", "info");
      const { texto } = await extrairDadosDeArquivo(e.target.files[0]);
      await salvarConteudoLocal(livro.id, texto);
      setTextoLocal(texto);
      notificar("Conteúdo do livro importado com sucesso neste dispositivo!", "sucesso");
    } catch (err: any) {
      console.error(err);
      notificar(err.message || "Erro ao processar o arquivo", "erro");
    } finally {
      setProcessandoArquivoLocal(false);
    }
  }

  // Limite dinâmico de caracteres por página com base no tamanho da fonte selecionada
  // Isso garante que o texto de cada página caiba perfeitamente no celular sem rolar verticalmente!
  const limiteCaracteres = useMemo(() => Math.max(300, 1600 - tamanhoFonte * 35), [tamanhoFonte]);

  const temCapa = Boolean(livro.capa);
  const eLivroImportado = ["PDF", "EPUB", "TXT"].includes(livro.formato?.toUpperCase() || "");
  const precisaCarregarArquivo = eLivroImportado && !textoLocal && !carregandoLocal;

  const textoBase =
    textoLocal ||
    conteudoTexto ||
    livro.sinopse ||
    `Sobre este Livro\n\n"${livro.titulo}" de ${livro.autor}.\n\nEste livro foi adicionado à sua estante pessoal no formato ${livro.formato || "Físico"}.\n\nVocê pode usar este leitor digital para acompanhar o número de páginas e sincronizar o marcador de leitura em tempo real com a sua estante. Para ler o texto completo diretamente na tela, adicione um dos clássicos abertos do Acervo ou faça o upload do seu arquivo EPUB/PDF.`;

  // Divide o texto em páginas perfeitamente calculadas por tamanho
  const paginationResult = useMemo(() => paginarTexto(textoBase, limiteCaracteres), [textoBase, limiteCaracteres]);
  const paginasTexto = paginationResult.paginas;
  const mapeamentoPaginas = paginationResult.mapeamento;
  const totalPaginasTexto = paginasTexto.length;
  
  const totalPaginas = totalPaginasTexto + (temCapa ? 1 : 0);
  const progresso = totalPaginas > 0 && !isNaN(totalPaginas)
    ? Math.min(100, Math.round((paginaAtual / totalPaginas) * 100))
    : 0;

  // Se tem capa, a página 1 exibe a capa. As páginas de texto começam na página 2.
  const exibindoCapa = temCapa && paginaAtual === 1;
  const paginaTextoEfetiva = temCapa ? paginaAtual - 1 : paginaAtual;

  const textoPaginaAtual = exibindoCapa
    ? ""
    : (paginasTexto[paginaTextoEfetiva - 1] || paginasTexto[0] || "");

  // Gestos de deslizar (swipe) para mudar de página em dispositivos móveis
  const touchStartX = useRef<number | null>(null);

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const diffX = touchStartX.current - e.changedTouches[0].clientX;
    touchStartX.current = null;

    if (Math.abs(diffX) > 50) {
      if (diffX > 0) {
        mudarPagina(paginaAtual + 1);
      } else {
        mudarPagina(paginaAtual - 1);
      }
    }
  }

  const [mostrarControles, setMostrarControles] = useState<boolean>(true);

  // Exibe onboarding sobre toque/arraste uma única vez por sessão
  useEffect(() => {
    const dicaMostrada = sessionStorage.getItem("dica-leitor-readera");
    if (!dicaMostrada) {
      const timer = setTimeout(() => {
        notificar("💡 Toque nas laterais para mudar de página e no centro para ocultar os menus!", "info");
        sessionStorage.setItem("dica-leitor-readera", "true");
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  // Toque nas laterais muda página, no centro oculta menus (estilo Kindle/ReadEra)
  function handleCardClick(e: React.MouseEvent<HTMLElement>) {
    const selecao = window.getSelection();
    if (selecao && selecao.toString().trim() !== "") return;
    if ((e.target as HTMLElement).closest("button, a, input, label")) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const largura = rect.width;

    if (x < largura * 0.22) {
      // Margem esquerda (22%): página anterior
      mudarPagina(paginaAtual - 1);
    } else if (x > largura * 0.78) {
      // Margem direita (22%): próxima página
      mudarPagina(paginaAtual + 1);
    } else {
      // Centro (56%): alterna menus
      setMostrarControles((prev) => !prev);
    }
  }

  // Intercepta e resolve links internos (ex: "#anchor" ou "caminho/arquivo.xhtml")
  function handleInternalLink(href: string) {
    const cleanHref = href.trim();
    if (!cleanHref) return;

    const [filePath, anchor] = cleanHref.split("#");
    let targetPageIndex: number | undefined = undefined;

    if (filePath) {
      const fileKey = filePath.toLowerCase();
      const fileNameOnly = filePath.split("/").pop()?.toLowerCase() || "";
      
      if (mapeamentoPaginas[fileKey] !== undefined) {
        targetPageIndex = mapeamentoPaginas[fileKey];
      } else if (mapeamentoPaginas[fileNameOnly] !== undefined) {
        targetPageIndex = mapeamentoPaginas[fileNameOnly];
      }
    } else if (anchor) {
      // Âncora local (ex: href="#capitulo-1")
      const anchorRegex = new RegExp(`id=["']${anchor}["']|name=["']${anchor}["']`, "i");
      const foundIndex = paginasTexto.findIndex(pagHtml => anchorRegex.test(pagHtml));
      if (foundIndex !== -1) {
        targetPageIndex = foundIndex;
      }
    }

    if (targetPageIndex !== undefined) {
      const targetPageNumber = targetPageIndex + 1 + (temCapa ? 1 : 0);
      mudarPagina(targetPageNumber);
      
      // Caso haja âncora, rola até o elemento após renderização da página
      if (anchor) {
        setTimeout(() => {
          const el = document.getElementById(anchor) || document.getElementsByName(anchor)[0];
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 150);
      }
    } else {
      console.warn("Link interno não pôde ser mapeado para página:", href);
      notificar("Seção do livro não encontrada ou indisponível", "erro");
    }
  }

  // Interceptador de clique do container dangerouslySetInnerHTML
  function handleContentClick(e: React.MouseEvent<HTMLDivElement>) {
    const target = e.target as HTMLElement;
    const anchor = target.closest("a");
    if (!anchor) return;

    const href = anchor.getAttribute("href");
    if (!href) return;

    // Links externos exibem um aviso confirmando a saída do aplicativo
    if (href.startsWith("http://") || href.startsWith("https://") || href.startsWith("mailto:") || href.startsWith("tel:")) {
      e.preventDefault();
      e.stopPropagation();
      const confirmado = window.confirm(
        `Você está saindo do aplicativo Minha Estante para acessar o link:\n\n${href}\n\nDeseja continuar?`
      );
      if (confirmado) {
        window.open(href, "_blank", "noopener,noreferrer");
      }
      return;
    }

    // Links internos são interceptados para navegação interna
    e.preventDefault();
    e.stopPropagation();
    handleInternalLink(href);
  }

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
      <div className={`h-dvh flex items-center justify-center transition-colors duration-300 ${temaStyles[tema]} font-sans overflow-hidden`}>
        <div className="text-center space-y-4">
          <div className="h-8 w-8 border-3 border-amora border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium opacity-80">Carregando conteúdo do livro...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-dvh transition-colors duration-300 ${temaStyles[tema]} flex flex-col font-serif overflow-hidden`}>
      {/* Top Header do Leitor */}
      <header className={`sticky top-0 z-40 border-b px-4 py-3 backdrop-blur-md flex items-center justify-between gap-4 border-inherit bg-inherit/90 transition-all duration-300 ${
        mostrarControles ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full pointer-events-none"
      }`}>
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
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-4 sm:py-6 flex flex-col justify-between overflow-hidden">
        <article
          onClick={handleCardClick}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className={`rounded-2xl border p-6 sm:p-10 transition-all duration-300 leading-relaxed ${papelCard[tema]} cursor-default flex-1 min-h-0 flex flex-col overflow-hidden select-none active:scale-[0.99]`}
          style={{ fontSize: `${tamanhoFonte}px`, lineHeight: 1.8 }}
        >
          <style>{`
            .leitor-img {
              max-width: 100%;
              max-height: 320px;
              object-fit: contain;
              margin: 8px auto;
              display: block;
              border-radius: 8px;
            }
            ${tema === "noturno" ? `
              .leitor-img {
                mix-blend-mode: normal !important;
              }
              img {
                filter: brightness(0.78) contrast(1.12) !important;
                transition: filter 0.3s ease;
              }
            ` : `
              .leitor-img {
                mix-blend-mode: multiply !important;
              }
            `}
          `}</style>

          {!exibindoCapa && (
            <div className="font-display text-center text-sm uppercase tracking-widest opacity-60 mb-6 font-sans">
              Página {paginaAtual} de {totalPaginas}
            </div>
          )}

          <div className={`text-justify selection:bg-[#7a3b52]/20 flex-1 overflow-y-auto pr-1 min-h-0 flex flex-col justify-start ${
            !exibindoCapa && !precisaCarregarArquivo && (textoPaginaAtual || "").trim().startsWith("<") ? "" : "whitespace-pre-line"
          }`}>
            {precisaCarregarArquivo ? (
              <div className="flex-1 flex flex-col items-center justify-center py-8 text-center max-w-md mx-auto space-y-6 font-sans">
                <div className="h-16 w-16 bg-amora/10 text-amora rounded-full flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-tinta">Texto não carregado neste dispositivo</h3>
                  <p className="text-xs text-tinta-2 leading-relaxed">
                    Você adicionou este livro a partir de outro dispositivo. Como os seus livros são processados e armazenados localmente no navegador por velocidade e privacidade, você precisa selecionar o arquivo do livro (<strong>EPUB, PDF ou TXT</strong>) uma única vez neste celular ou computador para começar a ler aqui.
                  </p>
                </div>
                
                <label className="inline-flex items-center gap-2 rounded-xl bg-[#7a3b52] hover:bg-[#5e2c3f] text-white font-semibold text-xs px-5 py-3 shadow-md cursor-pointer transition-colors active:scale-98">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  <span>{processandoArquivoLocal ? "Lendo arquivo..." : "Selecionar Arquivo do Livro"}</span>
                  <input
                    type="file"
                    accept=".epub,.pdf,.txt"
                    onChange={handleFileSelectLocal}
                    disabled={processandoArquivoLocal}
                    className="hidden"
                  />
                </label>
              </div>
            ) : exibindoCapa ? (
              <div className="flex-1 flex items-center justify-center w-full h-full min-h-0 py-2">
                <img
                  src={livro.capa!}
                  alt={`Capa de ${livro.titulo}`}
                  className="w-full h-full max-h-full object-contain transition-transform duration-300 hover:scale-[1.01]"
                />
              </div>
            ) : (textoPaginaAtual || "").trim().startsWith("<") ? (
              <div 
                dangerouslySetInnerHTML={{ __html: textoPaginaAtual }} 
                onClick={handleContentClick}
                className="w-full flex-1 flex flex-col justify-start"
              />
            ) : (
              textoPaginaAtual
            )}
          </div>
        </article>

        {/* Botões de navegação e ação */}
        <div className={`mt-4 sm:mt-6 flex-shrink-0 flex flex-col gap-4 font-sans transition-all duration-300 ${
          mostrarControles ? "opacity-100 max-h-40 translate-y-0" : "opacity-0 max-h-0 translate-y-4 overflow-hidden pointer-events-none mt-0"
        }`}>
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
      <footer className={`sticky bottom-0 border-t px-4 py-3 backdrop-blur-md flex items-center justify-center border-inherit bg-inherit/90 transition-all duration-300 ${
        mostrarControles ? "translate-y-0 opacity-100" : "translate-y-1 opacity-80 border-t-transparent bg-transparent"
      }`}>
        <div className="w-full max-w-md px-4">
          <div className="h-1.5 w-full rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-[#7a3b52] transition-all duration-300"
              style={{ width: `${progresso}%` }}
            />
          </div>
        </div>
      </footer>
    </div>
  );
}
