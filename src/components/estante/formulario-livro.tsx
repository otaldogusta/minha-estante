import { useState, useEffect } from "react";
import { useBlocker } from "@tanstack/react-router";
import { createPortal } from "react-dom";

import { salvarLivro } from "../../lib/api/livros.functions";
import { GENEROS, FORMATOS, type Livro } from "../../lib/livros";
import { EstrelasInput } from "./estrelas";
import { CapaLivro } from "./capa-livro";

export type ValoresLivro = Partial<Omit<Livro, "id">> & { id?: number };

const campo =
  "w-full rounded-lg border border-papel-3 bg-papel px-3 py-2 text-sm text-tinta placeholder:text-tinta-3 focus:border-amora focus:outline-none transition-colors";
const rotulo = "block text-sm font-medium text-tinta-2 mb-1";

function verificarAlteracao(v: ValoresLivro, i: ValoresLivro) {
  const normStr = (val: any) => (val === null || val === undefined ? "" : String(val).trim());
  const normNum = (val: any) => (val === null || val === undefined ? "" : String(val));
  const normBool = (val: any) => (val ? 1 : 0);

  return (
    normStr(v.titulo) !== normStr(i.titulo) ||
    normStr(v.autor) !== normStr(i.autor) ||
    normStr(v.capa) !== normStr(i.capa) ||
    normStr(v.status) !== normStr(i.status) ||
    normStr(v.genero) !== normStr(i.genero) ||
    normStr(v.formato) !== normStr(i.formato) ||
    normStr(v.editora) !== normStr(i.editora) ||
    normStr(v.pais) !== normStr(i.pais) ||
    normNum(v.ano) !== normNum(i.ano) ||
    normNum(v.paginas) !== normNum(i.paginas) ||
    normNum(v.valor) !== normNum(i.valor) ||
    normNum(v.ano_leitura) !== normNum(i.ano_leitura) ||
    normStr(v.inicio) !== normStr(i.inicio) ||
    normStr(v.fim) !== normStr(i.fim) ||
    normNum(v.pagina_atual) !== normNum(i.pagina_atual) ||
    normNum(v.nota) !== normNum(i.nota) ||
    normStr(v.palavra) !== normStr(i.palavra) ||
    normStr(v.resenha) !== normStr(i.resenha) ||
    normBool(v.adaptacao) !== normBool(i.adaptacao) ||
    normBool(v.vi_adaptacao) !== normBool(i.vi_adaptacao) ||
    normBool(v.privado) !== normBool(i.privado)
  );
}

