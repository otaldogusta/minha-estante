CREATE TABLE IF NOT EXISTS usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  usuario TEXT NOT NULL UNIQUE,
  senha_hash TEXT NOT NULL,
  criado_em TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessoes (
  token TEXT PRIMARY KEY,
  usuario_id INTEGER NOT NULL,
  expira_em TEXT NOT NULL,
  criado_em TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_sessoes_expira ON sessoes(expira_em);

-- Conta inicial (senha: amora2026 — trocável em "Minha conta")
INSERT INTO usuarios (nome, usuario, senha_hash)
SELECT 'Leitora', 'leitora', 'pbkdf2$100000$271bce0f9a7d3925c06d99a55ece8133$ad5abca0ba40ac0a00846c162c38b25a4711eb0dc69050893d61e4a18580a828'
WHERE NOT EXISTS (SELECT 1 FROM usuarios);
