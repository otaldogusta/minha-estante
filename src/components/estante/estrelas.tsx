// Estrelas com meia estrela (leitura) e versão interativa (formulário).

function Estrela({ fill }: { fill: number }) {
  // fill: 0, 0.5 ou 1
  const id = `meia-${Math.random().toString(36).slice(2, 8)}`;
  return (
    <svg viewBox="0 0 24 24" className="h-[1em] w-[1em]" aria-hidden>
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
  return (
    <div className="flex items-center gap-2">
      <div className="flex text-2xl">
        {[1, 2, 3, 4, 5].map((i) => (
          <span key={i} className="relative inline-flex">
            <button
              type="button"
              aria-label={`${i - 0.5} estrelas`}
              onClick={() => onChange(i - 0.5)}
              className="absolute inset-y-0 left-0 z-10 w-1/2 cursor-pointer"
            />
            <button
              type="button"
              aria-label={`${i} estrelas`}
              onClick={() => onChange(i)}
              className="absolute inset-y-0 right-0 z-10 w-1/2 cursor-pointer"
            />
            <Estrela fill={(valor ?? 0) >= i ? 1 : (valor ?? 0) >= i - 0.5 ? 0.5 : 0} />
          </span>
        ))}
      </div>
      <span className="font-num text-sm text-tinta-2">
        {valor !== null && valor !== undefined ? valor.toLocaleString("pt-BR", { minimumFractionDigits: 1 }) : "sem nota"}
      </span>
      {valor !== null && (
        <button type="button" onClick={() => onChange(null)} className="text-xs text-tinta-3 underline hover:text-amora">
          limpar
        </button>
      )}
    </div>
  );
}
