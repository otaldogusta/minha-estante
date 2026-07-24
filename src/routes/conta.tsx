import { createFileRoute, Link, useNavigate, useRouter, useBlocker } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

import {
  atualizarConta,
  sair,
  sessaoAtual,
  listarPedidosRecuperacao,
  atualizarStatusPresenca,
} from "../lib/api/auth.functions";
import { sincronizarPlanilhaGoogle } from "../lib/api/livros.functions";
import { Cabecalho } from "../components/estante/cabecalho";
import { CampoSenha } from "../components/estante/campo-senha";
import { exigirLogin } from "../lib/exigir-login";

export const Route = createFileRoute("/conta")({
  beforeLoad: () => exigirLogin(),
  loader: async () => {
    const [sessaoRes, pedidosRes] = await Promise.allSettled([
      sessaoAtual(),
      listarPedidosRecuperacao(),
    ]);
    const sessao = sessaoRes.status === "fulfilled" ? sessaoRes.value : { autenticado: false as const };
    const pedidosRecuperacao = pedidosRes.status === "fulfilled" ? pedidosRes.value ?? [] : [];
    return { sessao, pedidosRecuperacao };
  },
  component: PaginaConta,
});

const campo =
  "mt-1 w-full rounded-lg border border-papel-3 bg-papel px-3 py-2.5 text-tinta focus:border-amora focus:outline-none";

