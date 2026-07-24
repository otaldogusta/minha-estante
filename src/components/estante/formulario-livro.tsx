import { useState } from "react";

import { salvarLivro } from "../../lib/api/livros.functions";
import { GENEROS, FORMATOS, type Livro } from "../../lib/livros";
import { EstrelasInput } from "./estrelas";
import { CapaLivro } from "./capa-livro";

export type ValoresLivro = Partial<Omit<Livro, "id">> & { id?: number };

const campo =
  "w-full rounded-lg border border-papel-3 bg-papel px-3 py-2 text-sm text-tinta placeholder:text-tinta-3 focus:border-amora focus:outline-none";
const rotulo = "block text-sm font-medium text-tinta-2 mb-1";

export function FormularioLivro({
  inicial,
  aoSalvar,
}: {
  inicial: ValoresLivro;
  aoSalvar: (id: number) => void;
}) {
  const [v, setV] = useState<ValoresLivro>({
    status: "lido",
    formato: "Kindle",
    ano_leitura: new Date().getFullYear(),
    adaptacao: 0,
    vi_adaptacao: 0,
    ...inicial,
  });
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  function set<K extends keyof ValoresLivro>(k: K, val: ValoresLivro[K]) {
    setV((prev) => ({ ...prev, [k]: val }));
  }

  const num = (s: string) => (s.trim() === "" ? null : Number(s));

  async function enviar() {
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
      </div>

      <div className="space-y-5">
        <div className="flex flex-wrap gap-2">
          {statusOpcoes.map((s) => (
            <button
              key={s.valor}
              type="button"
              onClick={() => set("status", s.valor)}
              className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
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
            Páginas
            <input
              className={`${campo} mt-1 font-num`}
              inputMode="numeric"
              value={v.paginas ?? ""}
              onChange={(e) => set("paginas", num(e.target.value.replace(/\D/g, "")))}
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
              <label className={rotulo}>
                Página atual
                <input
                  className={`${campo} mt-1 font-num`}
                  inputMode="numeric"
                  value={v.pagina_atual ?? ""}
                  onChange={(e) => set("pagina_atual", num(e.target.value.replace(/\D/g, "")))}
                />
              </label>
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
          <label className="flex items-center gap-2 text-sm text-tinta-2">
            <input
              type="checkbox"
              checked={!!v.adaptacao}
              onChange={(e) => set("adaptacao", e.target.checked ? 1 : 0)}
              className="h-4 w-4 accent-amora"
            />
            Tem adaptação (filme/série)
          </label>
          {!!v.adaptacao && (
            <label className="flex items-center gap-2 text-sm text-tinta-2">
              <input
                type="checkbox"
                checked={!!v.vi_adaptacao}
                onChange={(e) => set("vi_adaptacao", e.target.checked ? 1 : 0)}
                className="h-4 w-4 accent-amora"
              />
              Já assisti
            </label>
          )}
          <label className="flex items-center gap-2 text-sm text-tinta-2">
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
          disabled={salvando}
          className="rounded-xl bg-amora px-8 py-3 text-sm font-medium text-papel transition-all hover:bg-amora-escura active:translate-y-[1px] disabled:opacity-60"
        >
          {salvando ? "Guardando na estante..." : "Salvar"}
        </button>
      </div>
    </div>
  );
}
