import { useEffect, useRef } from "react";

type Particula = {
  id: number;
  emoji: string;
  autorNome: string;
  startX: number;
  y: number;
  vy: number;
  scale: number;
  alpha: number;
  wobbleSpeed: number;
  wobbleAmp: number;
  frame: number;
  maxFrames: number;
};

// Função global para disparar reações de qualquer lugar sem re-renderizar React
export function dispararEfeitoReacao(emoji: string, autorNome: string = "") {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("minha-estante:reacao", {
      detail: { emoji, autorNome },
    })
  );
}

export function ReacoesFlutuantesContainer() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particulasRef = useRef<Particula[]>([]);
  const animandoRef = useRef<boolean>(false);
  const animFrameIdRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function redimensionar() {
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx?.scale(dpr, dpr);
    }

    redimensionar();
    window.addEventListener("resize", redimensionar);

    function loopAnimacao() {
      if (!ctx || !canvas) return;
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;

      ctx.clearRect(0, 0, w, h);

      const particulas = particulasRef.current;

      for (let i = particulas.length - 1; i >= 0; i--) {
        const p = particulas[i];
        p.frame++;
        p.y += p.vy;

        const progresso = p.frame / p.maxFrames;

        // Escala elástica: surge pequena, cresce e estabiliza
        if (progresso < 0.15) {
          p.scale = 0.5 + (progresso / 0.15) * 0.7; // 0.5 -> 1.2
          p.alpha = progresso / 0.15;
        } else if (progresso < 0.3) {
          p.scale = 1.2 - ((progresso - 0.15) / 0.15) * 0.2; // 1.2 -> 1.0
          p.alpha = 1;
        } else if (progresso > 0.75) {
          p.alpha = 1 - (progresso - 0.75) / 0.25; // 1 -> 0
        }

        // Movimento suave de onda horizontal (wobble)
        const x = p.startX + Math.sin(p.frame * p.wobbleSpeed) * p.wobbleAmp;

        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
        ctx.translate(x, p.y);
        ctx.scale(p.scale, p.scale);

        // Desenha o Emoji
        ctx.font = '38px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(p.emoji, 0, 0);

        // Desenha o nome do autor logo abaixo em um pill sutil
        if (p.autorNome) {
          ctx.font = '600 11px system-ui, -apple-system, sans-serif';
          const textMetrics = ctx.measureText(p.autorNome);
          const pillW = textMetrics.width + 14;
          const pillH = 18;
          const pillY = 24;

          ctx.fillStyle = "rgba(15, 12, 20, 0.82)";
          ctx.beginPath();
          ctx.roundRect(-pillW / 2, pillY - pillH / 2, pillW, pillH, 9);
          ctx.fill();

          ctx.fillStyle = "#ffffff";
          ctx.fillText(p.autorNome, 0, pillY + 1);
        }

        ctx.restore();

        // Remove partículas finalizadas
        if (p.frame >= p.maxFrames) {
          particulas.splice(i, 1);
        }
      }

      if (particulas.length > 0) {
        animFrameIdRef.current = requestAnimationFrame(loopAnimacao);
      } else {
        animandoRef.current = false;
        if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      }
    }

    function onNovaReacao(e: Event) {
      const custom = e as CustomEvent<{ emoji: string; autorNome: string }>;
      const { emoji, autorNome } = custom.detail || { emoji: "❤️", autorNome: "" };

      const dpr = window.devicePixelRatio || 1;
      const w = (canvas?.width || window.innerWidth * dpr) / dpr;
      const h = (canvas?.height || window.innerHeight * dpr) / dpr;

      const startX = w * (0.2 + Math.random() * 0.6); // 20% a 80% da tela
      const nova: Particula = {
        id: Date.now() + Math.random(),
        emoji: emoji || "❤️",
        autorNome: autorNome || "",
        startX,
        y: h - 100,
        vy: -2.8 - Math.random() * 1.2,
        scale: 0.5,
        alpha: 0,
        wobbleSpeed: 0.04 + Math.random() * 0.03,
        wobbleAmp: 12 + Math.random() * 18,
        frame: 0,
        maxFrames: 110, // ~1.8s a 60fps
      };

      particulasRef.current.push(nova);

      if (!animandoRef.current) {
        animandoRef.current = true;
        animFrameIdRef.current = requestAnimationFrame(loopAnimacao);
      }
    }

    window.addEventListener("minha-estante:reacao", onNovaReacao);

    return () => {
      window.removeEventListener("resize", redimensionar);
      window.removeEventListener("minha-estante:reacao", onNovaReacao);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-50 h-full w-full select-none"
    />
  );
}