export function FormularioLivro({
  inicial,
  aoSalvar,
}: {
  inicial: ValoresLivro;
  aoSalvar: (id: number) => void;
}) {
  const [inicialState] = useState<ValoresLivro>({
    status: "lido",
    formato: "Kindle",
    ano_leitura: new Date().getFullYear(),
    adaptacao: 0,
    vi_adaptacao: 0,
    ...inicial,
  });

  const [v, setV] = useState<ValoresLivro>({ ...inicialState });
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const teveAlteracao = verificarAlteracao(v, inicialState);

  // Bloqueador de navegação para alterações não salvas no livro
  const blocker = useBlocker({
    shouldBlockFn: () => teveAlteracao && !salvando,
    withResolver: true,
  });

  // Alerta nativo se tentar fechar ou recarregar a aba com alterações
  useEffect(() => {
    if (!teveAlteracao || salvando) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [teveAlteracao, salvando]);

  function set<K extends keyof ValoresLivro>(k: K, val: ValoresLivro[K]) {
    setV((prev) => ({ ...prev, [k]: val }));
  }

  const num = (s: string) => (s.trim() === "" ? null : Number(s));

  async function enviar() {
    if (!teveAlteracao) return;
    if (!v.titulo?.trim() || !v.autor?.trim()) {
      setErro("Título e autor são obrigatórios.");
      return;
    }
    setSalvando(true);
    setErro(null);
    try {
      const res = await salvarLivro({
        data: {
          id: v.id,
          titulo: v.titulo.trim(),
          autor: v.autor.trim(),
          pais: v.pais || null,
          genero: v.genero || null,
          editora: v.editora || null,
          ano: v.ano ?? null,
          paginas: v.paginas ?? null,
          formato: v.formato || null,
          status: (v.status as "lido") ?? "lido",
          ano_leitura: v.ano_leitura ?? null,
          inicio: v.inicio || null,
          fim: v.fim || null,
          nota: v.nota ?? null,
          palavra: v.palavra || null,
          resenha: v.resenha || null,
          adaptacao: !!v.adaptacao,
          vi_adaptacao: !!v.vi_adaptacao,
          valor: v.valor ?? null,
          capa: v.capa || null,
          sinopse: v.sinopse || null,
          pagina_atual: v.pagina_atual ?? null,
          privado: !!v.privado,
        },
      });
      aoSalvar(res.id);
    } catch {
      setErro("Não foi possível salvar. Tente de novo.");
      setSalvando(false);
    }
  }

  const statusOpcoes: Array<{ valor: NonNullable<ValoresLivro["status"]>; rotulo: string }> = [
    { valor: "lido", rotulo: "Já li" },
    { valor: "lendo", rotulo: "Lendo agora" },
    { valor: "quero_ler", rotulo: "Quero ler" },
    { valor: "abandonado", rotulo: "Abandonei" },
  ];

  const [modoProgresso, setModoProgresso] = useState<"pagina" | "porcentagem">("pagina");

  const totalPaginas = v.paginas && v.paginas > 0 ? v.paginas : null;
  const pctCalculado =
    totalPaginas && v.pagina_atual !== null && v.pagina_atual !== undefined
      ? Math.min(100, Math.round((v.pagina_atual / totalPaginas) * 100))
      : null;

  return (
    <div className="grid gap-8 md:grid-cols-[180px_1fr]">
      <div className="mx-auto w-40 md:mx-0">
        <CapaLivro titulo={v.titulo || "Sem título"} autor={v.autor || ""} capa={v.capa ?? null} />
        <label className={`${rotulo} mt-4`}>
          Capa (URL)
          <input
            className={`${campo} mt-1`}
            value={v.capa ?? ""}
            onChange={(e) => set("capa", e.target.value || null)}
            placeholder="https://..."
          />
        </label>
        <div className="mt-2 flex flex-col gap-1 text-xs">
          <button
            type="button"
            onClick={() => {
              const query = encodeURIComponent(`${v.titulo || ""} ${v.autor || ""} capa livro edicao`);
              window.open(`https://www.google.com/search?tbm=isch&q=${query}`, "_blank");
            }}
            className="inline-flex items-center gap-1 font-medium text-amora hover:underline cursor-pointer"
          >
            <span>🔍 Buscar capas de edições</span>
          </button>
          {v.capa && (
            <button
              type="button"
              onClick={() => set("capa", null)}
              className="text-tinta-3 hover:text-amora text-left cursor-pointer"
            >
              Remover capa
            </button>
          )}
        </div>
      </div>

      <div className="space-y-5">
        <div className="flex flex-wrap gap-2">
          {statusOpcoes.map((s) => (
            <button
              key={s.valor}
              type="button"
              onClick={() => set("status", s.valor)}
              className={`rounded-full px-4 py-1.5 text-sm transition-colors cursor-pointer ${
                v.status === s.valor ? "bg-amora text-papel" : "bg-papel-2 text-tinta-2 hover:bg-papel-3"
              }`}
            >
              {s.rotulo}
            </button>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className={rotulo}>
            Título
            <input className={`${campo} mt-1`} value={v.titulo ?? ""} onChange={(e) => set("titulo", e.target.value)} />
          </label>
          <label className={rotulo}>
            Autor(a)
            <input className={`${campo} mt-1`} value={v.autor ?? ""} onChange={(e) => set("autor", e.target.value)} />
          </label>
          <label className={rotulo}>
            Gênero
            <select className={`${campo} mt-1`} value={v.genero ?? ""} onChange={(e) => set("genero", e.target.value || null)}>
              <option value="">escolher</option>
              {GENEROS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
              {v.genero && !GENEROS.includes(v.genero) && <option value={v.genero}>{v.genero}</option>}
            </select>
          </label>
          <label className={rotulo}>
            Formato
            <select className={`${campo} mt-1`} value={v.formato ?? ""} onChange={(e) => set("formato", e.target.value || null)}>
              {FORMATOS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </label>
          <label className={rotulo}>
            Editora
            <input className={`${campo} mt-1`} value={v.editora ?? ""} onChange={(e) => set("editora", e.target.value || null)} />
          </label>
          <label className={rotulo}>
            País do autor
            <input
              className={`${campo} mt-1`}
              value={v.pais ?? ""}
              onChange={(e) => set("pais", e.target.value || null)}
              placeholder="BR, US, JP..."
              maxLength={20}
            />
          </label>
          <label className={rotulo}>
            Ano de publicação
            <input
              className={`${campo} mt-1 font-num`}
              inputMode="numeric"
              value={v.ano ?? ""}
              onChange={(e) => set("ano", num(e.target.value.replace(/\D/g, "")))}
            />
          </label>
          <label className={rotulo}>
            Páginas (da sua edição)
            <input
              className={`${campo} mt-1 font-num`}
              inputMode="numeric"
              value={v.paginas ?? ""}
              onChange={(e) => set("paginas", num(e.target.value.replace(/\D/g, "")))}
              placeholder="Ex: 293 ou total do EPUB"
            />
          </label>
          <label className={rotulo}>
            Quanto custou (R$)
            <input
              className={`${campo} mt-1 font-num`}
              inputMode="decimal"
              value={v.valor ?? ""}
              onChange={(e) => set("valor", num(e.target.value.replace(",", ".").replace(/[^0-9.]/g, "")))}
            />
          </label>
          <label className={rotulo}>
            Ano da leitura
            <input
              className={`${campo} mt-1 font-num`}
              inputMode="numeric"
              value={v.ano_leitura ?? ""}
              onChange={(e) => set("ano_leitura", num(e.target.value.replace(/\D/g, "")))}
            />
          </label>
        </div>

        {(v.status === "lido" || v.status === "lendo" || v.status === "abandonado") && (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={rotulo}>
              Começou em
              <input type="date" className={`${campo} mt-1 font-num`} value={v.inicio ?? ""} onChange={(e) => set("inicio", e.target.value || null)} />
            </label>
            {v.status !== "lendo" ? (
              <label className={rotulo}>
                Terminou em
                <input type="date" className={`${campo} mt-1 font-num`} value={v.fim ?? ""} onChange={(e) => set("fim", e.target.value || null)} />
              </label>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-tinta-2">
                    {modoProgresso === "pagina" ? "Página atual" : "Porcentagem lida (%)"}
                    {pctCalculado !== null && modoProgresso === "pagina" && (
                      <span className="ml-1.5 font-num text-xs font-semibold text-amora">({pctCalculado}%)</span>
                    )}
                    {v.pagina_atual !== null && v.pagina_atual !== undefined && modoProgresso === "porcentagem" && (
                      <span className="ml-1.5 font-num text-xs font-semibold text-amora">(Pág. {v.pagina_atual})</span>
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => setModoProgresso((m) => (m === "pagina" ? "porcentagem" : "pagina"))}
                    className="text-xs font-medium text-amora hover:underline cursor-pointer"
                  >
                    {modoProgresso === "pagina" ? "Usar %" : "Usar Páginas"}
                  </button>
                </div>
                {modoProgresso === "pagina" ? (
                  <input
                    className={`${campo} font-num`}
                    inputMode="numeric"
                    placeholder="Ex: 88"
                    value={v.pagina_atual ?? ""}
                    onChange={(e) => set("pagina_atual", num(e.target.value.replace(/\D/g, "")))}
                  />
                ) : (
                  <input
                    className={`${campo} font-num`}
                    inputMode="numeric"
                    placeholder="Ex: 30"
                    value={pctCalculado ?? ""}
                    onChange={(e) => {
                      const p = num(e.target.value.replace(/\D/g, ""));
                      if (p === null) {
                        set("pagina_atual", null);
                      } else {
                        const total = totalPaginas || 100;
                        const calcPag = Math.min(total, Math.round((Math.min(100, p) / 100) * total));
                        set("pagina_atual", calcPag);
                      }
                    }}
                  />
                )}
              </div>
            )}
          </div>
        )}

        {(v.status === "lido" || v.status === "abandonado") && (
          <>
            <div>
              <span className={rotulo}>Sua nota</span>
              <EstrelasInput valor={v.nota ?? null} onChange={(n) => set("nota", n)} />
            </div>
            <label className={rotulo}>
              Uma palavra para este livro
              <input
                className={`${campo} mt-1 max-w-xs`}
                value={v.palavra ?? ""}
                onChange={(e) => set("palavra", e.target.value || null)}
                placeholder="Visceral, Transformador, Previsível..."
                maxLength={40}
              />
            </label>
          </>
        )}

        <label className={rotulo}>
          Resenha ou anotações
          <textarea
            className={`${campo} mt-1 min-h-24`}
            value={v.resenha ?? ""}
            onChange={(e) => set("resenha", e.target.value || null)}
            placeholder="O que você quer lembrar deste livro?"
          />
        </label>

        <div className="flex flex-wrap items-center gap-6">
          <label className="flex items-center gap-2 text-sm text-tinta-2 cursor-pointer">
            <input
              type="checkbox"
              checked={!!v.adaptacao}
              onChange={(e) => set("adaptacao", e.target.checked ? 1 : 0)}
              className="h-4 w-4 accent-amora"
            />
            Tem adaptação (filme/série)
          </label>
          {!!v.adaptacao && (
            <label className="flex items-center gap-2 text-sm text-tinta-2 cursor-pointer">
              <input
                type="checkbox"
                checked={!!v.vi_adaptacao}
                onChange={(e) => set("vi_adaptacao", e.target.checked ? 1 : 0)}
                className="h-4 w-4 accent-amora"
              />
              Já assisti
            </label>
          )}
          <label className="flex items-center gap-2 text-sm text-tinta-2 cursor-pointer">
            <input
              type="checkbox"
              checked={!!v.privado}
              onChange={(e) => set("privado", e.target.checked ? 1 : 0)}
              className="h-4 w-4 accent-amora"
            />
            Livro privado (só você vê)
          </label>
        </div>

        {erro && <p className="text-sm text-amora-escura">{erro}</p>}

        <button
          type="button"
          onClick={enviar}
          disabled={!teveAlteracao || salvando}
          className={`rounded-xl px-8 py-3 text-sm font-medium transition-all ${
            !teveAlteracao || salvando
              ? "bg-amora/35 text-papel/50 cursor-not-allowed opacity-60"
              : "bg-amora text-papel hover:bg-amora-escura active:translate-y-[1px] cursor-pointer shadow-sm"
          }`}
        >
          {salvando ? "Guardando na estante..." : "Salvar"}
        </button>
      </div>

      {/* Modal de Confirmação para Descartar Alterações Não Salvas no Livro */}
      {blocker.status === "blocked" && typeof document !== "undefined" && createPortal(
        <div
          className="modal-backdrop z-[70]"
          onClick={() => blocker.reset()}
        >
          <div
            className="relative w-full max-w-md my-auto rounded-3xl border border-papel-3 bg-papel p-6 shadow-2xl surgir space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-amora">
              <div className="rounded-xl bg-amora-clara p-2.5">
                <svg viewBox="0 0 24 24" className="h-6 w-6 text-amora" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-display text-xl font-semibold text-tinta">Descartar alterações?</h3>
            </div>

            <p className="text-sm text-tinta-2 leading-relaxed">
              Você alterou dados deste livro e não salvou as mudanças. Se sair agora, todas as edições serão perdidas.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => blocker.reset()}
                className="rounded-xl border border-papel-3 px-4 py-2.5 text-sm text-tinta-2 transition-colors hover:border-amora hover:text-amora cursor-pointer"
              >
                Continuar editando
              </button>
              <button
                onClick={() => blocker.proceed()}
                className="rounded-xl bg-amora px-5 py-2.5 text-sm font-medium text-papel transition-colors hover:bg-amora-escura active:translate-y-[1px] cursor-pointer"
              >
                Descartar e Sair
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
