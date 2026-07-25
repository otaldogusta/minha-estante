import { useState } from "react";

// Estrelas com meia estrela (leitura) e versão interativa animada no hover (formulário).

function Estrela({ fill }: { fill: number }) {
  // fill: 0, 0.5 ou 1
  const id = `meia-${Math.random().toString(36).slice(2, 8)}`;
  return (
    <svg viewBox="0 0 24 24" className="h-[1em] w-[1em] transition-all duration-200 drop-shadow-xs" aria-hidden>
      {fill === 0.5 && (
        <defs>
          <linearGradient id={id}>
            <stop offset="50%" stopColor="#7A3B52" />
            <stop offset="50%" stopColor="#D8CDB8" />
          </linearGradient>
        </defs>
      )}
      <path
        d="M12 2.5l2.95 6.2 6.8.86-5 4.73 1.3 6.71L12 17.7 5.95 21l1.3-6.71-5-4.73 6.8-.86L12 2.5z"
        fill={fill === 1 ? "#7A3B52" : fill === 0.5 ? `url(#${id})` : "#D8CDB8"}
      />
    </svg>
  );
}

export function Estrelas({ nota, className = "" }: { nota: number | null; className?: string }) {
  if (nota === null || nota === undefined) return null;
  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`} aria-label={`Nota ${nota} de 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Estrela key={i} fill={nota >= i ? 1 : nota >= i - 0.5 ? 0.5 : 0} />
      ))}
    </span>
  );
}

export function EstrelasInput({
  valor,
  onChange,
}: {
  valor: number | null;
  onChange: (v: number | null) => void;
}) {
  const [hoverValor, setHoverValor] = useState<number | null>(null);

  const valorEfetivo = hoverValor !== null ? hoverValor : (valor ?? 0);
  const exibeValor = hoverValor !== null ? hoverValor : valor;

  return (
    <div
      className="flex items-center gap-2 select-none"
      onMouseLeave={() => setHoverValor(null)}
    >
      <div className="flex items-center gap-0.5 text-2xl">
        {[1, 2, 3, 4, 5].map((i) => {
          const estaPreenchido = valorEfetivo >= i;
          const estaMeio = valorEfetivo >= i - 0.5 && valorEfetivo < i;
          const estaEmHover = hoverValor !== null && hoverValor >= i - 0.5;

          return (
            <span
              key={i}
              className={`relative inline-flex items-center justify-center transition-all duration-200 ease-out ${
                estaEmHover ? "scale-125 -translate-y-0.5" : "scale-100"
              }`}
            >
              {/* Meia Estrela Esquerda */}
              <button
                type="button"
                aria-label={`${i - 0.5} estrelas`}
                onMouseEnter={() => setHoverValor(i - 0.5)}
                onClick={() => onChange(i - 0.5)}
                className="absolute inset-y-0 left-0 z-10 w-1/2 cursor-pointer"
              />
              {/* Estrela Inteira Direita */}
              <button
                type="button"
                aria-label={`${i} estrelas`}
                onMouseEnter={() => setHoverValor(i)}
                onClick={() => onChange(i)}
                className="absolute inset-y-0 right-0 z-10 w-1/2 cursor-pointer"
              />
              <Estrela fill={estaPreenchido ? 1 : estaMeio ? 0.5 : 0} />
            </span>
          );
        })}
      </div>

      <span
        className={`font-num text-sm transition-all duration-150 ${
          hoverValor !== null ? "text-amora font-semibold" : "text-tinta-2"
        }`}
      >
        {exibeValor !== null && exibeValor !== undefined
          ? exibeValor.toLocaleString("pt-BR", { minimumFractionDigits: 1 })
          : "sem nota"}
      </span>

      {valor !== null && (
        <button
          type="button"
          onClick={() => {
            setHoverValor(null);
            onChange(null);
          }}
          className="text-xs text-tinta-3 underline hover:text-amora transition-colors cursor-pointer ml-1"
        >
          limpar
        </button>
      )}
    </div>
  );
}
