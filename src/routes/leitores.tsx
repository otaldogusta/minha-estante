import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

import { listarLeitores, registrarPresencaAtiva, type StatusPresenca } from "../lib/api/livros.functions";
import { listarConvites, criarConvite, revogarConvite, sessaoAtual, removerLeitor } from "../lib/api/auth.functions";
import { Cabecalho } from "../components/estante/cabecalho";
import { AvatarLeitor } from "../components/estante/avatar";
import { exigirLogin } from "../lib/exigir-login";
import { notificar } from "../lib/toast";
import { copiarTexto } from "../lib/utils";

export const Route = createFileRoute("/leitores")({
  beforeLoad: () => exigirLogin(),
  loader: async () => {
    const [leitoresRes, convitesRes, sessaoRes] = await Promise.allSettled([
      listarLeitores(),
      listarConvites(),
      sessaoAtual(),
    ]);
    const leitores = leitoresRes.status === "fulfilled" ? leitoresRes.value ?? [] : [];
    const convites = convitesRes.status === "fulfilled" ? convitesRes.value ?? [] : [];
    const sessao = sessaoRes.status === "fulfilled" ? sessaoRes.value : null;
    return { leitores, convites, sessao };
  },
  component: PaginaLeitores,
});

function parseDataUtc(valor: any): Date | null {
  if (!valor) return null;
  if (valor instanceof Date) return isNaN(valor.getTime()) ? null : valor;
  if (typeof valor === "number") return new Date(valor);
  if (typeof valor === "string") {
    const s = valor.trim();
    if (!s) return null;

    // 1. Tenta parse direto (lida com ISO e strings Postgres com offset '+00' ou '-03')
    let d = new Date(s);
    if (!isNaN(d.getTime())) return d;

    // 2. Se for formato SQLite "YYYY-MM-DD HH:MM:SS" (sem fuso e com espaço)
    const sqlFormat = s.replace(" ", "T");
    d = new Date(sqlFormat.includes("+") || sqlFormat.includes("Z") ? sqlFormat : sqlFormat + "Z");
    if (!isNaN(d.getTime())) return d;

    return null;
  }
  return null;
}

function formatarVistoPorUltimo(ultimoAcesso: string | null | undefined, status: StatusPresenca, eVoce: boolean): string {
  if (eVoce) return "Online agora";
  if (status === "online") return "Online agora";
  if (status === "lendo") return "Lendo agora";
  if (status === "ocupado") return "Não perturbe";
  if (!ultimoAcesso) return "Offline";

  const d = parseDataUtc(ultimoAcesso);
  if (!d) return "Offline";

  const agora = new Date();
  const diffMs = Math.abs(agora.getTime() - d.getTime());

  const diffMin = Math.floor(diffMs / 60000);
  const diffHoras = Math.floor(diffMin / 60);
  const diffDias = Math.floor(diffHoras / 24);

  if (diffMin <= 4) return "Online agora";
  if (diffMin < 60) return `Visto há ${diffMin} min`;
  if (diffHoras < 24) return `Visto há ${diffHoras} ${diffHoras === 1 ? "hora" : "horas"}`;
  if (diffDias === 1) return "Visto ontem";
  if (diffDias < 7) return `Visto há ${diffDias} dias`;
  return `Visto em ${d.toLocaleDateString("pt-BR", { day: "numeric", month: "short" })}`;
}

function PontoPresenca({ status, eVoce }: { status: StatusPresenca; eVoce: boolean }) {
  const statusEfetivo: StatusPresenca = status;

  if (statusEfetivo === "online") {
    return (
      <span className="absolute bottom-0 right-0 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-papel ring-2 ring-papel shadow-xs" title="Online agora">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
        </span>
      </span>
    );
  }

  if (statusEfetivo === "lendo") {
    return (
      <span className="absolute bottom-0 right-0 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-papel ring-2 ring-papel shadow-xs" title="Lendo no momento">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-500" />
        </span>
      </span>
    );
  }

  if (statusEfetivo === "ocupado") {
    return (
      <span className="absolute bottom-0 right-0 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-papel ring-2 ring-papel shadow-xs" title="Não perturbe (Lendo em paz)">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-rose-500" />
        </span>
      </span>
    );
  }

  return (
    <span className="absolute bottom-0 right-0 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-papel ring-2 ring-papel shadow-xs" title="Offline">
      <span className="h-2.5 w-2.5 rounded-full bg-tinta-3/50" />
    </span>
  );
}

