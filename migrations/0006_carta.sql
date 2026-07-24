-- Usuário definitivo dela + controle da carta de boas-vindas
UPDATE usuarios SET usuario = 'judaviluis' WHERE usuario = 'leitora';

ALTER TABLE usuarios ADD COLUMN carta_vista INTEGER NOT NULL DEFAULT 0;
