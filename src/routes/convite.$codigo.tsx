import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useState } from "react";

import { validarConvite, cadastrarComConvite } from "../lib/api/auth.functions";
import { CampoSenha } from "../components/estante/campo-senha";

export const Route = createFileRoute("/convite/$codigo")({
  loader: async ({ params }) => {
    if (!/^[0-9a-f]{24}$/.test(params.codigo)) return { valido: false as const };
    return validarConvite({ data: { codigo: params.codigo } });
  },
  component: PaginaConvite,
});

const campo =
  "mt-1 w-full rounded-lg border border-papel-3 bg-papel px-3 py-2.5 text-tinta focus:border-amora focus:outline-none";

function PaginaConvite() {
  const convite = Route.useLoaderData();
  const { codigo } = Route.useParams();
  const navigate = useNavigate();
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function cadastrar() {
    setErro(null);
    if (!nome.trim() || !usuario.trim() || !senha) return;
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
      const res = await cadastrarComConvite({ data: { codigo, nome, usuario, senha } });
      if (res.ok) {
        await router.invalidate();
        navigate({ to: "/" });
      } else {
        setErro(res.erro);
        setEnviando(false);
      }
    } catch {
      setErro("Não foi possível criar a conta. Tente de novo.");
      setEnviando(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-papel px-4 py-10 textura-papel">
      <div className="surgir w-full max-w-sm">
        <div className="text-center">
          <span aria-hidden className="inline-flex gap-[4px]">
            <span className="inline-block h-8 w-[7px] rounded-sm bg-amora" />
            <span className="inline-block h-6 w-[7px] translate-y-2 rounded-sm bg-tinta-2" />
            <span className="inline-block h-8 w-[7px] rounded-sm bg-tinta" />
          </span>
          <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-tinta">Minha Estante</h1>
        </div>

        {!convite.valido ? (
          <div className="mt-8 rounded-2xl border border-dashed border-tinta-3 bg-papel-2/60 p-8 text-center space-y-3">
            <div className="mx-auto w-12 h-12 rounded-full bg-amora-clara flex items-center justify-center text-amora text-xl">
              {"usado" in convite && convite.usado ? "✓" : "🔒"}
            </div>
            <p className="font-display text-xl font-bold text-tinta">
              {"usado" in convite && convite.usado
                ? "Este convite já foi utilizado e finalizado"
                : "expirado" in convite && convite.expirado
                ? "Este convite expirou (mais de 48h)"
                : "Convite inválido ou revogado"}
            </p>
            <p className="text-xs text-tinta-2 leading-relaxed max-w-xs mx-auto">
              {"usado" in convite && convite.usado
                ? `Este link era de uso único e já foi utilizado por ${(convite as any).usadoPorNome ? `"${(convite as any).usadoPorNome}"` : "um leitor"} para criar uma conta.`
                : "Peça um novo link de convite para o dono da estante."}
            </p>
            <div className="pt-3">
              <Link to="/entrar" className="rounded-xl bg-amora px-5 py-2.5 text-xs font-semibold text-papel hover:bg-amora-escura transition-all inline-block shadow-xs">
                Ir para o login
              </Link>
            </div>
          </div>
        ) : (
          <>
            <p className="mt-3 text-center text-tinta-2">
              {convite.convidou} convidou você para montar a sua estante.
            </p>
            <form
              className="mt-6 space-y-4 rounded-2xl border border-papel-3 card-surface p-6 shadow-[0_10px_30px_-15px_rgba(93,74,43,0.35)]"
              onSubmit={(e) => {
                e.preventDefault();
                cadastrar();
              }}
            >
              <label className="block text-sm font-medium text-tinta-2">
                Seu nome
                <input value={nome} onChange={(e) => setNome(e.target.value)} className={campo} autoComplete="name" autoFocus />
              </label>
              <label className="block text-sm font-medium text-tinta-2">
                Usuário (para entrar)
                <input value={usuario} onChange={(e) => setUsuario(e.target.value)} className={campo} autoComplete="username" />
              </label>
              <label className="block text-sm font-medium text-tinta-2">
                Senha
                <CampoSenha value={senha} onChange={(e) => setSenha(e.target.value)} autoComplete="new-password" className={campo} />
              </label>
              <label className="block text-sm font-medium text-tinta-2">
                Confirmar senha
                <CampoSenha value={confirmar} onChange={(e) => setConfirmar(e.target.value)} autoComplete="new-password" className={campo} />
              </label>

              {erro && <p className="text-sm text-amora-escura">{erro}</p>}

              <button
                type="submit"
                disabled={enviando || !nome.trim() || !usuario.trim() || !senha || !confirmar}
                className="w-full rounded-xl bg-amora px-6 py-3 text-sm font-medium text-papel transition-colors hover:bg-amora-escura active:translate-y-[1px] disabled:opacity-60"
              >
                {enviando ? "Montando sua estante..." : "Criar minha estante"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
