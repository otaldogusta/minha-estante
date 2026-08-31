import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";

import {
  listarCartas,
  dadosParaEscrever,
  enviarCarta,
  editarCarta,
  excluirCarta,
  excluirCartaRecebida,
  marcarTodasComoLidas,
  lerCarta,
  type CartaRecebida,
  type CartaEnviada,
} from "../lib/api/cartas.functions";
import { Cabecalho } from "../components/estante/cabecalho";
import { exigirLogin } from "../lib/exigir-login";
import { matchSearch } from "../lib/utils";

export const Route = createFileRoute("/cartas")({
  beforeLoad: () => exigirLogin(),
  loader: async () => {
    try {
      const [cartas, escrever] = await Promise.all([listarCartas(), dadosParaEscrever()]);
      return {
        recebidas: cartas?.recebidas ?? [],
        enviadas: cartas?.enviadas ?? [],
        destinatarios: escrever?.destinatarios ?? [],
        livros: escrever?.livros ?? [],
      };
    } catch (e) {
      console.error("Erro ao carregar cartas:", e);
      return {
        recebidas: [],
        enviadas: [],
        destinatarios: [],
        livros: [],
      };
    }
  },
  component: PaginaCartas,
});

function dataLonga(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function Lacre() {
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amora text-papel shadow-sm">
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <polyline points="3 7 12 13 21 7" />
      </svg>
    </span>
  );
}

