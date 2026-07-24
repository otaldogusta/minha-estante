import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { validarRedefinicao, redefinirSenha } from "../lib/api/auth.functions";
import { CampoSenha } from "../components/estante/campo-senha";

export const Route = createFileRoute("/redefinir/$token")({
  loader: async ({ params }) => {
    if (!/^[0-9a-f]{48}$/.test(params.token)) return { valido: false as const };
    return validarRedefinicao({ data: { token: params.token } });
  },
  component: PaginaRedefinir,
});

const campo =
  "mt-1 w-full rounded-lg border border-papel-3 bg-papel px-3 py-2.5 text-tinta focus:border-amora focus:outline-none";

function PaginaRedefinir() {
  const info = Route.useLoaderData();
  const { token } = Route.useParams();
  const navigate = useNavigate();
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [concluido, setConcluido] = useState(false);

  async function enviar() {
    setErro(null);
    if (senha.length < 6) {
      setErro("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    if (senha !== confirmar) {
      setErro("A confirmação não confere com a senha.");
      return;
    }
    setEnviando(true);
    try {
      const res = await redefinirSenha({ data: { token, novaSenha: senha } });
      if (res.ok) {
        setConcluido(true);
        setTimeout(() => navigate({ to: "/entrar" }), 2500);
      } else {
        setErro(res.erro);
        setEnviando(false);
      }
    } catch {
      setErro("Não foi possível redefinir. Tente de novo.");
      setEnviando(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-papel px-4 textura-papel">
      <div className="surgir w-full max-w-sm">
        <div className="text-center">
          <span aria-hidden className="inline-flex gap-[4px]">
            <span className="inline-block h-8 w-[7px] rounded-sm bg-amora" />
            <span className="inline-block h-6 w-[7px] translate-y-2 rounded-sm bg-tinta-2" />
            <span className="inline-block h-8 w-[7px] rounded-sm bg-tinta" />
          </span>
          <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-tinta">Nova senha</h1>
        </div>

        {!info.valido ? (
          <div className="mt-8 rounded-2xl border border-dashed border-tinta-3 p-8 text-center">
            <p className="font-display text-xl text-tinta">Este link expirou ou já foi usado</p>
            <p className="mt-2 text-sm text-tinta-2">Peça um novo em "Esqueci minha senha".</p>
            <Link to="/esqueci-senha" className="mt-4 inline-block text-sm text-amora underline underline-offset-4">
              Pedir novo link
            </Link>
          </div>
        ) : concluido ? (
          <div className="mt-8 rounded-2xl border border-papel-3 bg-papel-3 p-6 text-center">
            <p className="font-display text-xl text-tinta">Senha redefinida!</p>
            <p className="mt-2 text-sm text-tinta-2">Levando você para o login...</p>
            <Link to="/entrar" className="mt-4 inline-block text-sm text-amora underline underline-offset-4">
              Ir agora
            </Link>
          </div>
        ) : (
          <>
            <p className="mt-3 text-center text-sm text-tinta-2">Olá, {info.nome}. Escolha sua nova senha.</p>
            <form
              className="mt-6 space-y-4 rounded-2xl border border-papel-3 bg-papel-3 p-6 shadow-[0_10px_30px_-15px_rgba(93,74,43,0.35)]"
              onSubmit={(e) => {
                e.preventDefault();
                enviar();
              }}
            >
              <label className="block text-sm font-medium text-tinta-2">
                Nova senha
                <CampoSenha value={senha} onChange={(e) => setSenha(e.target.value)} autoComplete="new-password" autoFocus className={campo} />
              </label>
              <label className="block text-sm font-medium text-tinta-2">
                Confirmar nova senha
                <CampoSenha value={confirmar} onChange={(e) => setConfirmar(e.target.value)} autoComplete="new-password" className={campo} />
              </label>

              {erro && <p className="text-sm text-amora-escura">{erro}</p>}

              <button
                type="submit"
                disabled={enviando || !senha || !confirmar}
                className="w-full rounded-xl bg-amora px-6 py-3 text-sm font-medium text-papel transition-colors hover:bg-amora-escura active:translate-y-[1px] disabled:opacity-60"
              >
                {enviando ? "Redefinindo..." : "Salvar nova senha"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
