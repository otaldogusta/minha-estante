-- Segunda conta (o remetente das cartas; senha: amora2026, trocável em Minha conta)
INSERT INTO usuarios (nome, usuario, senha_hash)
SELECT 'Carteiro', 'carteiro', 'pbkdf2$100000$d30bddb1da2972d0c89183ff6b7018bb$1df4ced624cde5680d54ca5da987d622d94f2941a16945992641691763fab205'
WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE usuario = 'carteiro');

-- Correio: cartas entre contas, com desbloqueio opcional atrelado a um livro
CREATE TABLE IF NOT EXISTS cartas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  de_usuario_id INTEGER NOT NULL,
  para_usuario_id INTEGER NOT NULL,
  corpo TEXT NOT NULL,
  livro_condicao_id INTEGER,
  lida INTEGER NOT NULL DEFAULT 0,
  lida_em TEXT,
  criado_em TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_cartas_para ON cartas(para_usuario_id, lida);
