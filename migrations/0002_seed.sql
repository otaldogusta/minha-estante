-- Biblioteca importada da planilha original (50 livros)
INSERT INTO livros (titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, adaptacao, vi_adaptacao, valor, capa, sinopse)
SELECT 'É Assim que Acaba', 'Colleen Hoover', 'US', 'Romance', 'Galera Record', 2016, 368, 'Físico', 'lido', 2024, NULL, NULL, 4, 'Transformador', 1, 0, 54.26, 'https://covers.openlibrary.org/b/id/10473609-L.jpg', NULL
WHERE (SELECT COUNT(*) FROM livros) < 50 AND NOT EXISTS (SELECT 1 FROM livros WHERE titulo = 'É Assim que Acaba');

INSERT INTO livros (titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, adaptacao, vi_adaptacao, valor, capa, sinopse)
SELECT 'É Assim que Começa', 'Colleen Hoover', 'US', 'Romance', 'Galera Record', 2022, 336, 'Físico', 'lido', 2024, NULL, NULL, 4, 'Recomeço', 0, 0, 52.44, 'https://covers.openlibrary.org/b/id/12749873-L.jpg', NULL
WHERE (SELECT COUNT(*) FROM livros) < 50 AND NOT EXISTS (SELECT 1 FROM livros WHERE titulo = 'É Assim que Começa');

INSERT INTO livros (titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, adaptacao, vi_adaptacao, valor, capa, sinopse)
SELECT 'Verity', 'Colleen Hoover', 'US', 'Suspense', 'Galera Record', 2020, 320, 'Físico', 'lido', 2024, NULL, NULL, 5, 'Visceral', 0, 0, 56.42, 'https://covers.openlibrary.org/b/id/8747160-L.jpg', NULL
WHERE (SELECT COUNT(*) FROM livros) < 50 AND NOT EXISTS (SELECT 1 FROM livros WHERE titulo = 'Verity');

INSERT INTO livros (titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, adaptacao, vi_adaptacao, valor, capa, sinopse)
SELECT 'Jantar Secreto', 'Raphael Montes', 'BR', 'Suspense', 'Companhia das Letras', 2016, 368, 'Kindle', 'lido', 2025, NULL, NULL, 4.5, 'Degradação', 0, 0, 66.12, 'https://covers.openlibrary.org/b/id/12372592-L.jpg', NULL
WHERE (SELECT COUNT(*) FROM livros) < 50 AND NOT EXISTS (SELECT 1 FROM livros WHERE titulo = 'Jantar Secreto');

INSERT INTO livros (titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, adaptacao, vi_adaptacao, valor, capa, sinopse)
SELECT 'Quarta Asa', 'Rebecca Yarros', 'US', 'Fantasia', 'Planeta', 2023, 544, 'Kindle', 'lido', 2025, NULL, NULL, 5, 'Imersão', 0, 0, 110.97, 'https://covers.openlibrary.org/b/id/14407898-L.jpg', NULL
WHERE (SELECT COUNT(*) FROM livros) < 50 AND NOT EXISTS (SELECT 1 FROM livros WHERE titulo = 'Quarta Asa');

INSERT INTO livros (titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, adaptacao, vi_adaptacao, valor, capa, sinopse)
SELECT 'Chama de Ferro', 'Rebecca Yarros', 'US', 'Fantasia', 'Planeta', 2024, 816, 'Kindle', 'lido', 2025, NULL, NULL, 5, NULL, 0, 0, 108, 'https://covers.openlibrary.org/b/id/14405746-L.jpg', NULL
WHERE (SELECT COUNT(*) FROM livros) < 50 AND NOT EXISTS (SELECT 1 FROM livros WHERE titulo = 'Chama de Ferro');

INSERT INTO livros (titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, adaptacao, vi_adaptacao, valor, capa, sinopse)
SELECT 'O Lado Feio do Amor', 'Colleen Hoover', 'US', 'Romance', 'Galera Record', 2015, 336, 'Kindle', 'lido', 2025, '2025-01-12', '2025-01-17', 3.5, NULL, 0, 0, 33.87, 'https://covers.openlibrary.org/b/id/12856728-L.jpg', NULL
WHERE (SELECT COUNT(*) FROM livros) < 50 AND NOT EXISTS (SELECT 1 FROM livros WHERE titulo = 'O Lado Feio do Amor');