function CartaRecebidaCard({ carta }: { carta: CartaRecebida }) {
  const router = useRouter();
  const jaLida = carta.lida === 1;
  // Já lidas começam recolhidas; novas começam abertas
  const [expandida, setExpandida] = useState(!jaLida);
  const [marcando, setMarcando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);

  // Detecta se a carta é um convite de leitura coletiva
  let livroIdSala: number | null = null;
  const matchTag = carta.corpo?.match(/\[SALA_LEITURA:(\d+)\]/);
  if (matchTag) {
    livroIdSala = Number(matchTag[1]);
  } else if (carta.livro_id) {
    livroIdSala = carta.livro_id;
  }

  const corpoVisual = carta.corpo ? carta.corpo.replace(/\[SALA_LEITURA:\d+\]/g, "").trim() : "";
  const ehConviteCineminha = Boolean(livroIdSala) || (corpoVisual.includes("Sessão Coletiva") || corpoVisual.includes("Modo Cineminha"));

  async function abrirELer() {
    setExpandida(true);
    if (!jaLida && !marcando) {
      setMarcando(true);
      await lerCarta({ data: { id: carta.id } });
      router.invalidate();
    }
  }

  async function excluirRecebida() {
    setExcluindo(true);
    try {
      await excluirCartaRecebida({ data: { id: carta.id } });
      router.invalidate();
    } finally {
      setExcluindo(false);
      setConfirmandoExclusao(false);
    }
  }

  // Lacrada ainda
  if (!carta.desbloqueada) {
    return (
      <div className="rounded-2xl border border-dashed border-tinta-3 bg-papel-2/60 p-5">
        <div className="flex items-center gap-4">
          <Lacre />
          <div className="min-w-0">
            <p className="font-display italic text-tinta">Uma carta de {carta.remetente} está lacrada</p>
            <p className="mt-0.5 text-sm text-tinta-2">
              Ela se abre quando você terminar <span className="font-medium text-amora">{carta.livro_titulo}</span>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Carta nova — ainda não lida, fechada como envelope
  if (!jaLida && !expandida) {
    return (
      <button
        onClick={abrirELer}
        className="group w-full rounded-2xl border border-amora/40 bg-amora-clara p-5 text-left transition-all hover:border-amora hover:shadow-md cursor-pointer"
      >
        <div className="flex items-center gap-4">
          <Lacre />
          <div className="min-w-0 flex-1">
            <p className="font-display text-lg italic text-amora-escura">
              {ehConviteCineminha ? `🛋️ Convite de Cineminha de ${carta.remetente}` : `Carta nova de ${carta.remetente}`}
            </p>
            <p className="mt-0.5 text-sm text-amora-escura/70">
              {carta.livro_titulo ? `Desbloqueada por "${carta.livro_titulo}". ` : ""}Toque para abrir
            </p>
          </div>
          <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-amora transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14m-7-7 7 7-7 7" />
          </svg>
        </div>
      </button>
    );
  }

  // Carta aberta (lida ou acabou de abrir)
  return (
    <div className="rounded-2xl border border-[#d9c9a8] bg-[#fdfaf1] overflow-hidden transition-all shadow-xs">
      {/* Cabeçalho clicável para recolher/expandir */}
      <button
        onClick={() => setExpandida((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-6 pt-5 pb-3 text-left group cursor-pointer"
      >
        <div className="flex items-baseline gap-3 min-w-0">
          <p className="font-display italic text-amora shrink-0">
            {carta.remetente ? `De ${carta.remetente}` : "De Carteiro"}
          </p>
          {!expandida && corpoVisual && (
            <p className="text-sm text-[#9a8c78] truncate min-w-0">
              — {corpoVisual.slice(0, 60)}{corpoVisual.length > 60 ? "…" : ""}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <p className="font-num text-xs text-[#9a8c78]">{dataLonga(carta.criado_em)}</p>
          <svg
            viewBox="0 0 24 24"
            className={`h-4 w-4 text-[#9a8c78] transition-transform duration-200 ${expandida ? "rotate-180" : ""}`}
            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </button>

      {/* Corpo expansível */}
      {expandida && (
        <div className="px-6 pb-6">
          {carta.livro_titulo && (
            <p className="mb-3 text-xs text-[#9a8c78]">Desbloqueada ao terminar "{carta.livro_titulo}"</p>
          )}
          <p className="whitespace-pre-wrap font-display leading-relaxed text-[#2d2520]">{corpoVisual}</p>

          {ehConviteCineminha && (
            <div className="mt-4 pt-3 border-t border-amora/20">
              {livroIdSala ? (
                <Link
                  to="/ler/$livroId"
                  params={{ livroId: String(livroIdSala) }}
                  className="spring-bounce inline-flex items-center gap-2 rounded-xl bg-amora px-5 py-2.5 text-xs font-semibold text-papel hover:bg-amora-escura shadow-md transition-all active:scale-98 cursor-pointer"
                >
                  <span>🛋️</span>
                  <span>Aceitar Convite e Entrar no Cineminha →</span>
                </Link>
              ) : (
                <Link
                  to="/"
                  className="spring-bounce inline-flex items-center gap-2 rounded-xl bg-amora px-5 py-2.5 text-xs font-semibold text-papel hover:bg-amora-escura shadow-md transition-all active:scale-98 cursor-pointer"
                >
                  <span>🛋️</span>
                  <span>Ver Sala Ativa na Estante →</span>
                </Link>
              )}
            </div>
          )}

          {/* Ações da carta recebida */}
          <div className="mt-4 pt-3 border-t border-[#d9c9a8]/60 flex items-center gap-3 text-xs">
            {!confirmandoExclusao ? (
              <button
                onClick={() => setConfirmandoExclusao(true)}
                className="text-[#9a8c78] hover:text-red-600 transition-colors cursor-pointer"
                title="Excluir carta"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 inline mr-1" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                Excluir
              </button>
            ) : (
              <span className="inline-flex items-center gap-2">
                <button
                  onClick={excluirRecebida}
                  disabled={excluindo}
                  className="rounded bg-red-600 px-2.5 py-1 text-papel font-medium hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-60"
                >
                  {excluindo ? "Excluindo..." : "Confirmar exclusão"}
                </button>
                <button
                  onClick={() => setConfirmandoExclusao(false)}
                  className="text-[#9a8c78] underline underline-offset-2 cursor-pointer"
                >
                  cancelar
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function CartaEnviadaCard({ carta }: { carta: CartaEnviada }) {
  const router = useRouter();
  const [editando, setEditando] = useState(false);
  const [corpo, setCorpo] = useState(carta.corpo);
  const [excluindo, setExcluindo] = useState(false);
  const [expandida, setExpandida] = useState(false);

  async function salvar() {
    await editarCarta({ data: { id: carta.id, corpo } });
    setEditando(false);
    router.invalidate();
  }
  async function excluir() {
    await excluirCarta({ data: { id: carta.id } });
    router.invalidate();
  }

  return (
    <div className="rounded-2xl border border-papel-3 card-surface overflow-hidden">
      {/* Cabeçalho clicável */}
      <button
        onClick={() => setExpandida((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left group"
      >
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 min-w-0">
          <span className="text-sm text-tinta-2 shrink-0">Para</span>
          <span className="text-sm font-medium text-tinta shrink-0">{carta.destinatario}</span>
          {carta.livro_titulo && (
            <span className="text-xs text-tinta-3 truncate">· até terminar "{carta.livro_titulo}"</span>
          )}
          {!expandida && (
            <span className="text-xs text-tinta-3 truncate min-w-0">
              — {carta.corpo.slice(0, 50)}{carta.corpo.length > 50 ? "…" : ""}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {/* Badge de status de leitura */}
          {carta.lida === 1 ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[11px] font-medium text-emerald-600">
              <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Lida{carta.lida_em ? ` em ${dataLonga(carta.lida_em)}` : ""}
            </span>
          ) : carta.desbloqueada ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-amora-clara px-2 py-0.5 text-[11px] text-amora-escura">
              <span className="h-1.5 w-1.5 rounded-full bg-amora animate-pulse" />
              Entregue
            </span>
          ) : (
            <span className="rounded-full bg-papel-3 px-2 py-0.5 text-[11px] text-tinta-3">Aguardando livro</span>
          )}
          <svg
            viewBox="0 0 24 24"
            className={`h-4 w-4 text-tinta-3 transition-transform duration-200 ${expandida ? "rotate-180" : ""}`}
            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </button>

      {/* Corpo expansível */}
      {expandida && (
        <div className="border-t border-papel-3/60 px-5 pb-4 pt-3">
          <p className="font-num text-[11px] text-tinta-3 mb-2">{dataLonga(carta.criado_em)}</p>

          {editando ? (
            <>
              <textarea
                value={corpo}
                onChange={(e) => setCorpo(e.target.value)}
                className="min-h-28 w-full rounded-lg border border-papel-3 bg-papel px-3 py-2 font-display text-tinta focus:border-amora focus:outline-none"
              />
              <div className="mt-2 flex gap-2">
                <button onClick={salvar} className="rounded-lg bg-amora px-4 py-1.5 text-sm text-papel hover:bg-amora-escura transition-colors cursor-pointer">
                  Salvar
                </button>
                <button onClick={() => setEditando(false)} className="rounded-lg border border-papel-3 px-4 py-1.5 text-sm text-tinta-2 cursor-pointer">
                  Cancelar
                </button>
              </div>
            </>
          ) : (
            <p className="whitespace-pre-wrap font-display leading-relaxed text-tinta">{carta.corpo}</p>
          )}

          {carta.lida === 0 && (
            <div className="mt-3 flex items-center gap-3 text-xs">
              {!editando && (
                <button onClick={() => setEditando(true)} className="text-tinta-2 underline underline-offset-2 hover:text-amora cursor-pointer">
                  editar
                </button>
              )}
              {!excluindo ? (
                <button onClick={() => setExcluindo(true)} className="text-tinta-2 underline underline-offset-2 hover:text-amora cursor-pointer">
                  excluir
                </button>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <button onClick={excluir} className="rounded bg-amora-escura px-2 py-0.5 text-papel cursor-pointer">
                    confirmar exclusão
                  </button>
                  <button onClick={() => setExcluindo(false)} className="text-tinta-2 underline cursor-pointer">
                    cancelar
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PaginaCartas() {
  const { recebidas, enviadas, destinatarios, livros } = Route.useLoaderData();
  const router = useRouter();

  // Polling para sincronizar cartas em tempo real a cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        router.invalidate();
      }
    }, 30000); // 30 segundos
    return () => clearInterval(interval);
  }, [router]);
  const [aba, setAba] = useState<"recebidas" | "enviadas" | "escrever">("recebidas");
  const [para, setPara] = useState<number[]>([]);
  const [busca, setBusca] = useState("");
  const [listaAberta, setListaAberta] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [corpo, setCorpo] = useState("");
  const [livroId, setLivroId] = useState<number | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  const novas = recebidas.filter((c) => Boolean(c.desbloqueada) && c.lida === 0).length;

  async function enviar() {
    if (para.length === 0 || !corpo.trim()) return;
    setEnviando(true);
    setAviso(null);
    try {
      const erros: string[] = [];
      for (const id of para) {
        const res = await enviarCarta({ data: { para: id, corpo, livroCondicaoId: livroId } });
        if (!res.ok) erros.push(res.erro);
      }
      if (erros.length > 0) {
        setAviso(erros.join(" "));
      } else {
        setCorpo("");
        setLivroId(null);
        setPara([]);
        setAba("enviadas");
        router.invalidate();
      }
    } catch {
      setAviso("Não foi possível enviar. Tente de novo.");
    } finally {
      setEnviando(false);
    }
  }

  // Fechar lista ao clicar fora
  useEffect(() => {
    if (!listaAberta) return;
    function fora(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setListaAberta(false);
        setBusca("");
      }
    }
    document.addEventListener("mousedown", fora);
    return () => document.removeEventListener("mousedown", fora);
  }, [listaAberta]);

  function togglePara(id: number) {
    setPara((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
    setLivroId(null);
  }

  const destinatariosFiltrados = destinatarios.filter((d) =>
    !busca || matchSearch(busca, d.nome)
  );

  const abaCls = (ativa: boolean) =>
    `rounded-full px-4 py-1.5 text-sm transition-colors ${ativa ? "bg-amora text-papel" : "bg-papel-2 text-tinta-2 hover:bg-papel-3"}`;

  return (
    <div className="min-h-dvh pb-24">
      <Cabecalho paginaAtiva="cartas" />
      <main className="mx-auto max-w-2xl px-4 sm:px-6">
        <h1 className="mt-10 font-display text-3xl font-semibold tracking-tight text-tinta">Cartas</h1>
        <p className="mt-1 text-tinta-2">Palavras trocadas entre leitores. Algumas só se abrem no fim de um livro.</p>

        <div className="mt-6 flex flex-wrap gap-2">
          <button onClick={() => setAba("recebidas")} className={abaCls(aba === "recebidas")}>
            Recebidas{novas > 0 ? ` (${novas} nova${novas > 1 ? "s" : ""})` : ""}
          </button>
          <button onClick={() => setAba("enviadas")} className={abaCls(aba === "enviadas")}>
            Enviadas
          </button>
          <button onClick={() => setAba("escrever")} className={abaCls(aba === "escrever")}>
            Escrever carta
          </button>
        </div>

        {aba === "recebidas" && (
          <div className="mt-6 space-y-4">
            {/* Barra de ações em massa */}
            {recebidas.length > 0 && novas > 0 && (
              <div className="flex items-center justify-between rounded-xl bg-papel-2/80 border border-papel-3 px-4 py-2.5">
                <span className="text-xs text-tinta-2">
                  {novas} carta{novas > 1 ? "s" : ""} não lida{novas > 1 ? "s" : ""}
                </span>
                <button
                  onClick={async () => {
                    await marcarTodasComoLidas();
                    router.invalidate();
                  }}
                  className="text-xs font-medium text-amora hover:text-amora-escura transition-colors cursor-pointer"
                >
                  ✓ Marcar todas como lidas
                </button>
              </div>
            )}
            {recebidas.length === 0 && (
              <div className="rounded-2xl border border-dashed border-tinta-3 p-8 text-center text-tinta-2">
                Nenhuma carta ainda. Elas aparecem aqui quando alguém escrever pra você.
              </div>
            )}
            {recebidas.map((c) => (
              <CartaRecebidaCard key={c.id} carta={c} />
            ))}
          </div>
        )}

        {aba === "enviadas" && (
          <div className="mt-6 space-y-4">
            {enviadas.length === 0 && (
              <div className="rounded-2xl border border-dashed border-tinta-3 p-8 text-center text-tinta-2">
                Você ainda não enviou nenhuma carta.
              </div>
            )}
            {enviadas.map((c) => (
              <CartaEnviadaCard key={c.id} carta={c} />
            ))}
          </div>
        )}

        {aba === "escrever" && (
          <form
            className="mt-6 space-y-5 rounded-2xl border border-papel-3 card-surface p-6"
            onSubmit={(e) => {
              e.preventDefault();
              enviar();
            }}
          >
            {/* Multi-select de destinatários */}
            <div>
              <label className="block text-sm font-medium text-tinta-2 mb-1">Para</label>
              <div ref={wrapRef} className="relative">
                {/* Caixa com pills + input */}
                <div
                  onClick={() => { setListaAberta(true); inputRef.current?.focus(); }}
                  className={`min-h-[42px] w-full flex flex-wrap items-center gap-1.5 rounded-lg border bg-papel px-2.5 py-2 cursor-text transition-colors ${
                    listaAberta ? "border-amora" : "border-papel-3"
                  }`}
                >
                  {/* Pills dos selecionados */}
                  {para.map((id) => {
                    const d = destinatarios.find((x) => x.id === id);
                    if (!d) return null;
                    return (
                      <span key={id} className="inline-flex items-center gap-1 rounded-full bg-amora-clara pl-2.5 pr-1 py-0.5 text-xs font-medium text-amora-escura">
                        {d.nome}
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); togglePara(id); }}
                          className="flex h-4 w-4 items-center justify-center rounded-full hover:bg-amora/20 transition-colors cursor-pointer"
                          aria-label={`Remover ${d.nome}`}
                        >
                          <svg viewBox="0 0 24 24" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 6L6 18M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    );
                  })}

                  {/* Input de busca */}
                  <input
                    ref={inputRef}
                    type="text"
                    value={busca}
                    placeholder={para.length === 0 ? "Digitar nome..." : ""}
                    autoComplete="off"
                    spellCheck={false}
                    className="flex-1 min-w-[100px] bg-transparent text-sm text-tinta placeholder:text-tinta-3 focus:outline-none"
                    onChange={(e) => { setBusca(e.target.value); setListaAberta(true); }}
                    onFocus={() => setListaAberta(true)}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && busca === "" && para.length > 0) {
                        togglePara(para[para.length - 1]);
                      }
                      if (e.key === "Escape") { setListaAberta(false); setBusca(""); }
                    }}
                  />
                </div>

                {/* Dropdown de sugestões */}
                {listaAberta && destinatariosFiltrados.length > 0 && (
                  <ul
                    role="listbox"
                    className="absolute z-50 mt-1 w-full rounded-xl border border-papel-3 bg-papel shadow-xl overflow-auto max-h-52 text-sm"
                  >
                    {destinatariosFiltrados.map((d) => {
                      const selecionado = para.includes(d.id);
                      return (
                        <li
                          key={d.id}
                          role="option"
                          aria-selected={selecionado}
                          onMouseDown={(e) => { e.preventDefault(); togglePara(d.id); setBusca(""); inputRef.current?.focus(); }}
                          className={`flex items-center justify-between gap-2 px-3 py-2.5 cursor-pointer transition-colors ${
                            selecionado
                              ? "bg-amora-clara/60 text-amora-escura font-medium"
                              : "text-tinta hover:bg-papel-2"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            {/* Avatar inicial */}
                            <span className="h-6 w-6 rounded-full bg-amora/20 flex items-center justify-center text-[10px] font-bold text-amora shrink-0">
                              {d.nome.charAt(0).toUpperCase()}
                            </span>
                            {d.nome}
                          </span>
                          {selecionado && (
                            <svg viewBox="0 0 24 24" className="h-4 w-4 text-amora shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
                {listaAberta && destinatariosFiltrados.length === 0 && (
                  <div className="absolute z-50 mt-1 w-full rounded-xl border border-papel-3 bg-papel px-3 py-3 text-sm text-tinta-3 shadow-xl">
                    Nenhum leitor encontrado
                  </div>
                )}
              </div>
            </div>

            <label className="block text-sm font-medium text-tinta-2">
              Sua carta
              <textarea
                value={corpo}
                onChange={(e) => setCorpo(e.target.value)}
                placeholder="Escreva com calma. Cartas não têm pressa."
                className="mt-1 min-h-40 w-full rounded-lg border border-papel-3 bg-papel px-3 py-2.5 font-display leading-relaxed text-tinta placeholder:font-ui placeholder:text-tinta-3 focus:border-amora focus:outline-none"
              />
            </label>

            <label className="block text-sm font-medium text-tinta-2">
              Lacrar a um livro (opcional)
              <select
                value={livroId ?? ""}
                onChange={(e) => setLivroId(Number(e.target.value) || null)}
                className="mt-1 w-full rounded-lg border border-papel-3 bg-papel px-3 py-2.5 text-tinta focus:border-amora focus:outline-none"
              >
                <option value="">Entregar agora</option>
                {livros
                  .filter((l) => para.includes(l.usuario_id))
                  .map((l) => (
                    <option key={l.id} value={l.id}>
                      Só abrir quando terminar: {l.titulo} {l.status === "lendo" ? "(lendo agora)" : "(quer ler)"}
                    </option>
                  ))}
              </select>
              <span className="mt-1 block text-xs text-tinta-3">
                A carta aparece lacrada na caixinha e vira recompensa quando o livro termina.
              </span>
            </label>

            {aviso && <p className="text-sm text-amora-escura">{aviso}</p>}

            <button
              type="submit"
              disabled={enviando || !corpo.trim() || para.length === 0}
              className="w-full rounded-xl bg-amora px-6 py-3 text-sm font-medium text-papel transition-colors hover:bg-amora-escura active:translate-y-[1px] disabled:opacity-60 cursor-pointer"
            >
              {enviando
                ? "Lacrando o envelope..."
                : para.length > 1
                ? `Enviar ${para.length} cartas`
                : "Enviar carta"}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
