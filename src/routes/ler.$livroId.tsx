import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { obterLivroParaLeitura } from "../lib/api/livros.functions";
import { carregarTextoGutenberg } from "../lib/api/conquistas.functions";
import { LeitorDigital } from "../components/estante/leitor-digital";
import { Cabecalho } from "../components/estante/cabecalho";
import { exigirLogin } from "../lib/exigir-login";

function LeitorLivroNaoEncontrado() {
  return (
    <div className="min-h-dvh bg-papel text-tinta">
      <Cabecalho />
      <main className="mx-auto max-w-md px-4 py-20 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-amora-clara text-amora shadow-xs">
          <svg viewBox="0 0 24 24" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
            <path d="M9 10h6" />
          </svg>
        </div>
        <h1 className="mt-6 font-display text-2xl font-semibold text-tinta">Livro não encontrado para leitura</h1>
        <p className="mt-2 text-sm text-tinta-2 leading-relaxed">
          O livro selecionado não existe na sua estante ou ainda não foi adicionado.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/acervo"
            className="inline-flex items-center justify-center rounded-full bg-amora px-6 py-2.5 text-sm font-medium text-papel hover:bg-amora-escura transition-all cursor-pointer shadow-xs"
          >
            Explorar Acervo de Livros
          </Link>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full border border-papel-3 px-6 py-2.5 text-sm font-medium text-tinta hover:border-amora hover:text-amora transition-all cursor-pointer"
          >
            ← Voltar para a Estante
          </Link>
        </div>
      </main>
    </div>
  );
}

export const Route = createFileRoute("/ler/$livroId")({
  beforeLoad: () => exigirLogin(),
  loader: async ({ params }) => {
    const id = Number(params.livroId);
    if (isNaN(id) || id <= 0) throw notFound();
    const livro = await obterLivroParaLeitura({ data: { id } });
    if (!livro) throw notFound();

    let textoOnline: string | undefined = undefined;
    try {
      const gut = await carregarTextoGutenberg({
        data: {
          gutenbergId: livro.gutenberg_id ?? undefined,
          titulo: livro.titulo,
        },
      });
      if (gut?.texto) {
        textoOnline = gut.texto;
      }
    } catch {}

    return { livro, textoOnline };
  },
  notFoundComponent: LeitorLivroNaoEncontrado,
  component: PaginaLeitura,
});

function PaginaLeitura() {
  const { livro, textoOnline } = Route.useLoaderData();
  return <LeitorDigital livro={livro} conteudoTexto={textoOnline} />;
}
