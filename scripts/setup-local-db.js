// Setup script: cria o banco SQLite local com schema + dados atuais.
// Uso: node scripts/setup-local-db.js

import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const MIGRATIONS_DIR = path.resolve(ROOT, "migrations");
const DATA_DIR = path.resolve(ROOT, "data");
const DB_PATH = path.resolve(DATA_DIR, "minha-estante.db");

// Migrações em ordem de aplicação
const MIGRATION_ORDER = [
  "0001_init.sql",
  "0001_livros.sql",
  "0002_seed.sql",
  "0003_resenhas.sql",
  "0004_capas.sql",
  "0005_auth.sql",
  "0006_carta.sql",
  "0007_cartas.sql",
  "0008_estantes_por_usuario.sql",
  "0009_convites.sql",
  "0010_limpeza_teste.sql",
  "0011_limpa_convites_teste.sql",
  "0012_limpeza_simulacao_entrega.sql",
  "0013_limpa_convites_acumulados.sql",
  "0014_recuperacao.sql",
  "0015_limpa_recuperacao_teste.sql",
];

// Dados adicionais que foram criados no site e não estão nas migrações
const DADOS_ADICIONAIS = `
-- Carta que o carteiro escreveu para a judaviluis (já enviada, não lida)
INSERT OR IGNORE INTO cartas (id, de_usuario_id, para_usuario_id, corpo, lida, criado_em)
SELECT 3, 2, 1, 'Oi gatinha, vim aqui pra dizer que vc é a mulher da minha vida! amo cada momento ao seu lado, cada sensação, cada cheiro, cada abraço, cada você.
Você é quem me da sentido as coisas e me mostrou o que é amar de verdade.

Um passarinho verde me contou que vc tava construindo uma planilha de livros, e então resolvi simplificar ela - não significa que esta horrível lixo e podre - pois precisava de um toque especial para que vc economizasse o seu tempo precioso e me dar mais atenção.

Agora ela ta com uma cara nova, e detalhe, aqui ja está todos os seus livros, resenhas e tudo mais que estava na planilha, então não precisa se preocupar tabao.

Espero que goste, feliz namoreidos de 4, te amo 🧡.', 0, '2026-07-23 13:17:20'
WHERE NOT EXISTS (SELECT 1 FROM cartas WHERE id = 3);

-- Convites gerados pelo carteiro (ainda não usados)
INSERT OR IGNORE INTO convites (codigo, criado_por, usado_por, criado_em)
VALUES ('76be46c2a4d29cd5db639c08', 2, NULL, '2026-07-22 23:16:20'),
       ('f604be7528a6b0b923d6b1ac', 2, NULL, '2026-07-22 23:16:22');
`;

function main() {
  console.log("Criando banco local em:", DB_PATH);

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // Remove DB anterior para recriar do zero
  if (fs.existsSync(DB_PATH)) {
    fs.unlinkSync(DB_PATH);
    console.log("  (banco anterior removido)");
  }

  const db = new DatabaseSync(DB_PATH);
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec("PRAGMA foreign_keys = ON;");

  // Aplica cada migração em ordem
  for (const file of MIGRATION_ORDER) {
    const filePath = path.resolve(MIGRATIONS_DIR, file);
    if (!fs.existsSync(filePath)) {
      console.warn("  [AVISO] migração não encontrada:", file);
      continue;
    }
    const sql = fs.readFileSync(filePath, "utf-8");
    try {
      db.exec(sql);
      console.log("  OK", file);
    } catch (e) {
      console.error("  [ERRO]", file, ":", e.message);
      db.close();
      process.exit(1);
    }
  }

  // Dados adicionais (carta do carteiro, convites)
  console.log("  --- dados adicionais ---");
  db.exec(DADOS_ADICIONAIS);
  console.log("  OK carta + convites");

  // Verificação
  const stats = db
    .prepare(
      "SELECT (SELECT COUNT(*) FROM usuarios) AS usuarios, (SELECT COUNT(*) FROM livros) AS livros, (SELECT COUNT(*) FROM cartas) AS cartas, (SELECT COUNT(*) FROM convites) AS convites"
    )
    .get();
  console.log("\nBanco criado com sucesso!");
  console.log(`  Usuários: ${stats.usuarios}`);
  console.log(`  Livros:    ${stats.livros}`);
  console.log(`  Cartas:    ${stats.cartas}`);
  console.log(`  Convites:  ${stats.convites}`);

  db.close();
}

main();
