import { toPng } from "html-to-image";

function gerarSlug(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "livro";
}

export async function exportarStoryPng(
  elementoDom: HTMLElement,
  tituloLivro: string
): Promise<{ dataUrl: string; blob: Blob; nomeArquivo: string }> {
  if (typeof document !== "undefined" && document.fonts) {
    try {
      await document.fonts.ready;
    } catch {}
  }

  await new Promise((resolve) => setTimeout(resolve, 200));

  let dataUrl: string;
  try {
    dataUrl = await toPng(elementoDom, {
      width: 1080,
      height: 1920,
      canvasWidth: 1080,
      canvasHeight: 1920,
      pixelRatio: 1,
      cacheBust: true,
      filter: (node: Node) => {
        if (node instanceof HTMLElement && node.classList.contains("story-no-export")) {
          return false;
        }
        return true;
      },
    });
  } catch (err) {
    console.warn("Tentando exportar com fallback (sem cacheBust e ignorando erros de fonte/cors):", err);
    dataUrl = await toPng(elementoDom, {
      width: 1080,
      height: 1920,
      canvasWidth: 1080,
      canvasHeight: 1920,
      pixelRatio: 1,
      skipFonts: true,
      filter: (node: Node) => {
        if (node instanceof HTMLElement && node.classList.contains("story-no-export")) {
          return false;
        }
        return true;
      },
    });
  }

  const res = await fetch(dataUrl);
  const blob = await res.blob();
  const nomeArquivo = `minha-estante-${gerarSlug(tituloLivro)}.png`;

  return { dataUrl, blob, nomeArquivo };
}

export async function compartilharOuBaixarStory(
  blob: Blob,
  tituloLivro: string,
  nomeArquivo?: string
): Promise<{ metodo: "compartilhado" | "baixado" }> {
  const nome = nomeArquivo || `minha-estante-${gerarSlug(tituloLivro)}.png`;
  const file = new File([blob], nome, { type: "image/png" });

  // Tenta compartilhar nativamente via Web Share API se suportado com arquivos
  if (typeof navigator !== "undefined" && navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        title: "Minha Estante — Story",
        text: `Leitura finalizada: ${tituloLivro}`,
        files: [file],
      });
      return { metodo: "compartilhado" };
    } catch (e: any) {
      // Se o usuário apenas cancelou o share sheet, não faz o download compulsório
      if (e.name === "AbortError") {
        return { metodo: "compartilhado" };
      }
      // Se falhar de outra forma, prossegue para o download
    }
  }

  // Fallback para download direto
  baixarBlob(blob, nome);
  return { metodo: "baixado" };
}

export function baixarBlob(blob: Blob, nomeArquivo: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nomeArquivo;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
