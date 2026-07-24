-- Cada leitor tem a própria estante; livros podem ser privados
ALTER TABLE livros ADD COLUMN usuario_id INTEGER;
ALTER TABLE livros ADD COLUMN privado INTEGER NOT NULL DEFAULT 0;

-- A biblioteca importada da planilha pertence a ela
UPDATE livros
SET usuario_id = (SELECT id FROM usuarios WHERE usuario = 'judaviluis')
WHERE usuario_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_livros_usuario ON livros(usuario_id, status);

-- A carta de boas-vindas é exclusiva do login dela
UPDATE usuarios SET carta_vista = 1 WHERE usuario = 'carteiro';
