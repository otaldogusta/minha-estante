import { createFileRoute } from "@tanstack/react-router";

import { usuarioDaSessao } from "../lib/auth.server";

// Proxy de capas (mesma origem) para o canvas do pôster da retrospectiva.
// Restrito a sessão válida + hosts conhecidos de capas de livro.
const HOSTS_PERMITIDOS = [
  "covers.openlibrary.org",
  "books.google.com",
  "books.googleusercontent.com",
  "dcdn-us.mitiendanube.com",
  "cdn.awsli.com.br",
  "m.media-amazon.com",
];

function hostPermitido(host: string): boolean {
  return HOSTS_PERMITIDOS.some((h) => host === h || host.endsWith(`.${h}`));
}

export const Route = createFileRoute("/api/capa")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const sessao = await usuarioDaSessao();
        if (!sessao) return new Response("Não autenticado", { status: 401 });

        const alvo = new URL(request.url).searchParams.get("u");
        if (!alvo) return new Response("Faltou a URL", { status: 400 });
        let url: URL;
        try {
          url = new URL(alvo);
        } catch {
          return new Response("URL inválida", { status: 400 });
        }
        if (url.protocol !== "https:" || !hostPermitido(url.hostname)) {
          return new Response("Host não permitido", { status: 400 });
        }

        const res = await fetch(url.toString(), { signal: AbortSignal.timeout(10000) });
        if (!res.ok || !res.body) return new Response("Capa indisponível", { status: 502 });
        const tipo = res.headers.get("content-type") ?? "image/jpeg";
        if (!tipo.startsWith("image/")) return new Response("Não é imagem", { status: 502 });
        return new Response(res.body, {
          headers: {
            "Content-Type": tipo,
            "Cache-Control": "public, max-age=86400",
          },
        });
      },
    },
  },
});
