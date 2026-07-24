-- Convites de um leitor para novos leitores criarem conta
CREATE TABLE IF NOT EXISTS convites (
  codigo TEXT PRIMARY KEY,
  criado_por INTEGER NOT NULL,
  usado_por INTEGER,
  criado_em TEXT DEFAULT (datetime('now')),
  usado_em TEXT
);
