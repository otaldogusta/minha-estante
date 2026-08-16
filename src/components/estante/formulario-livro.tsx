import { useState, useEffect, useRef } from "react";
import { useBlocker } from "@tanstack/react-router";
import { createPortal } from "react-dom";

import { salvarLivro } from "../../lib/api/livros.functions";
import { GENEROS, FORMATOS, type Livro } from "../../lib/livros";
import { EstrelasInput } from "./estrelas";
import { CapaLivro } from "./capa-livro";
import { notificar } from "../../lib/toast";

export type ValoresLivro = Partial<Omit<Livro, "id">> & { id?: number };

const campo =
  "w-full rounded-lg border border-papel-3 bg-papel px-3 py-2 text-sm text-tinta placeholder:text-tinta-3 focus:border-amora focus:outline-none transition-colors";
const rotulo = "block text-sm font-medium text-tinta-2 mb-1";

/** Combobox com autocomplete: digita, filtra a lista e aceita valor livre */
function CampoCombo({
  valor,
  onChange,
  opcoes,
  placeholder,
  id,
}: {
  valor: string | null | undefined;
  onChange: (v: string | null) => void;
  opcoes: string[];
  placeholder?: string;
  id?: string;
}) {
  const [texto, setTexto] = useState(valor ?? "");
  const [aberto, setAberto] = useState(false);
  const [cursor, setCursor] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listaRef = useRef<HTMLUListElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Sincroniza quando o valor externo muda (ex: ao carregar o livro)
  useEffect(() => { setTexto(valor ?? ""); }, [valor]);

  const filtradas = texto.trim() === ""
    ? opcoes
    : opcoes.filter((o) => o.toLowerCase().includes(texto.toLowerCase()));

  // Fechar ao clicar fora
  useEffect(() => {
    if (!aberto) return;
    function fora(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setAberto(false);
        // confirma o texto atual como valor (livre)
        onChange(texto.trim() || null);
      }
    }
    document.addEventListener("mousedown", fora);
    return () => document.removeEventListener("mousedown", fora);
  }, [aberto, texto, onChange]);

  function selecionar(op: string) {
    setTexto(op);
    onChange(op || null);
    setAberto(false);
    setCursor(-1);
    inputRef.current?.blur();
  }

  function teclado(e: React.KeyboardEvent) {
    if (!aberto && e.key !== "Escape") { setAberto(true); }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => Math.min(c + 1, filtradas.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => Math.max(c - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (cursor >= 0 && filtradas[cursor]) {
        selecionar(filtradas[cursor]);
      } else {
        onChange(texto.trim() || null);
        setAberto(false);
      }
    } else if (e.key === "Escape") {
      setAberto(false);
      inputRef.current?.blur();
    }
  }

  return (
    <div ref={wrapRef} className="relative mt-1">
      <input
        ref={inputRef}
        id={id}
        type="text"
        value={texto}
        placeholder={placeholder ?? "digitar ou escolher"}
        autoComplete="off"
        spellCheck={false}
        className={campo}
        onChange={(e) => {
          setTexto(e.target.value);
          onChange(e.target.value.trim() || null);
          setCursor(-1);
          setAberto(true);
        }}
        onFocus={() => setAberto(true)}
        onKeyDown={teclado}
      />
      {/* Chevron icon */}
      <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-tinta-3">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </span>

      {aberto && filtradas.length > 0 && (
        <ul
          ref={listaRef}
          role="listbox"
          className="absolute z-50 mt-1 w-full rounded-xl border border-papel-3 bg-papel shadow-xl overflow-auto max-h-52 text-sm animate-[fadeIn_80ms_ease-out]"
        >
          {filtradas.map((op, i) => (
            <li
              key={op}
              role="option"
              aria-selected={op === texto}
              onMouseDown={(e) => { e.preventDefault(); selecionar(op); }}
              className={`flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors ${
                i === cursor
                  ? "bg-amora-clara text-amora"
                  : op === texto
                  ? "bg-papel-2 text-tinta font-medium"
                  : "text-tinta hover:bg-papel-2"
              }`}
            >
              {op === texto && (
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-amora shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
              {op}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** URL da bandeira real via flagcdn.com (sem dependências) */
function urlBandeira(code: string): string {
  return `https://flagcdn.com/w20/${code.toLowerCase()}.png`;
}

const PAISES: Array<{ code: string; nome: string }> = [
  { code: "BR", nome: "Brasil" },
  { code: "US", nome: "Estados Unidos" },
  { code: "GB", nome: "Reino Unido" },
  { code: "PT", nome: "Portugal" },
  { code: "FR", nome: "França" },
  { code: "DE", nome: "Alemanha" },
  { code: "ES", nome: "Espanha" },
  { code: "IT", nome: "Itália" },
  { code: "JP", nome: "Japão" },
  { code: "CN", nome: "China" },
  { code: "RU", nome: "Rússia" },
  { code: "AR", nome: "Argentina" },
  { code: "MX", nome: "México" },
  { code: "CO", nome: "Colômbia" },
  { code: "CL", nome: "Chile" },
  { code: "PE", nome: "Peru" },
  { code: "AU", nome: "Austrália" },
  { code: "CA", nome: "Canadá" },
  { code: "SE", nome: "Suécia" },
  { code: "NO", nome: "Noruega" },
  { code: "DK", nome: "Dinamarca" },
  { code: "FI", nome: "Finlândia" },
  { code: "NL", nome: "Países Baixos" },
  { code: "BE", nome: "Bélgica" },
  { code: "CH", nome: "Suíça" },
  { code: "AT", nome: "Austria" },
  { code: "PL", nome: "Polônia" },
  { code: "CZ", nome: "República Tcheca" },
  { code: "HU", nome: "Hungria" },
  { code: "GR", nome: "Grécia" },
  { code: "TR", nome: "Turquia" },
  { code: "IL", nome: "Israel" },
  { code: "IN", nome: "India" },
  { code: "KR", nome: "Coreia do Sul" },
  { code: "IR", nome: "Irã" },
  { code: "ZA", nome: "Africa do Sul" },
  { code: "NG", nome: "Nigéria" },
  { code: "EG", nome: "Egito" },
  { code: "UA", nome: "Ucrânia" },
  { code: "NZ", nome: "Nova Zelândia" },
  { code: "IE", nome: "Irlanda" },
  { code: "CU", nome: "Cuba" },
  { code: "VE", nome: "Venezuela" },
  { code: "UY", nome: "Uruguai" },
  { code: "BO", nome: "Bolívia" },
  { code: "PY", nome: "Paraguai" },
  { code: "EC", nome: "Equador" },
  { code: "RO", nome: "Romênia" },
  { code: "SK", nome: "Eslováquia" },
  { code: "HR", nome: "Croácia" },
  { code: "RS", nome: "Sérvia" },
  { code: "AF", nome: "Afeganistão" },
  { code: "MO", nome: "Macau" },
  { code: "TW", nome: "Taiwan" },
];

/** Combobox de países com bandeira emoji */
function CampoPais({
  valor,
  onChange,
}: {
  valor: string | null | undefined;
  onChange: (v: string | null) => void;
}) {
  const [texto, setTexto] = useState(valor ?? "");
  const [aberto, setAberto] = useState(false);
  const [cursor, setCursor] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setTexto(valor ?? ""); }, [valor]);

  const filtrados = PAISES.filter((p) => {
    if (texto.trim() === "") return true;
    const q = texto.toLowerCase();
    return p.nome.toLowerCase().includes(q) || p.code.toLowerCase().includes(q);
  });

  useEffect(() => {
    if (!aberto) return;
    function fora(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setAberto(false);
        onChange(texto.trim() || null);
      }
    }
    document.addEventListener("mousedown", fora);
    return () => document.removeEventListener("mousedown", fora);
  }, [aberto, texto, onChange]);

  function selecionar(p: { code: string; nome: string }) {
    setTexto(p.nome);
    onChange(p.nome);
    setAberto(false);
    setCursor(-1);
    inputRef.current?.blur();
  }

  function teclado(e: React.KeyboardEvent) {
    if (!aberto && e.key !== "Escape") setAberto(true);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => Math.min(c + 1, filtrados.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => Math.max(c - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (cursor >= 0 && filtrados[cursor]) {
        selecionar(filtrados[cursor]);
      } else {
        onChange(texto.trim() || null);
        setAberto(false);
      }
    } else if (e.key === "Escape") {
      setAberto(false);
      inputRef.current?.blur();
    }
  }

  // Tenta encontrar o país pelo texto para mostrar bandeira no input
  const paisAtual = PAISES.find(
    (p) => p.nome.toLowerCase() === texto.toLowerCase() || p.code.toLowerCase() === texto.toLowerCase()
  );

  return (
    <div ref={wrapRef} className="relative mt-1">
      <div className="relative">
        {paisAtual && (
          <img
            src={urlBandeira(paisAtual.code)}
            alt={paisAtual.nome}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-5 rounded-[2px] object-cover shadow-xs"
          />
        )}
        <input
          ref={inputRef}
          type="text"
          value={texto}
          placeholder="Digitar ou escolher..."
          autoComplete="off"
          spellCheck={false}
          className={`${campo} ${paisAtual ? "pl-9" : ""}`}
          onChange={(e) => {
            setTexto(e.target.value);
            onChange(e.target.value.trim() || null);
            setCursor(-1);
            setAberto(true);
          }}
          onFocus={() => setAberto(true)}
          onKeyDown={teclado}
        />
        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-tinta-3">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </span>
      </div>

      {aberto && filtrados.length > 0 && (
        <ul
          role="listbox"
          className="absolute z-50 mt-1 w-full rounded-xl border border-papel-3 bg-papel shadow-xl overflow-auto max-h-60 text-sm"
        >
          {filtrados.map((p, i) => {
            const selecionado = paisAtual?.code === p.code;
            return (
              <li
                key={p.code}
                role="option"
                aria-selected={selecionado}
                onMouseDown={(e) => { e.preventDefault(); selecionar(p); }}
                className={`flex items-center gap-2.5 px-3 py-2 cursor-pointer transition-colors ${
                  i === cursor
                    ? "bg-amora-clara text-amora"
                    : selecionado
                    ? "bg-papel-2 font-medium text-tinta"
                    : "text-tinta hover:bg-papel-2"
                }`}
              >
                <img
                  src={urlBandeira(p.code)}
                  alt={p.nome}
                  className="h-3.5 w-5 rounded-[2px] object-cover shadow-xs shrink-0"
                />
                <span className="flex-1 truncate">{p.nome}</span>
                <span className="text-[11px] font-mono text-tinta-3 shrink-0">{p.code}</span>
                {selecionado && (
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-amora shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

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
      notificar("Alterações salvas com sucesso!");
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
      <div className="mx-auto w-40 md:mx-0 flex flex-col items-center md:items-start">
        <div
          onClick={() => setModalCapaAberto(true)}
          className="group relative cursor-pointer overflow-hidden rounded-xl shadow-md transition-all hover:shadow-xl hover:scale-[1.02] w-full"
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

        {/* Estrelas da nota abaixo do livro (apenas as estrelas) */}
        <div className="mt-3 flex justify-center md:justify-start">
          <EstrelasInput valor={v.nota ?? null} onChange={(n) => set("nota", n)} />
        </div>

        <div className="mt-2.5 flex flex-col gap-1.5 text-xs text-center md:text-left">
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
                <path d="M3 6h18m-2 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
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
          <div>
            <label htmlFor="campo-genero" className={rotulo}>Gênero</label>
            <CampoCombo
              id="campo-genero"
              valor={v.genero}
              onChange={(val) => set("genero", val)}
              opcoes={GENEROS}
              placeholder="Ex: Ficção, Romance..."
            />
          </div>
          <div>
            <label htmlFor="campo-formato" className={rotulo}>Formato</label>
            <CampoCombo
              id="campo-formato"
              valor={v.formato}
              onChange={(val) => set("formato", val)}
              opcoes={FORMATOS}
              placeholder="Ex: Kindle, Físico..."
            />
          </div>
          <label className={rotulo}>
            Editora
            <input className={`${campo} mt-1`} value={v.editora ?? ""} onChange={(e) => set("editora", e.target.value || null)} />
          </label>
          <div>
            <label htmlFor="campo-pais" className={rotulo}>País do autor</label>
            <CampoPais
              valor={v.pais}
              onChange={(val) => set("pais", val)}
            />
          </div>
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
        aoAplicarCapa={(novaCapa) => {
          set("capa", novaCapa);
          notificar("Capa do livro selecionada!");
        }}
        capaAtual={v.capa ?? null}
        titulo={v.titulo || ""}
        autor={v.autor || ""}
      />

      {/* Modal de Confirmação para Remover Capa */}
      <ModalConfirmarRemoverCapa
        aberto={modalRemoverCapaAberto}
        aoFechar={() => setModalRemoverCapaAberto(false)}
        aoConfirmar={() => {
          set("capa", null);
          notificar("Capa do livro removida.");
        }}
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
  const [arquivoInfo, setArquivoInfo] = useState<{ nome: string; tamanho: string } | null>(null);
  const [progressoUpload, setProgressoUpload] = useState<number>(0);
  const [urlInput, setUrlInput] = useState(capaAtual || "");
  const [preview, setPreview] = useState<string | null>(capaAtual);
  const [arrastando, setArrastando] = useState(false);
  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (aberto) {
      setUrlInput(capaAtual || "");
      setPreview(capaAtual);
      setArquivoInfo(null);
      setProgressoUpload(0);
      setErro(null);
    }
  }, [aberto, capaAtual]);

  if (!aberto || typeof document === "undefined") return null;

  async function processarArquivo(file: File) {
    if (!file.type.startsWith("image/")) {
      setErro("Por favor, selecione um arquivo de imagem válido.");
      return;
    }
    const tamanhoFmt =
      file.size < 1024 * 1024
        ? `${(file.size / 1024).toFixed(1)} KB`
        : `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

    setArquivoInfo({ nome: file.name, tamanho: tamanhoFmt });
    setProcessando(true);
    setProgressoUpload(30);
    setErro(null);

    const timer1 = setTimeout(() => setProgressoUpload(70), 120);
    const timer2 = setTimeout(() => setProgressoUpload(95), 250);

    try {
      const dataUrl = await redimensionarImagem(file);
      setPreview(dataUrl);
      setUrlInput(dataUrl);
      setProgressoUpload(100);
    } catch {
      setErro("Não foi possível otimizar esta imagem.");
      setArquivoInfo(null);
      setProgressoUpload(0);
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
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

  function limparArquivo() {
    setArquivoInfo(null);
    setProgressoUpload(0);
    setPreview(capaAtual);
    setUrlInput(capaAtual || "");
  }

  return createPortal(
    <div className="modal-backdrop z-[70]" onClick={aoFechar}>
      <div
        className="relative w-full max-w-lg my-auto rounded-3xl border border-papel-3 bg-papel p-6 shadow-2xl surgir space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-papel-3/50 pb-4">
          <div>
            <h3 className="font-display text-xl font-semibold text-tinta">Alterar capa do livro</h3>
            <p className="text-xs text-tinta-2 mt-0.5">{titulo ? `"${titulo}"` : "Selecione uma imagem"}</p>
          </div>
          <button
            type="button"
            onClick={aoFechar}
            className="rounded-full p-1.5 text-tinta-3 hover:bg-papel-2 hover:text-tinta transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Seleção de Aba (Apenas Ícones KokonutUI) */}
        <div className="flex rounded-xl bg-papel-2 p-1 text-sm font-medium">
          <button
            type="button"
            onClick={() => setAba("upload")}
            title="Carregar arquivo (Drag & Drop)"
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
          <div className="space-y-4">
            {/* Componente KokonutUI File Upload Dropzone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setArrastando(true);
              }}
              onDragLeave={() => setArrastando(false)}
              onDrop={handleDrop}
              className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-7 text-center transition-all cursor-pointer group ${
                arrastando
                  ? "border-amora bg-amora-clara/30 scale-[1.01]"
                  : "border-papel-3 hover:border-amora/60 bg-papel-2/40 hover:bg-papel-2/80"
              }`}
            >
              <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" id="capa-file-input" />
              <label htmlFor="capa-file-input" className="cursor-pointer flex flex-col items-center w-full">
                <div className="rounded-2xl bg-amora-clara/70 p-4 mb-3 text-amora shadow-xs group-hover:scale-110 group-hover:bg-amora group-hover:text-papel transition-all duration-300">
                  <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
                    <path d="M12 12v9" />
                    <path d="m16 16-4-4-4 4" />
                  </svg>
                </div>
                <p className="font-semibold text-tinta text-sm">
                  {arrastando ? "Solte a imagem para carregar" : "Arraste e solte a capa do livro aqui"}
                </p>
                <p className="text-xs text-tinta-2 mt-1">ou clique para escolher do seu computador</p>
                <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-papel px-3 py-1 text-[11px] font-medium text-tinta-3 border border-papel-3">
                  <span>Suporta PNG, JPG, WEBP até 10MB</span>
                </div>
              </label>
            </div>

            {/* KokonutUI File Upload Status Card */}
            {arquivoInfo && (
              <div className="rounded-2xl border border-papel-3 bg-papel-2 p-3.5 space-y-3 surgir shadow-xs">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-12 w-9 shrink-0 overflow-hidden rounded-md border border-papel-3 bg-papel shadow-xs">
                      {preview ? (
                        <img src={preview} alt="Prévia da capa" className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-amora-clara text-amora">
                          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-tinta truncate">{arquivoInfo.nome}</p>
                      <p className="text-[11px] text-tinta-3">{arquivoInfo.tamanho}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {progressoUpload === 100 ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[11px] font-medium text-emerald-600">
                        <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Pronto
                      </span>
                    ) : (
                      <span className="text-xs font-num text-amora font-medium">{progressoUpload}%</span>
                    )}

                    <button
                      type="button"
                      onClick={limparArquivo}
                      className="rounded-full p-1 text-tinta-3 hover:bg-papel-3 hover:text-amora transition-colors cursor-pointer"
                      title="Remover arquivo"
                    >
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Progress Bar (KokonutUI style) */}
                <div className="h-1.5 w-full rounded-full bg-papel-3 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-amora transition-all duration-300 ease-out"
                    style={{ width: `${progressoUpload}%` }}
                  />
                </div>
              </div>
            )}
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
                  setArquivoInfo(null);
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

        {erro && <p className="text-xs text-rose-500 font-medium">{erro}</p>}

        {/* Prévia da capa quando não há card de upload ativo */}
        {preview && !arquivoInfo && (
          <div className="flex items-center gap-4 rounded-2xl border border-papel-3 bg-papel-2 p-3">
            <div className="w-12 shrink-0 overflow-hidden rounded-lg shadow-md aspect-[2/3] bg-papel-3">
              <img src={preview} alt="Prévia da capa" className="h-full w-full object-cover" />
            </div>
            <div>
              <p className="text-xs font-semibold text-tinta">Capa atual selecionada</p>
              <p className="text-[11px] text-tinta-2 mt-0.5">Imagem otimizada em alta resolução.</p>
            </div>
          </div>
        )}

        {/* Botões do Modal */}
        <div className="flex items-center justify-between border-t border-papel-3/50 pt-4">
          {capaAtual ? (
            <button
              type="button"
              onClick={() => {
                aoFechar();
                aoAplicarCapa("");
              }}
              className="text-xs text-tinta-3 hover:text-rose-500 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18m-2 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
              </svg>
              <span>Remover capa</span>
            </button>
          ) : (
            <span />
          )}

          <div className="flex items-center gap-3">
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
