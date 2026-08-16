-- Garante que não existam dois usuários com o mesmo nome de exibição
-- (case-insensitive via collation NOCASE).
-- A verificação no código já foi adicionada em auth.functions.ts,
-- mas este índice é a proteção definitiva a nível de banco de dados.

CREATE UNIQUE INDEX IF NOT EXISTS idx_usuarios_nome_unico
  ON usuarios (nome COLLATE NOCASE);
