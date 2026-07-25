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
  const [modalCapaAberto, setModalCapaAberto] = useState(false);
  const [modalRemoverCapaAberto, setModalRemoverCapaAberto] = useState(false);

  const totalPaginas = v.paginas && v.paginas > 0 ? v.paginas : null;
  const pctCalculado =
    totalPaginas && v.pagina_atual !== null && v.pagina_atual !== undefined
      ? Math.min(100, Math.round((v.pagina_atual / totalPaginas) * 100))
      : null;

  return (
    <div className="grid gap-8 md:grid-cols-[180px_1fr]">
      <div className="mx-auto w-40 md:mx-0">
        <div
          onClick={() => setModalCapaAberto(true)}
          className="group relative cursor-pointer overflow-hidden rounded-xl shadow-md transition-all hover:shadow-xl hover:scale-[1.02]"
          title="Clique para alterar ou adicionar a capa"
        >
          <CapaLivro titulo={v.titulo || "Sem título"} autor={v.autor || ""} capa={v.capa ?? null} />

          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-tinta/65 backdrop-blur-xs p-3 text-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="rounded-full bg-papel/95 px-3 py-1.5 text-xs font-semibold text-tinta shadow-md flex items-center gap-1.5">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-amora" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              <span>{v.capa ? "Alterar capa" : "Adicionar capa"}</span>
            </span>
          </div>
        </div>

        <div className="mt-3 flex flex-col gap-1.5 text-xs text-center md:text-left">
          <button
            type="button"
            onClick={() => setModalCapaAberto(true)}
            className="inline-flex items-center justify-center md:justify-start gap-1.5 font-medium text-amora hover:underline cursor-pointer"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14m-7-7h14" />
            </svg>
            <span>{v.capa ? "Alterar foto da capa" : "Adicionar foto da capa"}</span>
          </button>
          {v.capa && (
            <button
              type="button"
              onClick={() => setModalRemoverCapaAberto(true)}
              className="inline-flex items-center justify-center md:justify-start gap-1.5 text-tinta-3 hover:text-amora cursor-pointer transition-colors"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18m-2 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 01-2-2h4a2 2 0 012 2v2" />
              </svg>
              <span>Remover capa</span>
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

      {/* Modal de Gerenciamento da Capa (Drag & Drop + URL + Otimização) */}
      <ModalGerenciadorCapa
        aberto={modalCapaAberto}
        aoFechar={() => setModalCapaAberto(false)}
        aoAplicarCapa={(novaCapa) => set("capa", novaCapa)}
        capaAtual={v.capa ?? null}
        titulo={v.titulo || ""}
        autor={v.autor || ""}
      />

      {/* Modal de Confirmação para Remover Capa */}
      <ModalConfirmarRemoverCapa
        aberto={modalRemoverCapaAberto}
        aoFechar={() => setModalRemoverCapaAberto(false)}
        aoConfirmar={() => set("capa", null)}
      />

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

// Otimizador e redimensionador de imagem leve via HTML5 Canvas
function redimensionarImagem(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxW = 600;
        const scale = maxW / Math.max(img.width, maxW);
        const w = Math.round(img.width * (scale < 1 ? scale : 1));
        const h = Math.round(img.height * (scale < 1 ? scale : 1));

        canvas.width = w;
        canvas.height = h;

        const ctx = canvas.getContext("2d");
        if (!ctx) return reject("Erro ao processar imagem");

        ctx.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        resolve(dataUrl);
      };
      img.onerror = () => reject("Arquivo de imagem inválido");
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject("Erro ao ler arquivo");
    reader.readAsDataURL(file);
  });
}

