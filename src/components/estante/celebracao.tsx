import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";

import { CapaLivro } from "./capa-livro";
import { notaFmt } from "../../lib/livros";

function fraseDaNota(nota: number | null): string {
  if (nota === null) return "Mais um capítulo da sua história de leitora.";
  if (nota >= 4.75) return "Esse vai direto pra prateleira do coração.";
  if (nota >= 4) return "Que leitura boa. Já sabe qual vem agora?";
  if (nota >= 3) return "Mais um pra conta do ano!";
  return "Nem todo livro é pra gente, e tá tudo bem.";
}

type Confete = { left: number; delay: number; dur: number; rot: number; tam: number; cor: string };

export function Celebracao({
  titulo,
  autor,
  capa,
  nota,
  dias,
  cartas = [],
  aoFechar,
}: {
  titulo: string;
  autor: string;
  capa: string | null;
  nota: number | null;
  dias: number | null;
  cartas?: Array<{ id: number; remetente: string }>;
  aoFechar: () => void;
}) {
  const [carimbado, setCarimbado] = useState(false);
  const [reduzido, setReduzido] = useState(false);

  useEffect(() => {
    setReduzido(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const t = setTimeout(() => setCarimbado(true), reduzido ? 0 : 450);
    return () => clearTimeout(t);
  }, [reduzido]);

  const confetes = useMemo<Confete[]>(() => {
    const cores = ["#f6efdf", "#efe5cd", "#e8d9b8", "#f0e2e8", "#d9a7bd"];
    return Array.from({ length: 36 }, (_, i) => ({
      left: (i * 137.5) % 100,
      delay: ((i * 53) % 100) / 100,
      dur: 2.4 + ((i * 31) % 100) / 60,
      rot: ((i * 97) % 360) - 180,
      tam: 7 + ((i * 13) % 9),
      cor: cores[i % cores.length],
    }));
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-tinta/50 px-4 backdrop-blur-sm"
      role="dialog"
      aria-label="Livro concluído"
    >
      {!reduzido && (
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          {confetes.map((c, i) => (
            <span
              key={i}
              className="confete-pagina"
              style={{
                left: `${c.left}%`,
                width: c.tam,
                height: c.tam * 1.35,
                background: c.cor,
                animationDelay: `${c.delay}s`,
                animationDuration: `${c.dur}s`,
                ["--rot" as string]: `${c.rot}deg`,
              }}
            />
          ))}
        </div>
      )}

      <div className="surgir relative w-full max-w-sm rounded-3xl bg-papel p-8 text-center shadow-2xl">
        <div className="relative mx-auto w-36">
          <CapaLivro titulo={titulo} autor={autor} capa={capa} />
          <div
            className={`absolute -right-6 -top-4 rotate-12 rounded-lg border-[3px] border-amora px-3 py-1 font-num text-sm font-bold uppercase tracking-widest text-amora transition-all duration-300 ${
              carimbado ? "scale-100 opacity-90" : "scale-[2.2] opacity-0"
            }`}
            style={{ boxShadow: "0 2px 8px rgba(94,44,63,0.25)", background: "rgba(251,247,238,0.92)" }}
          >
            LIDO
          </div>
        </div>

        <h2 className="mt-6 font-display text-2xl font-semibold leading-tight tracking-tight text-tinta">{titulo}</h2>
        <div className="mt-2 flex items-center justify-center gap-3 font-num text-sm text-tinta-2">
          {dias !== null && <span>{dias <= 1 ? "lido em 1 dia" : `lido em ${dias} dias`}</span>}
          {nota !== null && <span>nota {notaFmt(nota)}</span>}
        </div>
        <p className="mt-4 font-display italic text-amora">{fraseDaNota(nota)}</p>

        {cartas.length > 0 && (
          <Link
            to="/cartas"
            className="mt-5 block rounded-2xl border border-amora/50 bg-amora-clara p-4 text-left transition-colors hover:border-amora"
          >
            <p className="font-display text-lg italic text-amora-escura">
              Este livro destravou {cartas.length === 1 ? "uma carta" : `${cartas.length} cartas`} pra você!
            </p>
            <p className="mt-0.5 text-sm text-amora-escura/70">
              De {[...new Set(cartas.map((c) => c.remetente))].join(", ")}. Toque para ler.
            </p>
          </Link>
        )}

        <button
          onClick={aoFechar}
          className="mt-7 w-full rounded-xl bg-amora px-6 py-3 text-sm font-medium text-papel transition-colors hover:bg-amora-escura active:translate-y-[1px]"
        >
          Voltar para a estante
        </button>
      </div>
    </div>
  );
}
