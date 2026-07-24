import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { guardarCarta, cartaStatus } from "../lib/api/auth.functions";
import { exigirLogin } from "../lib/exigir-login";

export const Route = createFileRoute("/carta")({
  beforeLoad: () => exigirLogin(),
  loader: async () => {
    const status = await cartaStatus();
    // A carta é só da dona da primeira estante.
    if (!status.dona) throw redirect({ to: "/" });
    return status;
  },
  component: PaginaCarta,
});

// O texto da carta, escrito por quem presenteia.
const CARTA_PARA = "Para Júlia Schwab";
const CARTA_DATA = "23 de julho de 2026";
const CARTA = [
  "Oi gatinha, vim aqui pra dizer que vc é a mulher da minha vida! amo cada momento ao seu lado, cada sensação, cada cheiro, cada abraço, cada você.",
  "Você é quem me da sentido as coisas e me mostrou o que é amar de verdade.",
  "Um passarinho verde me contou que vc tava construindo uma planilha de livros, e então resolvi simplificar ela - não significa que esta horrível lixo e podre - pois precisava de um toque especial para que vc economizasse o seu tempo precioso e me dar mais atenção.",
  "Agora ela ta com uma cara nova, e detalhe, aqui ja está todos os seus livros, resenhas e tudo mais que estava na planilha, então não precisa se preocupar tabao.",
  "Espero que goste, feliz namoreidos de 4, te amo 🧡.",
];

function PaginaCarta() {
  const navigate = useNavigate();
  const [aberta, setAberta] = useState(false);
  const [guardando, setGuardando] = useState(false);

  async function guardar() {
    setGuardando(true);
    try {
      await guardarCarta();
    } finally {
      navigate({ to: "/" });
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-papel px-4 py-10 textura-papel">
      {!aberta ? (
        <button
          onClick={() => setAberta(true)}
          className="group flex flex-col items-center focus:outline-none"
          aria-label="Abrir a carta"
        >
          <div className="relative h-44 w-64 sm:h-52 sm:w-80">
            {/* corpo do envelope */}
            <div className="absolute inset-0 rounded-lg border border-[#d9c9a8] bg-[#f6efdf] shadow-[0_18px_40px_-18px_rgba(93,74,43,0.5)]" />
            {/* aba */}
            <div
              className="absolute inset-x-0 top-0 h-1/2 origin-top rounded-t-lg border border-[#d9c9a8] bg-[#efe5cd] transition-transform duration-500 [clip-path:polygon(0_0,100%_0,50%_100%)] motion-safe:group-hover:-rotate-x-12"
              style={{ transformStyle: "preserve-3d" }}
            />
            {/* lacre */}
            <div className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-amora shadow-[0_4px_10px_rgba(94,44,63,0.5)] transition-transform duration-300 motion-safe:group-hover:scale-110">
              <span aria-hidden className="inline-flex gap-[2px]">
                <span className="inline-block h-5 w-[4px] rounded-sm bg-papel/90" />
                <span className="inline-block h-4 w-[4px] translate-y-1 rounded-sm bg-papel/60" />
                <span className="inline-block h-5 w-[4px] rounded-sm bg-papel/90" />
              </span>
            </div>
          </div>
          <p className="mt-6 font-display text-xl italic text-tinta">Tem uma carta pra você</p>
          <p className="mt-1 text-sm text-tinta-3">toque no lacre para abrir</p>
        </button>
      ) : (
        <div className="surgir w-full max-w-lg">
          <div className="rounded-2xl border border-[#d9c9a8] bg-[#fdfaf1] p-7 shadow-[0_20px_50px_-20px_rgba(93,74,43,0.45)] sm:p-10">
            <span aria-hidden className="inline-flex gap-[3px]">
              <span className="inline-block h-5 w-[5px] rounded-sm bg-amora" />
              <span className="inline-block h-4 w-[5px] translate-y-1 rounded-sm bg-tinta-2" />
              <span className="inline-block h-5 w-[5px] rounded-sm bg-tinta" />
            </span>
            <div className="mt-5 flex items-baseline justify-between gap-3">
              <p className="font-display text-xl font-semibold italic text-amora">{CARTA_PARA}</p>
              <p className="font-num text-xs text-tinta-3">{CARTA_DATA}</p>
            </div>
            <div className="mt-4 space-y-4">
              {CARTA.map((p, i) => (
                <p key={i} className="font-display leading-relaxed text-tinta">
                  {p}
                </p>
              ))}
            </div>
          </div>
          <button
            onClick={guardar}
            disabled={guardando}
            className="mx-auto mt-8 block rounded-full bg-amora px-8 py-3 text-sm font-medium text-papel transition-colors hover:bg-amora-escura active:translate-y-[1px] disabled:opacity-60"
          >
            {guardando ? "Guardando..." : "Guardar esta carta e abrir minha estante"}
          </button>
          <p className="mt-3 text-center text-xs text-tinta-3">Ela fica guardada em Minha conta, sempre que quiser reler.</p>
        </div>
      )}
    </div>
  );
}
