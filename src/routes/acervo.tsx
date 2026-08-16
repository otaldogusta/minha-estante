import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Cabecalho } from "../components/estante/cabecalho";
import {
  obterConquistasEAcervo,
  adicionarLivroDoAcervo,
  type LivroAcervo,
  type Conquista,
} from "../lib/api/conquistas.functions";
import { salvarLivro } from "../lib/api/livros.functions";
import { exigirLogin } from "../lib/exigir-login";
import { notificar } from "../lib/toast";

export const Route = createFileRoute("/acervo")({
  beforeLoad: () => exigirLogin(),
  loader: async () => {
    return await obterConquistasEAcervo();
  },
  component: PaginaAcervo,
});

// Componentes de Ícones Vetoriais SVG Limpos (sem emojis)
function IconeRaio({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function IconeTrofeu({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.45 1-1 1H7v4h10v-4h-2c-.55 0-1-.45-1-1v-2.34" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );
}

function IconeLivro({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    </svg>
  );
}

function IconeUpload({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function IconeMedalha({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="6" />
      <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
    </svg>
  );
}

function IconeGlobo({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function IconeEstrela({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function IconeSprout({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 20h10" />
      <path d="M10 20c5.5-2.5.8-6.4 3-10" />
      <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4.1 5.5.8z" />
      <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4.1 1-4.9 2z" />
    </svg>
  );
}

function IconeTemplo({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="2" y1="22" x2="22" y2="22" />
      <line x1="4" y1="18" x2="20" y2="18" />
      <line x1="6" y1="18" x2="6" y2="11" />
      <line x1="10" y1="18" x2="10" y2="11" />
      <line x1="14" y1="18" x2="14" y2="11" />
      <line x1="18" y1="18" x2="18" y2="11" />
      <polygon points="12 2 20 7 4 7 12 2" />
    </svg>
  );
}

function renderIconeConquista(chave: string) {
  switch (chave) {
    case "leitor_7_dias":
      return <IconeRaio className="h-6 w-6 text-amora" />;
    case "primeiro_livro":
      return <IconeSprout className="h-6 w-6 text-amora" />;
    case "devorador_500":
      return <IconeLivro className="h-6 w-6 text-amora" />;
    case "viajante_3_paises":
      return <IconeGlobo className="h-6 w-6 text-amora" />;
    case "guardiao_classicos":
      return <IconeTemplo className="h-6 w-6 text-amora" />;
    default:
      return <IconeMedalha className="h-6 w-6 text-amora" />;
  }
}

function PaginaAcervo() {
  const dados = Route.useLoaderData();
  const navigate = useNavigate();
  const [adicionandoId, setAdicionandoId] = useState<number | null>(null);
  const [filtro, setFiltro] = useState<"todos" | "pt" | "en" | "conquistas">("todos");
  const [busca, setBusca] = useState<string>("");
  const [amostraModal, setAmostraModal] = useState<LivroAcervo | null>(null);
  const [uploadando, setUploadando] = useState<boolean>(false);

  const livrosFiltrados = dados.livrosAcervo.filter((l) => {
    if (filtro === "pt" && l.idioma !== "pt") return false;
    if (filtro === "en" && l.idioma !== "en") return false;
    if (busca.trim()) {
      const q = busca.toLowerCase();
      return l.titulo.toLowerCase().includes(q) || l.autor.toLowerCase().includes(q);
    }
    return true;
  });

  async function handleAdicionar(acervo: LivroAcervo, irParaLeitura = false) {
    setAdicionandoId(acervo.id);
    try {
      const res = await adicionarLivroDoAcervo({ data: { acervoId: acervo.id } });
      notificar("Adicionado à sua Estante!", "sucesso");
      if (irParaLeitura) {
        navigate({ to: "/ler/$livroId", params: { livroId: String(res.id) } });
      }
    } catch {
      notificar("Erro ao adicionar livro", "erro");
    } finally {
      setAdicionandoId(null);
    }
  }

  // Upload simulado de EPUB / PDF pessoal
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadando(true);
    try {
      const nomeSemExt = file.name.replace(/\.[^/.]+$/, "");
      const res = await salvarLivro({
        data: {
          titulo: nomeSemExt,
          autor: "Autor do Arquivo",
          formato: "Kindle",
          status: "lendo",
          inicio: new Date().toISOString().split("T")[0],
          paginas: 200,
          genero: "Ficção",
          sinopse: `Arquivo importado: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`,
        },
      });
      notificar(`Arquivo "${file.name}" importado com sucesso!`, "sucesso");
      navigate({ to: "/ler/$livroId", params: { livroId: String(res.id) } });
    } catch {
      notificar("Erro ao importar arquivo", "erro");
    } finally {
      setUploadando(false);
    }
  }

  return (
    <div className="min-h-dvh bg-papel text-tinta selection:bg-amora/20">
      <Cabecalho paginaAtiva="acervo" />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* Banner do Desafio Semanal & Conquistas (Gamificação) */}
        <section className="surgir mb-8 overflow-hidden rounded-2xl border border-papel-3 bg-papel-2/60 p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amora">
                <IconeRaio className="h-3.5 w-3.5 text-amora animate-pulse" />
                <span>Desafio Semanal de Leitura</span>
              </div>
              <h2 className="mt-2 font-display text-xl sm:text-2xl font-bold text-tinta">
                {dados.desafioSemanal.titulo}
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-tinta-2 leading-relaxed max-w-2xl">
                {dados.desafioSemanal.descricao}
              </p>

              {/* Barra de Progresso */}
              <div className="mt-4 max-w-md">
                <div className="flex items-center justify-between text-xs font-num font-medium text-tinta-2 mb-1.5">
                  <span>
                    {dados.desafioSemanal.diasConcluidos} de {dados.desafioSemanal.metaDias} dias
                  </span>
                  <span className="text-amora font-bold">
                    {Math.round((dados.desafioSemanal.diasConcluidos / dados.desafioSemanal.metaDias) * 100)}%
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-papel-3 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-amora transition-all duration-500"
                    style={{
                      width: `${(dados.desafioSemanal.diasConcluidos / dados.desafioSemanal.metaDias) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Medalha & Pontos */}
            <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-papel-3 pt-4 md:pt-0 md:pl-6 shrink-0">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amora-clara text-amora shadow-xs">
                <IconeTrofeu className="h-7 w-7 text-amora" />
              </div>
              <div>
                <div className="font-num text-lg sm:text-xl font-bold text-tinta">
                  {dados.pontosTotais} <span className="text-xs font-normal text-tinta-2">pontos</span>
                </div>
                <div className="text-xs text-tinta-3">
                  {dados.conquistas.filter((c) => c.desbloqueada).length} de {dados.conquistas.length} medalhas
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Barra de Filtros e Busca */}
        <section className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setFiltro("todos")}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                filtro === "todos" ? "bg-amora text-papel shadow-xs" : "bg-papel-2 text-tinta-2 hover:bg-papel-3"
              }`}
            >
              <IconeEstrela className="h-3.5 w-3.5" />
              <span>Todos os Clássicos</span>
            </button>
            <button
              onClick={() => setFiltro("pt")}
              className={`rounded-full px-4 py-1.5 text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                filtro === "pt" ? "bg-amora text-papel shadow-xs" : "bg-papel-2 text-tinta-2 hover:bg-papel-3"
              }`}
            >
              Literatura Brasileira
            </button>
            <button
              onClick={() => setFiltro("en")}
              className={`rounded-full px-4 py-1.5 text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                filtro === "en" ? "bg-amora text-papel shadow-xs" : "bg-papel-2 text-tinta-2 hover:bg-papel-3"
              }`}
            >
              Clássicos Mundiais
            </button>
            <button
              onClick={() => setFiltro("conquistas")}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                filtro === "conquistas" ? "bg-amora text-papel shadow-xs" : "bg-papel-2 text-tinta-2 hover:bg-papel-3"
              }`}
            >
              <IconeMedalha className="h-3.5 w-3.5" />
              <span>Conquistas ({dados.conquistas.filter((c) => c.desbloqueada).length})</span>
            </button>
          </div>

          {/* Campo de Busca */}
          {filtro !== "conquistas" && (
            <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
              <input
                type="text"
                placeholder="Buscar clássico ou autor..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full rounded-full border border-papel-3 bg-papel px-3.5 py-1.5 pl-8 text-xs sm:text-sm text-tinta placeholder:text-tinta-3 focus:border-amora focus:outline-none"
              />
              <svg
                viewBox="0 0 24 24"
                className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-tinta-3 pointer-events-none"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
          )}
        </section>

        {/* Visão de Conquistas */}
        {filtro === "conquistas" ? (
          <section className="surgir grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {dados.conquistas.map((c) => (
              <div
                key={c.chave}
                className={`rounded-2xl border p-5 transition-all ${
                  c.desbloqueada
                    ? "border-amora/40 bg-amora-clara/20 shadow-xs"
                    : "border-papel-3 bg-papel-2/40 opacity-60"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-papel shadow-xs shrink-0">
                    {renderIconeConquista(c.chave)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold text-sm text-tinta truncate">{c.titulo}</h3>
                      <span className="font-num text-xs font-bold text-amora">+{c.pontos} pts</span>
                    </div>
                    <p className="mt-1 text-xs text-tinta-2 leading-relaxed">{c.descricao}</p>
                    <div className="mt-3 text-[11px] font-medium text-tinta-3 flex items-center gap-1">
                      {c.desbloqueada ? (
                        <>
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                          <span className="text-emerald-700 dark:text-emerald-400">Desbloqueada</span>
                        </>
                      ) : (
                        <>
                          <span className="h-1.5 w-1.5 rounded-full bg-tinta-3" />
                          <span>Em andamento</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </section>
        ) : (
          /* Grid de Livros do Acervo + Dropzone de Upload */
          <section className="surgir grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {livrosFiltrados.map((livro) => (
              <div
                key={livro.id}
                className="group flex flex-col justify-between rounded-2xl border border-papel-3 bg-papel p-5 shadow-xs transition-all hover:border-amora hover:shadow-md"
              >
                <div>
                  <div className="flex gap-4">
                    <img
                      src={livro.capaUrl}
                      alt={livro.titulo}
                      className="h-28 w-20 rounded-md object-cover shadow-xs border border-papel-3 shrink-0 group-hover:scale-102 transition-transform"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="rounded-md bg-papel-2 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-tinta-2">
                        {livro.genero} • {livro.ano}
                      </span>
                      <h3 className="mt-1.5 font-display font-semibold text-sm sm:text-base text-tinta leading-snug line-clamp-2">
                        {livro.titulo}
                      </h3>
                      <p className="mt-0.5 text-xs text-tinta-2 truncate">{livro.autor}</p>
                      <p className="mt-2 font-num text-[11px] text-tinta-3">{livro.paginas} páginas</p>
                    </div>
                  </div>

                  <p className="mt-3.5 text-xs text-tinta-2 line-clamp-3 leading-relaxed">
                    {livro.amostraTexto}
                  </p>
                </div>

                <div className="mt-5 border-t border-papel-3/50 pt-3 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setAmostraModal(livro)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-tinta-2 hover:text-amora transition-colors cursor-pointer py-1 px-2"
                  >
                    <IconeLivro className="h-3.5 w-3.5" />
                    <span>Degustar</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleAdicionar(livro, false)}
                      disabled={adicionandoId === livro.id}
                      className="rounded-lg border border-papel-3 px-2.5 py-1 text-xs font-medium text-tinta hover:border-amora hover:text-amora transition-colors cursor-pointer disabled:opacity-50"
                      title="Salvar na estante como 'Quero Ler'"
                    >
                      + Estante
                    </button>
                    <button
                      onClick={() => handleAdicionar(livro, true)}
                      disabled={adicionandoId === livro.id}
                      className="rounded-lg bg-amora px-3 py-1 text-xs font-medium text-papel hover:bg-amora-escura transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      Ler Agora
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Card de Upload Pessoal (BYOB) */}
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-papel-3 bg-papel-2/30 p-8 text-center transition-all hover:border-amora hover:bg-papel-2/60">
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
          </section>
        )}
      </main>

      {/* Modal de Degustação / Prévia de Trecho */}
      {amostraModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="max-w-lg w-full rounded-2xl border border-papel-3 bg-papel p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-amora">
                  Amostra de Leitura
                </span>
                <h3 className="font-display font-bold text-lg text-tinta">{amostraModal.titulo}</h3>
                <p className="text-xs text-tinta-2">{amostraModal.autor}</p>
              </div>
              <button
                onClick={() => setAmostraModal(null)}
                className="h-8 w-8 rounded-full border border-papel-3 flex items-center justify-center text-tinta-2 hover:bg-papel-2 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="mt-6 max-h-64 overflow-y-auto rounded-xl bg-papel-2 p-4 text-xs sm:text-sm text-tinta-2 leading-relaxed font-serif whitespace-pre-line border border-papel-3">
              {amostraModal.amostraTexto}
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setAmostraModal(null)}
                className="rounded-xl border border-papel-3 px-4 py-2 text-xs font-medium text-tinta hover:bg-papel-2 cursor-pointer"
              >
                Fechar
              </button>
              <button
                onClick={() => {
                  const m = amostraModal;
                  setAmostraModal(null);
                  handleAdicionar(m, true);
                }}
                className="rounded-xl bg-amora px-5 py-2 text-xs font-medium text-papel hover:bg-amora-escura cursor-pointer shadow-xs"
              >
                Ler Livro Completo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
