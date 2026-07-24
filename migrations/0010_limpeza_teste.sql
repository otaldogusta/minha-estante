-- Remove os dados da simulação de convite (conta de teste e rastros)
DELETE FROM cartas
WHERE de_usuario_id IN (SELECT id FROM usuarios WHERE usuario = 'leitora.teste')
   OR para_usuario_id IN (SELECT id FROM usuarios WHERE usuario = 'leitora.teste');

DELETE FROM sessoes
WHERE usuario_id IN (SELECT id FROM usuarios WHERE usuario = 'leitora.teste');

DELETE FROM livros
WHERE usuario_id IN (SELECT id FROM usuarios WHERE usuario = 'leitora.teste');

DELETE FROM convites
WHERE usado_por IN (SELECT id FROM usuarios WHERE usuario = 'leitora.teste');

DELETE FROM usuarios WHERE usuario = 'leitora.teste';
