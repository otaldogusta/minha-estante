import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";

import { listarLeitores } from "../lib/api/livros.functions";
import { listarConvites, criarConvite, revogarConvite } from "../lib/api/auth.functions";
import { Cabecalho } from "../components/estante/cabecalho";
import { exigirLogin } from "../lib/exigir-login";

export const Route = createFileRoute("/leitores")({
  beforeLoad: () => exigirLogin(),
  loader: async () => {
    const [leitores, convites] = await Promise.all([
      listarLeitores(),
      listarConvites(),
    ]);
    return { leitores, convites };
  },
  component: PaginaLeitores,
});

function PaginaLeitores() {
  const { leitores, convites } = Route.useLoaderData();
  const [modalAberto, setModalAberto] = useState(false);

  return (
    <div className="min-h-dvh pb-24">
      <Cabecalho paginaAtiva="leitores" />
      <main className="mx-auto max-w-2xl px-4 sm:px-6">
        <div className="flex items-center justify-between mt-10">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-tinta">Leitores</h1>
          <button
            onClick={() => setModalAberto(true)}
            className="rounded-xl border border-amora px-4 py-2 text-sm font-medium text-amora transition-colors hover:bg-amora hover:text-papel active:translate-y-[1px]"
          >
            + Convidar
          </button>
        </div>
        <p className="mt-1 text-tinta-2">As estantes desta casa. Cada perfil mostra só o que a pessoa deixou público.</p>

        <div className="mt-8 space-y-4">
          {leitores.map((l) => (
            <Link
              key={l.usuario}
              to="/leitor/$usuario"
              params={{ usuario: l.usuario }}
              className="card-surface group flex items-center gap-4 rounded-2xl border border-papel-3/80 p-5 shadow-sm transition-all hover:border-amora hover:shadow-md active:translate-y-[1px]"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amora-clara font-display text-xl text-amora">
                {l.nome.charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-lg font-semibold text-tinta group-hover:text-amora">{l.nome}</p>
                <p className="mt-0.5 truncate text-sm text-tinta-2">
                  {l.lidos} {l.lidos === 1 ? "livro lido" : "livros lidos"}
                  {l.lendoAgora ? ` · lendo ${l.lendoAgora}` : ""}
                </p>
              </div>
              <span aria-hidden className="text-tinta-3 transition-transform duration-300 motion-safe:group-hover:translate-x-1">
                →
              </span>
            </Link>
          ))}
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

  if (!aberto) return null;

  const linkDe = (codigo: string) =>
    (typeof window !== "undefined" ? window.location.origin : "") + `/convite/${codigo}`;

  async function gerar() {
    setGerando(true);
    try {
      await criarConvite();
      await router.invalidate();
    } finally {
      setGerando(false);
    }
  }

  async function revogar(codigo: string) {
    setRevogando(codigo);
    try {
      await revogarConvite({ data: { codigo } });
      await router.invalidate();
    } finally {
      setRevogando(null);
    }
  }

  async function copiar(codigo: string) {
    try {
      await navigator.clipboard.writeText(linkDe(codigo));
      setCopiado(codigo);
      setTimeout(() => setCopiado(null), 2000);
    } catch {
      // sem clipboard
    }
  }

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

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
