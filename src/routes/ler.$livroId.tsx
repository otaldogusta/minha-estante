import { createFileRoute, notFound } from "@tanstack/react-router";
import { obterLivro } from "../lib/api/livros.functions";
import { carregarTextoGutenberg } from "../lib/api/conquistas.functions";
import { LeitorDigital } from "../components/estante/leitor-digital";
import { exigirLogin } from "../lib/exigir-login";

export const Route = createFileRoute("/ler/$livroId")({
  beforeLoad: () => exigirLogin(),
  loader: async ({ params }) => {
    const id = Number(params.livroId);
    if (isNaN(id) || id <= 0) throw notFound();
    const livro = await obterLivro({ data: { id } });
    if (!livro) throw notFound();

    let textoOnline: string | undefined = undefined;
    if (livro.gutenberg_id) {
      try {
        const gut = await carregarTextoGutenberg({ data: { gutenbergId: livro.gutenberg_id } });
        textoOnline = gut.texto;
      } catch {}
    }

    return { livro, textoOnline };
  },
  component: PaginaLeitura,
});

function PaginaLeitura() {
  const { livro, textoOnline } = Route.useLoaderData();
  return <LeitorDigital livro={livro} conteudoTexto={textoOnline} />;
}
