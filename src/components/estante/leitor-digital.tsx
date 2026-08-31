import { useState, useEffect, useRef, useMemo } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { atualizarProgresso } from "../../lib/api/livros.functions";
import { notificar } from "../../lib/toast";
import type { Livro } from "../../lib/livros";
import { obterConteudoLocal, salvarConteudoLocal } from "../../lib/db-local";
import { extrairDadosDeArquivo } from "../../lib/file-parser";
import {
  criarSalaLeitura,
  obterSalaLeitura,
  obterSalaAtivaDoLivro,
  entrarSalaLeitura,
  sairSalaLeitura,
  sincronizarPaginaHost,
  marcarPaginaPronta,
  enviarReacao,
  encerrarSala,
  type SalaLeituraDetalhes,
} from "../../lib/api/sala-leitura.functions";
import { SalaLeituraBar } from "./sala-leitura-bar";
import { ReacoesFlutuantesContainer, dispararEfeitoReacao } from "./reacoes-flutuantes";

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

  // Estado da Sala de Leitura Coletiva (Modo Cineminha)
  const [codigoSala, setCodigoSala] = useState<string | null>(null);
  const [dadosSala, setDadosSala] = useState<SalaLeituraDetalhes | null>(null);
  const [modalSalaAberto, setModalSalaAberto] = useState(false);
  const [criandoSala, setCriandoSala] = useState(false);
  const [salaAtivaDoLivro, setSalaAtivaDoLivro] = useState<{ temSala: boolean; codigo?: string; hostNome?: string; livroTitulo?: string } | null>(null);
  const ultimaReacaoProcessadaRef = useRef<string | null>(null);

  // Verifica se há alguma sala ativa para este livro
  useEffect(() => {
    let montado = true;
    async function checarSalaAtiva() {
      try {
        const res = await obterSalaAtivaDoLivro({ data: { livroId: livro.id } });
        if (montado && res && res.temSala) {
          setSalaAtivaDoLivro(res);
        } else if (montado && !res?.temSala) {
          setSalaAtivaDoLivro(null);
        }
      } catch {}
    }
    checarSalaAtiva();
    const intv = setInterval(checarSalaAtiva, 8000);
    return () => {
      montado = false;
      clearInterval(intv);
    };
  }, [livro.id]);

  // Polling e sincronização contínua da sala
  useEffect(() => {
    if (!codigoSala) return;

    let cancelado = false;

    async function sincronizar() {
      try {
        const res = await obterSalaLeitura({ data: { codigo: codigoSala! } });
        if (cancelado) return;

        if (!res || res.status === "encerrada") {
          notificar("A sala de leitura coletiva foi encerrada.", "info");
          setCodigoSala(null);
          setDadosSala(null);
          return;
        }

        setDadosSala(res);

        // Se NÃO for o host, segue a página oficial da sala definida pelo host
        if (!res.souHost && res.paginaAtual !== paginaAtual) {
          setPaginaAtual(res.paginaAtual);
        }

        // Verifica novas reações ao vivo dos outros participantes e emite para o Canvas
        for (const p of res.participantes) {
          if (p.reacao && p.reacaoEm) {
            const reacaoKey = `${p.usuarioId}-${p.reacao}-${p.reacaoEm}`;
            if (ultimaReacaoProcessadaRef.current !== reacaoKey) {
              ultimaReacaoProcessadaRef.current = reacaoKey;
              dispararEfeitoReacao(p.reacao, p.nome);
            }
          }
        }
      } catch {}
    }

    sincronizar();
    const interval = setInterval(sincronizar, 1500); // 1.5s para resposta ágil
    return () => {
      cancelado = true;
      clearInterval(interval);
    };
  }, [codigoSala, paginaAtual]);

  async function handleAbrirSala() {
    setCriandoSala(true);
    try {
      const res = await criarSalaLeitura({
        data: {
          livroId: livro.id,
          paginaInicial: paginaAtual,
          totalPaginas: totalPaginas,
        },
      });
      if (res.ok && res.codigo) {
        setCodigoSala(res.codigo);
        setModalSalaAberto(false);
        notificar("Sala de leitura coletiva aberta! Você é o Host da sessão.", "sucesso");
      } else {
        notificar(res.erro || "Não foi possível criar a sala.", "erro");
      }
    } catch (e: any) {
      notificar(e.message || "Erro ao criar sala", "erro");
    } finally {
      setCriandoSala(false);
    }
  }

  async function handleEntrarSala(codigo: string) {
    try {
      const res = await entrarSalaLeitura({ data: { codigo } });
      if (res.ok) {
        setCodigoSala(codigo);
        setModalSalaAberto(false);
        setSalaAtivaDoLivro(null);
        notificar("Você entrou na sala de leitura coletiva!", "sucesso");
      } else {
        notificar(res.erro || "Não foi possível entrar na sala.", "erro");
      }
    } catch (e: any) {
      notificar(e.message || "Erro ao entrar na sala", "erro");
    }
  }

  async function handleSairSala() {
    if (!codigoSala) return;
    try {
      await sairSalaLeitura({ data: { codigo: codigoSala } });
      setCodigoSala(null);
      setDadosSala(null);
      notificar("Você saiu da sala de leitura.");
    } catch {}
  }

  async function handleEncerrarSala() {
    if (!codigoSala) return;
    try {
      await encerrarSala({ data: { codigo: codigoSala } });
      setCodigoSala(null);
      setDadosSala(null);
      notificar("Sala de leitura coletiva encerrada.");
    } catch {}
  }

  async function handleReagir(emoji: string) {
    if (!codigoSala) return;
    // Anima localmente no canvas de 60fps sem travar o leitor
    dispararEfeitoReacao(emoji, "Você");
    try {
      await enviarReacao({ data: { codigo: codigoSala, reacao: emoji } });
    } catch {}
  }

  async function handleMarcarPronto() {
    if (!codigoSala) return;
    try {
      await marcarPaginaPronta({ data: { codigo: codigoSala, pagina: paginaAtual } });
      notificar(`✓ Você marcou que terminou a página ${paginaAtual}!`, "sucesso");
    } catch {}
  }

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

  // Sincroniza página atual com a estante e com a sala coletiva
  function mudarPagina(novaPag: number) {
    if (novaPag < 1 || novaPag > totalPaginas) return;

    // Se estiver em sala coletiva e NÃO for o host:
    if (codigoSala && dadosSala && !dadosSala.souHost) {
      if (novaPag > paginaAtual) {
        // Sinaliza prontidão
        marcarPaginaPronta({ data: { codigo: codigoSala, pagina: paginaAtual } }).catch(() => {});
        notificar(`✓ Você marcou que terminou a página ${paginaAtual}! Aguardando o host mudar a página...`, "info");
        return;
      }
    }

    setPaginaAtual(novaPag);
    setSincronizado(false);

    // Se for o Host da sala, sincroniza imediatamente para todos os participantes
    if (codigoSala && dadosSala?.souHost) {
      sincronizarPaginaHost({ data: { codigo: codigoSala, paginaAtual: novaPag } }).catch(() => {});
    }

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

        {/* Controles de Fonte, Tema e Sala Coletiva */}
        <div className="flex items-center gap-2 sm:gap-3 font-sans">
          {/* Botão Sala Coletiva */}
          {codigoSala && dadosSala ? (
            <button
              onClick={() => setModalSalaAberto(true)}
              className="spring-bounce flex items-center gap-1.5 rounded-full bg-amora px-3 py-1 text-xs font-sans font-medium text-papel hover:bg-amora-escura transition-all cursor-pointer shadow-xs"
              title="Gerenciar leitura coletiva"
            >
              <span>🛋️</span>
              <span className="hidden sm:inline">Sala ({dadosSala.participantes.length})</span>
            </button>
          ) : salaAtivaDoLivro?.temSala && salaAtivaDoLivro.codigo ? (
            <button
              onClick={() => handleEntrarSala(salaAtivaDoLivro.codigo!)}
              className="spring-bounce flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1 text-xs font-sans font-medium text-white hover:bg-emerald-700 transition-all cursor-pointer shadow-xs animate-pulse"
              title={`Entrar na sala de ${salaAtivaDoLivro.hostNome}`}
            >
              <span>🛋️</span>
              <span className="hidden sm:inline">Entrar na Sala ({salaAtivaDoLivro.hostNome})</span>
            </button>
          ) : (
            <button
              onClick={() => setModalSalaAberto(true)}
              className="spring-bounce flex items-center gap-1.5 rounded-full border border-current/20 px-2.5 py-1 text-xs font-sans font-medium hover:border-amora hover:text-amora transition-all cursor-pointer"
              title="Criar sala de leitura coletiva sincronizada"
            >
              <span>🛋️</span>
              <span className="hidden sm:inline">Abrir Sala</span>
            </button>
          )}

          {/* Ajuste de Fonte */}
          <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 rounded-lg p-1 text-xs">
            <button
              onClick={() => setTamanhoFonte((f) => Math.max(14, f - 2))}
              className="h-6 w-6 rounded flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 font-bold cursor-pointer"
              title="Diminuir fonte"
            >
              A-
            </button>
            <span className="px-1 font-num text-[11px]">{tamanhoFonte}px</span>
            <button
              onClick={() => setTamanhoFonte((f) => Math.min(26, f + 2))}
              className="h-6 w-6 rounded flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 font-bold cursor-pointer"
              title="Aumentar fonte"
            >
              A+
            </button>
          </div>

          {/* Seletor de Tema */}
          <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 rounded-lg p-1 text-xs">
            <button
              onClick={() => setTema("claro")}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-all cursor-pointer ${
                tema === "claro" ? "bg-white text-black shadow-xs" : "opacity-70 hover:opacity-100"
              }`}
            >
              Claro
            </button>
            <button
              onClick={() => setTema("sepia")}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-all cursor-pointer ${
                tema === "sepia" ? "bg-[#eadecc] text-[#2b221a] shadow-xs" : "opacity-70 hover:opacity-100"
              }`}
            >
              Sépia
            </button>
            <button
              onClick={() => setTema("noturno")}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-all cursor-pointer ${
                tema === "noturno" ? "bg-[#2c2436] text-white shadow-xs" : "opacity-70 hover:opacity-100"
              }`}
            >
              Noturno
            </button>
          </div>
        </div>
      </header>

      {/* Barra de Presença e Sincronização da Sala de Leitura Coletiva */}
      {codigoSala && dadosSala && (
        <SalaLeituraBar
          sala={dadosSala}
          paginaAtual={paginaAtual}
          onReagir={handleReagir}
          onSair={handleSairSala}
          onEncerrar={handleEncerrarSala}
          souHost={dadosSala.souHost}
        />
      )}

      {/* Camada de Reações Flutuantes ao Vivo (Canvas 60fps) */}
      <ReacoesFlutuantesContainer />

      {/* Área Principal de Leitura */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-4 sm:py-6 flex flex-col justify-between overflow-hidden relative">
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

        {/* Botão de Conclusão de Página para Participantes da Sala Coletiva */}
        {codigoSala && dadosSala && !dadosSala.souHost && (
          <div className="mt-3 flex items-center justify-center">
            <button
              onClick={handleMarcarPronto}
              className="spring-bounce inline-flex items-center gap-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs px-5 py-2 shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <span>✓</span>
              <span>Já terminei de ler a página {paginaAtual}</span>
            </button>
          </div>
        )}

        {/* Botões de navegação e ação */}
        <div className={`mt-3 sm:mt-4 flex-shrink-0 flex flex-col gap-4 font-sans transition-all duration-300 ${
          mostrarControles ? "opacity-100 max-h-40 translate-y-0" : "opacity-0 max-h-0 translate-y-4 overflow-hidden pointer-events-none mt-0"
        }`}>
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => mudarPagina(paginaAtual - 1)}
              disabled={paginaAtual <= 1 || (Boolean(codigoSala && dadosSala && !dadosSala.souHost))}
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
                {codigoSala && dadosSala && !dadosSala.souHost ? "✓ Li essa página" : "Próxima página →"}
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

      {/* Modal de Abertura / Gestão da Sala de Leitura Coletiva */}
      {modalSalaAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-papel-3 bg-papel p-6 shadow-2xl text-tinta space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amora-clara text-xl select-none">
                  🛋️
                </span>
                <h3 className="font-display text-xl font-bold">Leitura Coletiva</h3>
              </div>
              <button
                onClick={() => setModalSalaAberto(false)}
                className="rounded-full p-1 text-tinta-3 hover:bg-papel-2 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {codigoSala && dadosSala ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-amora/30 bg-amora-clara/40 p-4 space-y-2">
                  <p className="text-xs font-semibold text-amora uppercase tracking-wider">
                    Sessão em Andamento · Código: {codigoSala}
                  </p>
                  <p className="text-sm font-medium text-tinta">
                    {dadosSala.souHost ? "👑 Você é o Moderador/Host desta leitura coletiva." : `Host: ${dadosSala.hostNome}`}
                  </p>
                  <p className="text-xs text-tinta-2">
                    {dadosSala.participantes.length} leitor(es) conectado(s) na página {dadosSala.paginaAtual}.
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold text-tinta-2">Leitores na sala:</p>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {dadosSala.participantes.map((p) => (
                      <div key={p.usuarioId} className="flex items-center justify-between rounded-lg bg-papel-2 px-3 py-2 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{p.nome}</span>
                          {p.usuarioId === dadosSala.hostUsuarioId && (
                            <span className="text-[10px] text-amora font-bold">👑 Host</span>
                          )}
                        </div>
                        <span className={p.paginaPronta >= paginaAtual ? "text-emerald-500 font-medium" : "text-amber-500"}>
                          {p.paginaPronta >= paginaAtual ? "✓ Pronto" : "Lendo…"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  {dadosSala.souHost ? (
                    <button
                      onClick={handleEncerrarSala}
                      className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 transition-all cursor-pointer shadow-xs"
                    >
                      Encerrar Sessão Coletiva
                    </button>
                  ) : (
                    <button
                      onClick={handleSairSala}
                      className="rounded-xl border border-papel-3 px-4 py-2 text-xs font-semibold text-tinta hover:bg-papel-2 transition-all cursor-pointer"
                    >
                      Sair da Leitura
                    </button>
                  )}
                  <button
                    onClick={() => setModalSalaAberto(false)}
                    className="rounded-xl bg-amora px-5 py-2 text-xs font-semibold text-white hover:bg-amora-escura transition-all cursor-pointer"
                  >
                    Continuar Lendo
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-tinta-2 leading-relaxed">
                  Abra uma sala de <strong>Modo Cineminha</strong> para que os outros leitores da casa leiam <em>"{livro.titulo}"</em> sincronizados com você em tempo real.
                </p>

                <div className="rounded-xl border border-papel-3 bg-papel-2/60 p-4 text-xs space-y-2 text-tinta-2">
                  <div className="flex items-start gap-2">
                    <span className="text-amora font-bold">1.</span>
                    <span>Você passa a página como moderador e a leitura vira para todos na sala.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-amora font-bold">2.</span>
                    <span>Cada participante sinaliza quando terminar de ler a página atual.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-amora font-bold">3.</span>
                    <span>Reações ao vivo e emoções flutuam na tela enquanto leem juntos.</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => setModalSalaAberto(false)}
                    className="rounded-xl border border-papel-3 px-4 py-2.5 text-xs font-medium text-tinta hover:bg-papel-2 transition-all cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleAbrirSala}
                    disabled={criandoSala}
                    className="rounded-xl bg-amora px-5 py-2.5 text-xs font-semibold text-papel hover:bg-amora-escura transition-all cursor-pointer shadow-md disabled:opacity-50"
                  >
                    {criandoSala ? "Abrindo sala..." : "🛋️ Abrir Sala de Leitura"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
