import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportHiggsfieldError } from "../lib/higgsfield-error-reporting";
// Page metadata (browser <title>/favicon + social og: tags) committed into the
// repo by the marketplace meta API and read at BUILD time — no runtime fetch.
// Editing it via the app settings UI rewrites this file and redeploys the app.
import appMetaJson from "../app-meta.json";

// Built-in defaults for any field that isn't set in app-meta.json.
const DEFAULT_TITLE = "Minha Estante";
const DEFAULT_DESCRIPTION = "Um diário de leitura: sua estante, suas notas e sua retrospectiva.";

type AppMeta = {
  og_title?: string | null;
  og_description?: string | null;
  og_image_url?: string | null;
  favicon_url?: string | null;
  og_video_url?: string | null;
};

const appMeta = appMetaJson as AppMeta;

// Build the document head (title / description / og: / twitter: / favicon) from
// app-meta.json, falling back to the defaults above for any unset field.
// og_title/og_description double as the browser <title> and meta description;
// og_image_url (when set) also drives the twitter card + image. Built from
// inline tag literals (conditional spreads for the optional image/favicon) so
// it matches the head() shape TanStack expects.
// favicon/og images live in THIS app's own /assets, so the host is never
// inherent. app-meta.json may carry an absolute higgsfield-app URL with a STALE
// host — baked from the app this one was copied/remixed/renamed from — which would
// serve the wrong app's favicon/og. Strip any higgsfield-app host (prod
// higgsfield.app + dev higgsfield-dev.app) down to a root-relative path so it
// always resolves against whoever serves THIS page (preview / prod / custom
// domain). Genuinely external URLs (a CDN image the owner set) are left absolute.
const APP_HOST_ZONES = ["higgsfield.app", "higgsfield-dev.app"];

function toOwnAssetUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  if (value.startsWith("/")) return value; // already root-relative
  try {
    const u = new URL(value);
    const isAppHost = APP_HOST_ZONES.some(
      (zone) => u.hostname === zone || u.hostname.endsWith(`.${zone}`),
    );
    if (isAppHost) return u.pathname + u.search;
    return value; // external host (CDN, etc.) — keep absolute
  } catch {
    return value; // not a parseable URL — leave as-is
  }
}

function buildHead(meta: AppMeta) {
  const title = meta.og_title ?? DEFAULT_TITLE;
  const description = meta.og_description ?? DEFAULT_DESCRIPTION;
  const ogImage = toOwnAssetUrl(meta.og_image_url);
  const favicon = toOwnAssetUrl(meta.favicon_url);
  const ogVideo = toOwnAssetUrl(meta.og_video_url);

  return {
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title },
      { name: "description", content: description },
      { name: "author", content: "Higgsfield" },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: ogImage ? "summary_large_image" : "summary" },
      { name: "twitter:site", content: "@Higgsfield" },
      ...(ogImage
        ? [
            { property: "og:image", content: ogImage },
            { name: "twitter:image", content: ogImage },
          ]
        : []),
      // Cover video (og:video) — the animated counterpart of og:image; the
      // Higgsfield feed cards also play it on hover.
      ...(ogVideo ? [{ property: "og:video", content: ogVideo }] : []),
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" as const },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,opsz,wght@0,8..60,400..700;1,8..60,400..600&family=Outfit:wght@300..700&family=IBM+Plex+Mono:wght@400;500&display=swap",
      },
      ...(favicon ? [{ rel: "icon", href: favicon }] : []),
    ],
  };
}

function NotFoundComponent() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-papel px-4">
      <div className="max-w-md text-center">
        <p className="font-display text-6xl text-amora">404</p>
        <h1 className="mt-3 font-display text-2xl text-tinta">Página não encontrada</h1>
        <p className="mt-2 text-tinta-2">Essa página não existe ou foi movida.</p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-full bg-amora px-6 py-2.5 text-papel transition-colors hover:bg-amora-escura active:scale-[0.98]"
        >
          Voltar para a estante
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportHiggsfieldError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-papel px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-2xl text-tinta">Algo deu errado</h1>
        <p className="mt-2 text-tinta-2">A página não carregou. Tente novamente ou volte para a estante.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="rounded-full bg-amora px-6 py-2.5 text-papel transition-colors hover:bg-amora-escura active:scale-[0.98]"
          >
            Tentar de novo
          </button>
          <a
            href="/"
            className="rounded-full border border-tinta-3 px-6 py-2.5 text-tinta transition-colors hover:bg-papel-2 active:scale-[0.98]"
          >
            Voltar para a estante
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  // Read the committed page metadata at build time (no runtime fetch).
  head: () => buildHead(appMeta),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('minha-estante-theme') || 'light';
                document.documentElement.setAttribute('data-theme', theme);
              })();
            `
          }}
        />
      </head>
      <body className="bg-papel text-tinta">
        <div className="dynamic-ambient-bg" />
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function TopProgressBar() {
  const isPending = useRouterState({ select: (s) => s.status === "pending" });
  const [mostrar, setMostrar] = useState(false);

  useEffect(() => {
    if (!isPending) {
      setMostrar(false);
      return;
    }
    // Só exibe a barra se o carregamento demorar mais de 180ms
    const timer = setTimeout(() => {
      setMostrar(true);
    }, 180);

    return () => clearTimeout(timer);
  }, [isPending]);

  if (!mostrar) return null;
  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-amora animate-pulse shadow-[0_0_10px_#7A3B52] transition-opacity duration-200" />
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <TopProgressBar />
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <div className="page-layout-transition">
        <Outlet />
      </div>
    </QueryClientProvider>
  );
}
