import React, { useEffect, useState, lazy, Suspense } from "react";

const DotLottieReact = lazy(() =>
  import("@lottiefiles/dotlottie-react").then((mod) => ({
    default: mod.DotLottieReact,
  }))
);

interface SleepingLottieCatProps {
  useLottie?: boolean;
}

export function SleepingLottieCat({ useLottie = true }: SleepingLottieCatProps) {
  const [mounted, setMounted] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-[300px] h-[160px]" aria-hidden="true" />;
  }

  return (
    <div
      aria-hidden="true"
      className="shelf-lottie-cat pointer-events-none relative flex-shrink-0 self-end -mb-[2px] ml-2 sm:ml-4 z-20 w-[320px] sm:w-[400px] md:w-[460px] h-[150px] sm:h-[180px] md:h-[210px] select-none"
    >
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .shelf-lottie-cat {
            display: none !important;
          }
        }
      `}</style>

      {/* Sombra de Contato Suave com a Madeira */}
      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-[70%] h-3 bg-black/40 dark:bg-black/60 blur-xs rounded-full pointer-events-none z-10" />

      {/* Container de Alta Definição (Renderiza a tela nativa em alta resolução sem pixelamento) */}
      <div className="relative w-full h-full flex items-end justify-center filter opacity-95 contrast-[0.98] dark:brightness-[0.95] transform translate-y-[22px] translate-x-[10px] origin-bottom transition-transform">
        <Suspense fallback={<div className="w-full h-full" />}>
          <DotLottieReact
            src="/animations/sleeping-cat.lottie"
            autoplay
            loop
            renderConfig={{
              autoResize: true,
              devicePixelRatio: typeof window !== "undefined" ? Math.max(2.5, window.devicePixelRatio || 2) : 2.5,
            }}
            onError={() => setHasError(true)}
            aria-hidden="true"
            className="w-full h-full object-contain"
          />
        </Suspense>
      </div>
    </div>
  );
}
