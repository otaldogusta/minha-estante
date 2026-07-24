-- Remove os dados da simulação do fluxo de entrega
DELETE FROM cartas
WHERE livro_condicao_id IN (SELECT id FROM livros WHERE titulo = 'Livro do Teste de Entrega');

DELETE FROM livros WHERE titulo = 'Livro do Teste de Entrega' AND autor = 'Simulação';
