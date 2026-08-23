import { toPng } from "html-to-image";

function gerarSlug(texto: string): string {
  return (
    texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "livro"
  );
}

async function urlParaDataUrl(url: string): Promise<string> {
  if (url.startsWith("data:")) return url;
  try {
    const res = await fetch(url, { mode: "cors" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    // Fallback com HTMLImageElement e Canvas
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth || img.width || 400;
          canvas.height = img.naturalHeight || img.height || 600;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL("image/png"));
            return;
          }
        } catch {}
        resolve(url);
      };
      img.onerror = () => resolve(url);
      img.src = url;
    });
  }
}

async function prepararImagensParaExportacao(container: HTMLElement): Promise<void> {
  const imagens = Array.from(container.querySelectorAll("img"));
  await Promise.all(
    imagens.map(async (img) => {
      if (img.src && !img.src.startsWith("data:")) {
        try {
          const dataUrl = await urlParaDataUrl(img.src);
          if (dataUrl && dataUrl.startsWith("data:")) {
            img.src = dataUrl;
          }
        } catch (e) {
          console.warn("Não foi possível converter imagem para Data URL:", img.src, e);
        }
      }
    })
  );
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

  // Converte todas as imagens no nó para Base64 Data URL antes de renderizar
  await prepararImagensParaExportacao(elementoDom);
  await new Promise((resolve) => setTimeout(resolve, 250));

  let dataUrl: string;
  try {
    dataUrl = await toPng(elementoDom, {
      width: 1080,
      height: 1920,
      canvasWidth: 1080,
      canvasHeight: 1920,
      pixelRatio: 1,
      cacheBust: false,
      filter: (node: Node) => {
        if (node instanceof HTMLElement && node.classList.contains("story-no-export")) {
          return false;
        }
        return true;
      },
    });
  } catch (err) {
    console.warn("Tentando exportar com fallback (skipFonts):", err);
    dataUrl = await toPng(elementoDom, {
      width: 1080,
      height: 1920,
      canvasWidth: 1080,
      canvasHeight: 1920,
      pixelRatio: 1,
      cacheBust: false,
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
      if (e.name === "AbortError") {
        return { metodo: "compartilhado" };
      }
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
  a.target = "_blank";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 3000);
}
