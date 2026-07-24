import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";

import { obterPerfilPublico } from "../lib/api/livros.functions";
import { diasDeLeitura, notaFmt } from "../lib/livros";
import { Cabecalho } from "../components/estante/cabecalho";
import { CapaLivro } from "../components/estante/capa-livro";
import { Estrelas } from "../components/estante/estrelas";
import { exigirLogin } from "../lib/exigir-login";

export const Route = createFileRoute("/leitor/$usuario")({
  beforeLoad: () => exigirLogin(),
  loader: ({ params }) => obterPerfilPublico({ data: { usuario: params.usuario } }),
  component: PaginaPerfil,
});

function PaginaPerfil() {
  const perfil = Route.useLoaderData();
  const { livros } = perfil;

  const lendo = livros.filter((l) => l.status === "lendo");
  const lidos = livros.filter((l) => l.status === "lido");
  const queroLer = livros.filter((l) => l.status === "quero_ler");
  const paginas = lidos.reduce((s, l) => s + (l.paginas ?? 0), 0);
  const comNota = lidos.filter((l) => l.nota !== null);
  const notaMedia = comNota.length ? comNota.reduce((s, l) => s + (l.nota ?? 0), 0) / comNota.length : null;

  const porAno = useMemo(() => {
    const m = new Map<number, typeof lidos>();
    for (const l of lidos) {
      const ano = l.ano_leitura ?? 0;
      if (!m.has(ano)) m.set(ano, []);
      m.get(ano)!.push(l);
    }
    return [...m.entries()].sort((a, b) => b[0] - a[0]);
  }, [lidos]);

  return (
    <div className="min-h-dvh pb-24">
      <Cabecalho paginaAtiva="leitores" />
      <main className="mx-auto max-w-6xl px-4 sm:px-6">
        <Link to="/leitores" className="mt-8 inline-block text-sm text-tinta-2 hover:text-amora">
          ← leitores
        </Link>

        <div className="mt-6 flex items-center gap-5">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-amora-clara font-display text-3xl text-amora">
            {perfil.nome.charAt(0).toUpperCase()}
          </span>
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-tinta">{perfil.nome}</h1>
            <p className="mt-0.5 text-sm text-tinta-2">
              {perfil.souEu ? "Sua estante" : `a estante de ${perfil.nome}`}
            </p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-y-6 border-y border-papel-3 py-6">
          {[
            [String(lidos.length), "livros lidos"],
            [paginas.toLocaleString("pt-BR"), "páginas"],
            [notaMedia ? notaFmt(notaMedia) : "sem notas", "nota média"],
          ].map(([v, r]) => (
            <div key={r} className="text-center">
              <p className="font-num text-2xl text-tinta md:text-3xl">{v}</p>
              <p className="mt-1 text-sm text-tinta-2">{r}</p>
            </div>
          ))}
        </div>

        {lendo.length > 0 && (
          <section className="mt-10">
            <h2 className="font-display text-2xl font-semibold tracking-tight text-tinta">Lendo agora</h2>
            <div className="mt-4 flex flex-wrap gap-6">
              {lendo.map((l) => (
                <div key={l.id} className="flex w-full max-w-md items-center gap-4 rounded-2xl border border-papel-3 bg-papel-2 p-4">
                  <div className="w-20 shrink-0">
                    <CapaLivro titulo={l.titulo} autor={l.autor} capa={l.capa} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-display text-lg font-semibold leading-snug text-tinta">{l.titulo}</p>
                    <p className="mt-0.5 text-sm text-tinta-2">{l.autor}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {porAno.map(([ano, doAno]) => (
          <section key={ano} className="mt-10">
            <div className="flex items-baseline gap-3">
              <h3 className="font-num text-lg text-amora">{ano || "sem ano"}</h3>
              <span className="text-sm text-tinta-3">
                {doAno.length} {doAno.length === 1 ? "livro" : "livros"}
              </span>
            </div>
            <div className="prateleira mt-4 mb-8 flex snap-x gap-5 overflow-x-auto pb-2 [scrollbar-width:thin] sm:flex-wrap sm:overflow-visible">
              {doAno.map((l) => {
                const dias = diasDeLeitura(l);
                return (
                  <div key={l.id} className="livro-hover w-32 shrink-0 snap-start sm:w-36">
                    <CapaLivro titulo={l.titulo} autor={l.autor} capa={l.capa} />
                    <div className="mt-3 px-0.5">
                      <p className="truncate text-sm font-medium text-tinta" title={l.titulo}>
                        {l.titulo}
                      </p>
                      <div className="mt-0.5 flex items-center justify-between gap-2">
                        <Estrelas nota={l.nota} className="text-[11px]" />
                        {dias !== null && (
                          <span className="font-num text-[11px] text-tinta-3">{dias === 0 ? "1 dia" : `${dias}d`}</span>
                        )}
                      </div>
                      {l.palavra && <p className="mt-0.5 truncate font-display text-xs italic text-amora">“{l.palavra}”</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}

        {queroLer.length > 0 && (
          <section className="mt-12">
            <h3 className="font-display text-2xl font-semibold tracking-tight text-tinta">Quer ler</h3>
            <div className="prateleira mt-4 mb-8 flex snap-x gap-5 overflow-x-auto pb-2 [scrollbar-width:thin] sm:flex-wrap sm:overflow-visible">
              {queroLer.map((l) => (
                <div key={l.id} className="w-32 shrink-0 snap-start sm:w-36">
                  <CapaLivro titulo={l.titulo} autor={l.autor} capa={l.capa} />
                  <p className="mt-3 truncate px-0.5 text-sm font-medium text-tinta">{l.titulo}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {livros.length === 0 && (
          <div className="mt-10 rounded-2xl border border-dashed border-tinta-3 p-10 text-center">
            <p className="font-display text-2xl text-tinta">A estante de {perfil.nome} ainda está vazia</p>
            <p className="mt-2 text-tinta-2">Ou os livros estão guardados no modo privado.</p>
          </div>
        )}
      </main>
    </div>
  );
}
