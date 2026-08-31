import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { listarLeitores, type LeitorResumo } from "../../lib/api/livros.functions";
import { convidarLeitorParaSala, type SalaLeituraDetalhes } from "../../lib/api/sala-leitura.functions";
import { AvatarLeitor } from "./avatar";
import { notificar } from "../../lib/toast";

export function ModalConvidarSala({
  aberto,
  onClose,
  sala,
}: {
  aberto: boolean;
  onClose: () => void;
  sala: SalaLeituraDetalhes;
}) {
  const [leitores, setLeitores] = useState<LeitorResumo[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [enviandoId, setEnviandoId] = useState<number | null>(null);
  const [convidados, setConvidados] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!aberto) return;
    let ativo = true;
    setCarregando(true);
    listarLeitores()
      .then((res) => {
        if (ativo && Array.isArray(res)) {
          setLeitores(res);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, [aberto]);

  if (!aberto || typeof document === "undefined") return null;

  async function handleCopiarLink() {
    try {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      notificar("Link copiado! Envie para quem você quer convidar.", "sucesso");
    } catch {
      notificar("Não foi possível copiar o link.", "erro");
    }
  }

  async function handleConvidarLeitor(leitorId: number, leitorNome: string) {
    setEnviandoId(leitorId);
    try {
      const res = await convidarLeitorParaSala({
        data: {
          codigo: sala.codigo,
          paraUsuarioId: leitorId,
        },
      });

      if (res.ok) {
        setConvidados((prev) => new Set(prev).add(leitorId));
        notificar(`Convite enviado para ${leitorNome}! 📬`, "sucesso");
      } else {
        notificar(res.erro || "Erro ao enviar convite.", "erro");
      }
    } catch (e: any) {
      notificar(e.message || "Erro ao convidar leitor.", "erro");
    } finally {
      setEnviandoId(null);
    }
  }

  // IDs dos participantes que já estão na sala
  const idsNaSala = new Set(sala.participantes.map((p) => p.usuarioId));

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-lg rounded-2xl border border-papel-3 bg-papel p-6 sm:p-7 shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh] overflow-hidden"
      >
        {/* Cabeçalho do Modal */}
        <div className="flex items-center justify-between gap-3 border-b border-papel-3/70 pb-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amora-clara text-amora text-2xl shadow-xs shrink-0 select-none">
              🛋️
            </span>
            <div>
              <h3 className="font-display text-lg sm:text-xl font-bold text-tinta">
                Convidar para Leitura Coletiva
              </h3>
              <p className="text-xs text-tinta-2">
                Livro: <strong className="font-medium text-tinta">“{sala.livroTitulo}”</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-tinta-3 hover:bg-papel-2 hover:text-tinta transition-all cursor-pointer"
            title="Fechar"
          >
            ✕
          </button>
        </div>

        {/* Link Direto para Compartilhar */}
        <div className="mt-4 rounded-xl border border-dashed border-amora/40 bg-amora/5 p-3 sm:p-4 flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-amora">
              Link Direto da Sala
            </span>
            <p className="text-xs font-mono text-tinta truncate mt-0.5 select-all">
              {typeof window !== "undefined" ? window.location.href : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={handleCopiarLink}
            className="spring-bounce shrink-0 inline-flex items-center gap-1.5 rounded-full bg-amora px-3.5 py-1.5 text-xs font-medium text-papel hover:bg-amora-escura shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <span>📋</span>
            <span>Copiar</span>
          </button>
        </div>

        {/* Lista de Leitores da Casa */}
        <div className="mt-5 flex-1 overflow-y-auto pr-1 -mr-1">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-tinta-3 mb-2.5">
            Leitores da Casa
          </h4>

          {carregando ? (
            <div className="py-8 text-center text-xs text-tinta-3">
              Carregando leitores da casa...
            </div>
          ) : leitores.length === 0 ? (
            <div className="py-6 text-center text-xs text-tinta-3">
              Nenhum outro leitor encontrado na casa.
            </div>
          ) : (
            <div className="space-y-2">
              {leitores.map((leitor) => {
                const jaEstaNaSala = idsNaSala.has(leitor.id);
                const jaConvidado = convidados.has(leitor.id);
                const enviandoEste = enviandoId === leitor.id;

                return (
                  <div
                    key={leitor.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-papel-3/70 bg-papel-2/50 p-2.5 sm:p-3 transition-colors hover:border-papel-3 hover:bg-papel-2"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <AvatarLeitor nome={leitor.nome} tamanho="sm" status={leitor.statusPresenca} />
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-semibold text-tinta truncate">
                          {leitor.nome}
                        </p>
                        <p className="text-[11px] text-tinta-3">
                          {leitor.statusPresenca === "online" ? (
                            <span className="text-emerald-600 font-medium">Online agora</span>
                          ) : leitor.statusPresenca === "lendo" ? (
                            <span className="text-amber-600 font-medium">Lendo agora</span>
                          ) : (
                            <span>{leitor.lidos || 0} livros lidos</span>
                          )}
                        </p>
                      </div>
                    </div>

                    {jaEstaNaSala ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        ✓ Já na sala
                      </span>
                    ) : jaConvidado ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amora/15 border border-amora/30 px-3 py-1 text-[11px] font-semibold text-amora">
                        ✓ Convite enviado
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleConvidarLeitor(leitor.id, leitor.nome)}
                        disabled={enviandoEste}
                        className="spring-bounce inline-flex items-center gap-1.5 rounded-full border border-papel-3 bg-papel hover:border-amora hover:bg-amora-clara hover:text-amora px-3.5 py-1.5 text-xs font-semibold text-tinta transition-all active:scale-95 cursor-pointer shadow-xs disabled:opacity-60"
                      >
                        {enviandoEste ? (
                          <span>Enviando...</span>
                        ) : (
                          <>
                            <span>📬</span>
                            <span>Convidar</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Rodapé */}
        <div className="mt-5 border-t border-papel-3/70 pt-4 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="spring-bounce rounded-full border border-papel-3 bg-papel-2 px-5 py-2 text-xs sm:text-sm font-medium text-tinta hover:bg-papel-3 transition-colors cursor-pointer"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
