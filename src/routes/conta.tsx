import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useState, useEffect } from "react";

import {
  atualizarConta,
  sair,
  sessaoAtual,
  listarPedidosRecuperacao,
} from "../lib/api/auth.functions";
import { sincronizarPlanilhaGoogle } from "../lib/api/livros.functions";
import { Cabecalho } from "../components/estante/cabecalho";
import { CampoSenha } from "../components/estante/campo-senha";
import { exigirLogin } from "../lib/exigir-login";

export const Route = createFileRoute("/conta")({
  beforeLoad: () => exigirLogin(),
  loader: async () => {
    const [sessao, pedidosRecuperacao] = await Promise.all([
      sessaoAtual(),
      listarPedidosRecuperacao(),
    ]);
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
    await sair();
    await router.invalidate();
    navigate({ to: "/entrar" });
  }

  return (
    <div className="min-h-dvh pb-24">
      <Cabecalho paginaAtiva="conta" />
      <main className="mx-auto max-w-lg px-4 sm:px-6">
        <h1 className="mt-10 font-display text-3xl font-semibold tracking-tight text-tinta">Minha conta</h1>
        <p className="mt-1 text-tinta-2">Seu nome, seu usuário e sua senha.</p>

        <form
          className="mt-8 space-y-5 rounded-2xl border border-papel-3 card-surface p-6"
          onSubmit={(e) => {
            e.preventDefault();
            salvar();
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
            disabled={salvando}
            className="w-full rounded-xl bg-amora px-6 py-3 text-sm font-medium text-papel transition-colors hover:bg-amora-escura active:translate-y-[1px] disabled:opacity-60"
          >
            {salvando ? "Salvando..." : "Salvar mudanças"}
          </button>
        </form>

        {/* Google Sheets Integration for Julia */}
        {sessao.autenticado && sessao.id === 1 && (
          <SecaoGoogleSheets />
        )}

        <button
          onClick={encerrar}
          className="mt-6 w-full rounded-xl border border-papel-3 px-6 py-3 text-sm text-tinta-2 transition-colors hover:border-amora hover:text-amora"
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
    </div>
  );
}

function SecaoGoogleSheets() {
  const router = useRouter();
  const [sincronizando, setSincronizando] = useState(false);
  const [status, setStatus] = useState<{ tipo: "ok" | "erro"; msg: string } | null>(null);
  const [modalPlanilha, setModalPlanilha] = useState(false);

  useEffect(() => {
    if (modalPlanilha) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [modalPlanilha]);

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

  return (
    <>
      {/* Modal da planilha */}
      {modalPlanilha && (
        <div
          className="modal-backdrop"
          onClick={() => setModalPlanilha(false)}
        >
          <div
            className="relative w-full max-w-5xl my-auto rounded-2xl bg-papel shadow-2xl overflow-hidden flex flex-col max-h-[88vh]"
            style={{ height: "82vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header do modal */}
            <div className="flex items-center justify-between border-b border-papel-3 px-5 py-4 shrink-0">
              <div className="flex items-center gap-3">
                <svg viewBox="0 0 24 24" className="h-5 w-5 text-amora" fill="currentColor">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14H7v-2h5v2zm5-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                </svg>
                <div>
                  <h3 className="font-display text-lg font-semibold text-tinta">Controle de Livros</h3>
                  <p className="text-xs text-tinta-3">Planilha original da Julia</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href="https://docs.google.com/spreadsheets/d/1wpuAfQ8WpWhZiXlC0Ovr3OAANWP4ZuAHNem8Ql22qno/edit"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-papel-3 px-3 py-1.5 text-xs text-tinta-2 transition-colors hover:border-amora hover:text-amora flex items-center gap-1.5"
                >
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Abrir no Google
                </a>
                <button
                  onClick={() => setModalPlanilha(false)}
                  className="rounded-full p-1.5 text-tinta-2 transition-colors hover:bg-papel-2 hover:text-tinta"
                  aria-label="Fechar"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Iframe */}
            <div className="flex-1 bg-white overflow-hidden">
              <iframe
                src="https://docs.google.com/spreadsheets/d/1wpuAfQ8WpWhZiXlC0Ovr3OAANWP4ZuAHNem8Ql22qno/htmlembed?widget=true&headers=false&chrome=false"
                className="w-full h-full border-0"
                title="Planilha Controle de Livros"
              />
            </div>
          </div>
        </div>
      )}

      {/* Card da seção */}
      <section className="mt-8 rounded-2xl border border-papel-3 card-surface p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="mt-0.5 rounded-xl bg-amora-clara p-2.5 shrink-0">
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-amora" fill="currentColor">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14H7v-2h5v2zm5-4H7v-2h10v2zm0-4H7V7h10v2z"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-display text-xl font-semibold text-tinta">Planilha do Google Sheets</h2>
            <p className="mt-1 text-sm text-tinta-2">
              Sua estante está conectada à sua planilha original. Sincronize para importar novos livros — capas e resenhas cadastradas aqui são preservadas.
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={() => setModalPlanilha(true)}
            className="flex-1 rounded-xl border border-papel-3 px-4 py-2.5 text-sm text-tinta-2 transition-colors hover:border-amora hover:text-amora flex items-center justify-center gap-2"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Ver Planilha
          </button>

          <button
            onClick={sincronizar}
            disabled={sincronizando}
            className="flex-1 rounded-xl bg-amora px-4 py-2.5 text-sm font-medium text-papel transition-colors hover:bg-amora-escura active:translate-y-[1px] disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
          >
            {sincronizando ? (
              <>
                <svg className="animate-spin h-4 w-4 text-papel" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Sincronizando...
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.2 8H18" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Sincronizar Estante
              </>
            )}
          </button>
        </div>

        {status && (
          <p className={`mt-3 text-sm text-center rounded-lg p-2 ${status.tipo === "ok" ? "bg-tinta/5 text-tinta font-medium" : "bg-amora-clara text-amora-escura"}`}>
            {status.msg}
          </p>
        )}
      </section>
    </>
  );
}
