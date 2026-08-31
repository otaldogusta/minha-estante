import { useState, useEffect, useCallback } from "react";

export type ReacaoItem = {
  id: string;
  emoji: string;
  autorNome: string;
  leftPercent: number;
};

export function ReacoesFlutuantesContainer({
  novaReacao,
}: {
  novaReacao: { emoji: string; autorNome: string; timestamp: number } | null;
}) {
  const [reacoes, setReacoes] = useState<ReacaoItem[]>([]);

  useEffect(() => {
    if (!novaReacao) return;

    const id = `${novaReacao.timestamp}-${Math.random()}`;
    const leftPercent = 20 + Math.random() * 60; // 20% a 80% da tela

    const item: ReacaoItem = {
      id,
      emoji: novaReacao.emoji,
      autorNome: novaReacao.autorNome,
      leftPercent,
    };

    setReacoes((prev) => [...prev.slice(-10), item]);

    const timer = setTimeout(() => {
      setReacoes((prev) => prev.filter((r) => r.id !== id));
    }, 2300);

    return () => clearTimeout(timer);
  }, [novaReacao]);

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden select-none">
      {reacoes.map((r) => (
        <div
          key={r.id}
          style={{ left: `${r.leftPercent}%` }}
          className="absolute bottom-20 flex flex-col items-center animate-flutuar-reacao pointer-events-none"
        >
          <span className="text-4xl select-none leading-none">
            {r.emoji}
          </span>
          {r.autorNome && (
            <span className="mt-1 rounded-full bg-black/80 px-2 py-0.5 text-[10px] font-medium text-white shadow-xs">
              {r.autorNome}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
