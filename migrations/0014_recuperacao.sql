-- Recuperação de senha: email opcional + tokens de redefinição
ALTER TABLE usuarios ADD COLUMN email TEXT;

CREATE TABLE IF NOT EXISTS redefinicoes (
  token TEXT PRIMARY KEY,
  usuario_id INTEGER NOT NULL,
  criado_em TEXT DEFAULT (datetime('now')),
  expira_em TEXT NOT NULL,
  usado INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_redefinicoes_usuario ON redefinicoes(usuario_id, usado);
