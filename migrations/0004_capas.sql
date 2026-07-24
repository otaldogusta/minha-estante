-- Capas que faltaram na importação inicial (edições verificadas)
UPDATE livros SET capa = 'https://dcdn-us.mitiendanube.com/stores/996/805/products/71da2btiiufl-_sl1500_-0b000573fa0acb91f217690064389784-640-0.webp'
WHERE titulo = 'Com Amor, Mamãe' AND capa IS NULL;

UPDATE livros SET capa = 'https://covers.openlibrary.org/b/id/15127690-L.jpg'
WHERE titulo = 'Como Arruinar um Casamento' AND capa IS NULL;

UPDATE livros SET capa = 'https://cdn.awsli.com.br/800x800/1576/1576093/produto/168686317/3509877fad.jpg'
WHERE titulo = 'Pinóquio' AND capa IS NULL;

UPDATE livros SET capa = 'https://covers.openlibrary.org/b/id/10790361-L.jpg'
WHERE titulo = 'Academia dos Casos Arquivados' AND capa IS NULL;

UPDATE livros SET capa = 'https://covers.openlibrary.org/b/id/15197142-L.jpg'
WHERE titulo = 'Táticas do Amor' AND capa IS NULL;

UPDATE livros SET capa = 'https://covers.openlibrary.org/b/isbn/9788535931761-L.jpg'
WHERE titulo = 'Uma Mulher no Escuro' AND capa IS NULL;
