import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { z } from "zod";

import { obterLivro, excluirLivro } from "../lib/api/livros.functions";
import { cartasDesbloqueadasPorLivro } from "../lib/api/cartas.functions";
import { brl, dataCurta, diasDeLeitura } from "../lib/livros";
import { Cabecalho } from "../components/estante/cabecalho";
import { CapaLivro } from "../components/estante/capa-livro";
import { Estrelas } from "../components/estante/estrelas";
import { FormularioLivro } from "../components/estante/formulario-livro";
import { Celebracao } from "../components/estante/celebracao";
import { exigirLogin } from "../lib/exigir-login";

export const Route = createFileRoute("/livro/$livroId")({
  beforeLoad: () => exigirLogin(),
  validateSearch: z.object({ concluir: z.boolean().optional() }),
  loader: ({ params }) => obterLivro({ data: { id: Number(params.livroId) } }),
  component: PaginaLivro,
});

function PaginaLivro() {
  const livro = Route.useLoaderData();
  const { concluir } = Route.useSearch();
  const navigate = useNavigate();
  const router = useRouter();
  const [editando, setEditando] = useState(!!concluir);
  const [celebrar, setCelebrar] = useState(false);
  const [cartasNovas, setCartasNovas] = useState<Array<{ id: number; remetente: string }>>([]);
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const dias = diasDeLeitura(livro);

  async function excluir() {
    await excluirLivro({ data: { id: livro.id } });
    navigate({ to: "/" });
  }

  const iniciaisEdicao = concluir
    ? {
        ...livro,
        status: "lido" as const,
        fim: livro.fim ?? new Date().toISOString().slice(0, 10),
        ano_leitura: livro.ano_leitura ?? new Date().getFullYear(),
      }
    : livro;

  useEffect(() => {
    if (modalAberto) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [modalAberto]);

  return (
    <div className="min-h-dvh pb-24">
      <Cabecalho />
      {celebrar && (
        <Celebracao
          titulo={livro.titulo}
          autor={livro.autor}
          capa={livro.capa}
          nota={livro.nota}
          dias={dias}
          cartas={cartasNovas}
          aoFechar={() => navigate({ to: "/" })}
        />
      )}
      <main className="mx-auto max-w-4xl px-4 sm:px-6">
        <Link to="/" className="mt-8 inline-block text-sm text-tinta-2 hover:text-amora">
          ← estante
        </Link>

        {editando ? (
          <div className="mt-6">
            {concluir && (
              <div className="mb-6 rounded-2xl bg-amora-clara p-4 text-amora-escura">
                <p className="font-display text-lg">Mais um livro terminado!</p>
                <p className="text-sm">Confirme a data, dê a nota e escolha a palavra deste livro.</p>
              </div>
            )}
            <h1 className="mb-6 font-display text-3xl font-semibold tracking-tight text-tinta">Editar livro</h1>
            <FormularioLivro
              inicial={iniciaisEdicao}
              aoSalvar={async (id) => {
                const celebrarAgora = !!concluir;
                if (celebrarAgora) {
                  try {
                    setCartasNovas(await cartasDesbloqueadasPorLivro({ data: { livroId: id } }));
                  } catch {
                    setCartasNovas([]);
                  }
                }
                await router.invalidate();
                navigate({ to: "/livro/$livroId", params: { livroId: String(id) }, search: {} });
                setEditando(false);
                if (celebrarAgora) setCelebrar(true);
              }}
            />
          </div>
        ) : (
          <div className="mt-6 grid gap-8 md:grid-cols-[220px_1fr]">
            <div className="mx-auto w-48 md:mx-0 md:w-full">
              <CapaLivro titulo={livro.titulo} autor={livro.autor} capa={livro.capa} />
            </div>
            <div>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h1 className="font-display text-3xl font-semibold leading-tight tracking-tight text-tinta md:text-4xl">
                    {livro.titulo}
                  </h1>
                  <p className="mt-1 text-lg text-tinta-2">{livro.autor}</p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    livro.status === "lendo"
                      ? "bg-amora text-papel"
                      : livro.status === "lido"
                        ? "bg-papel-3 text-tinta"
                        : "bg-papel-2 text-tinta-2"
                  }`}
                >
                  {livro.status === "lendo"
                    ? "Lendo agora"
                    : livro.status === "lido"
                      ? "Lido"
                      : livro.status === "quero_ler"
                        ? "Quero ler"
                        : "Abandonado"}
                </span>
              </div>

              {livro.nota !== null && (
                <div className="mt-3 flex items-center gap-3">
                  <Estrelas nota={livro.nota} className="text-xl" />
                  {livro.palavra && (
                    <span className="font-display text-lg italic text-amora">“{livro.palavra}”</span>
                  )}
                </div>
              )}

              <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
                {[
                  ["Gênero", livro.genero],
                  ["Editora", livro.editora],
                  ["Publicado em", livro.ano ? String(livro.ano) : null],
                  ["Páginas", livro.paginas ? String(livro.paginas) : null],
                  ["Formato", livro.formato],
                  ["País", livro.pais],
                  ["Começou", dataCurta(livro.inicio) || null],
                  ["Terminou", dataCurta(livro.fim) || null],
                  ["Tempo de leitura", dias !== null ? (dias === 0 ? "1 dia" : `${dias} dias`) : null],
                  ["Valor", livro.valor !== null ? brl(livro.valor) : null],
                  ["Adaptação", livro.adaptacao ? (livro.vi_adaptacao ? "Sim, já assisti" : "Sim, ainda não vi") : "Não tem"],
                  ["Ano da leitura", livro.ano_leitura ? String(livro.ano_leitura) : null],
                ]
                  .filter(([, v]) => v)
                  .map(([k, v]) => (
                    <div key={k}>
                      <dt className="text-tinta-3">{k}</dt>
                      <dd className="mt-0.5 font-num text-tinta">{v}</dd>
                    </div>
                  ))}
              </dl>

              {livro.resenha && (
                <div className="mt-6 rounded-2xl bg-papel-2 p-5">
                  <p className="text-sm text-tinta-3">Suas anotações</p>
                  {livro.resenha.length > 280 ? (
                    <>
                      <p className="mt-2 whitespace-pre-wrap font-display leading-relaxed text-tinta">
                        {livro.resenha.slice(0, 280)}...
                      </p>
                      <button
                        onClick={() => setModalAberto(true)}
                        className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-amora hover:text-amora-escura underline underline-offset-4 cursor-pointer"
                      >
                        ler mais +
                      </button>
                    </>
                  ) : (
                    <p className="mt-2 whitespace-pre-wrap font-display leading-relaxed text-tinta">{livro.resenha}</p>
                  )}
                </div>
              )}

              {livro.sinopse && (
                <details className="mt-6">
                  <summary className="cursor-pointer text-sm text-tinta-2 hover:text-amora">Sinopse</summary>
                  <p className="mt-2 max-w-prose text-sm leading-relaxed text-tinta-2">{livro.sinopse}</p>
                </details>
              )}

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setEditando(true)}
                  className="rounded-xl bg-amora px-6 py-2.5 text-sm font-medium text-papel transition-colors hover:bg-amora-escura active:translate-y-[1px]"
                >
                  Editar
                </button>
                {!confirmarExclusao ? (
                  <button
                    onClick={() => setConfirmarExclusao(true)}
                    className="rounded-xl border border-papel-3 px-6 py-2.5 text-sm text-tinta-2 transition-colors hover:border-amora hover:text-amora"
                  >
                    Remover
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-2 text-sm">
                    <span className="text-tinta-2">Remover da estante?</span>
                    <button onClick={excluir} className="rounded-lg bg-amora-escura px-3 py-1.5 text-papel">
                      Sim, remover
                    </button>
                    <button onClick={() => setConfirmarExclusao(false)} className="rounded-lg border border-papel-3 px-3 py-1.5 text-tinta-2">
                      Cancelar
                    </button>
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal de Anotações/Resenha Completa */}
      {modalAberto && livro.resenha && (
        <div 
          className="modal-backdrop"
          onClick={() => setModalAberto(false)}
        >
          <div 
            className="w-full max-w-2xl my-auto rounded-2xl border border-papel-3 bg-papel p-6 shadow-2xl flex flex-col max-h-[80vh] surgir"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-papel-3/50 pb-3">
              <div>
                <h3 className="font-display text-lg font-semibold text-tinta">Minhas anotações</h3>
                <p className="text-xs text-tinta-2 mt-0.5">{livro.titulo}</p>
              </div>
              <button 
                onClick={() => setModalAberto(false)}
                className="rounded-full p-1.5 text-tinta-2 hover:bg-papel-2 hover:text-tinta cursor-pointer transition-colors"
                aria-label="Fechar"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
            
            <div className="mt-5 overflow-y-auto pr-2 flex-1 font-display text-base leading-relaxed text-tinta whitespace-pre-wrap custom-scrollbar">
              {livro.resenha}
            </div>
            
            <div className="mt-6 flex justify-end border-t border-papel-3/50 pt-3">
              <button
                onClick={() => setModalAberto(false)}
                className="rounded-xl bg-amora px-5 py-2 text-sm font-medium text-papel hover:bg-amora-escura transition-colors cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
