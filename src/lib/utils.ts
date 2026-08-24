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