INSERT INTO livros (titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, adaptacao, vi_adaptacao, valor, capa, sinopse)
SELECT 'Tempestade de Ônix', 'Rebecca Yarros', 'US', 'Fantasia', 'Planeta', 2025, 752, 'Kindle', 'lido', 2025, NULL, NULL, 5, NULL, 0, 0, 116.62, 'https://covers.openlibrary.org/b/id/14826089-L.jpg', NULL
WHERE (SELECT COUNT(*) FROM livros) < 50 AND NOT EXISTS (SELECT 1 FROM livros WHERE titulo = 'Tempestade de Ônix');

INSERT INTO livros (titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, adaptacao, vi_adaptacao, valor, capa, sinopse)
SELECT 'Daisy Jones & The Six', 'Taylor Jenkins Reid', 'US', 'Romance', 'Paralela', 2019, 360, 'Kindle', 'lido', 2025, '2025-01-23', '2025-02-07', 2, NULL, 1, 0, 41.81, 'https://covers.openlibrary.org/b/id/8742674-L.jpg', NULL
WHERE (SELECT COUNT(*) FROM livros) < 50 AND NOT EXISTS (SELECT 1 FROM livros WHERE titulo = 'Daisy Jones & The Six');

INSERT INTO livros (titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, adaptacao, vi_adaptacao, valor, capa, sinopse)
SELECT 'A Paciente Silenciosa', 'Alex Michaelides', 'GB', 'Suspense', 'Record', 2019, 350, 'Kindle', 'lido', 2025, '2025-02-07', '2025-02-13', 3, NULL, 0, 0, 37.78, 'https://covers.openlibrary.org/b/id/9407338-L.jpg', NULL
WHERE (SELECT COUNT(*) FROM livros) < 50 AND NOT EXISTS (SELECT 1 FROM livros WHERE titulo = 'A Paciente Silenciosa');

INSERT INTO livros (titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, adaptacao, vi_adaptacao, valor, capa, sinopse)
SELECT 'Trono de Vidro', 'Sarah J. Maas', 'US', 'Fantasia', 'Galera Record', 2013, 392, 'Kindle', 'lido', 2025, '2025-02-14', '2025-02-26', 4.5, NULL, 0, 0, 69.66, 'https://covers.openlibrary.org/b/id/15157430-L.jpg', NULL
WHERE (SELECT COUNT(*) FROM livros) < 50 AND NOT EXISTS (SELECT 1 FROM livros WHERE titulo = 'Trono de Vidro');

INSERT INTO livros (titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, adaptacao, vi_adaptacao, valor, capa, sinopse)
SELECT 'Nunca Minta', 'Freida McFadden', 'US', 'Suspense', 'Arqueiro', 2023, 288, 'Kindle', 'lido', 2025, '2025-02-26', '2025-02-27', 5, NULL, 0, 0, 33.85, 'https://covers.openlibrary.org/b/id/13198561-L.jpg', NULL
WHERE (SELECT COUNT(*) FROM livros) < 50 AND NOT EXISTS (SELECT 1 FROM livros WHERE titulo = 'Nunca Minta');

INSERT INTO livros (titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, adaptacao, vi_adaptacao, valor, capa, sinopse)
SELECT 'Coroa da Meia-Noite', 'Sarah J. Maas', 'US', 'Fantasia', 'Galera Record', 2014, 406, 'Kindle', 'lido', 2025, '2025-02-28', '2025-03-14', 4, NULL, 0, 0, 77.6, 'https://covers.openlibrary.org/b/id/15157430-L.jpg', NULL
WHERE (SELECT COUNT(*) FROM livros) < 50 AND NOT EXISTS (SELECT 1 FROM livros WHERE titulo = 'Coroa da Meia-Noite');

INSERT INTO livros (titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, adaptacao, vi_adaptacao, valor, capa, sinopse)
SELECT 'Suicidas', 'Raphael Montes', 'BR', 'Suspense', 'Companhia das Letras', 2012, 448, 'Kindle', 'lido', 2025, '2025-03-14', '2025-03-27', 4, NULL, 0, 0, 37.47, 'https://covers.openlibrary.org/b/id/14086931-L.jpg', NULL
WHERE (SELECT COUNT(*) FROM livros) < 50 AND NOT EXISTS (SELECT 1 FROM livros WHERE titulo = 'Suicidas');