function ModalGerenciadorCapa({
  aberto,
  aoFechar,
  aoAplicarCapa,
  capaAtual,
  titulo,
  autor,
}: {
  aberto: boolean;
  aoFechar: () => void;
  aoAplicarCapa: (urlOuDataUrl: string) => void;
  capaAtual: string | null;
  titulo: string;
  autor: string;
}) {
  const [aba, setAba] = useState<"upload" | "url">("upload");
  const [urlInput, setUrlInput] = useState(capaAtual || "");
  const [preview, setPreview] = useState<string | null>(capaAtual);
  const [arrastando, setArrastando] = useState(false);
  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (aberto) {
      setUrlInput(capaAtual || "");
      setPreview(capaAtual);
      setErro(null);
    }
  }, [aberto, capaAtual]);

  if (!aberto || typeof document === "undefined") return null;

  async function processarArquivo(file: File) {
    if (!file.type.startsWith("image/")) {
      setErro("Por favor, selecione um arquivo de imagem válido.");
      return;
    }
    setProcessando(true);
    setErro(null);
    try {
      const dataUrl = await redimensionarImagem(file);
      setPreview(dataUrl);
      setUrlInput(dataUrl);
    } catch {
      setErro("Não foi possível otimizar esta imagem.");
    } finally {
      setProcessando(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setArrastando(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processarArquivo(e.dataTransfer.files[0]);
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      processarArquivo(e.target.files[0]);
    }
  }

  return createPortal(
    <div className="modal-backdrop z-[70]" onClick={aoFechar}>
      <div
        className="relative w-full max-w-lg my-auto rounded-3xl border border-papel-3 bg-papel p-6 shadow-2xl surgir space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xl font-semibold text-tinta">Alterar capa do livro</h3>
          <button
            type="button"
            onClick={aoFechar}
            className="rounded-full p-1.5 text-tinta-3 hover:bg-papel-2 hover:text-tinta transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Seleção de Aba (Apenas Ícones) */}
        <div className="flex rounded-xl bg-papel-2 p-1 text-sm font-medium">
          <button
            type="button"
            onClick={() => setAba("upload")}
            title="Carregar foto (Drag & Drop)"
            className={`flex-1 flex items-center justify-center rounded-lg py-2.5 transition-all cursor-pointer ${
              aba === "upload" ? "bg-papel text-amora shadow-xs font-semibold" : "text-tinta-3 hover:text-tinta"
            }`}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4m4-5l5-5 5 5m-5-5v12" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setAba("url")}
            title="Link da Imagem (URL)"
            className={`flex-1 flex items-center justify-center rounded-lg py-2.5 transition-all cursor-pointer ${
              aba === "url" ? "bg-papel text-amora shadow-xs font-semibold" : "text-tinta-3 hover:text-tinta"
            }`}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
            </svg>
          </button>
        </div>

        {aba === "upload" ? (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setArrastando(true);
            }}
            onDragLeave={() => setArrastando(false)}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-colors cursor-pointer ${
              arrastando ? "border-amora bg-amora-clara/20" : "border-papel-3 hover:border-amora/50 bg-papel-2/50"
            }`}
          >
            <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" id="capa-file-input" />
            <label htmlFor="capa-file-input" className="cursor-pointer flex flex-col items-center">
              <div className="rounded-2xl bg-amora-clara p-3.5 mb-3 text-amora shadow-xs">
                <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </div>
              <p className="font-medium text-tinta text-base">Arraste uma foto da capa aqui</p>
              <p className="text-xs text-tinta-3 mt-1">ou clique para escolher do seu computador</p>
              <span className="mt-4 rounded-full bg-amora px-4 py-1.5 text-xs font-medium text-papel shadow-xs hover:bg-amora-escura transition-colors">
                {processando ? "Otimizando capa..." : "Escolher arquivo"}
              </span>
            </label>
          </div>
        ) : (
          <div className="space-y-3">
            <label className="block text-xs font-medium text-tinta-2">
              URL da imagem da capa
              <input
                type="url"
                value={urlInput}
                onChange={(e) => {
                  setUrlInput(e.target.value);
                  setPreview(e.target.value || null);
                }}
                placeholder="https://exemplo.com/capa.jpg"
                className="w-full mt-1.5 rounded-xl border border-papel-3 bg-papel px-3.5 py-2 text-sm text-tinta placeholder:text-tinta-3 focus:border-amora focus:outline-none"
              />
            </label>
            <button
              type="button"
              onClick={() => {
                const query = encodeURIComponent(`${titulo || ""} ${autor || ""} capa livro edicao`);
                window.open(`https://www.google.com/search?tbm=isch&q=${query}`, "_blank");
              }}
              className="text-xs font-medium text-amora hover:underline cursor-pointer flex items-center gap-1.5"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <span>Buscar capas no Google Imagens</span>
            </button>
          </div>
        )}

        {erro && <p className="text-xs text-amora-escura">{erro}</p>}

        {/* Prévia Otimizada */}
        {preview && (
          <div className="flex items-center gap-4 rounded-2xl border border-papel-3 bg-papel-2 p-3">
            <div className="w-16 shrink-0 overflow-hidden rounded-lg shadow-md aspect-[2/3] bg-papel-3">
              <img src={preview} alt="Prévia da capa" className="h-full w-full object-cover" />
            </div>
            <div>
              <p className="text-xs font-semibold text-tinta">Prévia da nova capa</p>
              <p className="text-[11px] text-tinta-2 mt-0.5">Imagem comprimida em alta qualidade para carregamento instantâneo.</p>
            </div>
          </div>
        )}

        {/* Botões do Modal */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={aoFechar}
            className="rounded-xl px-4 py-2 text-sm font-medium text-tinta-2 hover:bg-papel-2 cursor-pointer transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => {
              if (preview) {
                aoAplicarCapa(preview);
                aoFechar();
              } else {
                setErro("Nenhuma imagem selecionada.");
              }
            }}
            disabled={!preview || processando}
            className="rounded-xl bg-amora px-5 py-2 text-sm font-medium text-papel hover:bg-amora-escura cursor-pointer transition-colors shadow-sm disabled:opacity-50"
          >
            Aplicar capa
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function ModalConfirmarRemoverCapa({
  aberto,
  aoFechar,
  aoConfirmar,
}: {
  aberto: boolean;
  aoFechar: () => void;
  aoConfirmar: () => void;
}) {
  if (!aberto || typeof document === "undefined") return null;

  return createPortal(
    <div className="modal-backdrop z-[70]" onClick={aoFechar}>
      <div
        className="relative w-full max-w-md my-auto rounded-3xl border border-papel-3 bg-papel p-6 shadow-2xl surgir space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 text-amora">
          <div className="rounded-xl bg-amora-clara p-2.5">
            <svg viewBox="0 0 24 24" className="h-6 w-6 text-amora" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <h3 className="font-display text-xl font-semibold text-tinta">Remover capa?</h3>
        </div>

        <p className="text-sm text-tinta-2 leading-relaxed">
          Tem certeza que deseja remover a capa deste livro? Ele voltará a exibir a capa estilizada padrão.
        </p>

        <div className="mt-6 flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={aoFechar}
            className="rounded-xl px-4 py-2 text-sm font-medium text-tinta-2 hover:bg-papel-2 cursor-pointer transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => {
              aoConfirmar();
              aoFechar();
            }}
            className="rounded-xl bg-amora px-5 py-2 text-sm font-medium text-papel hover:bg-amora-escura cursor-pointer transition-colors shadow-sm"
          >
            Sim, remover capa
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
