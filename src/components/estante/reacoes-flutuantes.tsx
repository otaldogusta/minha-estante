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
    const leftPercent = 15 + Math.random() * 70; // 15% a 85% da largura

    const item: ReacaoItem = {
      id,
      emoji: novaReacao.emoji,
      autorNome: novaReacao.autorNome,
      leftPercent,
    };

    setReacoes((prev) => [...prev.slice(-15), item]);

    const timer = setTimeout(() => {
      setReacoes((prev) => prev.filter((r) => r.id !== id));
    }, 2800);

    return () => clearTimeout(timer);
  }, [novaReacao]);

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {reacoes.map((r) => (
        <div
          key={r.id}
          style={{ left: `${r.leftPercent}%` }}
          className="absolute bottom-16 flex flex-col items-center animate-flutuar-reacao"
        >
          <span className="text-3xl drop-shadow-md select-none transform hover:scale-125 transition-transform">
            {r.emoji}
          </span>
          {r.autorNome && (
            <span className="mt-1 rounded-full bg-tinta/80 px-2 py-0.5 text-[10px] font-medium text-papel shadow-xs backdrop-blur-xs">
              {r.autorNome}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
