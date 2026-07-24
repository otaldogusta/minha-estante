import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";

import {
  listarCartas,
  dadosParaEscrever,
  enviarCarta,
  editarCarta,
  excluirCarta,
  lerCarta,
  type CartaRecebida,
  type CartaEnviada,
} from "../lib/api/cartas.functions";
import { Cabecalho } from "../components/estante/cabecalho";
import { exigirLogin } from "../lib/exigir-login";

export const Route = createFileRoute("/cartas")({
  beforeLoad: () => exigirLogin(),
  loader: async () => {
    const [cartas, dados] = await Promise.all([listarCartas(), dadosParaEscrever()]);
    return { ...cartas, ...dados };
  },
  component: PaginaCartas,
});

function dataLonga(iso: string): string {
  const d = new Date(iso.replace(" ", "T") + "Z");
  return d.toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
}

function Lacre({ tamanho = 12 }: { tamanho?: number }) {
  return (
    <span
      aria-hidden
      className="inline-flex items-center justify-center rounded-full bg-amora"
      style={{ width: tamanho * 3, height: tamanho * 3 }}
    >
      <span className="inline-flex gap-[2px]">
        <span className="inline-block rounded-sm bg-papel/90" style={{ width: 3, height: tamanho }} />
        <span className="inline-block translate-y-0.5 rounded-sm bg-papel/60" style={{ width: 3, height: tamanho * 0.8 }} />
        <span className="inline-block rounded-sm bg-papel/90" style={{ width: 3, height: tamanho }} />
      </span>
    </span>
  );
}

