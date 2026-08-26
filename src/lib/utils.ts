import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function copiarTexto(texto: string): Promise<boolean> {
  if (typeof window === "undefined") return false;
  
  if (navigator?.clipboard && typeof navigator.clipboard.writeText === "function") {
    try {
      await navigator.clipboard.writeText(texto);
      return true;
    } catch (e) {
      console.warn("Modern clipboard writeText failed, falling back...", e);
    }
  }

  try {
    const textarea = document.createElement("textarea");
    textarea.value = texto;
    textarea.style.position = "fixed";
    textarea.style.top = "0";
    textarea.style.left = "0";
    textarea.style.opacity = "0";
    textarea.style.pointerEvents = "none";
    
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    
    const copiado = document.execCommand("copy");
    document.body.removeChild(textarea);
    return copiado;
  } catch (err) {
    console.error("Fallback copy to clipboard failed:", err);
    return false;
  }
}

/**
 * Normaliza uma string removendo acentos, diacríticos e convertendo para minúsculas.
 */
export function normalizarTexto(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

/**
 * Verifica se um texto ou um conjunto de campos de texto bate com a string de busca de forma inteligente.
 * Ignora acentos/diacríticos e aceita palavras em ordens diferentes.
 */
export function matchSearch(busca: string, ...campos: Array<string | null | undefined>): boolean {
  const buscaNorm = normalizarTexto(busca.trim());
  if (!buscaNorm) return true;

  const camposNorm = campos
    .filter(Boolean)
    .map((c) => normalizarTexto(c!))
    .join(" ");

  // Se a busca inteira estiver contida na junção dos campos
  if (camposNorm.includes(buscaNorm)) return true;

  // Caso contrário, divide a busca em palavras (ignorando palavras com 1 caractere)
  const palavrasBusca = buscaNorm.split(/\s+/).filter((w) => w.length > 1);
  if (palavrasBusca.length === 0) return true;

  // Requisito: todas as palavras da busca (ou pelo menos 80% se for uma busca longa) devem estar presentes
  const encontradas = palavrasBusca.filter((w) => camposNorm.includes(w)).length;
  return encontradas / palavrasBusca.length >= 0.8;
}
