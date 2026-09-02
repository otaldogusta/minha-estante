import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";

import { buscarLivroExterno, type ResultadoBusca, salvarLivro } from "../lib/api/livros.functions";
import { Cabecalho } from "../components/estante/cabecalho";
import { CapaLivro } from "../components/estante/capa-livro";
import { FormularioLivro, type ValoresLivro } from "../components/estante/formulario-livro";
import { exigirLogin } from "../lib/exigir-login";
import { notificar } from "../lib/toast";
import { extrairDadosDeArquivo, obterTamanhoTextoReal } from "../lib/file-parser";
import { salvarConteudoLocal } from "../lib/db-local";

export const Route = createFileRoute("/novo")({
  beforeLoad: () => exigirLogin(),
  component: PaginaNovo,
});

function IconeUpload({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" x2="12" y1="3" y2="15" />
    </svg>
  );
}

function PaginaNovo() {
  const navigate = useNavigate();
  const [busca, setBusca] = useState("");
  const [resultados, setResultados] = useState<ResultadoBusca[] | null>(null);
  const [buscando, setBuscando] = useState(false);
  const [inicial, setInicial] = useState<ValoresLivro | null>(null);
  const [uploadando, setUploadando] = useState(false);
  const buscaRef = useRef(0);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadando(true);
    try {
      notificar("Lendo e extraindo conteúdo do arquivo...", "info");
      const dadosExtraidos = await extrairDadosDeArquivo(file);
      const { texto, capa, titulo, autor, editora, sinopse, genero, ano } = dadosExtraidos;
      
      const ext = file.name.split(".").pop()?.toUpperCase() || "EPUB";
      const paginasEstimadas = Math.max(1, Math.ceil(obterTamanhoTextoReal(texto) / 1000));

      const res = await salvarLivro({
        data: {
          titulo: titulo || file.name.replace(/\.[^/.]+$/, ""),
          autor: autor || "Autor Desconhecido",
          formato: ext as any,
          status: "lendo",
          inicio: new Date().toISOString().split("T")[0],
          paginas: paginasEstimadas,
          genero: genero || "Ficção",
          editora: editora || undefined,
          ano: ano || undefined,
          capa: capa || undefined,
          sinopse: sinopse || `Arquivo importado: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`,
        },
      });

      await salvarConteudoLocal(res.id, texto);

      notificar("Livro importado com sucesso!", "sucesso");
      navigate({ to: "/ler/$livroId", params: { livroId: String(res.id) } });
    } catch (erro: any) {
      console.error("Erro no upload:", erro);
      notificar(erro.message || "Não foi possível importar o arquivo.", "erro");
    } finally {
      setUploadando(false);
    }
  }
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

            {!inicial && (
              <div className="mt-12 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-papel-3 bg-papel-2/30 p-8 text-center transition-all hover:border-amora hover:bg-papel-2/60">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amora-clara text-amora shadow-xs">
                  <IconeUpload className="h-6 w-6 text-amora" />
                </div>
                <h3 className="mt-3 font-display font-semibold text-base text-tinta">
                  Importar seu EPUB ou PDF
                </h3>
                <p className="mt-1 text-xs text-tinta-2 max-w-xs leading-relaxed">
                  Adicione qualquer livro digital que você tenha para ler direto na aplicação com sincronização automática de páginas.
                </p>
                <label className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-full bg-amora px-4 py-2 text-xs font-medium text-papel hover:bg-amora-escura cursor-pointer transition-colors shadow-xs">
                  <IconeUpload className="h-3.5 w-3.5" />
                  <span>{uploadando ? "Importando..." : "Selecionar Arquivo"}</span>
                  <input
                    type="file"
                    accept=".epub,.pdf,.txt"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={uploadando}
                  />
                </label>
              </div>
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
