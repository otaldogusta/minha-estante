import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { entrar, sessaoAtual } from "../lib/api/auth.functions";
import { CampoSenha } from "../components/estante/campo-senha";

export const Route = createFileRoute("/entrar")({
  loader: () => sessaoAtual(),
  component: PaginaEntrar,
});

function PaginaEntrar() {
  const sessao = Route.useLoaderData();
  const navigate = useNavigate();
  const router = useRouter();
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [tema, setTema] = useState<"light" | "dark">("light");

  useEffect(() => {
    const t = (localStorage.getItem("minha-estante-theme") as "light" | "dark") || "light";
    setTema(t);
  }, []);

  function alternarTema() {
    const novoTema = tema === "light" ? "dark" : "light";
    setTema(novoTema);
    localStorage.setItem("minha-estante-theme", novoTema);
    document.documentElement.setAttribute("data-theme", novoTema);
  }

  // Ja autenticado (visita direta a /entrar): vai para a estante.
  // Durante o envio do login, quem decide o destino e o enviar() (carta ou estante).
  if (sessao.autenticado && !enviando) {
    navigate({ to: "/" });
    return null;
  }

  async function enviar() {
    if (!usuario.trim() || !senha) return;
    setEnviando(true);
    setErro(null);
    try {
      const res = await entrar({ data: { usuario, senha } });
      if (res.ok) {
        // Recarrega as rotas (agora autenticadas) e entao navega.
        // O redirect de render acima fica suprimido enquanto enviando=true,
        // entao o destino (carta ou estante) e decidido so aqui.
        await router.invalidate();
        await navigate({ to: res.cartaPendente ? "/carta" : "/" });
      } else {
        setErro(res.erro);
        setEnviando(false);
      }
    } catch {
      setErro("Nao foi possivel entrar. Tente de novo.");
      setEnviando(false);
    }
  }

  return (
    <div className="relative flex min-h-dvh items-center justify-center bg-papel px-4 textura-papel">
      {/* Botão de Tema (Modo Escuro/Claro) */}
      <button
        onClick={alternarTema}
        className="absolute top-4 right-4 spring-bounce inline-flex h-9 w-9 items-center justify-center rounded-full border border-papel-3 text-tinta-2 hover:border-amora hover:text-amora hover:bg-papel-2/50 cursor-pointer shadow-sm transition-all"
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
      <div className="surgir w-full max-w-sm">
        <div className="text-center">
          <span aria-hidden className="inline-flex gap-[4px]">
            <span className="inline-block h-8 w-[7px] rounded-sm bg-amora" />
            <span className="inline-block h-6 w-[7px] translate-y-2 rounded-sm bg-tinta-2" />
            <span className="inline-block h-8 w-[7px] rounded-sm bg-tinta" />
          </span>
          <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-tinta">Minha Estante</h1>
          <p className="mt-1 text-tinta-2">Seu diário de leitura</p>
        </div>

        <form
          className="mt-8 rounded-2xl border border-papel-3 card-surface p-6 shadow-[0_10px_30px_-15px_rgba(93,74,43,0.35)]"
          onSubmit={(e) => {
            e.preventDefault();
            enviar();
          }}
        >
          <label className="block text-sm font-medium text-tinta-2">
            Usuário
            <input
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              autoComplete="username"
              autoFocus
              className="mt-1 w-full rounded-lg border border-papel-3 bg-papel px-3 py-2.5 text-tinta focus:border-amora focus:outline-none"
            />
          </label>
          <label className="mt-4 block text-sm font-medium text-tinta-2">
            Senha
            <CampoSenha
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              autoComplete="current-password"
            />
          </label>

          {erro && <p className="mt-3 text-sm text-amora-escura">{erro}</p>}

          <button
            type="submit"
            disabled={enviando || !usuario.trim() || !senha}
            className="mt-6 w-full rounded-xl bg-amora px-6 py-3 text-sm font-medium text-papel transition-colors hover:bg-amora-escura active:translate-y-[1px] disabled:opacity-60"
          >
            {enviando ? "Abrindo a estante..." : "Entrar"}
          </button>

          <p className="mt-4 text-center">
            <Link to="/esqueci-senha" className="text-sm text-tinta-2 underline decoration-tinta-3 underline-offset-4 transition-colors hover:text-amora hover:decoration-amora">
              Esqueci minha senha
            </Link>
          </p>
        </form>

        <p className="mt-6 text-center text-xs text-tinta-3">Um cantinho só seu, para cada livro da sua história.</p>
      </div>
    </div>
  );
}