INSERT INTO livros (titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, adaptacao, vi_adaptacao, valor, capa, sinopse)
SELECT 'Tudo é Rio', 'Carla Madeira', 'BR', 'Romance', 'Record', 2014, 210, 'Kindle', 'lido', 2025, '2025-03-28', '2025-04-02', 4, NULL, 0, 0, 38.99, 'https://covers.openlibrary.org/b/id/14631316-L.jpg', NULL
WHERE (SELECT COUNT(*) FROM livros) < 50 AND NOT EXISTS (SELECT 1 FROM livros WHERE titulo = 'Tudo é Rio');

INSERT INTO livros (titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, adaptacao, vi_adaptacao, valor, capa, sinopse)
SELECT 'A Empregada', 'Freida McFadden', 'US', 'Suspense', 'Arqueiro', 2023, 304, 'Kindle', 'lido', 2025, '2025-04-03', '2025-04-07', 5, NULL, 1, 0, 38.32, 'https://covers.openlibrary.org/b/id/15222478-L.jpg', NULL
WHERE (SELECT COUNT(*) FROM livros) < 50 AND NOT EXISTS (SELECT 1 FROM livros WHERE titulo = 'A Empregada');

INSERT INTO livros (titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, adaptacao, vi_adaptacao, valor, capa, sinopse)
SELECT 'Desenhos Ocultos', 'Jason Rekulak', 'US', 'Suspense', 'Intrínseca', 2022, 384, 'Kindle', 'lido', 2025, '2025-06-20', '2025-06-23', 5, NULL, 0, 0, 37.6, 'https://covers.openlibrary.org/b/id/12775985-L.jpg', NULL
WHERE (SELECT COUNT(*) FROM livros) < 50 AND NOT EXISTS (SELECT 1 FROM livros WHERE titulo = 'Desenhos Ocultos');

INSERT INTO livros (titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, adaptacao, vi_adaptacao, valor, capa, sinopse)
SELECT 'Uma Vida Pequena', 'Hanya Yanagihara', 'US', 'Drama', 'Record', 2016, 784, 'Kindle', 'lido', 2025, '2025-05-04', '2025-07-07', 4.5, NULL, 0, 0, 54.07, 'https://covers.openlibrary.org/b/id/12065783-L.jpg', NULL
WHERE (SELECT COUNT(*) FROM livros) < 50 AND NOT EXISTS (SELECT 1 FROM livros WHERE titulo = 'Uma Vida Pequena');

INSERT INTO livros (titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, adaptacao, vi_adaptacao, valor, capa, sinopse)
SELECT 'O Massacre da Família Hope', 'Riley Sager', 'US', 'Suspense', 'Intrínseca', 2024, 400, 'Kindle', 'lido', 2025, '2025-07-07', '2025-07-26', 4, NULL, 0, 0, 48.2, 'https://covers.openlibrary.org/b/id/13189306-L.jpg', NULL
WHERE (SELECT COUNT(*) FROM livros) < 50 AND NOT EXISTS (SELECT 1 FROM livros WHERE titulo = 'O Massacre da Família Hope');

INSERT INTO livros (titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, adaptacao, vi_adaptacao, valor, capa, sinopse)
SELECT 'Os Dois Morrem no Final', 'Adam Silvera', 'US', 'Romance', 'Intrínseca', 2018, 416, 'Kindle', 'lido', 2025, '2025-07-28', '2025-08-06', 4, NULL, 0, 0, 40.34, 'https://covers.openlibrary.org/b/id/9280553-L.jpg', NULL
WHERE (SELECT COUNT(*) FROM livros) < 50 AND NOT EXISTS (SELECT 1 FROM livros WHERE titulo = 'Os Dois Morrem no Final');

INSERT INTO livros (titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, adaptacao, vi_adaptacao, valor, capa, sinopse)
SELECT 'Melhor do que nos Filmes', 'Lynn Painter', 'US', 'Romance', 'Intrínseca', 2022, 352, 'Kindle', 'lido', 2025, '2025-08-06', '2025-08-09', 4.5, NULL, 0, 0, 39.7, 'https://covers.openlibrary.org/b/id/15140832-L.jpg', NULL
WHERE (SELECT COUNT(*) FROM livros) < 50 AND NOT EXISTS (SELECT 1 FROM livros WHERE titulo = 'Melhor do que nos Filmes');

