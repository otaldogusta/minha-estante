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

  // Encontra classes centralizadas e de tamanhos nos arquivos CSS do zip
  const classesCentralizadas = new Set<string>();
  const classesTamanho = new Map<string, string>();
  for (const key of Object.keys(zip.files)) {
    if (key.endsWith(".css")) {
      try {
        const cssContent = await zip.files[key].async("text");
        
        // 1. Classes de alinhamento centralizado
        const centerMatches = cssContent.matchAll(/\.([a-zA-Z0-9_-]+)\s*\{[^}]*text-align\s*:\s*center[^}]*\}/gi);
        for (const match of centerMatches) {
          classesCentralizadas.add(match[1]);
        }
        
        // 2. Classes com tamanho de fonte
        const sizeMatches = cssContent.matchAll(/\.([a-zA-Z0-9_-]+)\s*\{[^}]*font-size\s*:\s*([^;}]+)[^}]*\}/gi);
        for (const match of sizeMatches) {
          classesTamanho.set(match[1], match[2].trim());
        }
      } catch (e) {
        console.error("Erro ao analisar CSS:", key, e);
      }
    }
  }

  const blocks: string[][] = [];

  for (const caminho of arquivosEmOrdem) {
    // Evita duplicar a capa se o primeiro arquivo da espinha for a página da capa
    const isFirstFile = caminho === arquivosEmOrdem[0];
    const isCoverFile = 
      caminho.toLowerCase().includes("cover") || 
      caminho.toLowerCase().includes("titlepage") || 
      caminho.toLowerCase().includes("capa") ||
      (coverImageHref && (
        caminho.toLowerCase() === coverImageHref.toLowerCase() ||
        caminho.toLowerCase().endsWith(coverImageHref.toLowerCase())
      ));
      
    if (isFirstFile && isCoverFile && (capaBase64 || coverImageHref)) {
      continue;
    }

    let zipKey = Object.keys(zip.files).find(
      (k) => k.toLowerCase() === caminho.toLowerCase() || k.toLowerCase().endsWith(caminho.toLowerCase())
    );
    if (!zipKey && zip.files[caminho]) {
      zipKey = caminho;
    }
    if (!zipKey) continue;

    const htmlContent = await zip.files[zipKey].async("text");
    const docDir = zipKey.substring(0, zipKey.lastIndexOf("/") + 1);
    
    const fileBlocks: string[] = [];

    if (typeof DOMParser !== "undefined") {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, "text/html");
      doc.querySelectorAll("script, style, link").forEach((el) => el.remove());
      
      const body = doc.body || doc.documentElement;
      
      const processarNo = async (node: Element) => {
        const tagName = node.tagName.toUpperCase();
        
        if (["SCRIPT", "STYLE", "LINK", "META", "TITLE"].includes(tagName)) {
          return;
        }

        if (tagName === "IMG") {
          const src = node.getAttribute("src");
          if (src) {
            const base64 = await extrairImagemEpub(src, docDir, zip);
            if (base64) {
              fileBlocks.push(`<div class="flex justify-center my-6"><img src="${base64}" class="leitor-img" /></div>`);
            }
          }
          return;
        }

        if (tagName === "SVG") {
          const image = node.querySelector("image");
          if (image) {
            const href = image.getAttribute("href") || image.getAttribute("xlink:href");
            if (href) {
              const base64 = await extrairImagemEpub(href, docDir, zip);
              if (base64) {
                fileBlocks.push(`<div class="flex justify-center my-6"><img src="${base64}" class="leitor-img" /></div>`);
              }
            }
          }
          return;
        }
        
        if (["H1", "H2", "H3", "H4", "H5", "H6"].includes(tagName)) {
          const cleanHtml = await limparEExtrairHtmlInterno(node.innerHTML, docDir, zip, classesCentralizadas, classesTamanho);
          if (cleanHtml.trim()) {
            fileBlocks.push(`<h3 class="font-display font-bold text-lg my-6 text-tinta text-center">${cleanHtml}</h3>`);
          }
          return;
        }
        
        if (tagName === "P") {
          const cleanHtml = await limparEExtrairHtmlInterno(node.innerHTML, docDir, zip, classesCentralizadas, classesTamanho);
          if (cleanHtml.trim()) {
            const nodeClass = node.getAttribute("class") || "";
            const classesOriginais = nodeClass.split(/\s+/).filter(Boolean);
            const deveCentralizar = classesOriginais.some(cls => classesCentralizadas.has(cls)) || 
                                   (node.getAttribute("style") || "").includes("text-align: center") ||
                                   (node.getAttribute("style") || "").includes("text-align:center") ||
                                   node.getAttribute("align") === "center";
            
            let customFontSize = "";
            for (const cls of classesOriginais) {
              if (classesTamanho.has(cls)) {
                customFontSize = classesTamanho.get(cls) || "";
                break;
              }
            }

            let styleAttr = "";
            if (customFontSize) {
              const parsedSize = parseFloat(customFontSize);
              const isLarge = !isNaN(parsedSize) && (
                (customFontSize.includes("em") && parsedSize >= 1.25) || 
                (customFontSize.includes("%") && parsedSize >= 120) ||
                (customFontSize.includes("pt") && parsedSize >= 14) ||
                (customFontSize.includes("px") && parsedSize >= 20)
              ) || ["large", "x-large", "xx-large", "larger"].includes(customFontSize.toLowerCase());
              
              styleAttr = ` style="font-size: ${customFontSize}; font-weight: ${isLarge ? "bold" : "normal"}"`;
            }
            
            if (deveCentralizar) {
              fileBlocks.push(`<p class="mb-4 text-center leading-relaxed w-full block"${styleAttr}>${cleanHtml}</p>`);
            } else {
              fileBlocks.push(`<p class="mb-4 text-justify leading-relaxed"${styleAttr}>${cleanHtml}</p>`);
            }
          }
          return;
        }
        
        if (tagName === "UL" || tagName === "OL") {
          const cleanHtml = await limparEExtrairHtmlInterno(node.innerHTML, docDir, zip, classesCentralizadas, classesTamanho);
          const listClass = tagName === "UL" ? "list-disc pl-5 mb-4 space-y-2" : "list-decimal pl-5 mb-4 space-y-2";
          fileBlocks.push(`<${tagName.toLowerCase()} class="${listClass}">${cleanHtml}</${tagName.toLowerCase()}>`);
          return;
        }
        
        if (tagName === "TABLE") {
          const cleanHtml = await limparEExtrairHtmlInterno(node.innerHTML, docDir, zip, classesCentralizadas, classesTamanho);
          fileBlocks.push(`<div class="overflow-x-auto my-4"><table class="min-w-full border border-current/15 text-sm">${cleanHtml}</table></div>`);
          return;
        }
        
        const hasBlockChildren = Array.from(node.children).some(child => 
          ["P", "DIV", "H1", "H2", "H3", "H4", "H5", "H6", "UL", "OL", "TABLE", "IMG", "SVG", "SECTION", "BLOCKQUOTE"].includes(child.tagName.toUpperCase())
        );
        
        if (hasBlockChildren) {
          for (const child of Array.from(node.children)) {
            await processarNo(child);
          }
        } else {
          const cleanHtml = await limparEExtrairHtmlInterno(node.innerHTML, docDir, zip, classesCentralizadas, classesTamanho);
          if (cleanHtml.trim()) {
            const nodeClass = node.getAttribute("class") || "";
            const classesOriginais = nodeClass.split(/\s+/).filter(Boolean);
            const deveCentralizar = classesOriginais.some(cls => classesCentralizadas.has(cls)) || 
                                   (node.getAttribute("style") || "").includes("text-align: center") ||
                                   (node.getAttribute("style") || "").includes("text-align:center") ||
                                   node.getAttribute("align") === "center";

            let customFontSize = "";
            for (const cls of classesOriginais) {
              if (classesTamanho.has(cls)) {
                customFontSize = classesTamanho.get(cls) || "";
                break;
              }
            }

            let styleAttr = "";
            if (customFontSize) {
              const parsedSize = parseFloat(customFontSize);
              const isLarge = !isNaN(parsedSize) && (
                (customFontSize.includes("em") && parsedSize >= 1.25) || 
                (customFontSize.includes("%") && parsedSize >= 120) ||
                (customFontSize.includes("pt") && parsedSize >= 14) ||
                (customFontSize.includes("px") && parsedSize >= 20)
              ) || ["large", "x-large", "xx-large", "larger"].includes(customFontSize.toLowerCase());
              
              styleAttr = ` style="font-size: ${customFontSize}; font-weight: ${isLarge ? "bold" : "normal"}"`;
            }

            if (cleanHtml.startsWith("<a") || cleanHtml.startsWith("<img") || cleanHtml.startsWith("<div")) {
              fileBlocks.push(cleanHtml);
            } else if (deveCentralizar) {
              fileBlocks.push(`<p class="mb-4 text-center leading-relaxed w-full block"${styleAttr}>${cleanHtml}</p>`);
            } else {
              fileBlocks.push(`<p class="mb-4 text-justify leading-relaxed"${styleAttr}>${cleanHtml}</p>`);
            }
          }
        }
      };

      for (const child of Array.from(body.children)) {
        await processarNo(child);
      }
    } else {
      const cleanText = htmlContent.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
      if (cleanText) {
        fileBlocks.push(`<p class="mb-4 text-justify leading-relaxed">${cleanText}</p>`);
      }
    }

    if (fileBlocks.length > 0) {
      blocks.push(fileBlocks);
    }
  }

  return { texto: JSON.stringify(blocks), capa: capaBase64 };
}