function CartaRecebidaCard({ carta }: { carta: CartaRecebida }) {
  const router = useRouter();
  const [aberta, setAberta] = useState(false);
  const jaLida = carta.lida === 1;

  async function abrir() {
    setAberta(true);
    if (!jaLida) {
      await lerCarta({ data: { id: carta.id } });
      router.invalidate();
    }
  }

  // Lacrada a um livro ainda não terminado
  if (!carta.desbloqueada) {
    return (
      <div className="rounded-2xl border border-dashed border-tinta-3 bg-papel-2/60 p-5">
        <div className="flex items-center gap-4">
          <Lacre />
          <div className="min-w-0">
            <p className="font-display italic text-tinta">Uma carta de {carta.remetente} está lacrada</p>
            <p className="mt-0.5 text-sm text-tinta-2">
              Ela se abre quando você terminar <span className="font-medium text-amora">{carta.livro_titulo}</span>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!aberta && !jaLida) {
    return (
      <button
        onClick={abrir}
        className="group w-full rounded-2xl border border-amora/40 bg-amora-clara p-5 text-left transition-all hover:border-amora"
      >
        <div className="flex items-center gap-4">
          <Lacre />
          <div>
            <p className="font-display text-lg italic text-amora-escura">Carta nova de {carta.remetente}</p>
            <p className="mt-0.5 text-sm text-amora-escura/70">
              {carta.livro_titulo ? `Desbloqueada por ${carta.livro_titulo}. ` : ""}Toque para abrir
            </p>
          </div>
        </div>
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-[#d9c9a8] bg-[#fdfaf1] p-6">
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-display italic text-amora">De {carta.remetente}</p>
        <p className="font-num text-xs text-tinta-3">{dataLonga(carta.criado_em)}</p>
      </div>
      {carta.livro_titulo && (
        <p className="mt-1 text-xs text-tinta-3">Desbloqueada ao terminar {carta.livro_titulo}</p>
      )}
      <p className="mt-4 whitespace-pre-wrap font-display leading-relaxed text-tinta">{carta.corpo}</p>
    </div>
  );
}

function CartaEnviadaCard({ carta }: { carta: CartaEnviada }) {
  const router = useRouter();
  const [editando, setEditando] = useState(false);
  const [corpo, setCorpo] = useState(carta.corpo);
  const [excluindo, setExcluindo] = useState(false);

  async function salvar() {
    await editarCarta({ data: { id: carta.id, corpo } });
    setEditando(false);
    router.invalidate();
  }
  async function excluir() {
    await excluirCarta({ data: { id: carta.id } });
    router.invalidate();
  }

  return (
    <div className="rounded-2xl border border-papel-3 card-surface p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm text-tinta-2">
          Para <span className="font-medium text-tinta">{carta.destinatario}</span>
          {carta.livro_titulo && (
            <>
              {" "}· lacrada até terminar <span className="text-amora">{carta.livro_titulo}</span>
            </>
          )}
        </p>
        <p className="font-num text-xs text-tinta-3">{dataLonga(carta.criado_em)}</p>
      </div>

      {editando ? (
        <>
          <textarea
            value={corpo}
            onChange={(e) => setCorpo(e.target.value)}
            className="mt-3 min-h-28 w-full rounded-lg border border-papel-3 bg-papel px-3 py-2 font-display text-tinta focus:border-amora focus:outline-none"
          />
          <div className="mt-2 flex gap-2">
            <button onClick={salvar} className="rounded-lg bg-amora px-4 py-1.5 text-sm text-papel hover:bg-amora-escura transition-colors">
              Salvar
            </button>
            <button onClick={() => setEditando(false)} className="rounded-lg border border-papel-3 px-4 py-1.5 text-sm text-tinta-2">
              Cancelar
            </button>
          </div>
        </>
      ) : (
        <p className="mt-3 whitespace-pre-wrap font-display leading-relaxed text-tinta">{carta.corpo}</p>
      )}

      <div className="mt-3 flex items-center gap-3 text-xs">
        {carta.lida === 1 ? (
          <span className="rounded-full bg-papel-3 px-2.5 py-1 text-tinta-2">Lida</span>
        ) : (
          <>
            <span className="rounded-full bg-amora-clara px-2.5 py-1 text-amora-escura">
              {carta.desbloqueada ? "Entregue, ainda não lida" : "Aguardando o livro"}
            </span>
            {!editando && (
              <button onClick={() => setEditando(true)} className="text-tinta-2 underline underline-offset-2 hover:text-amora">
                editar
              </button>
            )}
            {!excluindo ? (
              <button onClick={() => setExcluindo(true)} className="text-tinta-2 underline underline-offset-2 hover:text-amora">
                excluir
              </button>
            ) : (
              <span className="inline-flex items-center gap-2">
                <button onClick={excluir} className="rounded bg-amora-escura px-2 py-0.5 text-papel">
                  confirmar exclusão
                </button>
                <button onClick={() => setExcluindo(false)} className="text-tinta-2 underline">
                  cancelar
                </button>
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function PaginaCartas() {
  const { recebidas, enviadas, destinatarios, livros } = Route.useLoaderData();
  const router = useRouter();
  const [aba, setAba] = useState<"recebidas" | "enviadas" | "escrever">("recebidas");
  const [para, setPara] = useState<number | null>(destinatarios[0]?.id ?? null);
  const [corpo, setCorpo] = useState("");
  const [livroId, setLivroId] = useState<number | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  const novas = recebidas.filter((c) => c.desbloqueada === 1 && c.lida === 0).length;

  async function enviar() {
    if (!para || !corpo.trim()) return;
    setEnviando(true);
    setAviso(null);
    try {
      const res = await enviarCarta({ data: { para, corpo, livroCondicaoId: livroId } });
      if (res.ok) {
        setCorpo("");
        setLivroId(null);
        setAba("enviadas");
        router.invalidate();
      } else {
        setAviso(res.erro);
      }
    } catch {
      setAviso("Não foi possível enviar. Tente de novo.");
    } finally {
      setEnviando(false);
    }
  }

  const abaCls = (ativa: boolean) =>
    `rounded-full px-4 py-1.5 text-sm transition-colors ${ativa ? "bg-amora text-papel" : "bg-papel-2 text-tinta-2 hover:bg-papel-3"}`;

  return (
    <div className="min-h-dvh pb-24">
      <Cabecalho paginaAtiva="cartas" />
      <main className="mx-auto max-w-2xl px-4 sm:px-6">
        <h1 className="mt-10 font-display text-3xl font-semibold tracking-tight text-tinta">Cartas</h1>
        <p className="mt-1 text-tinta-2">Palavras trocadas entre leitores. Algumas só se abrem no fim de um livro.</p>

        <div className="mt-6 flex flex-wrap gap-2">
          <button onClick={() => setAba("recebidas")} className={abaCls(aba === "recebidas")}>
            Recebidas{novas > 0 ? ` (${novas} nova${novas > 1 ? "s" : ""})` : ""}
          </button>
          <button onClick={() => setAba("enviadas")} className={abaCls(aba === "enviadas")}>
            Enviadas
          </button>
          <button onClick={() => setAba("escrever")} className={abaCls(aba === "escrever")}>
            Escrever carta
          </button>
        </div>

        {aba === "recebidas" && (
          <div className="mt-6 space-y-4">
            {recebidas.length === 0 && (
              <div className="rounded-2xl border border-dashed border-tinta-3 p-8 text-center text-tinta-2">
                Nenhuma carta ainda. Elas aparecem aqui quando alguém escrever pra você.
              </div>
            )}
            {recebidas.map((c) => (
              <CartaRecebidaCard key={c.id} carta={c} />
            ))}
          </div>
        )}

        {aba === "enviadas" && (
          <div className="mt-6 space-y-4">
            {enviadas.length === 0 && (
              <div className="rounded-2xl border border-dashed border-tinta-3 p-8 text-center text-tinta-2">
                Você ainda não enviou nenhuma carta.
              </div>
            )}
            {enviadas.map((c) => (
              <CartaEnviadaCard key={c.id} carta={c} />
            ))}
          </div>
        )}

        {aba === "escrever" && (
          <form
            className="mt-6 space-y-5 rounded-2xl border border-papel-3 card-surface p-6"
            onSubmit={(e) => {
              e.preventDefault();
              enviar();
            }}
          >
            <label className="block text-sm font-medium text-tinta-2">
              Para
              <select
                value={para ?? ""}
                onChange={(e) => {
                  setPara(Number(e.target.value) || null);
                  setLivroId(null);
                }}
                className="mt-1 w-full rounded-lg border border-papel-3 bg-papel px-3 py-2.5 text-tinta focus:border-amora focus:outline-none"
              >
                {destinatarios.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nome}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-medium text-tinta-2">
              Sua carta
              <textarea
                value={corpo}
                onChange={(e) => setCorpo(e.target.value)}
                placeholder="Escreva com calma. Cartas não têm pressa."
                className="mt-1 min-h-40 w-full rounded-lg border border-papel-3 bg-papel px-3 py-2.5 font-display leading-relaxed text-tinta placeholder:font-ui placeholder:text-tinta-3 focus:border-amora focus:outline-none"
              />
            </label>

            <label className="block text-sm font-medium text-tinta-2">
              Lacrar a um livro (opcional)
              <select
                value={livroId ?? ""}
                onChange={(e) => setLivroId(Number(e.target.value) || null)}
                className="mt-1 w-full rounded-lg border border-papel-3 bg-papel px-3 py-2.5 text-tinta focus:border-amora focus:outline-none"
              >
                <option value="">Entregar agora</option>
                {livros
                  .filter((l) => l.usuario_id === para)
                  .map((l) => (
                    <option key={l.id} value={l.id}>
                      Só abrir quando terminar: {l.titulo} {l.status === "lendo" ? "(lendo agora)" : "(quer ler)"}
                    </option>
                  ))}
              </select>
              <span className="mt-1 block text-xs text-tinta-3">
                A carta aparece lacrada na caixinha e vira recompensa quando o livro termina.
              </span>
            </label>

            {aviso && <p className="text-sm text-amora-escura">{aviso}</p>}

            <button
              type="submit"
              disabled={enviando || !corpo.trim() || !para}
              className="w-full rounded-xl bg-amora px-6 py-3 text-sm font-medium text-papel transition-colors hover:bg-amora-escura active:translate-y-[1px] disabled:opacity-60"
            >
              {enviando ? "Lacrando o envelope..." : "Enviar carta"}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
