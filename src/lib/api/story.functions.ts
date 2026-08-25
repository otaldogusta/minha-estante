import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

function ehUrlSegura(urlString: string): boolean {
  try {
    const parsed = new URL(urlString);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export const obterCapaDataUrl = createServerFn({ method: "POST" })
  .validator(z.object({ url: z.string().min(1) }))
  .handler(async ({ data }) => {
    const { url } = data;

    // Se já for data URL ou blob local, retorna direto
    if (url.startsWith("data:") || url.startsWith("blob:")) {
      return { dataUrl: url };
    }

    if (!ehUrlSegura(url)) {
      return { dataUrl: null };
    }

    try {
      const resp = await fetch(url, {
        headers: {
          "User-Agent": "MinhaEstanteBot/1.0",
          Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        },
        signal: AbortSignal.timeout(4000),
      });

      if (!resp.ok) return { dataUrl: null };

      const contentType = resp.headers.get("content-type") || "image/jpeg";
      const buffer = await resp.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      const dataUrl = `data:${contentType};base64,${base64}`;

      return { dataUrl };
    } catch {
      return { dataUrl: null };
    }
  });