INSERT INTO livros (titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, adaptacao, vi_adaptacao, valor, capa, sinopse)
SELECT 'Dias Perfeitos', 'Raphael Montes', 'BR', 'Suspense', 'Companhia das Letras', 2014, 280, 'Kindle', 'lido', 2025, '2025-08-12', '2025-08-18', 3.5, NULL, 1, 0, 56.88, 'https://covers.openlibrary.org/b/id/8479640-L.jpg', NULL
WHERE (SELECT COUNT(*) FROM livros) < 50 AND NOT EXISTS (SELECT 1 FROM livros WHERE titulo = 'Dias Perfeitos');

INSERT INTO livros (titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, adaptacao, vi_adaptacao, valor, capa, sinopse)
SELECT 'A Lâmina da Assassina', 'Sarah J. Maas', 'US', 'Fantasia', 'Galera Record', 2014, 406, 'Kindle', 'lido', 2025, '2025-04-07', '2025-08-29', 4.5, NULL, 0, 0, 69.66, 'https://covers.openlibrary.org/b/id/7794980-L.jpg', NULL
WHERE (SELECT COUNT(*) FROM livros) < 50 AND NOT EXISTS (SELECT 1 FROM livros WHERE titulo = 'A Lâmina da Assassina');

INSERT INTO livros (titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, adaptacao, vi_adaptacao, valor, capa, sinopse)
SELECT 'Nadando no Escuro', 'Tomasz Jedrowski', 'PL', 'Ficção', 'Intrínseca', 2020, 224, 'Kindle', 'lido', 2025, '2025-08-30', '2025-09-11', 3.5, NULL, 0, 0, 30.75, 'https://covers.openlibrary.org/b/id/10144986-L.jpg', NULL
WHERE (SELECT COUNT(*) FROM livros) < 50 AND NOT EXISTS (SELECT 1 FROM livros WHERE titulo = 'Nadando no Escuro');

INSERT INTO livros (titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, adaptacao, vi_adaptacao, valor, capa, sinopse)
SELECT 'O Detento', 'Freida McFadden', 'US', 'Suspense', 'Arqueiro', 2024, 320, 'Kindle', 'lido', 2025, '2025-09-11', '2025-09-19', 3.5, NULL, 0, 0, 39.4, 'https://covers.openlibrary.org/b/id/15125020-L.jpg', NULL
WHERE (SELECT COUNT(*) FROM livros) < 50 AND NOT EXISTS (SELECT 1 FROM livros WHERE titulo = 'O Detento');

INSERT INTO livros (titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, adaptacao, vi_adaptacao, valor, capa, sinopse)
SELECT 'Tudo que Deixamos Inacabado', 'Rebecca Yarros', 'US', 'Romance', 'Planeta', 2023, 448, 'Kindle', 'lido', 2025, NULL, NULL, 5, NULL, 0, 0, 49.03, 'https://covers.openlibrary.org/b/id/10240342-L.jpg', NULL
WHERE (SELECT COUNT(*) FROM livros) < 50 AND NOT EXISTS (SELECT 1 FROM livros WHERE titulo = 'Tudo que Deixamos Inacabado');

INSERT INTO livros (titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, adaptacao, vi_adaptacao, valor, capa, sinopse)
SELECT 'O Vilarejo', 'Raphael Montes', 'BR', 'Suspense', 'Companhia das Letras', 2015, 96, 'Kindle', 'lido', 2025, '2025-10-19', '2025-10-20', 5, NULL, 0, 0, 36.19, 'https://covers.openlibrary.org/b/id/10839239-L.jpg', NULL
WHERE (SELECT COUNT(*) FROM livros) < 50 AND NOT EXISTS (SELECT 1 FROM livros WHERE titulo = 'O Vilarejo');

INSERT INTO livros (titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, adaptacao, vi_adaptacao, valor, capa, sinopse)
SELECT 'Herdeira do Fogo', 'Sarah J. Maas', 'US', 'Fantasia', 'Galera Record', 2014, 518, 'Kindle', 'lido', 2025, NULL, NULL, 5, NULL, 0, 0, 104.54, 'https://covers.openlibrary.org/b/id/9318480-L.jpg', NULL
WHERE (SELECT COUNT(*) FROM livros) < 50 AND NOT EXISTS (SELECT 1 FROM livros WHERE titulo = 'Herdeira do Fogo');

