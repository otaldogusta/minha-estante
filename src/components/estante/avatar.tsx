import type { StatusPresenca } from "../../lib/api/livros.functions";

export function PontoPresenca({ status, tamanho = "md" }: { status: StatusPresenca; tamanho?: "sm" | "md" | "lg" }) {
  const tamDot = tamanho === "lg" ? "h-4 w-4 ring-3" : tamanho === "sm" ? "h-3 w-3 ring-2" : "h-3.5 w-3.5 ring-2";
  const tamBolinha = tamanho === "lg" ? "h-3 w-3" : tamanho === "sm" ? "h-2 w-2" : "h-2.5 w-2.5";

  if (status === "online") {
    return (
      <span className={`absolute bottom-0 right-0 flex ${tamDot} items-center justify-center rounded-full bg-papel ring-papel shadow-xs`} title="Online agora">
        <span className={`relative flex ${tamBolinha}`}>
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className={`relative inline-flex ${tamBolinha} rounded-full bg-emerald-500`} />
        </span>
      </span>
    );
  }

  if (status === "lendo") {
    return (
      <span className={`absolute bottom-0 right-0 flex ${tamDot} items-center justify-center rounded-full bg-papel ring-papel shadow-xs`} title="Lendo no momento">
        <span className={`relative flex ${tamBolinha}`}>
          <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
          <span className={`relative inline-flex ${tamBolinha} rounded-full bg-amber-500`} />
        </span>
      </span>
    );
  }

  if (status === "ocupado") {
    return (
      <span className={`absolute bottom-0 right-0 flex ${tamDot} items-center justify-center rounded-full bg-papel ring-papel shadow-xs`} title="Não perturbe (Lendo em paz)">
        <span className={`relative flex ${tamBolinha}`}>
          <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
          <span className={`relative inline-flex ${tamBolinha} rounded-full bg-rose-500`} />
        </span>
      </span>
    );
  }

  return (
    <span className={`absolute bottom-0 right-0 flex ${tamDot} items-center justify-center rounded-full bg-papel ring-papel shadow-xs`} title="Offline">
      <span className={`${tamBolinha} rounded-full bg-tinta-3/50`} />
    </span>
  );
}

export function AvatarLeitor({
  nome,
  status,
  tamanho = "md",
  className = "",
}: {
  nome: string;
  status?: StatusPresenca;
  tamanho?: "sm" | "md" | "lg";
  className?: string;
}) {
  const tamanhoClasse =
    tamanho === "lg"
      ? "h-16 w-16 text-3xl"
      : tamanho === "sm"
      ? "h-8 w-8 text-sm"
      : "h-12 w-12 text-xl";

  const inicial = (nome || "L").charAt(0).toUpperCase();

  return (
    <div className={`relative inline-block ${className}`}>
      <span className={`flex ${tamanhoClasse} shrink-0 items-center justify-center rounded-full bg-amora-clara font-display text-amora shadow-xs`}>
        {inicial}
      </span>
      {status && <PontoPresenca status={status} tamanho={tamanho} />}
    </div>
  );
}