function PaginaLeitores() {
  const { leitores, convites, sessao } = Route.useLoaderData();
  const router = useRouter();
  const [modalAberto, setModalAberto] = useState(false);
  const usuarioLogado = sessao?.autenticado ? sessao.usuario : null;

  // Heartbeat e polling para sincronizar status de presença em tempo real
  useEffect(() => {
    // Registra presença ativa ao abrir a página
    registrarPresencaAtiva().catch(() => {});

    const interval = setInterval(async () => {
      if (document.visibilityState === "visible") {
        await registrarPresencaAtiva().catch(() => {});
        router.invalidate();
      }
    }, 10000); // a cada 10 segundos
    return () => clearInterval(interval);
  }, [router]);

  const [confirmarExclusao, setConfirmarExclusao] = useState<{ usuario: string; nome: string } | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  async function executarRemocao() {
    if (!confirmarExclusao || excluindo) return;
    setExcluindo(true);
    try {
      await removerLeitor({ data: { usuario: confirmarExclusao.usuario } });
      setConfirmarExclusao(null);
      await router.invalidate();
      notificar(`Leitor ${confirmarExclusao.nome} removido da casa com sucesso!`, "sucesso");
    } catch (e: any) {
      console.error(e);
      notificar(e.message || "Erro ao remover leitor.", "erro");
    } finally {
      setExcluindo(false);
    }
  }

  return (
    <div className="min-h-dvh pb-24">
      <Cabecalho paginaAtiva="leitores" />
      <main className="mx-auto max-w-2xl px-4 sm:px-6">
        <div className="flex items-center justify-between mt-10">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-tinta">Leitores</h1>
          <button
            onClick={() => setModalAberto(true)}
            className="spring-bounce rounded-xl border border-amora px-4 py-2 text-sm font-medium text-amora transition-colors hover:bg-amora hover:text-papel active:translate-y-[1px] cursor-pointer"
          >
            + Convidar
          </button>
        </div>
        <p className="mt-1 text-tinta-2">As estantes desta casa. Cada perfil mostra só o que a pessoa deixou público.</p>

        <div className="mt-8 space-y-4">
          {leitores.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-tinta-3 p-8 text-center">
              <p className="font-display text-lg text-tinta">Nenhum outro leitor encontrado</p>
              <p className="mt-1 text-sm text-tinta-2">Use o botão "+ Convidar" para convidar pessoas para a sua estante.</p>
            </div>
          ) : (
            [...leitores]
              .sort((a, b) => {
                if (usuarioLogado && a.usuario === usuarioLogado) return -1;
                if (usuarioLogado && b.usuario === usuarioLogado) return 1;
                return (a.nome || a.usuario).localeCompare(b.nome || b.usuario);
              })
              .map((l) => {
                const nome = l.nome || l.usuario || "Leitor";
                const eVoce = Boolean(usuarioLogado && l.usuario === usuarioLogado);

                return (
                  <Link
                    key={l.usuario}
                    to="/leitor/$usuario"
                    params={{ usuario: l.usuario }}
                    className="card-surface spring-bounce group flex items-center gap-4 rounded-2xl border border-papel-3/80 p-5 shadow-sm transition-all hover:border-amora hover:shadow-md active:translate-y-[1px]"
                  >
                    <AvatarLeitor
                      nome={nome}
                      status={
                        eVoce
                          ? l.statusPresenca === "invisivel"
                            ? "offline"
                            : l.statusPresenca === "ocupado" || l.statusPresenca === "lendo"
                            ? l.statusPresenca
                            : "online"
                          : l.statusPresenca
                      }
                      tamanho="md"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-display text-lg font-semibold text-tinta group-hover:text-amora transition-colors">
                          {nome}
                        </p>
                        {eVoce && (
                          <span className="font-sans text-xs font-normal text-amora border border-amora/30 bg-amora-clara/60 px-2 py-0.5 rounded-full">
                            (você)
                          </span>
                        )}
                        {(() => {
                          const statusEfetivo = eVoce ? "online" : l.statusPresenca;
                          const textoStatus = formatarVistoPorUltimo(l.ultimoAcesso, l.statusPresenca, eVoce);
                          const isOnline = statusEfetivo === "online";
                          const isLendo = statusEfetivo === "lendo";
                          const isOcupado = statusEfetivo === "ocupado";

                          return (
                            <span
                              className={`text-xs font-normal inline-flex items-center gap-1 ${
                                isOnline
                                  ? "text-emerald-500 font-medium dark:text-emerald-400"
                                  : isLendo
                                  ? "text-amber-500 font-medium dark:text-amber-400"
                                  : isOcupado
                                  ? "text-rose-500 font-medium dark:text-rose-400"
                                  : "text-tinta-3/80"
                              }`}
                            >
                              • {textoStatus}
                            </span>
                          );
                        })()}
                      </div>
                      <p className="mt-0.5 truncate text-sm text-tinta-2">
                        {l.lidos} {l.lidos === 1 ? "livro lido" : "livros lidos"}
                        {l.lendoAgora ? ` · lendo ${l.lendoAgora}` : ""}
                      </p>
                    </div>

                    {/* Botão de Excluir Leitor: Visível apenas para a moderadora judaviluis (id === 1) e não para ela mesma */}
                    {sessao?.autenticado && sessao.id === 1 && !eVoce && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setConfirmarExclusao({ usuario: l.usuario, nome });
                        }}
                        className="z-10 shrink-0 p-2.5 rounded-xl border border-amora/20 hover:border-amora bg-amora-clara/20 hover:bg-amora hover:text-papel text-amora transition-all cursor-pointer active:scale-95 flex items-center justify-center"
                        title={`Remover ${nome} da casa`}
                      >
                        <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 fill-none stroke-current" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          <line x1="10" y1="11" x2="10" y2="17" />
                          <line x1="14" y1="11" x2="14" y2="17" />
                        </svg>
                      </button>
                    )}

                    <span aria-hidden className="text-tinta-3 transition-transform duration-300 motion-safe:group-hover:translate-x-1">
                      →
                    </span>
                  </Link>
                );
            })
          )}
        </div>
      </main>

      <ModalConvites
        aberto={modalAberto}
        fechar={() => setModalAberto(false)}
        convites={convites}
      />

      {/* Modal de Confirmação para Remover Leitor */}
      {confirmarExclusao && typeof document !== "undefined" && createPortal(
        <div
          className="modal-backdrop z-[70]"
          onClick={() => !excluindo && setConfirmarExclusao(null)}
        >
          <div
            className="relative w-full max-w-md my-auto rounded-3xl border border-papel-3 bg-papel p-6 shadow-2xl surgir space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-amora">
              <div className="rounded-xl bg-amora-clara p-2.5">
                <svg viewBox="0 0 24 24" className="h-6 w-6 text-amora" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="font-display text-xl font-semibold text-tinta">Remover leitor da casa?</h3>
            </div>

            <p className="text-sm text-tinta-2 leading-relaxed">
              Tem certeza de que deseja remover <strong>{confirmarExclusao.nome}</strong> (@{confirmarExclusao.usuario})?
            </p>
            <p className="text-xs text-amora font-medium leading-relaxed bg-amora-clara/40 border border-amora/20 p-3 rounded-2xl">
              ⚠️ Esta ação é irreversível. Todos os livros da estante, progresso de leitura, opiniões e histórico de conquistas deste leitor serão excluídos permanentemente.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmarExclusao(null)}
                disabled={excluindo}
                className="rounded-xl border border-papel-3 px-4 py-2.5 text-sm text-tinta-2 transition-colors hover:border-amora hover:text-amora cursor-pointer disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={executarRemocao}
                disabled={excluindo}
                className="rounded-xl bg-amora px-5 py-2.5 text-sm font-medium text-papel transition-colors hover:bg-amora-escura active:translate-y-[1px] cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {excluindo ? "Removendo..." : "Confirmar Remoção"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

function ModalConvites({
  aberto,
  fechar,
  convites,
}: {
  aberto: boolean;
  fechar: () => void;
  convites: Array<{
    codigo: string;
    criado_em: string;
    usado_em: string | null;
    usado_por_nome: string | null;
    expirado: number;
  }>;
}) {
  const router = useRouter();
  const [localConvites, setLocalConvites] = useState(convites);
  const [gerando, setGerando] = useState(false);
  const [copiado, setCopiado] = useState<string | null>(null);
  const [revogando, setRevogando] = useState<string | null>(null);

  // Keep local list in sync with server updates
  useEffect(() => {
    setLocalConvites(convites);
  }, [convites]);

  useEffect(() => {
    if (!aberto) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [aberto]);

  if (!aberto) return null;

  const linkDe = (codigo: string) =>
    (typeof window !== "undefined" ? window.location.origin : "") + `/convite/${codigo}`;

  async function copiar(codigo: string) {
    const ok = await copiarTexto(linkDe(codigo));
    if (ok) {
      setCopiado(codigo);
      notificar("Link do convite copiado!");
      setTimeout(() => setCopiado(null), 2000);
    }
  }

  const pendentesAtivos = localConvites.filter((c) => !c.usado_em && !c.expirado);
  const pendentesExpirados = localConvites.filter((c) => !c.usado_em && !!c.expirado);
  const usados = localConvites.filter((c) => c.usado_em);
  const limiteAtingido = pendentesAtivos.length >= 3;

  async function gerar() {
    if (gerando || limiteAtingido) return;
    setGerando(true);
    try {
      const res = await criarConvite();
      if (res && res.codigo) {
        // Copia automaticamente o link gerado!
        await copiar(res.codigo);
        // Adiciona otimisticamente na lista local imediatamente!
        const novoConvite = {
          codigo: res.codigo,
          criado_em: new Date().toISOString(),
          usado_em: null,
          usado_por_nome: null,
          expirado: 0,
        };
        setLocalConvites((prev) => [novoConvite, ...prev]);
      }
      await router.invalidate();
    } catch (e: any) {
      console.error("Erro ao gerar convite:", e);
      notificar(e.message || "Erro ao gerar convite.", "erro");
    } finally {
      setGerando(false);
    }
  }

  async function revogar(codigo: string) {
    if (revogando) return;
    setRevogando(codigo);
    // Remove otimisticamente da lista local imediatamente!
    setLocalConvites((prev) => prev.filter((c) => c.codigo !== codigo));
    try {
      await revogarConvite({ data: { codigo } });
      await router.invalidate();
      notificar("Convite revogado.");
    } catch (e: any) {
      console.error("Erro ao revogar convite:", e);
      notificar(e.message || "Erro ao revogar convite.", "erro");
      // Se falhar, restaura
      setLocalConvites(convites);
    } finally {
      setRevogando(null);
    }
  }

  return (
    <div 
      className="modal-backdrop"
      onClick={fechar}
    >
      <div 
        className="relative w-full max-w-md my-auto overflow-hidden rounded-3xl border border-papel-3 bg-papel textura-papel shadow-2xl surgir max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho do Modal */}
        <div className="flex items-center justify-between border-b border-papel-3 p-5">
          <h2 className="font-display text-xl font-semibold text-tinta">Convidar um leitor</h2>
          <button 
            onClick={fechar}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-papel-3 text-tinta transition-colors text-lg cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Conteúdo do Modal */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1">
          <p className="text-sm text-tinta-2 leading-relaxed">
            Gere um link e envie para quem você quer nesta casa. A pessoa cria a própria conta e estante.
          </p>

          <button
            onClick={gerar}
            disabled={gerando || limiteAtingido}
            className="w-full rounded-xl bg-amora px-6 py-3 text-sm font-medium text-papel transition-colors hover:bg-amora-escura active:translate-y-[1px] disabled:opacity-60 cursor-pointer"
          >
            {gerando ? "Gerando..." : "Gerar link de convite"}
          </button>

          {limiteAtingido && (
            <p className="text-xs text-amora font-medium text-center">
              Você já possui 3 convites pendentes e ativos. Revogue um deles ou aguarde expirar para gerar mais.
            </p>
          )}

          {pendentesAtivos.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-tinta-2">Convites ativos (expiram em 48h):</p>
              {pendentesAtivos.map((c) => (
                <div key={c.codigo} className="flex items-center gap-2 rounded-lg bg-papel-2 p-2 pl-3">
                  <code className="min-w-0 flex-1 truncate font-num text-xs text-tinta-2">{linkDe(c.codigo)}</code>
                  <button
                    onClick={() => copiar(c.codigo)}
                    className="shrink-0 rounded-lg border border-tinta-3 px-3 py-1 text-xs text-tinta transition-colors hover:border-amora hover:text-amora cursor-pointer"
                  >
                    {copiado === c.codigo ? "Copiado!" : "Copiar"}
                  </button>
                  <button
                    onClick={() => revogar(c.codigo)}
                    disabled={revogando === c.codigo}
                    className="shrink-0 rounded-lg border border-amora/20 px-2 py-1 text-xs text-amora hover:bg-amora hover:text-white transition-colors disabled:opacity-[0.35] cursor-pointer"
                    title="Revogar convite"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {pendentesExpirados.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-tinta-3">Convites expirados:</p>
              {pendentesExpirados.map((c) => (
                <div key={c.codigo} className="flex items-center gap-2 rounded-lg bg-papel/50 border border-papel-3 p-2 pl-3 opacity-60">
                  <code className="min-w-0 flex-1 truncate font-num text-xs text-tinta-3 line-through">{linkDe(c.codigo)}</code>
                  <span className="shrink-0 text-xs text-tinta-3 px-2">Expirado</span>
                  <button
                    onClick={() => revogar(c.codigo)}
                    disabled={revogando === c.codigo}
                    className="shrink-0 rounded-lg border border-tinta-3/20 px-2 py-1 text-xs text-tinta hover:bg-tinta hover:text-white transition-colors disabled:opacity-[0.35] cursor-pointer"
                    title="Remover convite expirado"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
