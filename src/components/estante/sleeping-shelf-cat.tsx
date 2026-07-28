import React, { useEffect, useState } from "react";

export function SleepingShelfCat() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-[160px] sm:w-[190px] md:w-[210px] h-[65px]" aria-hidden="true" />;
  }

  return (
    <div
      aria-hidden="true"
      className="shelf-cat-editorial pointer-events-none relative flex-shrink-0 self-end -mb-[3px] ml-2 sm:ml-4 z-20 w-[180px] sm:w-[220px] md:w-[260px] select-none"
    >
      <style>{`
        @keyframes cat-shelf-breath {
          0%, 100% {
            transform: scaleY(1) translateY(0px);
          }
          50% {
            transform: scaleY(1.025) translateY(-1px);
          }
        }

        @keyframes cat-shelf-ear {
          0%, 90%, 100% {
            transform: rotate(0deg);
          }
          93% {
            transform: rotate(-3.5deg);
          }
          96% {
            transform: rotate(1.5deg);
          }
        }

        @keyframes cat-shelf-tail {
          0%, 84%, 100% {
            transform: rotate(0deg);
          }
          87% {
            transform: rotate(-4deg);
          }
          91% {
            transform: rotate(2deg);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .cat-anim-breath,
          .cat-anim-ear,
          .cat-anim-tail {
            animation: none !important;
          }
        }
      `}</style>

      {/* SVG Ilustrativo Vetorial Minimalista / Editorial do Gato na Estante */}
      <svg
        viewBox="0 0 200 70"
        className="w-full h-auto overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Sombra de Contato Suave com a Madeira (Ground Contact Shadow) */}
        <ellipse
          cx="102"
          cy="66"
          rx="72"
          ry="3.5"
          fill="var(--color-tinta)"
          opacity="0.22"
        />

        {/* Cauda Curvada Enrolada ao Lado da Madeira (Com movimento sutil raro) */}
        <g className="cat-anim-tail origin-right" style={{ animation: "cat-shelf-tail 13s infinite ease-in-out", transformOrigin: "52px 60px" }}>
          <path
            d="M 54 62 C 32 62, 18 52, 24 38 C 28 30, 36 28, 38 34 C 33 32, 28 38, 32 46 C 36 53, 46 56, 54 56 Z"
            fill="var(--color-papel-3)"
            stroke="var(--color-tinta-2)"
            strokeWidth="0.75"
            strokeOpacity="0.4"
          />
        </g>

        {/* Corpo Principal Enrolado (Com animação suave de respiração) */}
        <g className="cat-anim-breath" style={{ animation: "cat-shelf-breath 3.8s infinite ease-in-out", transformOrigin: "bottom center" }}>
          {/* Silhueta Base do Corpo (Usa papel-3 com borda suave em tinta-2) */}
          <path
            d="M 48 64 C 42 42, 60 22, 100 22 C 145 22, 168 36, 162 64 Z"
            fill="var(--color-papel-3)"
            stroke="var(--color-tinta-2)"
            strokeWidth="1"
            strokeOpacity="0.5"
          />

          {/* Camada Interna de Textura / Pelagem com Tinta-2 em baixa opacidade */}
          <path
            d="M 68 30 C 95 24, 130 26, 150 40 C 125 32, 90 32, 68 30 Z"
            fill="var(--color-tinta-2)"
            opacity="0.15"
          />

          {/* Curva Dorsal Anatômica (Destaque sutil com tom Amora da aplicação) */}
          <path
            d="M 62 48 Q 95 28, 142 36"
            stroke="var(--color-amora)"
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.45"
          />

          {/* Patinha Dianteira Recolhida no Apoio */}
          <ellipse
            cx="135"
            cy="62"
            rx="12"
            ry="4.5"
            fill="var(--color-papel-2)"
            stroke="var(--color-tinta-2)"
            strokeWidth="0.75"
            strokeOpacity="0.5"
          />

          {/* Cabeça Repousando na Prateleira */}
          <g className="cat-anim-ear" style={{ animation: "cat-shelf-ear 11.5s infinite ease-in-out", transformOrigin: "152px 48px" }}>
            {/* Formato do Rosto */}
            <path
              d="M 132 44 C 132 34, 144 32, 158 36 C 168 39, 172 50, 166 62 C 152 64, 136 60, 132 44 Z"
              fill="var(--color-papel-3)"
              stroke="var(--color-tinta-2)"
              strokeWidth="1"
              strokeOpacity="0.5"
            />

            {/* Orelha Esquerda Minimalista */}
            <path
              d="M 138 34 L 134 20 L 146 29 Z"
              fill="var(--color-papel-3)"
              stroke="var(--color-tinta-2)"
              strokeWidth="0.8"
              strokeOpacity="0.6"
            />
            <path
              d="M 139 33 L 136 24 L 144 30 Z"
              fill="var(--color-amora)"
              opacity="0.35"
            />

            {/* Orelha Direita Minimalista */}
            <path
              d="M 152 32 L 158 18 L 164 32 Z"
              fill="var(--color-papel-3)"
              stroke="var(--color-tinta-2)"
              strokeWidth="0.8"
              strokeOpacity="0.6"
            />
            <path
              d="M 153 32 L 157 22 L 162 32 Z"
              fill="var(--color-amora)"
              opacity="0.35"
            />

            {/* Olho Fechado em Repouso Sereno */}
            <path
              d="M 147 48 Q 152 52, 157 48"
              stroke="var(--color-tinta)"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
              opacity="0.75"
            />

            {/* Narizinho Delicado */}
            <path
              d="M 160 52 L 162.5 54 L 160 55 Z"
              fill="var(--color-amora)"
              opacity="0.7"
            />

            {/* Bigodes Finos Editoriais */}
            <path
              d="M 161 54 L 174 52 M 161 55 L 173 57 M 161 56 L 171 61"
              stroke="var(--color-tinta-2)"
              strokeWidth="0.65"
              strokeLinecap="round"
              opacity="0.5"
            />
          </g>
        </g>
      </svg>
    </div>
  );
}
