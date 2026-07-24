CREATE TABLE IF NOT EXISTS livros (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  titulo TEXT NOT NULL,
  autor TEXT NOT NULL,
  pais TEXT,
  genero TEXT,
  editora TEXT,
  ano INTEGER,
  paginas INTEGER,
  formato TEXT DEFAULT 'Kindle',
  status TEXT NOT NULL DEFAULT 'quero_ler',
  ano_leitura INTEGER,
  inicio TEXT,
  fim TEXT,
  nota REAL,
  palavra TEXT,
  resenha TEXT,
  adaptacao INTEGER NOT NULL DEFAULT 0,
  vi_adaptacao INTEGER NOT NULL DEFAULT 0,
  valor REAL,
  capa TEXT,
  sinopse TEXT,
  pagina_atual INTEGER,
  criado_em TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_livros_status ON livros(status);
CREATE INDEX IF NOT EXISTS idx_livros_ano_leitura ON livros(ano_leitura);
