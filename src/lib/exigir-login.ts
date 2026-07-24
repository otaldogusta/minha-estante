import { redirect } from "@tanstack/react-router";

import { sessaoAtual } from "./api/auth.functions";

// Guarda de rota: usar no beforeLoad das páginas privadas.
export async function exigirLogin() {
  const sessao = await sessaoAtual();
  if (!sessao.autenticado) {
    throw redirect({ to: "/entrar" });
  }
  return sessao;
}