INSERT INTO livros (titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, adaptacao, vi_adaptacao, valor, capa, sinopse)
SELECT 'Com Amor, Mamãe', 'Iliana Xander', 'US', 'Suspense', 'Intrínseca', 2025, 336, 'Kindle', 'lido', 2025, NULL, NULL, 3.5, NULL, 0, 0, 41.01, NULL, NULL
WHERE (SELECT COUNT(*) FROM livros) < 50 AND NOT EXISTS (SELECT 1 FROM livros WHERE titulo = 'Com Amor, Mamãe');

INSERT INTO livros (titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, adaptacao, vi_adaptacao, valor, capa, sinopse)
SELECT 'Como Arruinar um Casamento', 'Alison Espach', 'US', 'Romance', 'Harlequin Brasil', 2025, 368, 'Kindle', 'lido', 2025, NULL, NULL, 2.5, NULL, 0, 0, 35.67, NULL, NULL
WHERE (SELECT COUNT(*) FROM livros) < 50 AND NOT EXISTS (SELECT 1 FROM livros WHERE titulo = 'Como Arruinar um Casamento');

INSERT INTO livros (titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, adaptacao, vi_adaptacao, valor, capa, sinopse)
SELECT 'Rainha das Sombras', 'Sarah J. Maas', 'US', 'Fantasia', 'Galera Record', 2015, 644, 'Kindle', 'lido', 2026, '2025-12-05', '2026-01-26', 5, NULL, 0, 0, 104.54, 'https://covers.openlibrary.org/b/id/7994583-L.jpg', NULL
WHERE (SELECT COUNT(*) FROM livros) < 50 AND NOT EXISTS (SELECT 1 FROM livros WHERE titulo = 'Rainha das Sombras');

INSERT INTO livros (titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, adaptacao, vi_adaptacao, valor, capa, sinopse)
SELECT 'Layla', 'Colleen Hoover', 'US', 'Suspense', 'Galera Record', 2021, 304, 'Kindle', 'lido', 2026, '2026-01-27', '2026-02-06', 2, NULL, 0, 0, 31.54, 'https://covers.openlibrary.org/b/id/10533096-L.jpg', NULL
WHERE (SELECT COUNT(*) FROM livros) < 50 AND NOT EXISTS (SELECT 1 FROM livros WHERE titulo = 'Layla');

INSERT INTO livros (titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, adaptacao, vi_adaptacao, valor, capa, sinopse)
SELECT 'Pinóquio', 'Lily Murray', 'GB', 'Infantil', 'Universo dos Livros', 2022, 80, 'Kindle', 'lido', 2026, '2026-02-03', '2026-02-03', 5, NULL, 1, 0, 45.45, NULL, NULL
WHERE (SELECT COUNT(*) FROM livros) < 50 AND NOT EXISTS (SELECT 1 FROM livros WHERE titulo = 'Pinóquio');

INSERT INTO livros (titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, adaptacao, vi_adaptacao, valor, capa, sinopse)
SELECT 'O Peso do Pássaro Morto', 'Aline Bei', 'BR', 'Romance', 'Nós', 2017, 168, 'Kindle', 'lido', 2026, '2026-02-16', '2026-02-17', 5, 'Solidão', 0, 0, 64, 'https://covers.openlibrary.org/b/id/10833052-L.jpg', NULL
WHERE (SELECT COUNT(*) FROM livros) < 50 AND NOT EXISTS (SELECT 1 FROM livros WHERE titulo = 'O Peso do Pássaro Morto');

INSERT INTO livros (titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, adaptacao, vi_adaptacao, valor, capa, sinopse)
SELECT 'Casas Estranhas', 'Uketsu', 'JP', 'Suspense', 'Intrínseca', 2025, 240, 'Kindle', 'lido', 2026, '2026-02-17', '2026-02-23', 1.5, 'Confuso', 1, 0, 25.18, 'https://covers.openlibrary.org/b/id/15222531-L.jpg', NULL
WHERE (SELECT COUNT(*) FROM livros) < 50 AND NOT EXISTS (SELECT 1 FROM livros WHERE titulo = 'Casas Estranhas');

INSERT INTO livros (titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, adaptacao, vi_adaptacao, valor, capa, sinopse)
SELECT 'Academia dos Casos Arquivados', 'Jennifer Lynn Barnes', 'US', 'Suspense', 'Alt', 2024, 264, 'Kindle', 'lido', 2026, '2026-02-23', '2026-02-26', 4, 'Intrigante', 0, 0, 44.04, NULL, NULL
WHERE (SELECT COUNT(*) FROM livros) < 50 AND NOT EXISTS (SELECT 1 FROM livros WHERE titulo = 'Academia dos Casos Arquivados');

