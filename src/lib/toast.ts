export type ToastTipo = "sucesso" | "erro" | "info";

export type ToastItem = {
  id: string;
  mensagem: string;
  tipo: ToastTipo;
};

// Emite uma notificação toast flutuante em qualquer lugar da aplicação
export function notificar(mensagem: string, tipo: ToastTipo = "sucesso") {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("app:toast", { detail: { mensagem, tipo } }));
  }
}