// Recuperação pela casa: pedidos de redefinição dos outros leitores.
// Quem está logado copia o link e entrega pessoalmente a quem esqueceu a senha.
function SecaoRecuperacao({
  pedidos,
}: {
  pedidos: Array<{ token: string; nome: string; criado_em: string }>;
}) {
  const [copiado, setCopiado] = useState<string | null>(null);

  const linkDe = (token: string) =>
    (typeof window !== "undefined" ? window.location.origin : "") + `/redefinir/${token}`;

  async function copiar(token: string) {
    try {
      await navigator.clipboard.writeText(linkDe(token));
      setCopiado(token);
      setTimeout(() => setCopiado(null), 2000);
    } catch {
      // sem clipboard: o link fica visível para copiar manualmente
    }
  }

  return (
    <section className="mt-6 rounded-2xl border border-amora/40 bg-amora-clara p-6">
      <h2 className="font-display text-xl font-semibold text-amora-escura">Pedido de recuperação de senha</h2>
      <p className="mt-1 text-sm text-amora-escura/80">
        Alguém da casa esqueceu a senha. Confirme com a pessoa e entregue o link de redefinição (vale por 24 horas).
      </p>
      <div className="mt-4 space-y-2">
        {pedidos.map((p) => (
          <div key={p.token} className="rounded-lg bg-papel p-3">
            <p className="text-sm font-medium text-tinta">{p.nome}</p>
            <div className="mt-1.5 flex items-center gap-2">
              <code className="min-w-0 flex-1 truncate font-num text-xs text-tinta-2">{linkDe(p.token)}</code>
              <button
                onClick={() => copiar(p.token)}
                className="shrink-0 rounded-lg border border-tinta-3 px-3 py-1 text-xs text-tinta transition-colors hover:border-amora hover:text-amora"
              >
                {copiado === p.token ? "Copiado!" : "Copiar"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function PaginaConta() {
  const { sessao, pedidosRecuperacao } = Route.useLoaderData();
  const navigate = useNavigate();
  const router = useRouter();
  const [nome, setNome] = useState(sessao.autenticado ? sessao.nome : "");
  const [usuario, setUsuario] = useState(sessao.autenticado ? sessao.usuario : "");
  const [email, setEmail] = useState(sessao.autenticado ? (sessao.email ?? "") : "");
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [mensagem, setMensagem] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);
  const [salvando, setSalvando] = useState(false);

  const nomeInicial = sessao.autenticado ? sessao.nome : "";
  const usuarioInicial = sessao.autenticado ? sessao.usuario : "";
  const emailInicial = sessao.autenticado ? (sessao.email ?? "") : "";

  const teveAlteracao =
    nome.trim() !== nomeInicial ||
    usuario.trim() !== usuarioInicial ||
    email.trim() !== emailInicial ||
    novaSenha !== "" ||
    confirmar !== "";

  // Bloqueador de navegação para alterações não salvas
  const blocker = useBlocker({
    shouldBlockFn: () => teveAlteracao,
    withResolver: true,
  });

  // Alerta nativo se tentar fechar ou recarregar a aba com alterações
  useEffect(() => {
    if (!teveAlteracao) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [teveAlteracao]);

  async function salvar() {
    setMensagem(null);
    if (!senhaAtual) {
      setMensagem({ tipo: "erro", texto: "Digite sua senha atual para confirmar as mudanças." });
      return;
    }
    if (novaSenha && novaSenha.length < 6) {
      setMensagem({ tipo: "erro", texto: "A nova senha precisa ter pelo menos 6 caracteres." });
      return;
    }
    if (novaSenha && novaSenha !== confirmar) {
      setMensagem({ tipo: "erro", texto: "A confirmação não confere com a nova senha." });
      return;
    }
    setSalvando(true);
    try {
      const res = await atualizarConta({
        data: {
          senhaAtual,
          nome: nome.trim() || undefined,
          usuario: usuario.trim() || undefined,
          email: email.trim() ? email.trim() : null,
          novaSenha: novaSenha || undefined,
        },
      });
      if (res.ok) {
        setMensagem({ tipo: "ok", texto: "Conta atualizada!" });
        setSenhaAtual("");
        setNovaSenha("");
        setConfirmar("");
        await router.invalidate();
      } else {
        setMensagem({ tipo: "erro", texto: res.erro });
      }
    } catch {
      setMensagem({ tipo: "erro", texto: "Não foi possível salvar. Tente de novo." });
    } finally {
      setSalvando(false);
    }
  }

  async function encerrar() {
    try {
      await sair();
    } finally {
      window.location.href = "/entrar";
    }
  }

  return (
    <div className="min-h-dvh pb-24">
      <Cabecalho paginaAtiva="conta" />
      <main className="mx-auto max-w-lg px-4 sm:px-6">
        <div className="mt-10 flex flex-col gap-4">
          <div className="flex items-center gap-4">
            {/* Avatar do Leitor Logado com Ponto de Presença */}
            <div className="relative shrink-0">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-amora-clara font-display text-2xl text-amora font-semibold shadow-xs">
                {(sessao.autenticado ? sessao.nome : "L").charAt(0).toUpperCase()}
              </span>
              {statusPresenca === "online" && (
                <span className="absolute bottom-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-papel ring-2 ring-papel shadow-xs" title="Online agora">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  </span>
                </span>
              )}
              {statusPresenca === "lendo" && (
                <span className="absolute bottom-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-papel ring-2 ring-papel shadow-xs" title="Lendo no momento">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-500" />
                  </span>
                </span>
              )}
              {statusPresenca === "ocupado" && (
                <span className="absolute bottom-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-papel ring-2 ring-papel shadow-xs" title="Não perturbe (Lendo em paz)">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-rose-500" />
                  </span>
                </span>
              )}
              {statusPresenca === "invisivel" && (
                <span className="absolute bottom-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-papel ring-2 ring-papel shadow-xs" title="Invisível (Aparece offline)">
                  <span className="h-2.5 w-2.5 rounded-full bg-tinta-3/50" />
                </span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-display text-3xl font-semibold tracking-tight text-tinta">
                  Minha conta
                </h1>
                {sessao.autenticado && sessao.id === 1 && (
                  <BotaoAbrirPlanilha />
                )}
              </div>
              <p className="mt-1 text-tinta-2">Seu nome, seu usuário e sua senha.</p>
            </div>
          </div>

          {/* Seletor Interativo de Status de Presença */}
          <div className="rounded-2xl border border-papel-3/80 card-surface p-3.5 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-medium text-tinta-2">Seu status:</span>
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { key: "online", label: "Online", dot: "bg-emerald-500", activeBg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400" },
                { key: "lendo", label: "Lendo agora", dot: "bg-amber-500", activeBg: "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400" },
                { key: "ocupado", label: "Não perturbe", dot: "bg-rose-500", activeBg: "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400" },
                { key: "invisivel", label: "Invisível", dot: "bg-tinta-3/60", activeBg: "bg-papel-3/50 border-tinta-3/30 text-tinta-2" },
              ].map((st) => {
                const ativo = statusPresenca === st.key;
                return (
                  <button
                    key={st.key}
                    type="button"
                    onClick={() => mudarStatus(st.key as any)}
                    className={`spring-bounce inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-all cursor-pointer ${
                      ativo
                        ? `${st.activeBg} ring-2 ring-amora/30 font-semibold shadow-xs`
                        : "border-papel-3 bg-papel-2/60 text-tinta-2 hover:border-papel-3 hover:bg-papel-3/50"
                    }`}
                  >
                    <span className={`h-2 w-2 rounded-full ${st.dot} ${ativo ? "scale-110" : "opacity-60"}`} />
                    {st.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <form
          className="mt-8 space-y-5 rounded-2xl border border-papel-3 card-surface p-6"
          onSubmit={(e) => {
            e.preventDefault();
            if (teveAlteracao) salvar();
          }}
        >
          <label className="block text-sm font-medium text-tinta-2">
            Nome
            <input value={nome} onChange={(e) => setNome(e.target.value)} className={campo} autoComplete="name" />
          </label>
          <label className="block text-sm font-medium text-tinta-2">
            Usuário
            <input value={usuario} onChange={(e) => setUsuario(e.target.value)} className={campo} autoComplete="username" />
          </label>
          <label className="block text-sm font-medium text-tinta-2">
            Email (para recuperar a senha)
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={campo}
              autoComplete="email"
              placeholder="opcional"
            />
          </label>

          <div className="border-t border-papel-3 pt-5">
            <p className="text-sm text-tinta-2">Trocar a senha (opcional)</p>
            <label className="mt-3 block text-sm font-medium text-tinta-2">
              Nova senha
              <CampoSenha
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                autoComplete="new-password"
                className={campo}
              />
            </label>
            <label className="mt-3 block text-sm font-medium text-tinta-2">
              Confirmar nova senha
              <CampoSenha
                value={confirmar}
                onChange={(e) => setConfirmar(e.target.value)}
                autoComplete="new-password"
                className={campo}
              />
            </label>
          </div>

          <div className="border-t border-papel-3 pt-5">
            <label className="block text-sm font-medium text-tinta-2">
              Senha atual (para confirmar)
              <CampoSenha
                value={senhaAtual}
                onChange={(e) => setSenhaAtual(e.target.value)}
                autoComplete="current-password"
                className={campo}
              />
            </label>
          </div>

          {mensagem && (
            <p className={`text-sm ${mensagem.tipo === "ok" ? "text-tinta" : "text-amora-escura"}`}>{mensagem.texto}</p>
          )}

          <button
            type="submit"
            disabled={!teveAlteracao || salvando}
            className={`w-full rounded-xl px-6 py-3 text-sm font-medium transition-all ${
              !teveAlteracao || salvando
                ? "bg-amora/35 text-papel/50 cursor-not-allowed opacity-60"
                : "bg-amora text-papel hover:bg-amora-escura active:translate-y-[1px] cursor-pointer shadow-sm"
            }`}
          >
            {salvando ? "Salvando..." : "Salvar mudanças"}
          </button>
        </form>

        <button
          onClick={encerrar}
          className="mt-6 w-full rounded-xl border border-papel-3 px-6 py-3 text-sm text-tinta-2 transition-colors hover:border-amora hover:text-amora cursor-pointer"
        >
          Sair da conta
        </button>

        {pedidosRecuperacao.length > 0 && <SecaoRecuperacao pedidos={pedidosRecuperacao} />}

        <p className="mt-8 text-center">
          <Link to="/carta" className="font-display text-sm italic text-amora underline decoration-amora/40 underline-offset-4 hover:decoration-amora">
            Reler a primeira página do diário
          </Link>
        </p>
      </main>

      {/* Modal de Confirmação para Descartar Alterações Não Salvas */}
      {blocker.status === "blocked" && typeof document !== "undefined" && createPortal(
        <div
          className="modal-backdrop z-[70]"
          onClick={() => blocker.reset()}
        >
          <div
            className="relative w-full max-w-md my-auto rounded-3xl border border-papel-3 bg-papel p-6 shadow-2xl surgir space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-amora">
              <div className="rounded-xl bg-amora-clara p-2.5">
                <svg viewBox="0 0 24 24" className="h-6 w-6 text-amora" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-display text-xl font-semibold text-tinta">Descartar alterações?</h3>
            </div>

            <p className="text-sm text-tinta-2 leading-relaxed">
              Você alterou dados da sua conta e não salvou as mudanças. Se sair agora, todas as edições serão perdidas.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => blocker.reset()}
                className="rounded-xl border border-papel-3 px-4 py-2.5 text-sm text-tinta-2 transition-colors hover:border-amora hover:text-amora cursor-pointer"
              >
                Continuar editando
              </button>
              <button
                onClick={() => blocker.proceed()}
                className="rounded-xl bg-amora px-5 py-2.5 text-sm font-medium text-papel transition-colors hover:bg-amora-escura active:translate-y-[1px] cursor-pointer"
              >
                Descartar e Sair
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

function extrairEmbedUrl(urlStr: string) {
  const match = urlStr.match(/\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return `https://docs.google.com/spreadsheets/d/${match[1]}/htmlembed?widget=true&headers=false&chrome=false`;
  }
  return "https://docs.google.com/spreadsheets/d/1wpuAfQ8WpWhZiXlC0Ovr3OAANWP4ZuAHNem8Ql22qno/htmlembed?widget=true&headers=false&chrome=false";
}

function BotaoAbrirPlanilha() {
  const router = useRouter();
  const [sincronizando, setSincronizando] = useState(false);
  const [status, setStatus] = useState<{ tipo: "ok" | "erro"; msg: string } | null>(null);
  const [modalPlanilha, setModalPlanilha] = useState(false);
  const [confirmarSync, setConfirmarSync] = useState(false);
  const [linkPlanilha, setLinkPlanilha] = useState(
    "https://docs.google.com/spreadsheets/d/1wpuAfQ8WpWhZiXlC0Ovr3OAANWP4ZuAHNem8Ql22qno/edit"
  );

  useEffect(() => {
    if (modalPlanilha || confirmarSync) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [modalPlanilha, confirmarSync]);

  async function sincronizar() {
    setSincronizando(true);
    setStatus(null);
    try {
      const res = await sincronizarPlanilhaGoogle();
      if (res.ok) {
        setStatus({ tipo: "ok", msg: `✅ Sincronizado! ${res.count} livros importados. Capas e resenhas preservadas.` });
        await router.invalidate();
      } else {
        setStatus({ tipo: "erro", msg: "Erro ao processar os dados da planilha." });
      }
    } catch (e: any) {
      setStatus({ tipo: "erro", msg: e.message || "Falha na sincronização." });
    } finally {
      setSincronizando(false);
    }
  }

  const embedUrl = extrairEmbedUrl(linkPlanilha);

  return (
    <>
      <button
        onClick={() => setModalPlanilha(true)}
        className="spring-bounce inline-flex items-center gap-1.5 rounded-full border border-papel-3 bg-papel-2/60 px-3 py-1 text-xs text-tinta-2 shadow-sm transition-all hover:border-amora hover:text-amora cursor-pointer"
        title="Abrir Planilha do Google Drive"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#0F9D58]" fill="currentColor">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14H7v-2h5v2zm5-4H7v-2h10v2zm0-4H7V7h10v2z"/>
        </svg>
        <span className="font-medium text-tinta">Google Drive</span>
      </button>

      {/* Modal da planilha montado via Portal direto no document.body para ficar 100% fixo no viewport */}
      {modalPlanilha && typeof document !== "undefined" && createPortal(
        <div
          className="modal-backdrop"
          onClick={() => setModalPlanilha(false)}
        >
          <div
            className="relative w-full max-w-5xl my-auto rounded-2xl bg-papel shadow-2xl overflow-hidden flex flex-col h-[78vh] max-h-[750px]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Completo do Modal */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-papel-3 px-5 py-3.5 shrink-0 bg-papel-2/40">
              <div className="flex items-center gap-2.5">
                <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#0F9D58] shrink-0" fill="currentColor">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14H7v-2h5v2zm5-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                </svg>
                <h3 className="font-display text-base font-semibold text-tinta hidden xs:block sm:block">Planilha Google</h3>
              </div>

              {/* Barra para colocar link */}
              <div className="flex-1 min-w-[200px] max-w-md">
                <input
                  type="url"
                  value={linkPlanilha}
                  onChange={(e) => setLinkPlanilha(e.target.value)}
                  placeholder="Cole o link da sua planilha..."
                  className="w-full rounded-lg border border-papel-3 bg-papel px-3 py-1.5 text-xs text-tinta placeholder:text-tinta-3 focus:border-amora focus:outline-none"
                  title="Link da Planilha do Google Sheets"
                />
              </div>

              {/* Ações: Sincronizar, Abrir no Google e Fechar */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setConfirmarSync(true)}
                  disabled={sincronizando}
                  className="rounded-lg bg-amora px-3 py-1.5 text-xs font-medium text-papel transition-colors hover:bg-amora-escura active:translate-y-[1px] disabled:opacity-60 flex items-center gap-1.5 cursor-pointer"
                >
                  {sincronizando ? (
                    <>
                      <svg className="animate-spin h-3.5 w-3.5 text-papel" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Sincronizando...
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
                      </svg>
                      Sincronizar
                    </>
                  )}
                </button>

                <a
                  href={linkPlanilha}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-papel-3 px-2.5 py-1.5 text-xs text-tinta-2 transition-colors hover:border-amora hover:text-amora flex items-center gap-1 hidden sm:flex"
                >
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Abrir
                </a>

                <button
                  onClick={() => setModalPlanilha(false)}
                  className="rounded-full p-1.5 text-tinta-2 transition-colors hover:bg-papel-2 hover:text-tinta cursor-pointer"
                  aria-label="Fechar"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Banner de status se houver sincronização recente */}
            {status && (
              <div className={`px-5 py-2 text-xs border-b border-papel-3 ${status.tipo === "ok" ? "bg-tinta/5 text-tinta font-medium" : "bg-amora-clara text-amora-escura"}`}>
                {status.msg}
              </div>
            )}

            {/* Iframe da planilha */}
            <div className="flex-1 bg-white overflow-hidden">
              <iframe
                src={embedUrl}
                className="w-full h-full border-0"
                title="Planilha Controle de Livros"
              />
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal de Confirmação de Sincronização */}
      {confirmarSync && typeof document !== "undefined" && createPortal(
        <div
          className="modal-backdrop z-[60]"
          onClick={() => setConfirmarSync(false)}
        >
          <div
            className="relative w-full max-w-md my-auto rounded-3xl border border-papel-3 bg-papel p-6 shadow-2xl surgir space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-amora">
              <div className="rounded-xl bg-amora-clara p-2.5">
                <svg viewBox="0 0 24 24" className="h-6 w-6 text-amora" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
                </svg>
              </div>
              <h3 className="font-display text-xl font-semibold text-tinta">Sincronizar estante?</h3>
            </div>

            <p className="text-sm text-tinta-2 leading-relaxed">
              Isso atualizará os dados da sua estante com a planilha do Google Sheets. Novos livros serão importados e alterações de progresso serão sincronizadas.
            </p>
            <p className="text-xs text-tinta-3">
              ✨ Suas capas personalizadas e resenhas cadastradas aqui continuarão preservadas.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmarSync(false)}
                className="rounded-xl border border-papel-3 px-4 py-2.5 text-sm text-tinta-2 transition-colors hover:border-amora hover:text-amora cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  setConfirmarSync(false);
                  await sincronizar();
                }}
                disabled={sincronizando}
                className="rounded-xl bg-amora px-5 py-2.5 text-sm font-medium text-papel transition-colors hover:bg-amora-escura active:translate-y-[1px] cursor-pointer"
              >
                Confirmar e Sincronizar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
