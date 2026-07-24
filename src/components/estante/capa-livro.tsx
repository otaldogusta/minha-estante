import { useState } from "react";
import { corDaCapa } from "../../lib/livros";

// Capa de livro com fallback tipográfico (para livros sem imagem).
export function CapaLivro({
  titulo,
  autor,
  capa,
  className = "",
}: {
  titulo: string;
  autor: string;
  capa: string | null;
  className?: string;
}) {
  const [falhou, setFalhou] = useState(false);
  const mostrarImagem = capa && !falhou;

  return (
    <div className={`livro-capa aspect-[2/3] overflow-hidden bg-papel-3 ${className}`}>
      {mostrarImagem ? (
        <img
          src={capa}
          alt={`Capa de ${titulo}`}
          loading="lazy"
          onError={() => setFalhou(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <div
          className="flex h-full w-full flex-col justify-between p-3 text-left"
          style={{ backgroundColor: corDaCapa(titulo) }}
        >
          <div className="h-1 w-8 rounded-full bg-white/40" />
          <p className="font-display text-sm leading-snug text-white [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:5] overflow-hidden">
            {titulo}
          </p>
          <p className="text-[10px] uppercase tracking-wide text-white/70 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden">
            {autor}
          </p>
        </div>
      )}
    </div>
  );
}
