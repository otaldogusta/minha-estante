import { createFileRoute, Link, useNavigate, useRouter, notFound } from "@tanstack/react-router";
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
import { StoryGeneratorModal } from "../components/story/story-generator-modal";
import { exigirLogin } from "../lib/exigir-login";
import { notificar } from "../lib/toast";

function LivroNaoEncontrado() {
  return (
    <div className="min-h-dvh bg-papel">
      <Cabecalho />
      <main className="mx-auto max-w-md px-4 py-20 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-amora-clara text-amora shadow-xs">
          <svg viewBox="0 0 24 24" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
            <path d="M9 10h6" />
          </svg>
        </div>
        <h1 className="mt-6 font-display text-2xl font-semibold text-tinta">Livro não encontrado</h1>
        <p className="mt-2 text-sm text-tinta-2 leading-relaxed">
          Este livro não existe na sua estante ou pode ter sido removido.
        </p>
        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-amora px-6 py-2.5 text-sm font-medium text-papel hover:bg-amora-escura transition-all cursor-pointer shadow-xs"
          >
            ← Voltar para a estante
          </Link>
        </div>
      </main>
    </div>
  );
}

export const Route = createFileRoute("/livro/$livroId")({
  beforeLoad: () => exigirLogin(),
  validateSearch: z.object({ concluir: z.boolean().optional() }),
  loader: async ({ params }) => {
    const id = Number(params.livroId);
    if (isNaN(id) || id <= 0) throw notFound();
    const livro = await obterLivro({ data: { id } });
    if (!livro) throw notFound();
    return livro;
  },
  notFoundComponent: LivroNaoEncontrado,
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
  const [storyModalAberto, setStoryModalAberto] = useState(false);
  const dias = diasDeLeitura(livro);

  async function excluir() {
    await excluirLivro({ data: { id: livro.id } });
    notificar("Livro removido da estante.");
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
    if (modalAberto || storyModalAberto) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [modalAberto, storyModalAberto]);

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
          onGerarStory={() => {
            setCelebrar(false);
            setStoryModalAberto(true);
          }}
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

              <div className="mt-6 grid grid-cols-2 gap-4 rounded-2xl border border-papel-3 bg-papel-2/50 p-4 text-sm sm:grid-cols-3">
                {livro.inicio && (
                  <div>
                    <span className="text-xs text-tinta-3">Início</span>
                    <p className="font-medium text-tinta">{dataCurta(livro.inicio)}</p>
                  </div>
                )}
                {livro.fim && (
                  <div>
                    <span className="text-xs text-tinta-3">Término</span>
                    <p className="font-medium text-tinta">{dataCurta(livro.fim)}</p>
                  </div>
                )}
                {dias !== null && (
                  <div>
                    <span className="text-xs text-tinta-3">Tempo de leitura</span>
                    <p className="font-medium text-tinta">{dias === 0 ? "1 dia" : `${dias} dias`}</p>
                  </div>
                )}
                {livro.paginas && (
                  <div>
                    <span className="text-xs text-tinta-3">Páginas</span>
                    <p className="font-medium text-tinta">{livro.paginas}</p>
                  </div>
                )}
                {livro.genero && (
                  <div>
                    <span className="text-xs text-tinta-3">Gênero</span>
                    <p className="font-medium text-tinta">{livro.genero}</p>
                  </div>
                )}
                {livro.formato && (
                  <div>
                    <span className="text-xs text-tinta-3">Formato</span>
                    <p className="font-medium text-tinta">{livro.formato}</p>
                  </div>
                )}
                {livro.editora && (
                  <div>
                    <span className="text-xs text-tinta-3">Editora</span>
                    <p className="font-medium text-tinta">{livro.editora}</p>
                  </div>
                )}
                {livro.ano && (
                  <div>
                    <span className="text-xs text-tinta-3">Publicação</span>
                    <p className="font-medium text-tinta">{livro.ano}</p>
                  </div>
                )}
                {livro.valor !== null && livro.valor !== undefined && (
                  <div>
                    <span className="text-xs text-tinta-3">Valor</span>
                    <p className="font-medium text-tinta">{brl(livro.valor)}</p>
                  </div>
                )}
              </div>

              {livro.sinopse && (
                <div className="mt-6">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-tinta-3">Sinopse</h3>
                  <p className="mt-2 text-sm leading-relaxed text-tinta-2 whitespace-pre-line">{livro.sinopse}</p>
                </div>
              )}

              {livro.resenha && (
                <div className="mt-6 rounded-2xl border border-papel-3 bg-papel-2/30 p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-tinta-3">Minhas Anotações</h3>
                    <button
                      type="button"
                      onClick={() => setModalAberto(true)}
                      className="text-xs text-amora hover:underline cursor-pointer"
                    >
                      Ver completo
                    </button>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-tinta-2 line-clamp-4 whitespace-pre-line">
                    {livro.resenha}
                  </p>
                </div>
              )}

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  to="/ler/$livroId"
                  params={{ livroId: String(livro.id) }}
                  className="rounded-xl bg-amora px-5 py-2.5 text-sm font-medium text-papel transition-all hover:bg-amora-escura active:translate-y-[1px] shadow-xs cursor-pointer inline-flex items-center gap-2"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                  </svg>
                  <span>Abrir no Leitor</span>
                </Link>

                <button
                  type="button"
                  onClick={() => setStoryModalAberto(true)}
                  className="rounded-xl border border-pink-400/40 bg-pink-500/10 px-5 py-2.5 text-sm font-medium text-pink-600 dark:text-pink-300 transition-all hover:bg-pink-500/20 active:translate-y-[1px] shadow-xs cursor-pointer inline-flex items-center gap-2"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                  <span>Gerar Story</span>
                </button>

                <button
                  onClick={() => setEditando(true)}
                  className="rounded-xl border border-papel-3 px-5 py-2.5 text-sm font-medium text-tinta transition-colors hover:border-amora hover:text-amora active:translate-y-[1px] cursor-pointer"
                >
                  Editar
                </button>

                {!confirmarExclusao ? (
                  <button
                    onClick={() => setConfirmarExclusao(true)}
                    className="rounded-xl border border-papel-3 px-5 py-2.5 text-sm text-tinta-2 transition-colors hover:border-amora hover:text-amora cursor-pointer"
                  >
                    Remover
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-2 text-sm">
                    <span className="text-tinta-2">Remover da estante?</span>
                    <button onClick={excluir} className="rounded-lg bg-amora-escura px-3 py-1.5 text-papel cursor-pointer">
                      Sim, remover
                    </button>
                    <button onClick={() => setConfirmarExclusao(false)} className="rounded-lg border border-papel-3 px-3 py-1.5 text-tinta-2 cursor-pointer">
                      Cancelar
                    </button>
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <StoryGeneratorModal
        livro={livro}
        aberto={storyModalAberto}
        onClose={() => setStoryModalAberto(false)}
      />

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
