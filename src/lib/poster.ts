// Gera o pôster vertical (1080x1920) da retrospectiva, no navegador.
import { brl, corDaCapa, notaFmt, type Estatisticas, type Livro } from "./livros";

const W = 1080;
const H = 1920;

function carregarImagem(url: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = `/api/capa?u=${encodeURIComponent(url)}`;
  });
}

function arredondado(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export async function gerarPoster(livros: Livro[], est: Estatisticas): Promise<Blob> {
  await document.fonts.ready;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // fundo papel + pontinhos
  ctx.fillStyle = "#FBF7EE";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "rgba(93,74,43,0.05)";
  for (let y = 20; y < H; y += 44) {
    for (let x = 20; x < W; x += 44) {
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // marca (três livrinhos)
  const mx = 80;
  ctx.fillStyle = "#7A3B52";
  ctx.fillRect(mx, 88, 12, 46);
  ctx.fillStyle = "#6B6155";
  ctx.fillRect(mx + 18, 100, 12, 36);
  ctx.fillStyle = "#221D16";
  ctx.fillRect(mx + 36, 88, 12, 46);
  ctx.font = "500 34px Outfit, sans-serif";
  ctx.fillStyle = "#221D16";
  ctx.fillText("Minha Estante", mx + 68, 122);

  // título
  ctx.font = "400 44px Outfit, sans-serif";
  ctx.fillStyle = "#6B6155";
  ctx.fillText("Retrospectiva de leitura", mx, 226);
  ctx.font = "600 190px 'Source Serif 4', Georgia, serif";
  ctx.fillStyle = "#7A3B52";
  ctx.fillText(String(est.ano), mx, 396);

  // números
  const stats: Array<[string, string]> = [
    [String(est.livros), "livros"],
    [est.paginas.toLocaleString("pt-BR"), "páginas"],
    [est.notaMedia ? notaFmt(est.notaMedia) : "-", "nota média"],
    [brl(Math.round(est.gasto)), "investidos"],
  ];
  const colW = (W - mx * 2) / 4;
  stats.forEach(([v, r], i) => {
    const cx = mx + colW * i;
    ctx.font = "500 52px 'IBM Plex Mono', monospace";
    ctx.fillStyle = "#221D16";
    ctx.fillText(v, cx, 508);
    ctx.font = "400 30px Outfit, sans-serif";
    ctx.fillStyle = "#6B6155";
    ctx.fillText(r, cx, 552);
  });

  // capas (melhores notas primeiro, até 12)
  const doAno = livros
    .filter((l) => l.status === "lido" && l.ano_leitura === est.ano)
    .sort((a, b) => (b.nota ?? 0) - (a.nota ?? 0))
    .slice(0, 12);
  const cols = 4;
  const gap = 28;
  const cw = (W - mx * 2 - gap * (cols - 1)) / cols;
  const ch = cw * 1.5;
  const gy = 620;

  const imagens = await Promise.all(doAno.map((l) => (l.capa ? carregarImagem(l.capa) : Promise.resolve(null))));

  doAno.forEach((livro, i) => {
    const x = mx + (i % cols) * (cw + gap);
    const y = gy + Math.floor(i / cols) * (ch + gap);
    ctx.save();
    ctx.shadowColor = "rgba(60,45,20,0.35)";
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 12;
    arredondado(ctx, x, y, cw, ch, 10);
    ctx.clip();
    const img = imagens[i];
    if (img) {
      // object-fit: cover
      const esc = Math.max(cw / img.width, ch / img.height);
      const dw = img.width * esc;
      const dh = img.height * esc;
      ctx.drawImage(img, x + (cw - dw) / 2, y + (ch - dh) / 2, dw, dh);
    } else {
      ctx.fillStyle = corDaCapa(livro.titulo);
      ctx.fillRect(x, y, cw, ch);
      ctx.fillStyle = "rgba(255,255,255,0.95)";
      ctx.font = "600 26px 'Source Serif 4', Georgia, serif";
      const palavras = livro.titulo.split(" ");
      let linha = "";
      let ly = y + 60;
      for (const p of palavras) {
        const teste = linha ? `${linha} ${p}` : p;
        if (ctx.measureText(teste).width > cw - 40 && linha) {
          ctx.fillText(linha, x + 20, ly);
          linha = p;
          ly += 34;
        } else linha = teste;
      }
      ctx.fillText(linha, x + 20, ly);
    }
    ctx.restore();
  });

  const fimGrade = gy + Math.ceil(doAno.length / cols) * (ch + gap);

  // o ano em palavras
  const palavras = doAno.filter((l) => l.palavra).map((l) => l.palavra as string).slice(0, 8);
  if (palavras.length) {
    ctx.font = "italic 500 44px 'Source Serif 4', Georgia, serif";
    ctx.fillStyle = "#7A3B52";
    let linha = "";
    let ly = fimGrade + 80;
    for (const p of palavras) {
      const teste = linha ? `${linha} · ${p}` : p;
      if (ctx.measureText(teste).width > W - mx * 2 && linha) {
        ctx.fillText(linha, mx, ly);
        linha = p;
        ly += 62;
      } else linha = teste;
    }
    ctx.fillText(linha, mx, ly);
  }

  // rodapé
  ctx.font = "400 30px 'IBM Plex Mono', monospace";
  ctx.fillStyle = "#A2968A";
  ctx.fillText("meu diário de leitura", mx, H - 80);

  return new Promise((resolve) => canvas.toBlob((b) => resolve(b!), "image/png"));
}

export async function compartilharPoster(livros: Livro[], est: Estatisticas): Promise<void> {
  const blob = await gerarPoster(livros, est);
  const arquivo = new File([blob], `retrospectiva-${est.ano}.png`, { type: "image/png" });
  if (navigator.canShare?.({ files: [arquivo] })) {
    try {
      await navigator.share({ files: [arquivo], title: `Minha retrospectiva de leitura ${est.ano}` });
      return;
    } catch {
      // usuária cancelou o share; cai para download
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `retrospectiva-${est.ano}.png`;
  a.click();
  URL.revokeObjectURL(url);
}
