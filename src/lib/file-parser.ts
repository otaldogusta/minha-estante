function carregarScript(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof document === "undefined") {
      reject(new Error("Documento não disponível"));
      return;
    }
    const scripts = Array.from(document.querySelectorAll("script"));
    if (scripts.some((s) => s.src === url)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = url;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Erro ao carregar script ${url}`));
    document.body.appendChild(script);
  });
}

function lerTxt(file: File): Promise<{ texto: string; capa: string | null }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ texto: reader.result as string, capa: null });
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

async function lerPdf(file: File): Promise<{ texto: string; capa: string | null }> {
  await carregarScript("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js");
  const pdfjsLib = (window as any)["pdfjs-dist/build/pdf"];
  pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let textoCompleto = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const textoPagina = content.items.map((item: any) => item.str).join(" ");
    textoCompleto += textoPagina + "\n\n";
  }

  // Extrai a primeira página como imagem de capa usando um canvas oculto
  let capaBase64: string | null = null;
  try {
    const firstPage = await pdf.getPage(1);
    const viewport = firstPage.getViewport({ scale: 0.6 });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const context = canvas.getContext("2d");
    if (context) {
      await firstPage.render({ canvasContext: context, viewport }).promise;
      capaBase64 = canvas.toDataURL("image/jpeg", 0.75);
    }
  } catch (e) {
    console.error("Erro ao extrair capa do PDF:", e);
  }

  return { texto: textoCompleto, capa: capaBase64 };
}

async function lerEpub(file: File): Promise<{ texto: string; capa: string | null }> {
  await carregarScript("https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js");
  const JSZip = (window as any).JSZip;

  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);

  let opfPath = "";
  const containerFile = zip.files["META-INF/container.xml"];
  if (containerFile) {
    const containerXml = await containerFile.async("text");
    if (typeof DOMParser !== "undefined") {
      const parser = new DOMParser();
      const doc = parser.parseFromString(containerXml, "text/xml");
      const rootfile = doc.querySelector("rootfile");
      if (rootfile) {
        opfPath = rootfile.getAttribute("full-path") || "";
      }
    }
  }

  if (!opfPath) {
    const opfKey = Object.keys(zip.files).find((n) => n.endsWith(".opf"));
    if (opfKey) {
      opfPath = opfKey;
    }
  }

  let arquivosEmOrdem: string[] = [];
  let coverImageHref: string | null = null;
  let opfDir = "";

  if (opfPath && zip.files[opfPath]) {
    const opfContent = await zip.files[opfPath].async("text");
    opfDir = opfPath.substring(0, opfPath.lastIndexOf("/") + 1);

    if (typeof DOMParser !== "undefined") {
      const parser = new DOMParser();
      const doc = parser.parseFromString(opfContent, "text/xml");

      const manifestItems = doc.querySelectorAll("manifest > item");
      const manifestMap = new Map<string, string>();
      let coverItemId: string | null = null;

      const coverMeta = doc.querySelector("meta[name='cover']");
      if (coverMeta) {
        coverItemId = coverMeta.getAttribute("content");
      }

      manifestItems.forEach((item) => {
        const id = item.getAttribute("id");
        const href = item.getAttribute("href");
        const properties = item.getAttribute("properties");
        if (id && href) {
          let fullPath = opfDir + href;
          if (href.startsWith("/")) {
            fullPath = href.substring(1);
          }
          fullPath = fullPath.split("#")[0];
          const resolvedPath = decodeURIComponent(fullPath);
          manifestMap.set(id, resolvedPath);

          if (properties === "cover-image" || id === "cover-image" || id === "cover") {
            coverImageHref = resolvedPath;
          }
        }
      });

      if (coverItemId && manifestMap.has(coverItemId)) {
        coverImageHref = manifestMap.get(coverItemId) || null;
      }

      const spineItems = doc.querySelectorAll("spine > itemref");
      spineItems.forEach((itemref) => {
        const idref = itemref.getAttribute("idref");
        if (idref) {
          const filePath = manifestMap.get(idref);
          if (filePath) {
            arquivosEmOrdem.push(filePath);
          }
        }
      });
    }
  }

  if (arquivosEmOrdem.length === 0) {
    const nomesArquivos = Object.keys(zip.files).sort();
    arquivosEmOrdem = nomesArquivos.filter(
      (n) => n.endsWith(".html") || n.endsWith(".xhtml") || n.endsWith(".xml")
    );
  }

  // Tenta extrair a imagem da capa em base64 se a referência foi encontrada
  let capaBase64: string | null = null;
  if (coverImageHref) {
    let zipKey = Object.keys(zip.files).find(
      (k) => k.toLowerCase() === coverImageHref!.toLowerCase() || k.toLowerCase().endsWith(coverImageHref!.toLowerCase())
    );
    if (!zipKey && zip.files[coverImageHref]) {
      zipKey = coverImageHref;
    }
    if (zipKey) {
      try {
        const base64Content = await zip.files[zipKey].async("base64");
        const ext = zipKey.split(".").pop()?.toLowerCase();
        const mimeType = ext === "png" ? "image/png" : ext === "gif" ? "image/gif" : "image/jpeg";
        capaBase64 = `data:${mimeType};base64,${base64Content}`;
      } catch (e) {
        console.error("Erro ao ler arquivo de capa no EPUB:", e);
      }
    }
  }

  let textoCompleto = "";

  for (const caminho of arquivosEmOrdem) {
    let zipKey = Object.keys(zip.files).find(
      (k) => k.toLowerCase() === caminho.toLowerCase() || k.toLowerCase().endsWith(caminho.toLowerCase())
    );
    if (!zipKey && zip.files[caminho]) {
      zipKey = caminho;
    }
    if (!zipKey) continue;

    const htmlContent = await zip.files[zipKey].async("text");
    
    if (typeof DOMParser !== "undefined") {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, "text/html");
      doc.querySelectorAll("script, style").forEach((el) => el.remove());
      const textoLimpo = doc.body.textContent || doc.documentElement.textContent || "";
      if (textoLimpo.trim()) {
        textoCompleto += textoLimpo.trim() + "\n\n";
      }
    } else {
      const textoLimpo = htmlContent.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
      if (textoLimpo) {
        textoCompleto += textoLimpo + "\n\n";
      }
    }
  }

  return { texto: textoCompleto, capa: capaBase64 };
}

export async function extrairDadosDeArquivo(file: File): Promise<{ texto: string; capa: string | null }> {
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext === "txt") {
    return lerTxt(file);
  } else if (ext === "pdf") {
    return lerPdf(file);
  } else if (ext === "epub") {
    return lerEpub(file);
  } else {
    throw new Error("Formato não suportado para extração de texto.");
  }
}
