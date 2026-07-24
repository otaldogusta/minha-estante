import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import { solicitarRecuperacao } from "../lib/api/auth.functions";

export const Route = createFileRoute("/esqueci-senha")({
  component: PaginaEsqueciSenha,
});

function PaginaEsqueciSenha() {
  const [identificador, setIdentificador] = useState("");
  const [enviado, setEnviado] = useState<null | { emailEnviado: boolean }>(null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function enviar() {
    if (!identificador.trim()) return;
    setEnviando(true);
    setErro(null);
    try {
      const res = await solicitarRecuperacao({ data: { identificador } });
      setEnviado({ emailEnviado: res.emailEnviado });
    } catch {
      setErro("Não foi possível enviar o pedido. Tente de novo.");
    } finally {
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
          <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-tinta">Recuperar senha</h1>
        </div>

        {enviado ? (
          <div className="mt-8 rounded-2xl border border-papel-3 bg-papel-3 p-6 text-center">
            <p className="font-display text-xl text-tinta">Pedido registrado</p>
            {enviado.emailEnviado ? (
              <p className="mt-2 text-sm text-tinta-2">
                Se essa conta existir, um email com o link de redefinição acabou de ser enviado. Vale por 24 horas; confira
                também a caixa de spam.
              </p>
            ) : (
              <p className="mt-2 text-sm text-tinta-2">
                Se essa conta existir, o pedido fica ativo por 24 horas. Peça a outro leitor da casa: em Minha conta, ele
                verá seu pedido e poderá te passar o link de redefinição.
              </p>
            )}
            <Link to="/entrar" className="mt-5 inline-block text-sm text-amora underline underline-offset-4">
              Voltar para o login
            </Link>
          </div>
        ) : (
          <>
            <p className="mt-3 text-center text-sm text-tinta-2">
              Digite seu usuário ou email. Vamos registrar um pedido de redefinição.
            </p>
            <form
              className="mt-6 rounded-2xl border border-papel-3 bg-papel-3 p-6 shadow-[0_10px_30px_-15px_rgba(93,74,43,0.35)]"
              onSubmit={(e) => {
                e.preventDefault();
                enviar();
              }}
            >
              <label className="block text-sm font-medium text-tinta-2">
                Usuário ou email
                <input
                  value={identificador}
                  onChange={(e) => setIdentificador(e.target.value)}
                  autoComplete="username"
                  autoFocus
                  className="mt-1 w-full rounded-lg border border-papel-3 bg-papel px-3 py-2.5 text-tinta focus:border-amora focus:outline-none"
                />
              </label>

              {erro && <p className="mt-3 text-sm text-amora-escura">{erro}</p>}

              <button
                type="submit"
                disabled={enviando || !identificador.trim()}
                className="mt-6 w-full rounded-xl bg-amora px-6 py-3 text-sm font-medium text-papel transition-colors hover:bg-amora-escura active:translate-y-[1px] disabled:opacity-60"
              >
                {enviando ? "Registrando..." : "Recuperar minha senha"}
              </button>
            </form>
            <p className="mt-5 text-center">
              <Link to="/entrar" className="text-sm text-tinta-2 underline underline-offset-4 hover:text-amora">
                Lembrei a senha, voltar
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