INSERT INTO livros (titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, adaptacao, vi_adaptacao, valor, capa, sinopse)
SELECT 'Táticas do Amor', 'Sarah Adams', 'US', 'Romance', 'Intrínseca', 2023, 304, 'Kindle', 'lido', 2026, '2025-12-31', '2026-02-27', 2.5, 'Previsível', 0, 0, 37.66, NULL, NULL
WHERE (SELECT COUNT(*) FROM livros) < 50 AND NOT EXISTS (SELECT 1 FROM livros WHERE titulo = 'Táticas do Amor');

INSERT INTO livros (titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, adaptacao, vi_adaptacao, valor, capa, sinopse)
SELECT 'A Vegetariana', 'Han Kang', 'KR', 'Ficção', 'Todavia', 2018, 176, 'Kindle', 'lido', 2026, '2026-03-30', '2026-04-03', 4, NULL, 1, 0, 55.32, 'https://covers.openlibrary.org/b/id/15182525-L.jpg', NULL
WHERE (SELECT COUNT(*) FROM livros) < 50 AND NOT EXISTS (SELECT 1 FROM livros WHERE titulo = 'A Vegetariana');

INSERT INTO livros (titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, adaptacao, vi_adaptacao, valor, capa, sinopse)
SELECT 'O Meu Pé de Laranja Lima', 'José Mauro de Vasconcelos', 'BR', 'Ficção', 'Melhoramentos', 1968, 224, 'Kindle', 'lido', 2026, '2026-04-03', '2026-04-13', 4.5, 'Intenso', 1, 0, 24.26, 'https://covers.openlibrary.org/b/id/14831038-L.jpg', NULL
WHERE (SELECT COUNT(*) FROM livros) < 50 AND NOT EXISTS (SELECT 1 FROM livros WHERE titulo = 'O Meu Pé de Laranja Lima');

INSERT INTO livros (titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, adaptacao, vi_adaptacao, valor, capa, sinopse)
SELECT 'Uma Família Feliz', 'Raphael Montes', 'BR', 'Suspense', 'Companhia das Letras', 2024, 352, 'Kindle', 'lido', 2026, '2026-04-13', '2026-04-28', 4.5, 'Surpreendente', 1, 0, 41.09, 'https://covers.openlibrary.org/b/id/14619561-L.jpg', NULL
WHERE (SELECT COUNT(*) FROM livros) < 50 AND NOT EXISTS (SELECT 1 FROM livros WHERE titulo = 'Uma Família Feliz');

INSERT INTO livros (titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, adaptacao, vi_adaptacao, valor, capa, sinopse)
SELECT 'Uma Mulher no Escuro', 'Raphael Montes', 'BR', 'Suspense', 'Companhia das Letras', 2019, 256, 'Kindle', 'lido', 2026, '2026-04-29', '2026-05-01', 4, 'Perturbador', 0, 0, 44.98, NULL, NULL
WHERE (SELECT COUNT(*) FROM livros) < 50 AND NOT EXISTS (SELECT 1 FROM livros WHERE titulo = 'Uma Mulher no Escuro');

INSERT INTO livros (titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, adaptacao, vi_adaptacao, valor, capa, sinopse)
SELECT 'A Morte de Ivan Ilitch', 'Lev Tolstói', 'RU', 'Ficção', 'Editora 34', 1886, 96, 'Kindle', 'lido', 2026, '2026-05-11', '2026-05-16', 3.5, 'Reflexivo', 1, 0, 41.3, 'https://covers.openlibrary.org/b/id/11616112-L.jpg', NULL
WHERE (SELECT COUNT(*) FROM livros) < 50 AND NOT EXISTS (SELECT 1 FROM livros WHERE titulo = 'A Morte de Ivan Ilitch');

INSERT INTO livros (titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, adaptacao, vi_adaptacao, valor, capa, sinopse)
SELECT 'A Última Festa', 'Lucy Foley', 'GB', 'Suspense', 'Intrínseca', 2019, 304, 'Kindle', 'lido', 2026, '2026-05-31', '2026-06-02', 3.5, 'Enigmático', 0, 0, 127.6, 'https://covers.openlibrary.org/b/id/8797519-L.jpg', NULL
WHERE (SELECT COUNT(*) FROM livros) < 50 AND NOT EXISTS (SELECT 1 FROM livros WHERE titulo = 'A Última Festa');