function resolverCaminho(href: string, baseDir: string): string {
  const parts = (baseDir + href).split("/");
  const stack: string[] = [];
  for (const part of parts) {
    if (part === "." || part === "") continue;
    if (part === "..") {
      stack.pop();
    } else {
      stack.push(part);
    }
  }
  return stack.join("/");
}

async function extrairImagemEpub(href: string, baseDir: string, zip: any): Promise<string | null> {
  const caminhoResolvido = resolverCaminho(href, baseDir);
  const decodedPath = decodeURIComponent(caminhoResolvido);
  let zipKey = Object.keys(zip.files).find(
    (k) => k.toLowerCase() === decodedPath.toLowerCase() || k.toLowerCase().endsWith(decodedPath.toLowerCase())
  );
  if (!zipKey && zip.files[decodedPath]) {
    zipKey = decodedPath;
  }
  if (zipKey) {
    try {
      const base64Content = await zip.files[zipKey].async("base64");
      const ext = zipKey.split(".").pop()?.toLowerCase();
      const mimeType = ext === "png" ? "image/png" : ext === "gif" ? "image/gif" : ext === "svg" ? "image/svg+xml" : "image/jpeg";
      return `data:${mimeType};base64,${base64Content}`;
    } catch (e) {
      console.error("Erro ao ler imagem do zip:", decodedPath, e);
    }
  }
  return null;
}

