import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState, useEffect } from "react";

import { listarLeitores, type StatusPresenca } from "../lib/api/livros.functions";
import { listarConvites, criarConvite, revogarConvite, sessaoAtual } from "../lib/api/auth.functions";
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
  const [modalAberto, setModalAberto] = useState(false);
  const usuarioLogado = sessao?.autenticado ? sessao.usuario : null;

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
                const inicial = nome.charAt(0).toUpperCase();
                const eVoce = Boolean(usuarioLogado && l.usuario === usuarioLogado);

                return (
                  <Link
                    key={l.usuario}
                    to="/leitor/$usuario"
                    params={{ usuario: l.usuario }}
                    className="card-surface spring-bounce group flex items-center gap-4 rounded-2xl border border-papel-3/80 p-5 shadow-sm transition-all hover:border-amora hover:shadow-md active:translate-y-[1px]"
                  >
                    <AvatarLeitor nome={nome} status={l.statusPresenca} tamanho="md" />
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-lg font-semibold text-tinta group-hover:text-amora transition-colors inline-flex items-center gap-2 flex-wrap">
                        <span>{nome}</span>
                        {eVoce && (
                          <span className="font-sans text-xs font-normal text-amora border border-amora/30 bg-amora-clara/60 px-2 py-0.5 rounded-full">
                            (você)
                          </span>
                        )}
                      </p>
                      <p className="mt-0.5 truncate text-sm text-tinta-2">
                        {l.lidos} {l.lidos === 1 ? "livro lido" : "livros lidos"}
                        {l.lendoAgora ? ` · lendo ${l.lendoAgora}` : ""}
                      </p>
                    </div>
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
  const [gerando, setGerando] = useState(false);
  const [copiado, setCopiado] = useState<string | null>(null);
  const [revogando, setRevogando] = useState<string | null>(null);

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

  async function gerar() {
    setGerando(true);
    try {
      await criarConvite();
      await router.invalidate();
      notificar("Convite de leitor gerado!");
    } finally {
      setGerando(false);
    }
  }

  async function revogar(codigo: string) {
    setRevogando(codigo);
    try {
      await revogarConvite({ data: { codigo } });
      await router.invalidate();
      notificar("Convite revogado.");
    } finally {
      setRevogando(null);
    }
  }

  async function copiar(codigo: string) {
    const ok = await copiarTexto(linkDe(codigo));
    if (ok) {
      setCopiado(codigo);
      notificar("Link do convite copiado!");
      setTimeout(() => setCopiado(null), 2000);
    }
  }

  const pendentesAtivos = convites.filter((c) => !c.usado_em && c.expirado === 0);
  const pendentesExpirados = convites.filter((c) => !c.usado_em && c.expirado === 1);
  const usados = convites.filter((c) => c.usado_em);
  const limiteAtingido = pendentesAtivos.length >= 3;

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

          {usados.length > 0 && (
            <div className="border-t border-papel-3 pt-4">
              <p className="text-xs text-tinta-3 leading-relaxed">
                <span className="font-semibold">Convites aceitos:</span>{" "}
                {usados.map((c) => c.usado_por_nome).filter(Boolean).join(", ")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
