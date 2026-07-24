-- Supabase PostgreSQL Schema & Data Export for Minha Estante
BEGIN;


DROP TABLE IF EXISTS redefinicoes CASCADE;
DROP TABLE IF EXISTS convites CASCADE;
DROP TABLE IF EXISTS cartas CASCADE;
DROP TABLE IF EXISTS sessoes CASCADE;
DROP TABLE IF EXISTS livros CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;


CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  usuario TEXT NOT NULL UNIQUE,
  senha_hash TEXT NOT NULL,
  carta_vista INTEGER DEFAULT 0,
  email TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);


CREATE TABLE sessoes (
  token TEXT PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  expira_em TIMESTAMPTZ NOT NULL,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_sessoes_expira ON sessoes(expira_em);


CREATE TABLE livros (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
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
  nota NUMERIC(3,1),
  palavra TEXT,
  resenha TEXT,
  adaptacao INTEGER NOT NULL DEFAULT 0,
  vi_adaptacao INTEGER NOT NULL DEFAULT 0,
  valor NUMERIC(10,2),
  capa TEXT,
  sinopse TEXT,
  pagina_atual INTEGER,
  privado INTEGER NOT NULL DEFAULT 0,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_livros_status ON livros(status);
CREATE INDEX idx_livros_ano_leitura ON livros(ano_leitura);
CREATE INDEX idx_livros_usuario ON livros(usuario_id, status);


CREATE TABLE cartas (
  id SERIAL PRIMARY KEY,
  de_usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  para_usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  corpo TEXT NOT NULL,
  livro_condicao_id INTEGER,
  lida INTEGER NOT NULL DEFAULT 0,
  lida_em TIMESTAMPTZ,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_cartas_para ON cartas(para_usuario_id, lida);


CREATE TABLE convites (
  codigo TEXT PRIMARY KEY,
  criado_por INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  usado_por INTEGER,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  usado_em TIMESTAMPTZ
);


CREATE TABLE redefinicoes (
  token TEXT PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  expira_em TIMESTAMPTZ NOT NULL,
  usado INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX idx_redefinicoes_usuario ON redefinicoes(usuario_id, usado);


-- Data: usuarios
INSERT INTO usuarios (id, nome, usuario, senha_hash, carta_vista, email, criado_em) VALUES (1, 'Leitora', 'judaviluis', 'pbkdf2$100000$271bce0f9a7d3925c06d99a55ece8133$ad5abca0ba40ac0a00846c162c38b25a4711eb0dc69050893d61e4a18580a828', 1, NULL, '2026-07-23 22:37:01');
INSERT INTO usuarios (id, nome, usuario, senha_hash, carta_vista, email, criado_em) VALUES (2, 'Carteiro', 'carteiro', 'pbkdf2$100000$d30bddb1da2972d0c89183ff6b7018bb$1df4ced624cde5680d54ca5da987d622d94f2941a16945992641691763fab205', 1, NULL, '2026-07-23 22:37:01');
SELECT setval('usuarios_id_seq', 2);

-- Data: sessoes
INSERT INTO sessoes (token, usuario_id, expira_em, criado_em) VALUES ('109892a2271785ce576b36c1e443d89661aeccd3153562c8534c3bbaaacd5ed9', 2, '2027-01-19T23:08:47.179Z', '2026-07-23 23:08:47');
INSERT INTO sessoes (token, usuario_id, expira_em, criado_em) VALUES ('b1718478f97f5310ac38efbf1abaa26f3e784961f36b841f7889ecaaf93a0751', 1, '2027-01-20T00:50:37.383Z', '2026-07-24 00:50:37');

-- Data: livros
INSERT INTO livros (id, usuario_id, titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, resenha, adaptacao, vi_adaptacao, valor, capa, sinopse, pagina_atual, privado, criado_em) VALUES (51, 2, 'Netter Atlas de Anatomia Humana', 'Frank H. Netter', NULL, NULL, 'Gen Guanabara Koogan', 2018, NULL, 'Kindle', 'lido', 2026, '2026-07-23', '2026-07-23', NULL, NULL, NULL, 0, 0, NULL, 'https://covers.openlibrary.org/b/id/12501247-L.jpg', NULL, NULL, 0, '2026-07-23 23:12:02');
INSERT INTO livros (id, usuario_id, titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, resenha, adaptacao, vi_adaptacao, valor, capa, sinopse, pagina_atual, privado, criado_em) VALUES (302, 1, 'É Assim que Acaba', 'Colleen Hoover', 'US', 'Romance', 'Galera record', 2016, 368, 'Físico', 'lido', 2024, NULL, NULL, 4.0, 'Transformador', 'Eu li **É Assim que Acaba**, da Colleen Hoover, e foi um livro que me surpreendeu bastante. No começo, ele parece um romance comum. A história acompanha a Lily e o Ryle, e tudo começa de uma forma muito leve. Ele é bonito, carismático, não quer um relacionamento sério, enquanto ela procura exatamente isso. Aos poucos, eles vão se aproximando, se apaixonando e construindo uma relação que parece muito bonita.

O que eu achei interessante é que o Ryle não conquista só a Lily, ele conquista o leitor também. Durante boa parte da história, a gente enxerga ele como um homem bom. Ele faz coisas por ela, demonstra carinho, e é muito fácil gostar dele. Eu acho que essa é justamente a grande força do livro.

Só que depois vem a grande reviravolta. Quando eles já estão casados e aparentemente vivendo uma vida feliz, o Ryle mostra outro lado. Ele se torna agressivo, abusivo e violento. E isso é um choque porque, até aquele momento, a gente não estava acompanhando essa versão dele. A sensação é muito parecida com a da própria Lily: você não quer acreditar no que está acontecendo.

Ao mesmo tempo, o livro apresenta o Atlas, que foi o primeiro amor da Lily. Eles se conheceram na adolescência, quando ele era um garoto sem ter onde morar e estava vivendo em uma casa abandonada ao lado da dela. A amizade entre os dois cresce e acaba se transformando em amor. É um relacionamento muito mais leve, inocente e cheio de carinho.

A história do Atlas também se conecta diretamente com a da Lily porque ele conheceu de perto a realidade da família dela. A mãe da Lily sofria violência doméstica, e ela cresceu vendo o pai agredir a mãe. Por isso, ela sempre odiou esse comportamento e jurava que nunca aceitaria algo parecido na própria vida.

Quando ela reencontra o Atlas já adulta, ele percebe rapidamente que alguma coisa está errada. Ele vê machucados nela, percebe sinais que lembram exatamente o que acontecia dentro da casa dela quando era criança. E é aí que a história fica ainda mais dolorosa, porque a gente vê como é difícil para a vítima admitir o que está acontecendo.

O que mais me marcou no livro foi justamente a intenção da autora. Eu senti que ela quis fazer o leitor se apaixonar pelo Ryle primeiro para depois mostrar que pessoas abusivas nem sempre são monstros o tempo todo. Muitas vezes elas também têm qualidades, momentos bons e justificativas prontas. E é exatamente isso que faz tantas vítimas permanecerem nesses relacionamentos. A gente tenta desculpar, tenta encontrar uma explicação, tenta acreditar que foi um erro. Mas o livro mostra que não existe justificativa para violência.

Quando as agressões se repetem, a Lily finalmente entende que precisa colocar um limite. Ela procura ajuda e, nesse período, descobre que está grávida. O momento mais marcante para mim acontece depois que a filha nasce. Quando ela pega a bebê nos braços, decide pedir o divórcio.

A conversa final entre ela e o Ryle é uma das partes mais fortes do livro. Ela pergunta o que ele faria se a própria filha contasse que estava em um relacionamento em que era empurrada, machucada ou agredida. E ele responde que mandaria a filha sair imediatamente daquela situação. Nesse momento, ele não consegue mais negar a verdade.

E é justamente por isso que o livro se chama *É Assim que Acaba*. Porque naquele instante a Lily decide quebrar o ciclo de violência que acompanhou a vida dela desde a infância. Ela escolhe que aquilo não vai continuar com a filha dela.

Foi um livro que me surpreendeu muito porque começou como um romance e terminou sendo uma história sobre coragem, limites e sobre a dificuldade de romper ciclos que parecem impossíveis de quebrar.', 1, 1, 54.26, 'https://is1-ssl.mzstatic.com/image/thumb/Publication118/v4/24/34/2e/24342ee1-5c16-0699-c90d-24fd04a31a95/1023431982.jpg/512x512bb.jpg', NULL, NULL, 0, '2026-07-24T01:42:08.090Z');
INSERT INTO livros (id, usuario_id, titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, resenha, adaptacao, vi_adaptacao, valor, capa, sinopse, pagina_atual, privado, criado_em) VALUES (303, 1, 'É Assim que Começa', 'Colleen Hoover', 'US', 'Romance', 'Galera record', 2022, 336, 'Físico', 'lido', 2024, NULL, NULL, 4.0, 'Recomeço', 'Eu li **É Assim que Começa**, da Colleen Hoover, e achei um livro com uma proposta bem diferente de *É Assim que Acaba*. Enquanto o primeiro é muito mais pesado e doloroso, esse tem uma pegada muito mais leve e foca principalmente no desenvolvimento do relacionamento da Lily e do Atlas.

A história mostra que, mesmo depois de colocar um fim no relacionamento abusivo com o Ryle, a vida da Lily não se torna perfeita da noite para o dia. Ela ainda precisa lidar com as consequências de tudo o que viveu, principalmente porque o Ryle continua fazendo parte da vida dela por causa da filha que eles têm juntos. A prioridade da Lily é a filha, e isso influencia muitas das decisões que ela toma ao longo da história.

O que mais me marcou no livro foi a forma como o Atlas se comporta. Ele é extremamente paciente, compreensivo e se torna um verdadeiro porto seguro para a Lily. Em nenhum momento ele força situações ou tenta pressioná-la. Pelo contrário, ele respeita o tempo dela e entende tudo o que ela passou. Dá para perceber o quanto ele é apaixonado por ela e o quanto sempre foi, desde a adolescência.

A história deles faz muita diferença nesse processo. Eles já tinham uma conexão muito forte desde jovens, então existe uma base de confiança construída há anos. O Atlas sempre esteve ao lado da Lily quando ela precisou, e isso faz com que ela se sinta segura para se abrir novamente e acreditar que merece viver algo bom.

Uma das coisas que mais gostei foi acompanhar a Lily se libertando daquela sensação de que precisava continuar presa ao passado. No começo, ela ainda parece carregar o medo das reações do Ryle, como se não pudesse seguir em frente porque ele poderia ficar bravo ou criar problemas. Aos poucos, porém, ela vai entendendo que tem o direito de reconstruir a própria vida.

Quando eles se reencontram no início do livro, existe uma cena que eu achei muito bonita. A Lily conta que já está divorciada, e o Atlas simplesmente a abraça. Não é um abraço qualquer. É como se ele entendesse o tamanho da batalha que ela enfrentou para chegar até ali. Como alguém que conhecia a história dela e sabia tudo o que ela tinha passado, ele consegue imaginar o quanto aquilo foi difícil.

Também gostei muito quando o Atlas diz para a Lily se permitir se apaixonar novamente. E, no fundo, é exatamente sobre isso que o livro fala. Sobre dar uma nova chance ao amor depois de uma experiência traumática. Sobre entender que uma relação saudável existe e que ela merece viver algo leve.

O relacionamento dos dois acontece de forma muito natural porque a confiança já estava ali desde o começo. A Lily nunca teve motivos para duvidar do Atlas. Desde a adolescência ele sempre foi uma pessoa boa para ela, alguém em quem ela podia confiar. Por isso, acompanhar os dois finalmente vivendo aquilo que nunca tiveram oportunidade de viver quando eram mais novos foi muito satisfatório.

No final, eles conseguem construir a vida que sempre quiseram. Ficam juntos, se casam e encontram a felicidade que parecia tão distante depois de tudo o que aconteceu.

Foi uma leitura muito mais tranquila que o primeiro livro, mas que funciona muito bem como continuação porque mostra a reconstrução da Lily depois da dor e a importância de permitir que coisas boas aconteçam novamente.', 0, 0, 52.44, 'https://covers.openlibrary.org/b/id/12749873-L.jpg', NULL, NULL, 0, '2026-07-24T01:42:08.090Z');
INSERT INTO livros (id, usuario_id, titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, resenha, adaptacao, vi_adaptacao, valor, capa, sinopse, pagina_atual, privado, criado_em) VALUES (304, 1, 'Verity', 'Colleen Hoover', 'US', 'Suspense', 'Galera record', 2020, 320, 'Físico', 'lido', 2024, NULL, NULL, 5.0, 'Viceral', 'Eu li **Verity**, da Colleen Hoover, e achei um livro simplesmente espetacular. Foi uma leitura que me prendeu do começo ao fim. Eu fiquei completamente intrigada com a história e com uma vontade enorme de continuar lendo para descobrir o que realmente tinha acontecido.

Foi um livro que me chocou em vários momentos. Eu nunca tinha lido uma história com tantas situações absurdas e perturbadoras, e isso me deixava ainda mais curiosa. Eu queria continuar lendo porque precisava ver onde aquilo tudo ia dar e queria descobrir se, no final, existiria algum tipo de justiça para tudo o que estava acontecendo.

Também teve um peso especial porque foi o primeiro suspense que li depois de voltar ao hábito da leitura. E como eu já gosto muito da escrita da Colleen Hoover, foi uma combinação que funcionou perfeitamente para mim.

O grande centro da história é justamente a dúvida entre o manuscrito e a carta. E eu confesso que sou totalmente do time manuscrito. Para mim, não faz sentido alguém inventar e escrever aquelas coisas horríveis sobre as próprias filhas. São pensamentos e atitudes tão cruéis que eu simplesmente não consigo acreditar que aquilo seria uma invenção. Ainda mais quando a gente descobre tudo o que aconteceu ao longo da história e entende melhor o contexto por trás da capa do livro e dos acontecimentos narrados.

Ao mesmo tempo, o capítulo extra me deixou um pouco balançada. Eu continuo acreditando no manuscrito, mas ele me fez enxergar que talvez o Jeremy não seja tão inocente quanto parece. Principalmente porque, naquele capítulo, ele participa diretamente de uma situação muito grave e fala algo como "nós matamos". Isso faz surgir uma dúvida enorme.

Acho que quem é do time carta provavelmente sai desse capítulo ainda mais convencido da própria teoria. Já quem é do time manuscrito continua acreditando nela, mas passa a olhar para o Jeremy de outra forma. Para mim, ele definitivamente não é uma vítima completamente inocente. Tenho a sensação de que existe algo muito errado nele também.

Outra coisa que me marcou foi que eu jamais teria imaginado aquele plot. Em nenhum momento consegui prever o que estava acontecendo de verdade. Talvez eu tenha gostado tanto porque foi um dos primeiros suspenses que li quando voltei a ler, mas mesmo olhando hoje eu continuo achando uma história muito envolvente.

O final foi uma das partes que mais me impactaram. Quando tudo começa a acontecer entre Verity, Jeremy e Lowen, os acontecimentos se desenrolam muito rápido e você mal tem tempo para processar uma informação antes da próxima aparecer. É aquele tipo de final que deixa a leitura frenética.

Mas, se tem uma cena que eu nunca vou esquecer, é a famosa cena da escada. Antes de eu ler o livro, uma amiga tinha me dito que existia uma parte em que eu sentiria medo de verdade e que, quando chegasse nela, eu saberia exatamente qual era. E foi justamente essa cena.

Eu estava sozinha em casa, à noite, já precisava parar de ler porque tinha prova no dia seguinte, mas quando li aquela parte eu fiquei genuinamente assustada. E isso me fez pensar em uma coisa: como um livro, feito apenas de palavras escritas no papel, conseguiu me causar medo de verdade? Acho que esse foi um dos maiores méritos da história.

No geral, foi uma leitura que me trouxe muitas emoções diferentes. Fiquei chocada, curiosa, indignada, ansiosa e até com medo. E quando um livro consegue provocar tudo isso ao mesmo tempo, para mim ele fez exatamente o que se propôs a fazer.', 0, 0, 56.42, 'https://is1-ssl.mzstatic.com/image/thumb/Publication114/v4/31/04/66/31046671-1d53-eef3-6dd0-a6db859220d3/1031034141.jpg/512x512bb.jpg', NULL, NULL, 0, '2026-07-24T01:42:08.090Z');
INSERT INTO livros (id, usuario_id, titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, resenha, adaptacao, vi_adaptacao, valor, capa, sinopse, pagina_atual, privado, criado_em) VALUES (305, 1, 'Jantar Secreto', 'Raphael Montes', 'BR', 'Suspense', 'Companhia das Letras', 2016, 368, 'Kindle', 'lido', 2025, NULL, NULL, 4.5, 'Degradação', 'Eu li *Jantar Secreto*, do Rafael Montes, e foi um livro que me deixou muito ansiosa para ler. Eu já tinha ouvido algumas coisas sobre a história e isso me deixou extremamente curiosa. Foi o primeiro livro do autor que eu li, e fiquei completamente chocada com tudo o que encontrei nele.

O que mais me chamou a atenção foi como tudo faz sentido dentro da proposta da história. As críticas ao desespero dos universitários, à falta de dinheiro e às coisas que algumas pessoas são capazes de fazer quando estão sem perspectivas são muito bem construídas. Ao mesmo tempo, a gente acompanha o Diego, que para mim é o personagem mais fraco emocionalmente do grupo. Ele nunca concordou totalmente com o que estava acontecendo, mas continuou seguindo os amigos e acabou preso em uma situação da qual não conseguia mais sair.

As cenas descritas pelo autor são extremamente impactantes. Principalmente quando a história passa a mostrar como as vítimas eram tratadas. A forma como tudo é narrado faz a gente perceber o quanto aquelas pessoas foram desumanizadas. É impossível não sentir desconforto lendo algumas partes.

Tudo começa quando eles conseguem um corpo de uma pessoa que já havia falecido e percebem que podem ganhar muito dinheiro com aquilo. O problema é que a ambição cresce cada vez mais. O que começou como algo isolado rapidamente deixa de ser suficiente, e eles passam a procurar novas formas de manter o negócio funcionando. Aos poucos, deixam de esperar oportunidades e começam a criar as próprias oportunidades, escolhendo vítimas que acreditavam que não fariam falta para ninguém. O livro faz uma crítica muito forte a essa lógica cruel de que algumas vidas seriam menos importantes do que outras.

O que mais gostei foi acompanhar o conflito interno do Diego. Dá para perceber o desespero dele crescendo a cada página. Ele sabe que está fazendo algo errado, mas ao mesmo tempo se vê preso naquela realidade e nas consequências das próprias escolhas. O dinheiro pesa, a culpa pesa, e tudo vai ficando cada vez mais sufocante.

Um dos grandes plot twists do livro, que eu já desconfiava um pouco, envolve o Leitão. Desde o começo ele demonstra uma ambição muito maior do que a dos outros personagens. No final, descobrimos que ele estava envolvido em algo ainda maior e que conseguiu expandir toda a operação para outros lugares. Enquanto Diego acaba pagando pelos próprios crimes, quem realmente estava por trás de tudo continua enriquecendo e seguindo em frente.

Isso também reforça uma das coisas que eu mais gosto nos livros do Rafael Montes: ele não está preocupado em entregar finais felizes. Eu já imaginava que não seria uma história em que todos os culpados seriam punidos. E foi exatamente isso que aconteceu. O personagem que mais demonstrava arrependimento acaba preso, enquanto quem comandava tudo continua lucrando.

Foi uma leitura extremamente impactante, desconfortável e impossível de esquecer. É um livro que choca, revolta e faz pensar ao mesmo tempo. Mesmo com todos os absurdos que acontecem, a história consegue ser muito envolvente e me prendeu do começo ao fim.', 0, 0, 66.12, 'https://is1-ssl.mzstatic.com/image/thumb/Publication116/v4/ab/5b/46/ab5b467b-0944-435a-9cfd-218ba4b478dc/1017040245.jpg/512x512bb.jpg', NULL, NULL, 0, '2026-07-24T01:42:08.090Z');
INSERT INTO livros (id, usuario_id, titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, resenha, adaptacao, vi_adaptacao, valor, capa, sinopse, pagina_atual, privado, criado_em) VALUES (306, 1, 'Quarta Asa', 'Rebecca Yarros', 'US', 'Fantasia', 'Planeta', 2023, 544, 'Kindle', 'lido', 2025, NULL, NULL, 5.0, 'Imersão', '*Quarta Asa*, da Rebecca Yarros, foi um livro que me conquistou completamente. Foi a primeira fantasia que eu li depois de muito tempo e eu simplesmente adorei a experiência. Além disso, foi o meu primeiro contato com a escrita da autora, e mais tarde, quando li outros livros dela, percebi que a qualidade da escrita continua impecável, independentemente do gênero.

No começo, eu me irritava um pouco com a Violet. Ela se descreve o tempo todo como pequena, frágil e fisicamente mais fraca do que os outros candidatos. Mas, conforme a história avança, a gente acompanha o desenvolvimento dela e percebe que essa insegurança faz parte da construção da personagem. Foi muito interessante ver sua evolução ao longo da trama.

Uma das coisas que mais gostei foi a forma como o universo é apresentado. A gente vai descobrindo tudo junto com a Violet, entendendo as regras daquele mundo, os desafios do Instituto de Guerra e todos os obstáculos que ela precisa enfrentar. O primeiro deles, o Parapeito, já mostra que ninguém terá vida fácil ali.

Mas, para mim, o livro realmente se torna especial quando entram em cena Tairn e Andarna. Os dois dragões transformam completamente a história. Tairn é um dos dragões mais poderosos e raros, enorme, intimidador e extremamente rabugento. Já Andarna é uma jovem dragão dourada, algo que ninguém esperava encontrar. Os dois são completamente diferentes, mas funcionam perfeitamente juntos.

A cena em que Violet protege Andarna é uma das minhas favoritas do livro inteiro. Foi ali que senti a conexão entre eles se formando. Quando os dois dragões escolhem se vincular a ela, a história ganha uma nova dimensão. O elo entre cavaleiro e dragão é muito forte, mas o vínculo que eles desenvolvem parece ainda mais especial.

Outra cena que me marcou muito foi quando Tairn abaixa a cabeça para que Violet consiga montar nele. Pode parecer um gesto simples, mas dentro daquele universo significa respeito, confiança e vulnerabilidade. Os dragões são criaturas poderosas, que não costumam demonstrar esse tipo de comportamento. Eles não se preocupam em agradar ninguém e não hesitam em eliminar quem os desrespeita. Por isso, ver Tairn agir daquela forma mostra o quanto a relação entre os dois já havia evoluído.

Os dragões são, sem dúvida, meus personagens favoritos da série. A dinâmica entre eles, os diálogos e a forma como interagem com Violet tornaram a leitura ainda mais especial para mim.

Quando terminei *Quarta Asa*, comecei *Chama de Ferro* imediatamente. Eu estava completamente envolvida com a história e ansiosa pela continuação. Depois, fiquei contando os dias para o lançamento de *Tempestade de Ônix* e comecei a leitura assim que foi lançado.

O universo de *O Empyriano* me marcou muito. É uma das minhas séries favoritas e, sinceramente, não vejo a hora de ler os próximos livros, assistir à adaptação e continuar acompanhando essa história. Foi uma fantasia que me fez mergulhar completamente naquele mundo e me apaixonar por cada detalhe dele.', 0, 0, 110.97, 'https://is1-ssl.mzstatic.com/image/thumb/Publication116/v4/79/5f/54/795f54e1-8f24-04d4-c5c0-fdb12bb0a0d7/1043280070.jpg/512x512bb.jpg', NULL, NULL, 0, '2026-07-24T01:42:08.090Z');
INSERT INTO livros (id, usuario_id, titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, resenha, adaptacao, vi_adaptacao, valor, capa, sinopse, pagina_atual, privado, criado_em) VALUES (307, 1, 'Chama de Ferro', 'Rebecca Yarros', 'US', 'Fantasia', 'Planeta', 2024, 816, 'Kindle', 'lido', 2025, NULL, NULL, 5.0, NULL, 'Livros', 0, 0, 108.0, 'https://is1-ssl.mzstatic.com/image/thumb/Publication221/v4/2d/98/f3/2d98f3c1-d76a-c5ec-7f7f-b1e73c0199b8/1046074744.jpg/512x512bb.jpg', NULL, NULL, 0, '2026-07-24T01:42:08.090Z');
INSERT INTO livros (id, usuario_id, titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, resenha, adaptacao, vi_adaptacao, valor, capa, sinopse, pagina_atual, privado, criado_em) VALUES (308, 1, 'O Lado Feio do Amor', 'Colleen Hoover', 'US', 'Romance', 'Galera record', 2015, 336, 'Kindle', 'lido', 2025, '2025-01-12', '2025-01-17', 3.5, NULL, 'Livros', 0, 0, 33.87, 'https://is1-ssl.mzstatic.com/image/thumb/Publication118/v4/4d/40/90/4d40906e-2ac8-6b7b-6a0f-c7e64476aab9/1022045346.jpg/512x512bb.jpg', NULL, NULL, 0, '2026-07-24T01:42:08.090Z');
INSERT INTO livros (id, usuario_id, titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, resenha, adaptacao, vi_adaptacao, valor, capa, sinopse, pagina_atual, privado, criado_em) VALUES (309, 1, 'Tempestade de Ônix', 'Rebecca Yarros', 'US', 'Romance', 'Planeta', 2025, 752, 'Kindle', 'lido', 2025, NULL, NULL, 5.0, NULL, 'Livros', 0, 0, 116.62, 'https://is1-ssl.mzstatic.com/image/thumb/Publication221/v4/24/38/73/2438733f-8eb1-53e7-d182-da3f19142dff/1050110509.jpg/512x512bb.jpg', NULL, NULL, 0, '2026-07-24T01:42:08.090Z');
INSERT INTO livros (id, usuario_id, titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, resenha, adaptacao, vi_adaptacao, valor, capa, sinopse, pagina_atual, privado, criado_em) VALUES (310, 1, 'Daisy Jones & The Six', 'Taylor Jenkins Reid', 'US', 'Romance', 'Paralela', 2019, 360, 'Kindle', 'lido', 2025, '2025-01-23', '2025-02-07', 2.0, NULL, 'Livros', 1, 1, 41.81, 'https://is1-ssl.mzstatic.com/image/thumb/Publication113/v4/cd/8e/53/cd8e5342-3760-7e6e-8d92-c0f7c1c37ad7/1028550992.jpg/512x512bb.jpg', NULL, NULL, 0, '2026-07-24T01:42:08.090Z');
INSERT INTO livros (id, usuario_id, titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, resenha, adaptacao, vi_adaptacao, valor, capa, sinopse, pagina_atual, privado, criado_em) VALUES (311, 1, 'A Paciente Silenciosa', 'Alex Michaelides', 'GB', 'Suspense', 'Record', 2019, 350, 'Kindle', 'lido', 2025, '2025-02-07', '2025-02-13', 3.0, NULL, 'Livros', 0, 0, 37.78, 'https://is1-ssl.mzstatic.com/image/thumb/Publication124/v4/28/72/a4/2872a4c6-ae79-63dd-ffc3-8064898ce97e/1028032744.jpg/512x512bb.jpg', NULL, NULL, 0, '2026-07-24T01:42:08.090Z');
INSERT INTO livros (id, usuario_id, titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, resenha, adaptacao, vi_adaptacao, valor, capa, sinopse, pagina_atual, privado, criado_em) VALUES (312, 1, 'Trono de Vidro', 'Sarah J. Mass', 'US', 'Fantasia', 'Galera record', 2013, 392, 'Kindle', 'lido', 2025, '2025-02-14', '2025-02-26', 4.5, NULL, 'Livros', 0, 0, 69.66, 'https://is1-ssl.mzstatic.com/image/thumb/Publication113/v4/5f/1a/8c/5f1a8cc5-96a7-402a-0d76-bf5b22ee2355/1031661836.jpg/512x512bb.jpg', NULL, NULL, 0, '2026-07-24T01:42:08.090Z');
INSERT INTO livros (id, usuario_id, titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, resenha, adaptacao, vi_adaptacao, valor, capa, sinopse, pagina_atual, privado, criado_em) VALUES (313, 1, 'Nunca Minta', 'Freida McFadden', 'US', 'Suspense', 'Arqueiro', 2023, 288, 'Kindle', 'lido', 2025, '2025-02-26', '2025-02-27', 5.0, NULL, 'Livros', 0, 0, 33.85, 'https://is1-ssl.mzstatic.com/image/thumb/Publication211/v4/df/fb/3d/dffb3d3f-4c37-e454-2c5f-77a2efb6b2d2/1051278123.jpg/512x512bb.jpg', NULL, NULL, 0, '2026-07-24T01:42:08.090Z');
INSERT INTO livros (id, usuario_id, titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, resenha, adaptacao, vi_adaptacao, valor, capa, sinopse, pagina_atual, privado, criado_em) VALUES (314, 1, 'Coroa da Meia-Noite', 'Sarah J. Mass', 'US', 'Fantasia', 'Galera record', 2014, 406, 'Kindle', 'lido', 2025, '2025-02-28', '2025-03-14', 4.0, NULL, 'Livros', 0, 0, 77.6, 'https://is1-ssl.mzstatic.com/image/thumb/Publication118/v4/df/a6/89/dfa689af-b917-5f08-69d9-733ea3268138/1022085334.jpg/512x512bb.jpg', NULL, NULL, 0, '2026-07-24T01:42:08.090Z');
INSERT INTO livros (id, usuario_id, titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, resenha, adaptacao, vi_adaptacao, valor, capa, sinopse, pagina_atual, privado, criado_em) VALUES (315, 1, 'Suicidas', 'Raphael Montes', 'BR', 'Suspense', 'Companhia das Letras', 2012, 448, 'Kindle', 'lido', 2025, '2025-03-14', '2025-03-27', 4.0, NULL, 'Livros', 0, 0, 37.47, 'https://is1-ssl.mzstatic.com/image/thumb/Publication118/v4/58/d2/ba/58d2ba3a-17f3-f165-147c-2e1ce8a77255/1020322416.jpg/512x512bb.jpg', NULL, NULL, 0, '2026-07-24T01:42:08.090Z');
INSERT INTO livros (id, usuario_id, titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, resenha, adaptacao, vi_adaptacao, valor, capa, sinopse, pagina_atual, privado, criado_em) VALUES (316, 1, 'Tudo é Rio', 'Carla Madeira', 'BR', 'Romance', 'Record', 2014, 210, 'Kindle', 'lido', 2025, '2025-03-28', '2025-04-02', 4.0, NULL, 'Livros', 0, 0, 38.99, 'https://covers.openlibrary.org/b/id/14631316-L.jpg', NULL, NULL, 0, '2026-07-24T01:42:08.090Z');
INSERT INTO livros (id, usuario_id, titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, resenha, adaptacao, vi_adaptacao, valor, capa, sinopse, pagina_atual, privado, criado_em) VALUES (317, 1, 'A Empregada', 'Freida McFadden', 'US', 'Suspense', 'Arqueiro', 2023, 304, 'Kindle', 'lido', 2025, '2025-04-03', '2025-04-07', 5.0, NULL, 'Livros', 1, 1, 38.32, 'https://is1-ssl.mzstatic.com/image/thumb/Publication211/v4/bb/25/50/bb255085-feeb-60e5-5148-5d1f7bf84ef7/9786555655070.jpg/512x512bb.jpg', NULL, NULL, 0, '2026-07-24T01:42:08.090Z');
INSERT INTO livros (id, usuario_id, titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, resenha, adaptacao, vi_adaptacao, valor, capa, sinopse, pagina_atual, privado, criado_em) VALUES (318, 1, 'Desenhos Ocultos', 'Jason Rekulak', 'US', 'Suspense', 'Intrínseca', 2022, 384, 'Kindle', 'lido', 2025, '2025-06-20', '2025-06-23', 5.0, NULL, 'Livros', 0, 0, 37.6, 'https://is1-ssl.mzstatic.com/image/thumb/Publication126/v4/8f/a1/27/8fa127d8-aaca-df78-32aa-7dede2625a7b/9786555603507.jpg/512x512bb.jpg', NULL, NULL, 0, '2026-07-24T01:42:08.090Z');
INSERT INTO livros (id, usuario_id, titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, resenha, adaptacao, vi_adaptacao, valor, capa, sinopse, pagina_atual, privado, criado_em) VALUES (319, 1, 'Uma Vida Pequena', 'Hanya Yanagihara', 'US', 'Drama', 'Record', 2016, 784, 'Kindle', 'lido', 2025, '2025-05-04', '2025-07-07', 4.5, NULL, 'Livros', 0, 0, 54.07, 'https://is1-ssl.mzstatic.com/image/thumb/Publication125/v4/16/6c/bc/166cbc25-fb41-6c1e-2243-4280aaabdf5e/1034252674.jpg/512x512bb.jpg', NULL, NULL, 0, '2026-07-24T01:42:08.090Z');
INSERT INTO livros (id, usuario_id, titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, resenha, adaptacao, vi_adaptacao, valor, capa, sinopse, pagina_atual, privado, criado_em) VALUES (320, 1, 'O Massacre da Família Hope', 'Riley Sager', 'US', 'Suspense', 'Intrínseca', 2024, 400, 'Kindle', 'lido', 2025, '2025-07-07', '2025-07-26', 4.0, NULL, 'Livros', 0, 0, 48.2, 'https://is1-ssl.mzstatic.com/image/thumb/Publication221/v4/8a/e0/f7/8ae0f7ad-5116-c313-d02b-b6f677167461/9788551009444.jpg/512x512bb.jpg', NULL, NULL, 0, '2026-07-24T01:42:08.090Z');
INSERT INTO livros (id, usuario_id, titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, resenha, adaptacao, vi_adaptacao, valor, capa, sinopse, pagina_atual, privado, criado_em) VALUES (321, 1, 'Os Dois Morrem no Final', 'Adam Silvera', 'US', 'Romance', 'Intrínseca', 2018, 416, 'Kindle', 'lido', 2025, '2025-07-28', '2025-08-06', 4.0, NULL, 'Livros', 0, 0, 40.34, 'https://is1-ssl.mzstatic.com/image/thumb/Publication126/v4/91/f6/15/91f61500-bcb5-71ff-fa24-794c2238ebff/9786555603033.jpg/512x512bb.jpg', NULL, NULL, 0, '2026-07-24T01:42:08.090Z');
INSERT INTO livros (id, usuario_id, titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, resenha, adaptacao, vi_adaptacao, valor, capa, sinopse, pagina_atual, privado, criado_em) VALUES (322, 1, 'Melhor do que nos Filmes', 'Lynn Painter', 'US', 'Romance', 'Intrínseca', 2022, 352, 'Kindle', 'lido', 2025, '2025-08-06', '2025-08-09', 4.5, NULL, 'Livros', 0, 0, 39.7, 'https://is1-ssl.mzstatic.com/image/thumb/Publication211/v4/5a/55/10/5a55107f-18c8-b741-bc9c-4444168896a4/9786555607253.jpg/512x512bb.jpg', NULL, NULL, 0, '2026-07-24T01:42:08.090Z');
INSERT INTO livros (id, usuario_id, titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, resenha, adaptacao, vi_adaptacao, valor, capa, sinopse, pagina_atual, privado, criado_em) VALUES (323, 1, 'Dias Perfeitos', 'Raphael Montes', 'BR', 'Suspense', 'Companhia das Letras', 2014, 280, 'Kindle', 'lido', 2025, '2025-08-12', '2025-08-18', 3.5, NULL, 'Livros', 1, 1, 56.88, 'https://is1-ssl.mzstatic.com/image/thumb/Publication69/v4/d2/93/8b/d2938b0b-0c57-c018-23dd-6f4309487848/1013934771.jpg/512x512bb.jpg', NULL, NULL, 0, '2026-07-24T01:42:08.090Z');
INSERT INTO livros (id, usuario_id, titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, resenha, adaptacao, vi_adaptacao, valor, capa, sinopse, pagina_atual, privado, criado_em) VALUES (324, 1, 'A Lâmina da Assassina', 'Sarah J. Mass', 'US', 'Fantasia', 'Galera record', 2014, 406, 'Kindle', 'lido', 2025, '2025-04-07', '2025-08-29', 4.5, NULL, 'Livros', 0, 0, 69.66, 'https://is1-ssl.mzstatic.com/image/thumb/Publication118/v4/a2/a8/b0/a2a8b03b-46ba-47a1-8d3d-cdf26c62b475/1022095655.jpg/512x512bb.jpg', NULL, NULL, 0, '2026-07-24T01:42:08.090Z');
INSERT INTO livros (id, usuario_id, titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, resenha, adaptacao, vi_adaptacao, valor, capa, sinopse, pagina_atual, privado, criado_em) VALUES (325, 1, 'Nadando no Escuro', 'Tomasz Jedrowski', 'PL', 'Ficção', 'Intrínseca', 2020, 224, 'Kindle', 'lido', 2025, '2025-08-30', '2025-09-11', 3.5, NULL, 'Livros', 0, 0, 30.75, 'https://is1-ssl.mzstatic.com/image/thumb/Publication116/v4/91/81/f7/9181f743-32e2-6608-4af3-5747d691133e/1044260303.jpg/512x512bb.jpg', NULL, NULL, 0, '2026-07-24T01:42:08.090Z');
INSERT INTO livros (id, usuario_id, titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, resenha, adaptacao, vi_adaptacao, valor, capa, sinopse, pagina_atual, privado, criado_em) VALUES (326, 1, 'O Detento', 'Freida McFadden', 'US', 'Suspense', 'Arqueiro', 2024, 320, 'Kindle', 'lido', 2025, '2025-09-11', '2025-09-19', 3.5, NULL, 'Livros', 0, 0, 39.4, 'https://is1-ssl.mzstatic.com/image/thumb/Publication211/v4/4e/ef/3b/4eef3b76-0185-76c8-74d1-b767658a44b5/9786555657340.jpg/512x512bb.jpg', NULL, NULL, 0, '2026-07-24T01:42:08.090Z');
INSERT INTO livros (id, usuario_id, titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, resenha, adaptacao, vi_adaptacao, valor, capa, sinopse, pagina_atual, privado, criado_em) VALUES (327, 1, 'Tudo que Deixamos Inacabado', 'Rebecca Yarros', 'US', 'Romance', 'Planeta', 2023, 448, 'Kindle', 'lido', 2025, NULL, NULL, 5.0, NULL, 'Livros', 0, 0, 49.03, 'https://is1-ssl.mzstatic.com/image/thumb/Publication122/v4/e9/a7/43/e9a7435b-f7b1-bd15-af6f-c872c8f4cf62/9786555656213.jpg/512x512bb.jpg', NULL, NULL, 0, '2026-07-24T01:42:08.090Z');
INSERT INTO livros (id, usuario_id, titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, resenha, adaptacao, vi_adaptacao, valor, capa, sinopse, pagina_atual, privado, criado_em) VALUES (328, 1, 'O Vilarejo', 'Raphael Montes', 'BR', 'Suspense', 'Companhia das Letras', 2015, 96, 'Kindle', 'lido', 2025, '2025-10-19', '2025-10-20', 5.0, NULL, 'Livros', 0, 0, 36.19, 'https://covers.openlibrary.org/b/id/10839239-M.jpg', NULL, NULL, 0, '2026-07-24T01:42:08.090Z');
INSERT INTO livros (id, usuario_id, titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, resenha, adaptacao, vi_adaptacao, valor, capa, sinopse, pagina_atual, privado, criado_em) VALUES (329, 1, 'Herdeira do Fogo', 'Sarah J. Mass', 'US', 'Fantasia', 'Galera Record', 2014, 518, 'Kindle', 'lido', 2025, NULL, NULL, 5.0, NULL, 'Livros', 0, 0, 104.54, 'https://is1-ssl.mzstatic.com/image/thumb/Publication118/v4/28/bf/96/28bf9686-bdcf-406f-f096-3d40cac3cb49/1022079493.jpg/512x512bb.jpg', NULL, NULL, 0, '2026-07-24T01:42:08.090Z');
INSERT INTO livros (id, usuario_id, titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, resenha, adaptacao, vi_adaptacao, valor, capa, sinopse, pagina_atual, privado, criado_em) VALUES (330, 1, 'Com Amor, Mamãe', 'Iliana Xander', 'US', 'Suspense', 'Intrínseca', 2025, 336, 'Kindle', 'lido', 2025, NULL, NULL, 3.5, NULL, 'Livros', 0, 0, 41.01, 'https://is1-ssl.mzstatic.com/image/thumb/Publication221/v4/0f/78/94/0f78949b-0887-a56c-bb8d-cf3dc0a4601a/9788551011775.jpg/512x512bb.jpg', NULL, NULL, 0, '2026-07-24T01:42:08.090Z');
INSERT INTO livros (id, usuario_id, titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, resenha, adaptacao, vi_adaptacao, valor, capa, sinopse, pagina_atual, privado, criado_em) VALUES (331, 1, 'Como Arruinar um Casamento', 'Alison Espach', 'US', 'Romance', 'Harlequin Brasil', 2025, 368, 'Kindle', 'lido', 2025, NULL, NULL, 2.5, NULL, 'Livros', 0, 0, 35.67, 'https://is1-ssl.mzstatic.com/image/thumb/Publication211/v4/27/1b/c8/271bc8e4-ee02-5741-866b-34eaf6a430ac/1056870528.jpg/512x512bb.jpg', NULL, NULL, 0, '2026-07-24T01:42:08.090Z');
INSERT INTO livros (id, usuario_id, titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, resenha, adaptacao, vi_adaptacao, valor, capa, sinopse, pagina_atual, privado, criado_em) VALUES (332, 1, 'Rainha das Sombras', 'Sarah J. Mass', 'US', 'Fantasia', 'Galera Record', 2015, 644, 'Kindle', 'lido', 2026, '2025-12-05', '2026-01-26', 5.0, NULL, 'Livros', 0, 0, 104.54, 'https://is1-ssl.mzstatic.com/image/thumb/Publication128/v4/33/62/ac/3362ac3a-9cee-2284-4b85-231c2aa79d3f/1022060725.jpg/512x512bb.jpg', NULL, NULL, 0, '2026-07-24T01:42:08.090Z');
INSERT INTO livros (id, usuario_id, titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, resenha, adaptacao, vi_adaptacao, valor, capa, sinopse, pagina_atual, privado, criado_em) VALUES (333, 1, 'Layla', 'Colleen Hoover', 'US', 'Suspense', 'Galera Record', 2021, 304, 'Kindle', 'lido', 2026, '2026-01-27', '2026-02-06', 2.0, NULL, 'Livros', 0, 0, 31.54, 'https://is1-ssl.mzstatic.com/image/thumb/Publication124/v4/87/a3/20/87a32054-1858-b7ab-ea7c-1e7454bbe61a/1033612035.jpg/512x512bb.jpg', NULL, NULL, 0, '2026-07-24T01:42:08.090Z');
INSERT INTO livros (id, usuario_id, titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, resenha, adaptacao, vi_adaptacao, valor, capa, sinopse, pagina_atual, privado, criado_em) VALUES (334, 1, 'Pinóquio', 'Lily Murray', 'GB', 'Infantil', 'Universo dos Livros', 2022, 80, 'Kindle', 'lido', 2026, '2026-02-03', '2026-02-03', 5.0, NULL, 'Livros', 1, 0, 45.45, 'https://is1-ssl.mzstatic.com/image/thumb/Publication122/v4/f1/33/ba/f133ba0b-f773-059e-4d27-60536a5aa5c9/2918ef77-77b9-43a0-9d1f-d2f2271dd2f1_cover_image.jpg/512x512bb.jpg', NULL, NULL, 0, '2026-07-24T01:42:08.090Z');
INSERT INTO livros (id, usuario_id, titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, resenha, adaptacao, vi_adaptacao, valor, capa, sinopse, pagina_atual, privado, criado_em) VALUES (335, 1, 'O Peso do Pássaro Morto', 'Aline Bei', 'BR', 'Romance', 'Nós', 2017, 168, 'Kindle', 'lido', 2026, '2026-02-16', '2026-02-17', 5.0, 'Solidão', 'Eu li **O peso do pássaro morto**, da **Aline Bei**, e achei um livro muito forte, principalmente nos primeiros capítulos. Me deixou intrigada e curiosa desde o começo, e gostei muito da escrita da autora — é uma escrita fluida, direta, que faz a gente querer continuar lendo sem parar. É aquele tipo de livro que você lê rápido, mas que fica na cabeça depois.

A história acompanha a vida de uma mulher desde os 8 anos até a morte, e é uma vida muito triste, cheia de dificuldades. Logo criança ela já passa por perdas importantes, como a morte de uma amiga da escola e de um vizinho que era benzedeiro. Na adolescência, com 17 anos, acontece um episódio impulsivo que acaba levando a uma situação de violência, e ela engravida. A partir daí, a relação com o filho é muito complicada, porque ele é a cara do homem que abusou dela. Então ela não consegue desenvolver um amor materno, sente desconforto com a presença dele e passa a vida inteira meio afastada emocionalmente. Quando ele vai para a faculdade e se muda, ela até sente um certo alívio, e eles acabam perdendo contato.

Mais tarde, ela encontra um cachorro, e isso muda completamente a vida dela. O cachorro traz alegria, companhia e um amor que ela nunca tinha sentido antes. Dá a impressão de que é o tipo de afeto que ela gostaria de ter conseguido sentir pelo filho, mas não conseguiu. Esse período é praticamente o único momento em que ela parece realmente feliz — ela dança, escuta música, gosta da casa onde mora, se sente livre.

Só que tudo desmorona quando o cachorro é atropelado na frente dela. A partir daí, ela entra num estado de tristeza profunda, para de se cuidar, não sai de casa, não come direito, até que morre. Fica muito a sensação de que os poucos anos felizes da vida dela estavam ligados ao cachorro, e quando ele morre, acaba também o motivo dela continuar vivendo.

Depois da morte, a polícia chama o filho, e ele vai ao túmulo. Lá tem um homem deixando um buquê, que aparentemente conhece a história, chama ele pelo nome, e o livro termina assim, meio aberto, sem explicar quem é. Achei um final curioso, com uma sensação de mistério e de coisas não resolvidas.

No geral, é um livro pesado emocionalmente, mas muito bem escrito e fácil de ler. É triste do começo ao fim, mas ao mesmo tempo sensível, e faz pensar bastante sobre trauma, solidão e as relações que a gente consegue — ou não consegue — construir ao longo da vida.', 0, 0, 64.0, 'https://is1-ssl.mzstatic.com/image/thumb/Publication211/v4/b3/bf/bb/b3bfbb5f-b828-62e0-e678-7f9202f92311/1056618307.jpg/512x512bb.jpg', NULL, NULL, 0, '2026-07-24T01:42:08.090Z');
INSERT INTO livros (id, usuario_id, titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, resenha, adaptacao, vi_adaptacao, valor, capa, sinopse, pagina_atual, privado, criado_em) VALUES (336, 1, 'Casas Estranhas', 'Uketsu', 'JP', 'Suspense', 'Intrínseca', 2025, 240, 'Kindle', 'lido', 2026, '2026-02-17', '2026-02-23', 1.5, 'Confuso', 'Eu li **Casas estranhas**, do **Uketsu**, e achei que o livro tem uma ideia bem legal, principalmente essa questão das plantas das casas. É um jeito diferente de apresentar o mistério pro leitor, porque a gente vai analisando os desenhos junto com os personagens, tentando entender o que está errado ali. As imagens deixam a leitura mais descontraída e menos pesada, e como é um livro curto, dá pra ler rápido.

Mas, ao mesmo tempo, eu tive muita dificuldade de entender a história. Confundi bastante os nomes e quem era quem, e aquela parte em formato de entrevista também me deixou meio perdida, porque é um estilo diferente. No geral, senti que o livro é cheio de mistérios, só que as respostas aparecem todas de uma vez no final, muito juntas e compactadas, principalmente naquela última carta. Então parece que passa o livro inteiro criando perguntas e, de repente, resolve tudo rápido demais.

Uma coisa que eu não entendi direito foi a questão da criança do ritual da mão esquerda — de onde surgiu essa criança, por que existia esse ritual, como aquilo funcionava. Eu entendi que era um ritual, mas não consegui ligar bem os pontos. Fiquei com a sensação de que talvez eu tenha lido rápido demais e não consegui acompanhar todos os detalhes, mas também não tentei reler pra confirmar isso.

No fim, minha impressão foi que a ideia do livro é muito boa e tem bastante potencial, só que a execução acabou me confundindo. Mesmo assim, tenho curiosidade de ler outro livro do autor pra ver se é uma questão minha com essa história específica ou com a escrita dele mesmo.

**Uma palavra:** Confuso.', 1, 0, 25.18, 'https://is1-ssl.mzstatic.com/image/thumb/Publication211/v4/f7/7e/ea/f77eeadb-0830-7c69-4fcb-79120ebe8525/9788551013090.jpg/512x512bb.jpg', NULL, NULL, 0, '2026-07-24T01:42:08.090Z');
INSERT INTO livros (id, usuario_id, titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, resenha, adaptacao, vi_adaptacao, valor, capa, sinopse, pagina_atual, privado, criado_em) VALUES (337, 1, 'Academia dos Casos Arquivados', 'Jennifer Lynn Barnes', 'US', 'Suspense', 'Alt', 2024, 264, 'Kindle', 'lido', 2026, '2026-02-23', '2026-02-26', 4.0, 'Intrigante', 'Eu li **A Academia dos Casos Arquivados**, da **Jennifer Lynn Barnes**, e é um livro que gira muito mais em torno de mistério e investigação do que romance. Apesar de estar dentro do gênero romance, pelo menos nesse primeiro livro quase não tem foco nisso. Tem algumas interações, claro, mas a história é realmente voltada para resolver um mistério.

Como é uma trilogia, esse primeiro livro funciona meio como um quebra-cabeça: você encontra algumas peças, entende partes importantes, mas não resolve tudo completamente. Isso deixa várias pontas em aberto para os próximos livros.

A história acompanha a Cassie, que é chamada para fazer parte de um grupo do FBI conhecido como “Os Naturais”. São adolescentes com habilidades específicas para ajudar a resolver casos arquivados — não são casos ativos, mas investigações antigas que podem ser reabertas com uma nova perspectiva. A Cassie é perfiladora, ou seja, consegue analisar o comportamento de criminosos e traçar perfis psicológicos.

O grande mistério envolve o assassinato da mãe dela. Quando criança, Cassie encontrou a mãe em um local com muito sangue, mas o corpo nunca foi achado. Então, existe a suposição de que ela foi assassinada pela quantidade de sangue, mas nunca houve confirmação. A grande busca da protagonista é justamente pelo corpo e pelo assassino.

Ao longo da investigação, eles chegam perto de uma suspeita que é um grande plot do livro: uma agente do FBI que, na verdade, é tia da Cassie e irmã da mãe dela. Ela tinha problemas familiares antigos e cometeu outros assassinatos, mas afirma que quando encontrou a irmã, ela já estava morta — ou seja, não seria a assassina da mãe da Cassie. O choque maior é descobrir que existe uma assassina dentro da própria polícia, o que muda completamente a perspectiva da história.

Eu achei o livro muito bom, com uma leitura fácil e envolvente. É aquele tipo de história que te prende e faz querer continuar para entender todas as peças do quebra-cabeça. Fiquei bem ansiosa para ler os próximos livros e finalmente descobrir toda a verdade.

**Uma palavra:** Intrigante.', 0, 0, 44.04, 'https://is1-ssl.mzstatic.com/image/thumb/Publication112/v4/0e/a5/6a/0ea56a58-b088-bd34-a7a2-972bef956f47/3e0765c9-e641-4965-a5c0-f18ec33de576_cover_image.jpg/512x512bb.jpg', NULL, NULL, 0, '2026-07-24T01:42:08.090Z');
INSERT INTO livros (id, usuario_id, titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, resenha, adaptacao, vi_adaptacao, valor, capa, sinopse, pagina_atual, privado, criado_em) VALUES (338, 1, 'Táticas do Amor', 'Sarah Adams', 'US', 'Romance', 'Intrínseca', 2023, 304, 'Kindle', 'lido', 2026, '2025-12-31', '2026-02-27', 2.5, 'Previsível', 'Eu li **Táticas do amor**, da **Sarah Adams**, e é um livro que retrata a relação do Nathan e da Brie, que são melhores amigos, mas claramente escondem uma paixão muito grande um pelo outro. Eles têm uma amizade muito forte, só que morrem de medo de estragar isso, então guardam o que sentem só pra eles, cada um no seu próprio pensamento.

Em determinado momento da história, eles precisam fingir um namoro para engajar as redes sociais dele e ajudar na carreira. A partir daí, o que já era óbvio vai ficando cada vez mais evidente: o sentimento é totalmente recíproco. Aos poucos, eles vão se abrindo mais, conversando sobre o que sentem e deixando de esconder essa paixão.

No final, tem a competição de futebol, o time do Nathan perde, mas mesmo assim ele pede a Brie em casamento, e o livro termina com eles se casando e felizes.

Eu achei que as coisas acontecem muito rápido. Mesmo sendo um sentimento que estava guardado há muito tempo, quando finalmente começa, evolui depressa demais. Eles praticamente já casam sem realmente mostrar como é a dinâmica deles dentro de um relacionamento amoroso de fato. Fiquei com a sensação de que faltou desenvolver melhor essa fase.

No geral, não foi um livro que me cativou muito. Achei bem “café com leite”, previsível — desde o começo eu já sabia exatamente o que ia acontecer no final. Mas, ao mesmo tempo, é uma história leve, tranquila, boa pra ler quando você quer algo sem muito peso ou complexidade. É aquele tipo de romance confortável.

**Uma palavra:** Previsível.', 0, 0, 37.66, 'https://is1-ssl.mzstatic.com/image/thumb/Publication221/v4/ba/be/bf/babebf98-c8d0-3764-ba82-6935f733ec0a/9788551012543.jpg/512x512bb.jpg', NULL, NULL, 0, '2026-07-24T01:42:08.090Z');
INSERT INTO livros (id, usuario_id, titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, resenha, adaptacao, vi_adaptacao, valor, capa, sinopse, pagina_atual, privado, criado_em) VALUES (339, 1, 'A Vegetariana', 'Han Kang', 'KR', 'Ficção', 'Todavia', 2018, 176, 'Kindle', 'lido', 2026, '2026-03-30', '2026-04-03', 4.0, NULL, 'Livros', 1, 0, 55.32, 'https://is1-ssl.mzstatic.com/image/thumb/Publication221/v4/ad/7e/05/ad7e051b-fe52-b52b-5250-d33ccc97c831/1026690360.jpg/512x512bb.jpg', NULL, NULL, 0, '2026-07-24T01:42:08.090Z');
INSERT INTO livros (id, usuario_id, titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, resenha, adaptacao, vi_adaptacao, valor, capa, sinopse, pagina_atual, privado, criado_em) VALUES (340, 1, 'O Meu Pé de Laranja Lima', 'José Mauro de Vasconcelos', 'BR', 'Ficção', 'Melhoramentos', 1968, 224, 'Kindle', 'lido', 2026, '2026-04-03', '2026-04-13', 4.5, 'Intenso', 'Eu li **O Meu Pé de Laranja Lima**, do **José Mauro de Vasconcelos**, e é um livro que me trouxe muitas sensações diferentes — e eu gosto muito disso. Pra mim, quando um livro faz a gente sentir alguma coisa, independente do que seja, é porque o autor realmente sabe escrever, e aqui ele sabe muito bem.

A história conta a vida do Zezé, um menino de quase 6 anos, cheio de sonhos, vontades e imaginação, mas que vive em uma realidade muito difícil. Ele é de uma família muito pobre, com vários irmãos, e não recebe muita atenção dos pais. Como ele é arteiro, acaba apanhando bastante — não só dos pais, mas dos irmãos, vizinhos, de todo mundo que acha que pode bater nele. Isso já deixa a história bem pesada, porque é uma criança muito pequena passando por muita coisa.

Quando eles se mudam de casa, o Zezé encontra o pé de laranja lima, que vira praticamente um amigo pra ele. Ele chama de Minguinho, conversa, confia, e cria um vínculo muito bonito ali. É como se fosse um refúgio pra ele em meio a tudo que ele vive.

Ao mesmo tempo, ele tenta ajudar a família, quer ganhar dinheiro, e passa por situações muito tristes, como um Natal em que não ganha nada. A gente vê muito claramente a pobreza e a dificuldade da vida dele.

Em um momento, ele conhece um português (o Portuga), mas no começo a relação é ruim — o Zezé mexe no carro dele, o português se irrita e bate nele. O Zezé fica com tanta raiva que promete que vai matar ele quando crescer. Só que, com o tempo, eles começam a se aproximar, viram amigos, e essa relação se transforma completamente.

O Portuga passa a tratar o Zezé com carinho, atenção, leva ele pra passear, compra coisas, mas mais do que isso, ele dá amor, dá ternura — algo que o Zezé nunca teve de verdade. Tem um momento muito marcante em que o Zezé fala que queria que ele fosse o pai dele, e o português aceita isso de certa forma. É uma relação muito bonita.

Mas o livro quebra completamente quando o português morre em um acidente de trem. O Zezé sente isso antes mesmo de confirmarem, passa muito mal, fica doente, sem conseguir comer, como se tivesse perdido tudo. Justo quando ele encontra alguém que dá amor de verdade, ele perde essa pessoa.

Ao mesmo tempo, tem a questão do pé de laranja lima, que quase é cortado, e depois dá uma flor, que eu entendi como um tipo de despedida também. No final, mesmo com algumas coisas melhorando na vida dele — como o pai arrumando emprego —, a dor da perda continua muito forte.

E ainda tem a carta no final, quando o Zezé já é adulto, mostrando que ele nunca esqueceu o português, que aquilo marcou ele pra sempre. Dá muito a sensação de que ele foi obrigado a crescer rápido demais, a aprender coisas muito pesadas muito cedo.

É um livro que me fez sentir de tudo: eu ri, chorei, fiquei com dó, com raiva… então, pra mim, isso prova que é um livro muito bom mesmo.

**Uma palavra:** Intenso.', 1, 1, 24.26, 'https://is1-ssl.mzstatic.com/image/thumb/Publication123/v4/a6/cc/e1/a6cce1e8-b797-6384-aa0c-5454d099a258/1010982120.jpg/512x512bb.jpg', NULL, NULL, 0, '2026-07-24T01:42:08.090Z');
INSERT INTO livros (id, usuario_id, titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, resenha, adaptacao, vi_adaptacao, valor, capa, sinopse, pagina_atual, privado, criado_em) VALUES (341, 1, 'Uma Família Feliz', 'Raphael Montes', 'BR', 'Suspense', 'Companhia das Letras', 2024, 352, 'Kindle', 'lido', 2026, '2026-04-13', '2026-04-28', 4.5, 'Surpreendente', 'Eu li **Uma Família Feliz**, do **Raphael Montes**, e é um livro que me prendeu do começo ao fim. Já começa com o que seria o final, então você fica muito curiosa pra entender como a história chegou até ali.

Ao longo do livro, que é um suspense, você desconfia de todo mundo. Tem momentos em que parece óbvio demais quem é o culpado, e você acha que já entendeu tudo antes da protagonista. Só que aí ela vai descobrindo as coisas junto com você, e quando você acha que acertou, vem o autor e prova que você estava errada. Dá até aquela sensação de “me senti uma palhaça”, porque você tinha certeza e não era nada disso. Pra mim, quando o autor consegue fazer isso — te convencer de algo e depois virar completamente o jogo — é porque ele é muito bom, e o Raphael Montes faz isso muito bem.

A história gira em torno de uma família composta por pai, mãe, duas filhas (que não são biológicas da mãe) e um filho. Ao longo do livro, começam a acontecer agressões com as crianças, o que deixa todo mundo em alerta e gera muita desconfiança dentro da própria família. Em certo ponto, a suspeita cai sobre a mãe, e a trama inteira fica nesse clima de tensão, tentando descobrir quem é o responsável por esses ataques.

O final é surpreendente. Mesmo a gente já tendo visto uma parte lá no começo, o caminho até chegar nele é muito bem construído e te pega de surpresa. Ainda assim, senti que algumas coisas ficaram meio sem explicação. Por exemplo, uma das crianças em um momento diz que foi a mãe que agrediu, mas depois isso não é aprofundado — não fica claro se foi medo, influência de alguém ou outra coisa. Também fiquei com dúvida sobre o que acontece depois, principalmente em relação ao filho do casal, se aquele “sacrifício” no final teve consequência ou não. Eu gostaria de ter visto um pouco mais desse “pós”.

Mesmo com essas pontas soltas, achei um livro muito bom, realmente envolvente e que te prende o tempo todo. Não dou nota máxima por essas coisas que ficaram sem explicação, mas ainda assim é um suspense muito bem feito.

**Uma palavra:** Surpreendente.', 1, 1, 41.09, 'https://is1-ssl.mzstatic.com/image/thumb/Publication116/v4/cb/ed/dc/cbeddc9b-11ed-413b-794c-77d371ad6059/1043350865.jpg/512x512bb.jpg', NULL, NULL, 0, '2026-07-24T01:42:08.090Z');
INSERT INTO livros (id, usuario_id, titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, resenha, adaptacao, vi_adaptacao, valor, capa, sinopse, pagina_atual, privado, criado_em) VALUES (342, 1, 'Uma Mulher no Escuro', 'Raphael Montes', 'BR', 'Suspense', 'Companhia das Letras', 2019, 256, 'Kindle', 'lido', 2026, '2026-04-29', '2026-05-01', 4.0, 'Perturbador', 'Eu li **Uma Mulher no Escuro**, do **Raphael Montes**, e é um livro muito forte de ler. Ele aborda temas extremamente sensíveis, principalmente abuso infantil, de uma forma bem explícita. Pra quem é sensível com esse assunto, é um livro que causa muito desconforto — eu mesma fiquei bem incomodada em vários momentos, chegou a me dar até um certo enjoo.

Mas, ao mesmo tempo, eu penso que, se um livro consegue causar esse tipo de sensação, é porque ele é muito bem construído. O autor consegue fazer você entrar na história, entender o contexto e sentir tudo junto com os personagens. Mesmo sendo uma história fictícia, você cria empatia, e isso mostra o quanto a escrita é forte.

A história gira em torno de um crime que aconteceu quando a protagonista tinha 4 anos, cometido por um jovem de 17. Vinte anos depois, a narrativa acompanha o presente, tentando entender o que realmente aconteceu: quem era o assassino, por que ele fez aquilo, onde ele está, e por que a protagonista sobreviveu. Ao longo do livro, vão surgindo várias reviravoltas.

Uma das principais é descobrir que o próprio assassino também era vítima — ele sofria abuso, assim como outras crianças. Durante muito tempo, acusaram a pessoa errada, que também era uma vítima. Depois, a história fica ainda mais pesada quando a protagonista descobre que os próprios pais estavam envolvidos nesses abusos, o que explica muita coisa, mas também torna tudo muito mais difícil de digerir.

No final, tem mais um plot forte: o assassino era alguém muito próximo dela, e o psiquiatra dela também tinha ligação com tudo isso. Os dois carregavam traumas profundos da infância, e isso influenciou completamente o comportamento deles na vida adulta. Isso mostra como essas violências deixam marcas muito sérias.

É um livro que causa muito desconforto, mas justamente por isso também mostra a força da narrativa. Não é uma leitura leve, nem fácil, mas é muito impactante e bem construída.

**Uma palavra:** Perturbador.', 0, 0, 44.98, 'https://covers.openlibrary.org/b/id/10833536-L.jpg', NULL, NULL, 0, '2026-07-24T01:42:08.090Z');
INSERT INTO livros (id, usuario_id, titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, resenha, adaptacao, vi_adaptacao, valor, capa, sinopse, pagina_atual, privado, criado_em) VALUES (343, 1, 'A Morte de Ivan Ilitch', 'Lev Tolstói', 'RU', 'Ficção', '34', 1886, 96, 'Kindle', 'lido', 2026, '2026-05-11', '2026-05-16', 3.5, 'Reflexivo', 'Eu li **A Morte de Ivan Ilitch**, do **Leo Tolstoy**, e achei um livro muito reflexivo e pesado emocionalmente. Ele mostra muito bem o processo da morte e o que acontece quando uma pessoa vai ficando dependente dos outros aos poucos. O mais triste é que o Ivan Ilitch está consciente de tudo isso — ele percebe as pessoas se afastando, percebe que virou um peso para os familiares, e isso deixa tudo ainda mais doloroso.

O livro também mostra que, antes da doença, ele já não vivia uma vida realmente feliz. Ele tinha um casamento ruim, com uma pessoa que não fazia bem pra ele e que ele nem amava de verdade. Então, durante o processo de morte, fica muito forte essa sensação de que ele não aproveitou a vida como poderia.

Pra mim, como estudante de enfermagem, foi um livro que me fez pensar muito sobre o sofrimento de quem está doente, principalmente quando falta apoio emocional da família. A sensação de abandono e de ser um fardo piora tudo. Ao mesmo tempo em que ele quer que o sofrimento acabe logo, ele também tem muito medo da morte. Então existe uma guerra interna muito real: querer descansar, mas ter medo do que vem depois.

Eu acho que a maior reflexão do livro é justamente essa ideia de que a vida é curta e imprevisível. No caso dele, foi uma doença, mas poderia ser qualquer outra coisa. Então o livro faz pensar que as pessoas precisam viver da melhor forma possível, fazer o que querem, buscar felicidade e não deixar tudo para depois, porque em algum momento pode não existir mais tempo.

É um livro muito humano, muito real e que faz a gente pensar bastante sobre vida, morte e arrependimentos.

**Uma palavra:** Reflexivo.', 1, 0, 41.3, 'https://is1-ssl.mzstatic.com/image/thumb/Publication114/v4/61/82/84/61828450-9d5c-8a7a-3e9a-45382014836c/9789896605582_a_morte_de_ivan_ilitch.jpg/512x512bb.jpg', NULL, NULL, 0, '2026-07-24T01:42:08.090Z');
INSERT INTO livros (id, usuario_id, titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, resenha, adaptacao, vi_adaptacao, valor, capa, sinopse, pagina_atual, privado, criado_em) VALUES (344, 1, 'A Última Festa', 'Lucy Foley', 'GB', 'Suspense', 'Intrínseca', 2019, 304, 'Kindle', 'lido', 2026, '2026-05-31', '2026-06-02', 3.5, 'Enigmático', 'Eu li **A Última Festa**, da **Lucy Foley**, e achei um livro bem confuso no começo. A principal dificuldade pra mim foi que cada capítulo é narrado por um personagem diferente. Além disso, a história acontece em vários momentos diferentes no tempo, então a cronologia não é linear. Mesmo com as datas aparecendo, eu precisei prestar muita atenção para entender quem estava narrando e em qual período da história aquilo acontecia. Sinceramente, até mais ou menos metade do livro eu ainda estava tentando entender quem era quem.

A história acompanha um grupo de amigos que viaja para passar o Ano-Novo em um chalé isolado. Logo no início, a gente descobre que aconteceu um assassinato, mas o livro não revela nem quem morreu nem quem matou. A partir daí, a trama vai mostrando diferentes pontos de vista e voltando ao passado para explicar como aquelas pessoas se conheceram, quais conflitos existiam entre elas e como tudo caminhou para aquele crime.

Entre os personagens, a Miranda acabou sendo uma das figuras que mais me marcou. Ela é uma mulher muito bonita, muito chamativa e que gosta de ser o centro das atenções. Tem aquela personalidade de quem precisa sempre ser a mais admirada, a mais interessante e a mais importante do grupo. Ao longo da história, várias situações envolvendo traições, ressentimentos e rivalidades vão sendo reveladas, e isso vai aumentando a tensão entre os personagens.

O mistério é bem construído porque você passa boa parte do livro tentando descobrir quem morreu e quem matou. E, mesmo quando acha que entendeu o que está acontecendo, ainda faltam muitas peças para encaixar. O desfecho acaba revelando que o assassinato aconteceu por causa de uma série de conflitos acumulados, e eu achei difícil acertar o culpado antes da revelação.

Apesar da confusão inicial, quando eu finalmente consegui entender quem eram os personagens e qual era a função de cada um na história, a leitura ficou muito mais interessante. Pra mim, isso aconteceu lá pelos 60% ou 65% do livro. Foi só nesse ponto que eu realmente me envolvi com a trama e comecei a querer descobrir o final.

No geral, achei um livro que exige atenção e paciência no começo, mas que recompensa o leitor com um mistério interessante e um final difícil de prever.

**Uma palavra:** Enigmático.', 0, 0, 127.6, 'https://is1-ssl.mzstatic.com/image/thumb/Publication211/v4/c5/ae/3a/c5ae3a33-af8c-73d3-c351-e9e954a98767/9788551005736.jpg/512x512bb.jpg', NULL, NULL, 0, '2026-07-24T01:42:08.090Z');
INSERT INTO livros (id, usuario_id, titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, resenha, adaptacao, vi_adaptacao, valor, capa, sinopse, pagina_atual, privado, criado_em) VALUES (345, 1, 'Relatos de Um Gato Viajante', 'Hiro Arikawa', 'JP', 'Ficção', 'Alfaguara', 2017, 288, 'Kindle', 'lido', 2026, '2026-06-11', '2026-06-22', 5.0, 'Amor', 'Eu li **Relato de um Gato Viajante**, da **Hiro Arikawa**, e achei um livro simplesmente incrível. Uma das coisas que mais me surpreendeu desde o começo foi o fato de a história ser narrada por um gato. Mas não é um gato humanizado, que fala com pessoas ou age como um ser humano. Pelo contrário: ele pensa como um gato, age como um gato e vê o mundo como um gato. Isso faz com que a narrativa fique muito especial, porque parece que a gente realmente está dentro da cabeça dele. Eu achei isso genial.

Desde o início, eu comecei a torcer para que tudo desse certo na vida do Nana e do Satoru. A relação dos dois é muito bonita e, para quem tem ou já teve gato, ela faz muito sentido. O amor de um gato não é algo automático. Não é só pegar o animal e pronto. É uma construção diária, um processo de confiança. E o jeito que o Nana ama o Satoru mostra exatamente isso.

A história começa quando Nana ainda era um gato de rua. Ele vivia lutando por comida e dormia em uma van prata. Essa van pertencia ao Satoru, que começou a deixar comida para ele todos os dias. Aos poucos, eles foram se aproximando. Depois de um acidente em que o gato é atropelado, o Satoru o leva para casa, dá um nome a ele e pergunta se ele quer ficar. Como todo gato, Nana faz do seu próprio jeito: vai embora, pensa um pouco e depois volta, deixando claro que escolheu ficar.

Os dois vivem juntos por cinco anos até que, de repente, Satoru começa uma viagem pelo Japão tentando encontrar alguém para cuidar de Nana. Durante essa jornada, eles visitam amigos de infância e pessoas importantes da vida dele. Cada parada revela uma parte da história do Satoru, das amizades que construiu e das experiências que viveu. São esses os "relatos" do gato: as lembranças, os encontros e as reflexões que surgem durante a viagem.

O que torna tudo ainda mais emocionante é descobrir que Satoru está doente e tem pouco tempo de vida por causa de um tumor. Na verdade, toda a viagem acontece porque ele quer garantir que Nana fique com alguém que possa cuidar dele quando ele não estiver mais ali. E, ao mesmo tempo, a gente percebe que ele também está se despedindo das pessoas importantes da vida dele da maneira que gostaria: sem transformar tudo em uma despedida explícita.

O final me destruiu completamente. Satoru morre com Nana ao seu lado, e toda a construção da história faz esse momento ser ainda mais doloroso. Mas, ao mesmo tempo, é um final muito bonito. Depois, o livro mostra que Satoru continua esperando por Nana, mas Nana ainda não está pronto para partir. Ele decide ficar porque precisa cumprir uma última missão: ajudar a cuidar e ensinar uma nova gatinha que foi resgatada pela tia de Satoru, que agora cuida dele. Só depois disso, quando seus relatos terminarem, ele estará pronto para reencontrar o dono.

É um livro cheio de reflexões sobre amizade, amor, despedidas, luto e sobre como algumas pessoas mudam completamente a nossa vida. Eu ri, chorei, senti saudade e terminei a leitura completamente emocionada. Para quem gosta de gatos, a experiência é ainda mais forte, porque a relação entre Nana e Satoru parece muito real.

Foi um dos meus livros favoritos. Eu dei 5 estrelas sem pensar duas vezes. E, sinceramente, se existissem 6 estrelas, eu daria 6. Se existissem 7, eu daria 7 também.

**Uma palavra:** Amor. ❤️', 1, 0, 47.18, 'https://is1-ssl.mzstatic.com/image/thumb/Publication128/v4/c6/47/58/c64758af-ada3-d8b9-afe6-e193e408c5df/1020040927.jpg/512x512bb.jpg', NULL, NULL, 0, '2026-07-24T01:42:08.090Z');
INSERT INTO livros (id, usuario_id, titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, resenha, adaptacao, vi_adaptacao, valor, capa, sinopse, pagina_atual, privado, criado_em) VALUES (346, 1, 'Menina Má', 'William March', 'US', 'Suspense', 'DarkSide', 1954, 272, 'Kindle', 'lido', 2026, '2026-07-02', '2026-07-04', 3.0, 'Macabro', 'Eu li **Menina Má**, do **William March**, e achei um livro legal. É uma leitura rápida, que prende bastante, principalmente porque a história gira em torno de uma criança completamente diferente do que a gente espera.

A protagonista é a Rhoda, que por fora parece uma menina comum, educada e exemplar, mas, na verdade, tem um jeito extremamente egoísta e maldoso. Conforme a história avança, ela mesma deixa claro que machuca e mata as pessoas simplesmente para conseguir o que quer. Antes mesmo dos acontecimentos principais do livro, ela já havia matado uma senhora porque queria um colar que seria deixado para ela apenas quando a mulher morresse. Então ela resolveu adiantar isso. Depois, acontece o caso do menino da escola, que é o grande mistério da história. Ele ganha uma medalha que a Rhoda queria, não aceita entregar para ela, e acaba sendo assassinado.

O suspense do livro gira em torno desse crime, mas eu gostei porque o foco não é exatamente descobrir quem matou. Em nenhum momento o livro tenta fazer o leitor duvidar da culpa da Rhoda. Pelo contrário, praticamente desde o começo fica claro que foi ela. O interessante é acompanhar a mãe dela percebendo isso aos poucos. Não é como se ela simplesmente fingisse que não estava vendo; ela vai juntando os acontecimentos, desconfiando, ligando os pontos e entendendo quem a filha realmente é.

Ao longo da história, outras pessoas que de alguma forma atrapalham a Rhoda também acabam morrendo. Tem o zelador Leroy, por exemplo, que começa a desconfiar dela. Mesmo sem provas, ele acredita que ela matou o menino. Então a Rhoda o prende em um galpão e coloca fogo no lugar, matando ele também. A impressão que fica é que qualquer pessoa que represente um obstáculo para ela ou faça algo que ela não goste acaba virando uma vítima.

Enquanto isso, a mãe vai ficando cada vez mais desesperada. Ela também descobre que foi adotada e que sua mãe biológica era uma assassina em série. A partir daí, começa a acreditar que a maldade da Rhoda seria uma herança genética, como se ela tivesse passado essa "semente do mal" para a filha. Essa culpa consome completamente a personagem.

No final, ela decide acabar com o sofrimento das duas. Dá vários comprimidos para a Rhoda dormir e depois tira a própria vida, acreditando que assim impediria a filha de continuar matando pessoas. Só que o plano não dá certo: a mãe morre, mas a Rhoda sobrevive. O pai volta para casa sem saber de nada, e as únicas pessoas que conheciam a verdade já morreram. Ou seja, a Rhoda fica completamente impune.

No geral, achei um livro bom. É uma história que prende, acontece bastante coisa e a leitura flui muito rápido. Não foi um livro extraordinário, mas também não achei ruim. É um suspense interessante, principalmente pela construção da personagem principal e pela forma como a mãe vai percebendo, aos poucos, quem a filha realmente é.

**Uma palavra:** Macabro.

A protagonista é a Rhoda, que por fora parece uma menina comum, educada e exemplar, mas, na verdade, tem um jeito extremamente egoísta e maldoso. Conforme a história avança, ela mesma deixa claro que machuca e mata as pessoas simplesmente para conseguir o que quer. Antes mesmo dos acontecimentos principais do livro, ela já havia matado uma senhora porque queria um colar que seria deixado para ela apenas quando a mulher morresse. Então ela resolveu adiantar isso. Depois, acontece o caso do menino da escola, que é o grande mistério da história. Ele ganha uma medalha que a Rhoda queria, não aceita entregar para ela, e acaba sendo assassinado.

O suspense do livro gira em torno desse crime, mas eu gostei porque o foco não é exatamente descobrir quem matou. Em nenhum momento o livro tenta fazer o leitor duvidar da culpa da Rhoda. Pelo contrário, praticamente desde o começo fica claro que foi ela. O interessante é acompanhar a mãe dela percebendo isso aos poucos. Não é como se ela simplesmente fingisse que não estava vendo; ela vai juntando os acontecimentos, desconfiando, ligando os pontos e entendendo quem a filha realmente é.

Ao longo da história, outras pessoas que de alguma forma atrapalham a Rhoda também acabam morrendo. Tem o zelador Leroy, por exemplo, que começa a desconfiar dela. Mesmo sem provas, ele acredita que ela matou o menino. Então a Rhoda o prende em um galpão e coloca fogo no lugar, matando ele também. A impressão que fica é que qualquer pessoa que represente um obstáculo para ela ou faça algo que ela não goste acaba virando uma vítima.

Enquanto isso, a mãe vai ficando cada vez mais desesperada. Ela também descobre que foi adotada e que sua mãe biológica era uma assassina em série. A partir daí, começa a acreditar que a maldade da Rhoda seria uma herança genética, como se ela tivesse passado essa "semente do mal" para a filha. Essa culpa consome completamente a personagem.

No final, ela decide acabar com o sofrimento das duas. Dá vários comprimidos para a Rhoda dormir e depois tira a própria vida, acreditando que assim impediria a filha de continuar matando pessoas. Só que o plano não dá certo: a mãe morre, mas a Rhoda sobrevive. O pai volta para casa sem saber de nada, e as únicas pessoas que conheciam a verdade já morreram. Ou seja, a Rhoda fica completamente impune.

No geral, achei um livro bom. É uma história que prende, acontece bastante coisa e a leitura flui muito rápido. Não foi um livro extraordinário, mas também não achei ruim. É um suspense interessante, principalmente pela construção da personagem principal e pela forma como a mãe vai percebendo, aos poucos, quem a filha realmente é.

**Uma palavra:** Macabro.', 1, 0, 44.9, 'https://is1-ssl.mzstatic.com/image/thumb/Publication118/v4/4b/e2/bf/4be2bf92-1653-a979-b340-bb2fe80a2091/1024251462.jpg/512x512bb.jpg', NULL, NULL, 0, '2026-07-24T01:42:08.090Z');
INSERT INTO livros (id, usuario_id, titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, resenha, adaptacao, vi_adaptacao, valor, capa, sinopse, pagina_atual, privado, criado_em) VALUES (347, 1, 'A Hipótese do Amor', 'Ali Hazelwood', 'IT', 'Romance', 'Arqueiro', 2022, 336, 'Kindle', 'lido', 2026, '2026-06-26', '2026-07-05', 3.5, 'Envolvente', 'Eu li **A Hipótese do Amor**, da **Ali Hazelwood**, e gostei bastante da leitura. É um livro que prende e dá muita vontade de continuar lendo pra descobrir como tudo vai acontecer. A história gira em torno da Olive e do Adam, que começam um namoro de mentira, então é um clássico *fake dating*.

Apesar de eu ter gostado da história, uma coisa me incomodou bastante: em vários momentos eu senti que os personagens agiam como adolescentes, mas eles não eram. O Adam tem 34 anos, é professor e pesquisador, e a Olive tem 26 anos e está fazendo doutorado. Ou seja, os dois já passaram pela graduação, estão em um ambiente super profissional e maduro. Por isso, algumas situações não fizeram muito sentido pra mim.

O principal exemplo é justamente o motivo do namoro de mentira. A Olive começa a fingir que está namorando o Adam porque quer convencer a melhor amiga de que não gosta mais do Jeremy, já que a amiga não queria ficar com ele achando que ainda existia algum sentimento entre eles. Eu consigo imaginar essa situação acontecendo com adolescentes de 16 ou 17 anos, mas achei estranho ver dois adultos, com essa idade e esse nível de maturidade, entrando em um plano desses. Eu entendo que essa é a proposta do livro e que o romance depende disso, mas acho que teria funcionado melhor se os personagens fossem mais novos ou estivessem em outro contexto.

Uma parte que eu gostei bastante foi o conflito envolvendo o Tom, que também é professor. A Olive precisa da ajuda dele para continuar a pesquisa, mas ele acaba sendo completamente abusivo. Ele tenta chantageá-la, faz insinuações de que ela deveria aceitar as investidas dele e ainda ameaça usar toda a pesquisa dela em benefício próprio, já que ela havia compartilhado o trabalho com ele. Essa foi a parte que mais me deixou ansiosa para descobrir como seria resolvida. Eu queria muito ver quando o Adam descobriria tudo aquilo e como reagiria, e achei essa resolução muito satisfatória.

Ao mesmo tempo, a Olive me irritou bastante em vários momentos. Ela é uma pesquisadora extremamente inteligente, já está no doutorado e trabalha com coisas muito importantes, mas é muito insegura. Muitas das confusões da história acontecem porque ela simplesmente não conversa, tira conclusões erradas ou faz escolhas que acabam complicando ainda mais as coisas. Em alguns momentos parecia que tudo dava errado por culpa dela, e isso acabou me incomodando.

Minha maior crítica continua sendo a questão da idade dos personagens. Achei que várias atitudes não combinavam com o contexto em que eles estavam inseridos. Não sei se isso aconteceu porque esse foi o primeiro livro publicado pela autora, se foi uma escolha intencional ou se simplesmente é uma característica da escrita dela. Como também foi o primeiro livro que eu li da Ali Hazelwood, ainda quero ler outros para ver se essa impressão continua.

No geral, dei **3,5 estrelas**, que não considero uma nota ruim. Apesar das críticas, é um livro que realmente prende, desperta curiosidade e faz a gente sentir várias emoções ao longo da leitura. Eu fiquei ansiosa, com raiva, triste e feliz em diferentes momentos. E, pra mim, quando um livro consegue causar tudo isso só através da escrita, ele já cumpriu muito bem o seu papel.

**Uma palavra:** Envolvente.', 0, 0, 63.9, 'https://is1-ssl.mzstatic.com/image/thumb/Publication122/v4/d7/39/ea/d739eaa2-abfd-b62f-add3-5f5f5f65b329/9786555654127_20220908115807.jpg/512x512bb.jpg', NULL, NULL, 0, '2026-07-24T01:42:08.090Z');
INSERT INTO livros (id, usuario_id, titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, resenha, adaptacao, vi_adaptacao, valor, capa, sinopse, pagina_atual, privado, criado_em) VALUES (348, 1, 'A Última Casa da Rua Needless', 'Catriona Ward', 'US', 'Suspense', 'Jangada', 2022, 352, 'Kindle', 'lido', 2026, '2026-07-07', '2026-07-09', 4.0, 'Complexo', 'Eu li **A Última Casa da Rua Needless**, da **Catriona Ward**, e, no começo, achei um livro extremamente confuso. Eu me sentia totalmente perdida, não entendia direito quem era gente, quem era bicho e qual era a relação entre os personagens. Mesmo com o nome de quem narrava aparecendo no início dos capítulos, eu demorava para entender o que estava acontecendo.

Só que, conforme a história avança, tudo começa a fazer sentido. Eu já tinha assistido ao filme **Fragmentado**, então foi um pouco mais fácil entender o caminho que o livro estava seguindo. Quando percebi que a Lauren, a Olivia e as outras figuras eram, na verdade, personalidades criadas pelo Ted por causa do transtorno dissociativo de identidade, muitas coisas começaram a se encaixar.

O que mais me marcou foi perceber que o verdadeiro horror da história não está no suspense em si, mas na mãe do Ted. Todo o sofrimento, os abusos e os traumas que ele viveu fizeram com que ele criasse essas personalidades como uma forma de sobreviver. No fim, tudo gira em torno desse trauma.

A parte em que eu fiquei mais confusa foi justamente quando as personalidades começam a se integrar. São muitos diálogos acontecendo ao mesmo tempo, pensamentos misturados e alucinações, e fica muito difícil entender quem está falando. Tem momentos em que ele fala sobre cobras, diz que foi picado, depois diz que sabe que elas não existem... tudo isso acontece de forma muito misturada. Acho que, em um filme, seria mais fácil acompanhar porque a gente consegue ver quem é quem. No livro, como tudo está acontecendo dentro da mente de uma única pessoa, a sensação de confusão é muito maior.

Outra coisa que me confundiu bastante foi a questão da gata. Como o Ted chama tanto a Lauren quanto a Olivia de "gatinha", eu passei boa parte da leitura tentando entender quem era realmente um gato e quem era uma pessoa. Em alguns momentos, até achei que a Lauren fosse a Lulu, mas depois vem o grande plot mostrando que não era nada disso.

Apesar de toda essa confusão, eu acho que ela faz parte da proposta do livro. É uma história mais complexa, então faz sentido que o leitor também se sinta perdido. No final, praticamente todas as peças se encaixam, e isso torna a leitura muito satisfatória. É aquele tipo de livro que parece não fazer sentido por muito tempo, mas que recompensa a paciência do leitor quando tudo é explicado.

Eu dei **4 estrelas** porque gostei bastante da experiência. Foi um livro diferente de tudo o que eu já tinha lido, e justamente por ser tão confuso no começo, o final acaba sendo ainda mais impactante.

**Uma palavra:** Complexo.', 0, 0, 45.79, 'https://is1-ssl.mzstatic.com/image/thumb/Publication112/v4/f4/fc/21/f4fc2185-e027-f4dc-6b80-20f54acd60f6/1038835680.jpg/512x512bb.jpg', NULL, NULL, 0, '2026-07-24T01:42:08.090Z');
INSERT INTO livros (id, usuario_id, titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, resenha, adaptacao, vi_adaptacao, valor, capa, sinopse, pagina_atual, privado, criado_em) VALUES (349, 1, 'Para Sempre Seu', 'Abby Jimenez', 'US', 'Romance', 'Arqueiro', 2023, 336, 'Kindle', 'lido', 2026, '2026-07-10', '2026-07-16', 5.0, 'Envolvente', 'Eu li **Para Sempre Seu**, da Abby Jimenez, e gostei muito, muito do livro. Logo no começo já achei a leitura super tranquila e muito fluida. É uma história que tem pé e cabeça, que faz sentido do início ao fim, e principalmente não fica enrolando. Quando alguma coisa precisa acontecer, ela acontece. Não é aquele tipo de livro que faz você ficar pensando “vai logo, resolve isso”, porque a trama anda de forma natural e rápida.

Gostei bastante dos protagonistas, mas principalmente da Adriana. Uma das coisas que mais me chamou atenção foi o fato de ela ter iniciativa. Em vários momentos ela vai atrás do que quer, manda mensagem, procura o Jacob, comenta nas fotos, toma atitudes. Eu achei isso muito legal porque, em muitos romances, a protagonista fica esperando o homem tomar a iniciativa. Aqui não. Ela faz acontecer, e isso me conquistou logo de cara.

Também gostei muito do Jacob. Foi um daqueles personagens que a gente acaba se apegando. O livro me fez rir em vários momentos, me emocionou em outros e até me fez chorar. Foi uma leitura que me despertou várias emoções diferentes, e eu gosto muito quando um livro consegue fazer isso.

Uma coisa que achei muito bem construída foi a forma como a ansiedade do Jacob é retratada. Dá para perceber claramente as dificuldades dele, e eu gostei muito da forma como a autora colocou ao lado dele uma parceira que tenta entender, acolher e ajudar da melhor maneira possível. Também achei importante a preocupação da autora em avisar sobre os gatilhos antes da leitura.

Eu fiquei na dúvida entre dar 4,5 ou 5 estrelas. Teve uma parte perto do final que me irritou um pouco, quando a Adriana surta depois de encontrar o ex e a atual dele grávida. Mas, ao mesmo tempo, todos os conflitos do livro fazem sentido. Em nenhum momento eu pensei que os personagens estavam brigando por algo bobo ou criando problemas sem motivo. Pelo contrário: as reações deles pareciam humanas e coerentes. Muitas vezes eu conseguia imaginar que provavelmente agiria da mesma forma naquela situação.

Outra coisa que gostei muito foi a estrutura da história. A autora não perde tempo com cenas que não são relevantes. Quando existe um período sem acontecimentos importantes, ela simplesmente faz um salto temporal e segue para o que realmente importa. Isso deixou a leitura muito dinâmica. Mesmo com esses saltos, ela consegue contextualizar tudo o que aconteceu nesse intervalo, então a gente nunca fica perdido.

Foi uma leitura que não me cansou em nenhum momento. Eu queria continuar lendo, ficava até tarde porque sempre queria saber o que aconteceria no próximo capítulo. Não teve partes arrastadas nem momentos em que senti que a história estava parada.

No geral, foi uma experiência muito boa. Foi o primeiro livro que li da Abby Jimenez e gostei bastante da escrita dela. É uma escrita leve, envolvente e que faz a história fluir muito bem. Foi um livro que me surpreendeu positivamente e me deixou com muita vontade de conhecer outras obras da autora.', 0, 0, 39.98, 'https://is1-ssl.mzstatic.com/image/thumb/Publication126/v4/88/86/11/88861197-bc05-561e-b6b0-f1453ceda46f/9786555655575.jpg/512x512bb.jpg', NULL, NULL, 0, '2026-07-24T01:42:08.090Z');
INSERT INTO livros (id, usuario_id, titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, resenha, adaptacao, vi_adaptacao, valor, capa, sinopse, pagina_atual, privado, criado_em) VALUES (350, 1, 'Não Perturbe', 'Freida McFadden', 'US', 'Suspense', 'Arqueiro', 2024, 293, 'Kindle', 'lido', 2026, '2026-07-17', '2026-07-20', 3.0, 'Previsibilidade', 'Eu li Não Perturbe, da Freida McFadden, e, comparando com os outros livros da autora que já li, achei um livro bem mais fraco.

O principal motivo foi que eu consegui descobrir boa parte dos mistérios antes da revelação. Normalmente, quando leio um livro da Freida, sempre penso que estou entendendo tudo errado e que ela vai me enganar em algum momento. Afinal, essa costuma ser uma das maiores qualidades dela: fazer o leitor acreditar em uma coisa para depois mostrar que era outra completamente diferente. Mas, dessa vez, isso não aconteceu comigo.

O livro tem dois grandes plot twists, e o principal eu consegui prever durante a leitura. Conforme a história avançava, fui ficando cada vez mais desconfiada de algumas atitudes da Claudia. Quando ela começou a agir de forma estranha, esconder informações e principalmente quando surgiram as mensagens escondidas no celular, eu já suspeitava do que estava acontecendo. Quando a revelação finalmente aconteceu, não foi uma surpresa.

O segundo plot, envolvendo Greta e a descoberta sobre o que realmente aconteceu com Cristina, funcionou melhor para mim. Foi a parte que mais me surpreendeu e que acabou elevando um pouco minha nota para o livro. Eu realmente não esperava aquela revelação específica e, por um momento, achei que a autora terminaria a história sem esclarecer completamente aquele mistério.

Mesmo assim, foi uma leitura que não conseguiu me prender tanto. Diferente de outros livros da autora, eu não fiquei ansiosa para descobrir o que aconteceria no próximo capítulo. Não foi aquele tipo de história que me fez querer largar tudo para continuar lendo.

Ainda considero um livro bom, mas muito mediano dentro da bibliografia da Freida McFadden. É uma leitura rápida, curta e fácil de acompanhar, ótima para quando você quer ler algo sem muito compromisso ou apenas aumentar a quantidade de páginas lidas no mês. Porém, para mim, faltou aquele fator surpresa que normalmente faz os livros da autora se destacarem.

No final, foi uma experiência agradável, mas sem nada realmente memorável. Não achei um livro ruim, apenas não encontrei nele nada que o tornasse especial quando comparado aos outros trabalhos da autora.', 0, 0, 53.9, 'https://is1-ssl.mzstatic.com/image/thumb/Publication221/v4/1f/6b/56/1f6b5637-c077-b310-7414-fa30db7744c3/9788530601928.jpg/512x512bb.jpg', NULL, NULL, 0, '2026-07-24T01:42:08.090Z');
INSERT INTO livros (id, usuario_id, titulo, autor, pais, genero, editora, ano, paginas, formato, status, ano_leitura, inicio, fim, nota, palavra, resenha, adaptacao, vi_adaptacao, valor, capa, sinopse, pagina_atual, privado, criado_em) VALUES (351, 1, 'Pequena Coreografia do Adeus', 'Aline Bei', 'BR', 'Ficção', 'Companhia das Letras', 2021, 288, 'Audiobook', 'lendo', 2026, '2026-07-20', NULL, NULL, NULL, 'Livros', 0, 0, 46.65, 'https://is1-ssl.mzstatic.com/image/thumb/Publication124/v4/bf/2e/c4/bf2ec4ff-bf9a-0a71-8be0-f3a226ab3bc6/1033660901.jpg/512x512bb.jpg', NULL, NULL, 0, '2026-07-24T01:42:08.090Z');
SELECT setval('livros_id_seq', 351);

-- Data: cartas
INSERT INTO cartas (id, de_usuario_id, para_usuario_id, corpo, livro_condicao_id, lida, lida_em, criado_em) VALUES (3, 2, 1, 'Oi gatinha, vim aqui pra dizer que vc é a mulher da minha vida! amo cada momento ao seu lado, cada sensação, cada cheiro, cada abraço, cada você.
Você é quem me da sentido as coisas e me mostrou o que é amar de verdade.

Um passarinho verde me contou que vc tava construindo uma planilha de livros, e então resolvi simplificar ela - não significa que esta horrível lixo e podre - pois precisava de um toque especial para que vc economizasse o seu tempo precioso e me dar mais atenção.

Agora ela ta com uma cara nova, e detalhe, aqui ja está todos os seus livros, resenhas e tudo mais que estava na planilha, então não precisa se preocupar tabao.

Espero que goste, feliz namoreidos de 4, te amo 🧡.', NULL, 0, NULL, '2026-07-23 13:17:20');
SELECT setval('cartas_id_seq', 3);

-- Data: convites
INSERT INTO convites (codigo, criado_por, usado_por, criado_em, usado_em) VALUES ('d511fa821ed19926a01a70fa', 1, NULL, '2026-07-23 22:56:30', NULL);
INSERT INTO convites (codigo, criado_por, usado_por, criado_em, usado_em) VALUES ('4b54129caa311d3de97ed61c', 2, NULL, '2026-07-23 23:10:09', NULL);

-- Data: redefinicoes

COMMIT;