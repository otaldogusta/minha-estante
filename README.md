# Minha Estante — versão standalone (local)

Diário de leitura feito de presente: estante com capas, resenhas, cartas entre
leitores, retrospectiva anual e pôster compartilhável.

O site oficial roda na plataforma Higgsfield: https://minha-estante.higgsfield.app

## O que é esta pasta

Cópia do código-fonte adaptada para rodar 100% local, com banco SQLite
próprio. As dependências internas da plataforma foram substituídas por
equivalentes locais (`better-sqlite3` no lugar do D1 da Cloudflare,
`cloudflare-workers-shim.ts` no lugar do runtime).

## Setup rápido

Requer Node.js 20+ (ou Bun) e Python 3 (para criar o banco).

```bash
# 1. Instalar dependências
npm install

# 2. Criar o banco local (schema + 50 livros + 2 usuários + carta)
npm run setup-db

# 3. Rodar o servidor de desenvolvimento
npm run dev
# → http://localhost:5173 (ou a porta que o Vite mostrar)
```

## Fluxo de desenvolvimento

```bash
npm run typecheck   # checagem de tipos
npm run setup-db    # recria o banco do zero (dados das migrações)
npm run dev         # servidor com hot-reload
npm run build       # build de produção (client + server)
```

## Contas

| Usuário | Senha | Nome | Descrição |
|---------|-------|------|-----------|
| `judaviluis` | `amora2026` | Júlia Schwab | 50 livros, carta de boas-vindas fechada |
| `carteiro` | `amora2026` | Carteiro | Conta secundária, sem livros, pode escrever cartas |

## Estrutura

- `src/routes/` — páginas (estante, livro, cartas, retrospectiva, login,
  convites, recuperação de senha)
- `src/lib/api/` — funções de servidor (livros, cartas, autenticação)
- `src/lib/auth.server.ts` — sessões e hash de senha (PBKDF2)
- `src/lib/d1-local.ts` — wrapper D1-compatível sobre `better-sqlite3`
- `src/lib/cloudflare-workers-shim.ts` — mock do runtime Cloudflare
- `src/components/estante/` — componentes visuais (capa, estrelas, celebração)
- `migrations/` — schema do banco + dados importados da planilha original
- `data/minha-estante.db` — banco local (criado pelo `setup-db`)
- `design-brief.md` — conceito de design ("papel, tinta e amora")

## Diferenças do site oficial

- O banco fica em `data/minha-estante.db` (SQLite local) em vez do D1 da
  Cloudflare
- A recuperação de senha por email (Resend) não funciona localmente — o fluxo
  "pelas casas" (pedido visível pra outro usuário) funciona
- O servidor roda em Node.js, não no Workers runtime