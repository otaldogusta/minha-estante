// Shim para o módulo cloudflare:workers quando rodando localmente.
// O vite.config.ts redireciona o import "cloudflare:workers" para este arquivo
// via alias. Fornece um objeto env com DB apontando para o SQLite local.
import { getLocalDB } from "./d1-local";

const db = getLocalDB();

export const env = {
  DB: db,
  STORAGE: undefined,
  KV: undefined,
  CONTAINER: undefined,
  HF_ENV: "development",
  APP_SLUG: "minha-estante-local",
  RESEND_API_KEY: undefined,
};