INSERT INTO livros (titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, adaptacao, vi_adaptacao, valor, capa, sinopse)
SELECT 'Relatos de Um Gato Viajante', 'Hiro Arikawa', 'JP', 'Ficção', 'Alfaguara', 2017, 288, 'Kindle', 'lido', 2026, '2026-06-11', '2026-06-22', 5, 'Amor', 1, 0, 47.18, 'https://covers.openlibrary.org/b/id/8523132-L.jpg', NULL
WHERE (SELECT COUNT(*) FROM livros) < 50 AND NOT EXISTS (SELECT 1 FROM livros WHERE titulo = 'Relatos de Um Gato Viajante');

INSERT INTO livros (titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, adaptacao, vi_adaptacao, valor, capa, sinopse)
SELECT 'Menina Má', 'William March', 'US', 'Suspense', 'DarkSide', 1954, 272, 'Kindle', 'lido', 2026, '2026-07-02', '2026-07-04', 3, 'Macabro', 1, 0, 44.9, 'https://covers.openlibrary.org/b/id/10376288-L.jpg', NULL
WHERE (SELECT COUNT(*) FROM livros) < 50 AND NOT EXISTS (SELECT 1 FROM livros WHERE titulo = 'Menina Má');

INSERT INTO livros (titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, adaptacao, vi_adaptacao, valor, capa, sinopse)
SELECT 'A Hipótese do Amor', 'Ali Hazelwood', 'IT', 'Romance', 'Arqueiro', 2022, 336, 'Kindle', 'lido', 2026, '2026-06-26', '2026-07-05', 3.5, 'Envolvente', 0, 0, 63.9, 'https://covers.openlibrary.org/b/id/10601402-L.jpg', NULL
WHERE (SELECT COUNT(*) FROM livros) < 50 AND NOT EXISTS (SELECT 1 FROM livros WHERE titulo = 'A Hipótese do Amor');

INSERT INTO livros (titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, adaptacao, vi_adaptacao, valor, capa, sinopse)
SELECT 'A Última Casa da Rua Needless', 'Catriona Ward', 'US', 'Suspense', 'Jangada', 2022, 352, 'Kindle', 'lido', 2026, '2026-07-07', '2026-07-09', 4, 'Complexo', 0, 0, 45.79, 'https://covers.openlibrary.org/b/id/10829438-L.jpg', NULL
WHERE (SELECT COUNT(*) FROM livros) < 50 AND NOT EXISTS (SELECT 1 FROM livros WHERE titulo = 'A Última Casa da Rua Needless');

INSERT INTO livros (titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, adaptacao, vi_adaptacao, valor, capa, sinopse)
SELECT 'Para Sempre Seu', 'Abby Jimenez', 'US', 'Romance', 'Arqueiro', 2023, 336, 'Kindle', 'lido', 2026, '2026-07-10', '2026-07-16', 5, 'Envolvente', 0, 0, 39.98, 'https://covers.openlibrary.org/b/id/13186198-L.jpg', NULL
WHERE (SELECT COUNT(*) FROM livros) < 50 AND NOT EXISTS (SELECT 1 FROM livros WHERE titulo = 'Para Sempre Seu');

INSERT INTO livros (titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, adaptacao, vi_adaptacao, valor, capa, sinopse)
SELECT 'Não Perturbe', 'Freida McFadden', 'US', 'Suspense', 'Arqueiro', 2024, 293, 'Kindle', 'lido', 2026, '2026-07-17', '2026-07-20', 3, 'Previsibilidade', 0, 0, 53.9, 'https://covers.openlibrary.org/b/id/15096889-L.jpg', NULL
WHERE (SELECT COUNT(*) FROM livros) < 50 AND NOT EXISTS (SELECT 1 FROM livros WHERE titulo = 'Não Perturbe');

INSERT INTO livros (titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, adaptacao, vi_adaptacao, valor, capa, sinopse)
SELECT 'Pequena Coreografia do Adeus', 'Aline Bei', 'BR', 'Ficção', 'Companhia das Letras', 2021, 288, 'Físico', 'lendo', 2026, '2026-07-20', NULL, NULL, NULL, 0, 0, 46.65, 'https://covers.openlibrary.org/b/id/12064640-L.jpg', NULL
WHERE (SELECT COUNT(*) FROM livros) < 50 AND NOT EXISTS (SELECT 1 FROM livros WHERE titulo = 'Pequena Coreografia do Adeus');
