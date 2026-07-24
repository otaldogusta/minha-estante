import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";

import { buscarLivroExterno, type ResultadoBusca } from "../lib/api/livros.functions";
import { Cabecalho } from "../components/estante/cabecalho";
import { CapaLivro } from "../components/estante/capa-livro";
import { FormularioLivro, type ValoresLivro } from "../components/estante/formulario-livro";
import { exigirLogin } from "../lib/exigir-login";

export const Route = createFileRoute("/novo")({
  beforeLoad: () => exigirLogin(),
  component: PaginaNovo,
});

function PaginaNovo() {
  const navigate = useNavigate();
  const [busca, setBusca] = useState("");
  const [resultados, setResultados] = useState<ResultadoBusca[] | null>(null);
  const [buscando, setBuscando] = useState(false);
  const [inicial, setInicial] = useState<ValoresLivro | null>(null);
  const buscaRef = useRef(0);

  async function buscar() {
    const q = busca.trim();
    if (q.length < 2) return;
    const id = ++buscaRef.current;
    setBuscando(true);
    try {
      const res = await buscarLivroExterno({ data: { q } });
      if (id === buscaRef.current) setResultados(res);
    } catch {
      if (id === buscaRef.current) setResultados([]);
    } finally {
      if (id === buscaRef.current) setBuscando(false);
    }
  }

  function escolher(r: ResultadoBusca) {
    setInicial({
      titulo: r.titulo,
      autor: r.autor,
      editora: r.editora,
      ano: r.ano,
      paginas: r.paginas,
      capa: r.capa,
      sinopse: r.sinopse,
      status: "lendo",
      inicio: new Date().toISOString().slice(0, 10),
    });
  }

  return (
    <div className="min-h-dvh pb-24">
      <Cabecalho />
      <main className="mx-auto max-w-4xl px-4 sm:px-6">
        <h1 className="mt-10 font-display text-3xl font-semibold tracking-tight text-tinta md:text-4xl">
          Adicionar um livro
        </h1>

        {!inicial && (
          <>
            <p className="mt-2 max-w-xl text-tinta-2">
              Digite o título (e o autor, se quiser). A ficha do livro chega pronta: capa, editora, ano e páginas.
            </p>
            <div className="mt-6 flex max-w-xl gap-2">
              <input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && buscar()}
                placeholder="Ex.: Quarta Asa Rebecca Yarros"
                aria-label="Buscar livro"
                autoFocus
                className="flex-1 rounded-xl border border-papel-3 bg-papel px-4 py-3 text-tinta placeholder:text-tinta-3 focus:border-amora focus:outline-none"
              />
              <button
                onClick={buscar}
                disabled={buscando || busca.trim().length < 2}
                className="rounded-xl bg-amora px-6 py-3 text-sm font-medium text-papel transition-colors hover:bg-amora-escura active:translate-y-[1px] disabled:opacity-60"
              >
                {buscando ? "Buscando..." : "Buscar"}
              </button>
            </div>

            {buscando && (
              <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="motion-safe:animate-pulse">
                    <div className="aspect-[2/3] rounded-lg bg-papel-3" />
                    <div className="mt-3 h-3 w-3/4 rounded bg-papel-3" />
                    <div className="mt-2 h-3 w-1/2 rounded bg-papel-3" />
                  </div>
                ))}
              </div>
            )}

            {!buscando && resultados && resultados.length === 0 && (
              <div className="mt-8 rounded-2xl border border-dashed border-tinta-3 p-6">
                <p className="text-tinta">Nada encontrado com essa busca.</p>
                <button onClick={() => setInicial({ titulo: busca, status: "lendo" })} className="mt-2 text-sm text-amora underline underline-offset-4">
                  Preencher a ficha manualmente
                </button>
              </div>
            )}

            {!buscando && resultados && resultados.length > 0 && (
              <>
                <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-4">
                  {resultados.map((r, i) => (
                    <button key={i} onClick={() => escolher(r)} className="livro-hover group block text-left">
                      <CapaLivro titulo={r.titulo} autor={r.autor} capa={r.capa} />
                      <p className="mt-3 line-clamp-2 text-sm font-medium text-tinta group-hover:text-amora">{r.titulo}</p>
                      <p className="mt-0.5 truncate text-xs text-tinta-2">{r.autor}</p>
                      {r.ano && <p className="font-num text-xs text-tinta-3">{r.ano}</p>}
                    </button>
                  ))}
                </div>
                <button onClick={() => setInicial({ titulo: busca, status: "lendo" })} className="mt-6 text-sm text-tinta-2 underline underline-offset-4 hover:text-amora">
                  Nenhum desses. Preencher manualmente
                </button>
              </>
            )}

            {!resultados && !buscando && (
              <button onClick={() => setInicial({ status: "lendo" })} className="mt-6 text-sm text-tinta-2 underline underline-offset-4 hover:text-amora">
                Prefiro preencher a ficha manualmente
              </button>
            )}
          </>
        )}

        {inicial && (
          <div className="mt-8">
            <button onClick={() => setInicial(null)} className="mb-6 text-sm text-tinta-2 hover:text-amora">
              ← voltar para a busca
            </button>
            <FormularioLivro
              inicial={inicial}
              aoSalvar={() => navigate({ to: "/" })}
            />
          </div>
        )}
      </main>
    </div>
  );
}