async function limparEExtrairHtmlInterno(
  html: string,
  docDir: string,
  zip: any,
  classesCentralizadas: Set<string>,
  classesTamanho: Map<string, string>
): Promise<string> {
  if (typeof DOMParser === "undefined") return html;
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div>${html}</div>`, "text/html");
    const container = doc.body.firstChild as HTMLElement;
    if (!container) return html;
    
    // Converte imagens img e svg internas para base64
    const imagens = container.querySelectorAll("img");
    for (const img of Array.from(imagens)) {
      const src = img.getAttribute("src");
      if (src && !src.startsWith("data:")) {
        const base64 = await extrairImagemEpub(src, docDir, zip);
        if (base64) {
          img.setAttribute("src", base64);
        }
      }
    }

    const svgImages = container.querySelectorAll("image");
    for (const img of Array.from(svgImages)) {
      const href = img.getAttribute("href") || img.getAttribute("xlink:href");
      if (href && !href.startsWith("data:")) {
        const base64 = await extrairImagemEpub(href, docDir, zip);
        if (base64) {
          img.setAttribute("href", base64);
          img.setAttribute("xlink:href", base64);
        }
      }
    }
    
    const todosElementos = container.querySelectorAll("*");
    todosElementos.forEach((el) => {
      const origClass = el.getAttribute("class") || "";
      const origRole = el.getAttribute("role") || "";
      const isButton = origClass.includes("btn") || origClass.includes("button") || origClass.includes("cta") || origRole === "button";
      
      const classesOriginais = origClass.split(/\s+/).filter(Boolean);
      const deveCentralizar = classesOriginais.some(cls => classesCentralizadas.has(cls)) || 
                             el.getAttribute("align") === "center" || 
                             (el.getAttribute("style") || "").includes("text-align: center") ||
                             (el.getAttribute("style") || "").includes("text-align:center");

      // Recupera se o elemento original possuía custom font-size
      let customFontSize = "";
      for (const cls of classesOriginais) {
        if (classesTamanho.has(cls)) {
          customFontSize = classesTamanho.get(cls) || "";
          break;
        }
      }

      el.removeAttribute("style");
      el.removeAttribute("class");
      el.removeAttribute("id");
      
      if (customFontSize) {
        el.style.fontSize = customFontSize;
        const parsedSize = parseFloat(customFontSize);
        const isLarge = !isNaN(parsedSize) && (
          (customFontSize.includes("em") && parsedSize >= 1.25) || 
          (customFontSize.includes("%") && parsedSize >= 120) ||
          (customFontSize.includes("pt") && parsedSize >= 14) ||
          (customFontSize.includes("px") && parsedSize >= 20)
        ) || ["large", "x-large", "xx-large", "larger"].includes(customFontSize.toLowerCase());
        
        if (isLarge) {
          el.style.fontWeight = "bold";
        }
      }
      
      if (el.tagName.toUpperCase() === "A") {
        el.setAttribute("target", "_blank");
        el.setAttribute("rel", "noopener noreferrer");
        if (isButton) {
          el.setAttribute("class", "inline-flex items-center justify-center rounded-xl bg-[#7a3b52] hover:bg-[#5e2c3f] text-white font-semibold text-xs px-5 py-3 shadow-md transition-colors my-4 cursor-pointer no-underline");
        } else {
          el.setAttribute("class", "text-amora hover:underline font-semibold");
        }
      }
      
      if (el.tagName.toUpperCase() === "P" || el.tagName.toUpperCase() === "DIV") {
        if (deveCentralizar) {
          el.setAttribute("class", "text-center w-full block");
        }
      }
      
      if (el.tagName.toUpperCase() === "IMG") {
        el.setAttribute("class", "leitor-img");
      }
    });
    
    return container.innerHTML;
  } catch (e) {
    return html;
  }
}

export function obterTamanhoTextoReal(texto: string): number {
  if (texto.startsWith("[") && texto.endsWith("]")) {
    try {
      const parsed = JSON.parse(texto);
      if (Array.isArray(parsed)) {
        const isNested = Array.isArray(parsed[0]);
        const blocks = isNested ? parsed.flat() : parsed;
        
        let total = 0;
        for (const block of blocks) {
          if (typeof block !== "string") continue;
          if (block.includes("<img")) {
            total += 500;
          } else {
            const textOnly = block.replace(/<[^>]*>/g, "");
            total += textOnly.length;
          }
        }
        return total;
      }
    } catch {
      // Fallback
    }
  }
  return texto.length;
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
