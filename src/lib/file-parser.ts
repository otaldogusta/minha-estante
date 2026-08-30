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

function lerTxt(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

async function lerPdf(file: File): Promise<string> {
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

  return textoCompleto;
}

async function lerEpub(file: File): Promise<string> {
  await carregarScript("https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js");
  const JSZip = (window as any).JSZip;

  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);

  // 1. Encontra o arquivo container.xml para saber onde está o conteúdo principal (.opf)
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

  // Fallback se não achou container.xml: busca qualquer arquivo .opf
  if (!opfPath) {
    const opfKey = Object.keys(zip.files).find((n) => n.endsWith(".opf"));
    if (opfKey) {
      opfPath = opfKey;
    }
  }

  let arquivosEmOrdem: string[] = [];

  if (opfPath && zip.files[opfPath]) {
    const opfContent = await zip.files[opfPath].async("text");
    const opfDir = opfPath.substring(0, opfPath.lastIndexOf("/") + 1);

    if (typeof DOMParser !== "undefined") {
      const parser = new DOMParser();
      const doc = parser.parseFromString(opfContent, "text/xml");

      // Mapeia o manifest: id -> href completo
      const manifestItems = doc.querySelectorAll("manifest > item");
      const manifestMap = new Map<string, string>();
      manifestItems.forEach((item) => {
        const id = item.getAttribute("id");
        const href = item.getAttribute("href");
        if (id && href) {
          // Normaliza o caminho do arquivo relativo ao diretório do opf
          let fullPath = opfDir + href;
          if (href.startsWith("/")) {
            fullPath = href.substring(1);
          }
          // Remove hashes ou parâmetros
          fullPath = fullPath.split("#")[0];
          manifestMap.set(id, decodeURIComponent(fullPath));
        }
      });

      // Lê o spine para obter a ordem correta dos IDs
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

  // Fallback se falhar a leitura do OPF/Spine: usa ordenação por nome filtrada
  if (arquivosEmOrdem.length === 0) {
    const nomesArquivos = Object.keys(zip.files).sort();
    arquivosEmOrdem = nomesArquivos.filter(
      (n) => n.endsWith(".html") || n.endsWith(".xhtml") || n.endsWith(".xml")
    );
  }

  let textoCompleto = "";

  // Lê os arquivos na ordem correta
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

  return textoCompleto;
}

export async function extrairTextoDeArquivo(file: File): Promise<string> {
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
