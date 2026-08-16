-- Tabela de conquistas e medalhas desbloqueadas pelos leitores
CREATE TABLE IF NOT EXISTS conquistas (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  chave TEXT NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  icone TEXT NOT NULL,
  pontos INTEGER NOT NULL DEFAULT 10,
  desbloqueada_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_usuario_conquista UNIQUE (usuario_id, chave)
);

-- Tabela de progresso de desafios gamificados (ex: Desafio da Semana)
CREATE TABLE IF NOT EXISTS desafios_leitor (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  meta INTEGER NOT NULL DEFAULT 7,
  progresso INTEGER NOT NULL DEFAULT 0,
  concluido BOOLEAN NOT NULL DEFAULT FALSE,
  recompensa_resgatada BOOLEAN NOT NULL DEFAULT FALSE,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expira_em TIMESTAMP
);

-- Adiciona campos para arquivos de leitura e integrações na tabela de livros
ALTER TABLE livros ADD COLUMN IF NOT EXISTS arquivo_url TEXT;
ALTER TABLE livros ADD COLUMN IF NOT EXISTS gutenberg_id INTEGER;
ALTER TABLE livros ADD COLUMN IF NOT EXISTS preview_url TEXT;
