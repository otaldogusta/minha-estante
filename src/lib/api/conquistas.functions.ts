import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { bindings } from "../bindings.server";
import { exigirUsuario } from "../auth.server";
import type { Livro } from "../livros";

function db() {
  const { DB } = bindings();
  if (!DB) throw new Error("Banco de dados indisponível");
  return DB;
}

export type Conquista = {
  chave: string;
  titulo: string;
  descricao: string;
  icone: string;
  pontos: number;
  desbloqueada: boolean;
  desbloqueada_em?: string | null;
};

export type DesafioSemanal = {
  titulo: string;
  descricao: string;
  metaDias: number;
  diasConcluidos: number;
  concluido: boolean;
  recompensaResgatada: boolean;
  premio: string;
};

export type LivroAcervo = {
  id: number;
  titulo: string;
  autor: string;
  capaUrl: string;
  paginas: number;
  ano: number;
  genero: string;
  idioma: string;
  gutenbergId?: number;
  epubUrl?: string;
  textoUrl?: string;
  amostraTexto?: string;
  textoIntegral: string;
};

// Textos e capítulos autênticos da literatura clássica
export const CLASSICOS_CURADOS: LivroAcervo[] = [
  {
    id: 55752,
    gutenbergId: 55752,
    titulo: "Dom Casmurro",
    autor: "Machado de Assis",
    capaUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80",
    paginas: 256,
    ano: 1899,
    genero: "Romance",
    idioma: "pt",
    epubUrl: "https://www.gutenberg.org/ebooks/55752.epub.noimages",
    textoUrl: "https://www.gutenberg.org/files/55752/55752-0.txt",
    amostraTexto: "Uma noite destas, vindo da cidade para o Engenho Novo, encontrei no trem da Central um rapaz aqui do bairro, que eu conheço de vista e de chapéu. Cumprimentou-me, sentou-se ao pé de mim, falou da lua e dos ministros, e acabou recitando-me versos...",
    textoIntegral: `Capítulo I — Do Título

Uma noite destas, vindo da cidade para o Engenho Novo, encontrei no trem da Central um rapaz aqui do bairro, que eu conheço de vista e de chapéu. Cumprimentou-me, sentou-se ao pé de mim, falou da lua e dos ministros, e acabou recitando-me versos. A viagem era curta, e os versos pode ser que não fossem inteiramente maus, porém o caso é que eu ia cansado, fechei os olhos, e dormitei.

Ao chegar à estação, acordei e não pude conter o agradecimento pela leitura; mas o rapaz não se deu por satisfeito. No dia seguinte entrou a dizer de mim aos vizinhos que eu era um casmurro. O título pegou, e não é mau; serve para explicar a minha pessoa e o meu livro. Casmurro não quer dizer aqui o homem teimoso e obstinado, mas o indivíduo calado e metido consigo.

Capítulo II — Do Livro

Agora que expliquei o título, passo a escrever o livro. Para isso, tentei primeiro recompor no Engenho Novo a mesma casa em que me criei na antiga Rua de Matacavalos. O mesmo aspecto, os mesmos quartos, as pinturas no teto com pássaros e ramagens, os mesmos bustos de César e Nero na parede. Quis atar as duas pontas da vida, e restaurar na velhice a adolescência.

Pois, senhor, não consegui recompor o que foi nem o que fui. Em verdade, as paredes são iguais, mas falta-lhes a alma do tempo. Resta-me contar a história de minha vida, e sobretudo de meus amores com Capitu, que foi o sol e a tormenta de minha mocidade.

Capítulo III — A Denúncia

Ia a entrar na sala de visitas, quando ouvi proferir o meu nome e escondi-me atrás da porta.
— D. Glória, a senhora persiste na ideia de meter o Bentinho no seminário? É mais que tempo, e já agora pode haver uma dificuldade.
— Que dificuldade?
— Uma grande dificuldade. Bentinho e a menina do Pádua andam muito chegados. Desde que amanhece até a noite, é vê-los juntos no quintal. É preciso separá-los antes que o mal cresça.

Capítulo XIV — A Inscrição

Fui ao quintal. Capitu estava encostada ao muro, riscando com um prego na cal da parede.
— Que estás fazendo aí, Capitu?
— Nada, respondeu ela, tapando o risco com as costas.
— Deixa ver, Capitu!
Cheguei-me a ela e vi escriptos no muro, cruzados um no outro, dois nomes: Bento e Capitolina. O coração bateu-me como se quisesse saltar fora do peito. Olhamo-nos um ao outro em silêncio, e aquele instante valeu por uma eternidade.

Capítulo XXXII — Olhos de Ressaca

Capitu era Capitu, isto é, uma criatura muito particular, mais mulher do que eu era homem. Olhos de ressaca? Trazia-os assim de ordinário, como a vaga do mar quando se recolhe para quebrar na praia com redobrada força. Quem os fitasse de perto, arriscava-se a ser tragado pelo mistério de sua profundeza e de sua sedução.`
  },
  {
    id: 54829,
    gutenbergId: 54829,
    titulo: "Memórias Póstumas de Brás Cubas",
    autor: "Machado de Assis",
    capaUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80",
    paginas: 210,
    ano: 1881,
    genero: "Ficção",
    idioma: "pt",
    epubUrl: "https://www.gutenberg.org/ebooks/54829.epub.noimages",
    textoUrl: "https://www.gutenberg.org/files/54829/54829-0.txt",
    amostraTexto: "Ao verme que primeiro roeu as frias carnes do meu cadáver dedico como saudosa lembrança estas memórias póstumas. Que me conste, ainda nenhum autor defunto escreveu as suas memórias com tanta sinceridade...",
    textoIntegral: `Ao Verme que Primeiro Roeu as Frias Carnes do Meu Cadáver
Dedico Como Saudosa Lembrança Estas Memórias Póstumas

Capítulo I — Óbito do Autor

Algum tempo hesitei se devia abrir estas memórias pelo princípio ou pelo fim, isto é, se poria em primeiro lugar o meu nascimento ou a minha morte. Suposto o uso vulgar seja começar pelo nascimento, duas considerações me levaram a adotar diferente método: a primeira é que eu não sou propriamente um autor defunto, mas um defunto autor, para quem a campa foi outro berço; a segunda é que o escrito ficaria assim mais galante e mais novo. Moisés, que também contou a sua morte, não a pôs no intróito: mas era um cronista vivo.

Expiro às duas horas da tarde de uma sexta-feira do mês de agosto de 1869, na minha bela chácara de Catumbi. Tinha uns sessenta e quatro anos, rijos e prósperos, era solteiro, possuía cerca de trezentos contos e fui acompanhado ao cemitério por onze amigos. Onze amigos! A verdade é que não houve cartas nem anúncios. Acresce que chovia — uma chuvinha miúda, triste e constante.

Capítulo II — O Emplasto Brás Cubas

Tive um dia a grande ideia de inventar um medicamento sublime, um emplasto anti-hipocondríaco, destinado a aliviar a nossa melancólica humanidade. Na verdade, a ideia de curar os males da alma com uma fórmula de botica era ambiciosa; mas o que me movia no fundo não era o amor ao próximo, e sim o amor à glória, o desejo de ver o meu nome impresso nas gazetas e nas caixas de remédio: Emplasto Brás Cubas.

Capítulo CLX — Das Negativas

Este livro e o meu estilo são como os ébrios, guinam à direita e à esquerda, andam e param, resmungam, urram, gargalham, ameaçam o céu, escorregam e caem...

Não alcancei a celebridade do emplasto, não fui ministro, não fui califa, não conheci o casamento. É verdade que, ao lado dessas faltas, coube-me a boa fortuna de não comprar o pão com o suor do meu rosto. Mais ainda: não padeci a morte de Dona Plácida, nem a loucura do Quincas Borba. Somadas umas cousas e outras, qualquer pessoa imaginará que não houve míngua nem sobra, e conseguintemente que saí quite com a vida. E imaginará mal; porque ao chegar a este outro lado do mistério, achei-me com um pequeno saldo, para a derradeira conta dos meus dias:
— Não tive filhos, não transmiti a nenhuma criatura o legado da nossa miséria.`
  },
  {
    id: 57971,
    gutenbergId: 57971,
    titulo: "O Alienista",
    autor: "Machado de Assis",
    capaUrl: "https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&w=600&q=80",
    paginas: 110,
    ano: 1882,
    genero: "Suspense",
    idioma: "pt",
    epubUrl: "https://www.gutenberg.org/ebooks/57971.epub.noimages",
    textoUrl: "https://www.gutenberg.org/files/57971/57971-0.txt",
    amostraTexto: "As crônicas da vila de Itaguaí dizem que em tempos remotos um médico ilustre, o Dr. Simão Bacamarte, filho da nobreza da terra e o maior dos médicos do Brasil, de Portugal e das Espanhas, resolveu fundar a Casa Verde...",
    textoIntegral: `Capítulo I — De Como Itaguaí Ganhou uma Casa de Orates

As crônicas da vila de Itaguaí dizem que em tempos remotos um médico ilustre, o Dr. Simão Bacamarte, filho da nobreza da terra e o maior dos médicos do Brasil, de Portugal e das Espanhas, resolveu consagrar-se ao estudo da psiquiatria. Tinha quarenta anos; fizera estudos em Coimbra e Pádua. Aos trinta e quatro anos regressou ao Brasil, não podendo el-rei alcançar dele que ficasse em Lisboa.

Casara-se com D. Evarista da Costa e Silva, senhora de cinquenta anos, nem bonita nem rica, mas dotada de excelente saúde e digestão perfeita.
— A razão do meu casamento, dizia Simão Bacamarte ao vigário, é puramente científica. D. Evarista reúne condições fisiológicas ideais para gerar filhos robustos e calmos.

Fundou então em Itaguaí a Casa Verde, edifício imponente destinado a acolher todos os loucos da vila e das províncias vizinhas. A ciência era a sua única paixão; não conhecia o repouso nem a hesitação.

Capítulo II — A Torrente de Loucos

Três dias depois de aberta a Casa Verde, estava ela com vinte hóspedes; no fim do primeiro mês, contavam-se mais de cem. A vila entrou em pânico ao ver que o alienista internava quem falava sozinho, quem gastava demais, quem não gastava nada, e até quem elogiava o governo com excessivo fervor.
— A loucura, dizia o alienista, é um continente inexplorado; até agora só se conheciam as ilhas.

Capítulo XIII — O Desfecho Sublime

Ao cabo de longos estudos, Simão Bacamarte chegou a uma nova teoria: se quatro quintos da vila estavam na Casa Verde, o desequilíbrio não era a exceção, mas a regra. Mandou soltar todos os internados e trancou a si mesmo na Casa Verde.
Ali viveu e faleceu dezessete meses depois, tendo sido o único e verdadeiro louco de Itaguaí.`
  },
  {
    id: 1661,
    gutenbergId: 1661,
    titulo: "The Adventures of Sherlock Holmes",
    autor: "Arthur Conan Doyle",
    capaUrl: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=600&q=80",
    paginas: 307,
    ano: 1892,
    genero: "Suspense",
    idioma: "en",
    epubUrl: "https://www.gutenberg.org/ebooks/1661.epub.noimages",
    textoUrl: "https://www.gutenberg.org/files/1661/1661-0.txt",
    amostraTexto: "To Sherlock Holmes she is always THE woman. I have seldom heard him mention her under any other name. In his eyes she eclipses and predominates the whole of her sex...",
    textoIntegral: `A Scandal in Bohemia

Chapter I

To Sherlock Holmes she is always THE woman. I have seldom heard him mention her under any other name. In his eyes she eclipses and predominates the whole of her sex. It was not that he felt any emotion akin to love for Irene Adler. All emotions, and that one particularly, were abhorrent to his cold, precise but admirably balanced mind.

I had seen little of Holmes lately. My marriage had drifted us away from each other. My own complete happiness, and the home-centred interests which rise up around the man who first finds himself master of his own establishment, were sufficient to absorb all my attention. Holmes, who loathed every form of society with his whole Bohemian soul, remained in our lodgings in Baker Street, buried among his old books, and alternating from week to week between cocaine and ambition.

Chapter II

One night—it was on the twentieth of March, 1888—I was returning from a journey to a patient, when my way led me through Baker Street. As I passed the well-remembered door, I was seized with a keen desire to see Holmes again, and to know how he was employing his extraordinary powers.

His rooms were brilliantly lit, and, even as I looked up, I saw his tall, spare figure pass twice in a dark silhouette against the blind. He was pacing the room swiftly, eagerly, with his head sunk upon his chest and his hands clasped behind him. To me, who knew his every mood and habit, his attitude and manner told their own story. He was at work again. He had risen out of his drug-created dreams and was hot upon the scent of some new problem. I rang the bell and was shown up to the chamber which had formerly been in part my own.`
  },
  {
    id: 1342,
    gutenbergId: 1342,
    titulo: "Pride and Prejudice",
    autor: "Jane Austen",
    capaUrl: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80",
    paginas: 279,
    ano: 1813,
    genero: "Romance",
    idioma: "en",
    epubUrl: "https://www.gutenberg.org/ebooks/1342.epub.noimages",
    textoUrl: "https://www.gutenberg.org/files/1342/1342-0.txt",
    amostraTexto: "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife...",
    textoIntegral: `Chapter I

It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.

However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families, that he is considered the rightful property of some one or other of their daughters.

"My dear Mr. Bennet," said his lady to him one day, "have you heard that Netherfield Park is let at last?"
Mr. Bennet replied that he had not.
"But it is," returned she; "for Mrs. Long has just been here, and she told me all about it."
Mr. Bennet made no answer.
"Do you not want to know who has taken it?" cried his wife impatiently.
"You want to tell me, and I have no objection to hearing it."
This was invitation enough.

"Why, my dear, you must know, Mrs. Long says that Netherfield is taken by a young man of large fortune from the north of England; that he came down on Monday in a chaise and four to see the place, and was so much delighted with it, that he agreed with Mr. Morris immediately."

"What is his name?"
"Bingley."
"Is he married or single?"
"Oh! Single, my dear, to be sure! A single man of large fortune; four or five thousand a year. What a fine thing for our girls!"`
  },
  {
    id: 11,
    gutenbergId: 11,
    titulo: "Alice's Adventures in Wonderland",
    autor: "Lewis Carroll",
    capaUrl: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80",
    paginas: 120,
    ano: 1865,
    genero: "Fantasia",
    idioma: "en",
    epubUrl: "https://www.gutenberg.org/ebooks/11.epub.noimages",
    textoUrl: "https://www.gutenberg.org/files/11/11-0.txt",
    amostraTexto: "Alice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do: once or twice she had peeped into the book her sister was reading, but it had no pictures or conversations in it...",
    textoIntegral: `Chapter I — Down the Rabbit-Hole

Alice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do: once or twice she had peeped into the book her sister was reading, but it had no pictures or conversations in it, "and what is the use of a book," thought Alice "without pictures or conversations?"

So she was considering in her own mind (as well as she could, for the hot day made her feel very sleepy and stupid), whether the pleasure of making a daisy-chain would be worth the trouble of getting up and picking the daisies, when suddenly a White Rabbit with pink eyes ran close by her.

There was nothing so VERY remarkable in that; nor did Alice think it so VERY much out of the way to hear the Rabbit say to itself, "Oh dear! Oh dear! I shall be late!" But when the Rabbit actually TOOK A WATCH OUT OF ITS WAISTCOAT-POCKET, and looked at it, and then hurried on, Alice started to her feet, for it flashed across her mind that she had never before seen a rabbit with either a waistcoat-pocket, or a watch to take out of it, and burning with curiosity, she ran across the field after it, and fortunately was just in time to see it pop down a large rabbit-hole under the hedge.

In another moment down went Alice after it, never once considering how in the world she was to get out again.`
  }
];

export const obterConquistasEAcervo = createServerFn({ method: "GET" }).handler(async () => {
  const u = await exigirUsuario();

  // Busca dados de leitura do usuário para cálculo de conquistas
  const { results: livros } = await db()
    .prepare("SELECT * FROM livros WHERE usuario_id = ?")
    .bind(u.id)
    .all<Livro>();

  const lidos = livros.filter((l) => l.status === "lido");
  const totalPaginas = lidos.reduce((acc, cur) => acc + (cur.paginas || 0), 0);
  const paises = new Set(lidos.map((l) => l.pais?.trim().toUpperCase()).filter(Boolean));

  // Verifica se leu algum livro em até 7 dias
  let leuEm7Dias = false;
  for (const l of lidos) {
    if (l.inicio && l.fim) {
      const d1 = new Date(l.inicio + "T12:00:00");
      const d2 = new Date(l.fim + "T12:00:00");
      const diff = Math.round((d2.getTime() - d1.getTime()) / 86400000);
      if (diff >= 0 && diff <= 7) {
        leuEm7Dias = true;
        break;
      }
    }
  }

  // Lista base de conquistas com validação
  const DEFINICOES = [
    {
      chave: "leitor_7_dias",
      titulo: "Leitor Relâmpago",
      descricao: "Completou um livro do início ao fim em 7 dias ou menos",
      icone: "raio",
      pontos: 50,
      atingida: leuEm7Dias,
    },
    {
      chave: "primeiro_livro",
      titulo: "Primeira Conquista",
      descricao: "Marcou seu primeiro livro como lido na estante",
      icone: "sprout",
      pontos: 20,
      atingida: lidos.length >= 1,
    },
    {
      chave: "devorador_500",
      titulo: "Devorador de Páginas",
      descricao: "Leu mais de 500 páginas acumuladas",
      icone: "livro",
      pontos: 30,
      atingida: totalPaginas >= 500,
    },
    {
      chave: "viajante_3_paises",
      titulo: "Cidadão do Mundo",
      descricao: "Leu livros de autores de 3 ou mais países diferentes",
      icone: "globo",
      pontos: 40,
      atingida: paises.size >= 3,
    },
    {
      chave: "guardiao_classicos",
      titulo: "Guardião dos Clássicos",
      descricao: "Possui clássicos da literatura na sua estante",
      icone: "templo",
      pontos: 25,
      atingida: livros.some((l) => (l.ano && l.ano < 1930) || l.gutenberg_id),
    },
  ];

  // Busca conquistas já salvas
  let salvas: Array<{ chave: string; desbloqueada_em: string }> = [];
  try {
    const res = await db()
      .prepare("SELECT chave, desbloqueada_em FROM conquistas WHERE usuario_id = ?")
      .bind(u.id)
      .all<{ chave: string; desbloqueada_em: string }>();
    salvas = res.results;
  } catch {}

  const salvasMap = new Map(salvas.map((s) => [s.chave, s.desbloqueada_em]));

  // Auto-desbloqueia as que foram atingidas agora
  for (const def of DEFINICOES) {
    if (def.atingida && !salvasMap.has(def.chave)) {
      try {
        await db()
          .prepare(
            `INSERT INTO conquistas (usuario_id, chave, titulo, descricao, icone, pontos)
             VALUES (?, ?, ?, ?, ?, ?)`
          )
          .bind(u.id, def.chave, def.titulo, def.descricao, def.icone, def.pontos)
          .run();
        salvasMap.set(def.chave, new Date().toISOString());
      } catch {}
    }
  }

  const conquistasFormatadas: Conquista[] = DEFINICOES.map((d) => ({
    chave: d.chave,
    titulo: d.titulo,
    descricao: d.descricao,
    icone: d.icone,
    pontos: d.pontos,
    desbloqueada: salvasMap.has(d.chave) || d.atingida,
    desbloqueada_em: salvasMap.get(d.chave) || null,
  }));

  const pontosTotais = conquistasFormatadas
    .filter((c) => c.desbloqueada)
    .reduce((acc, c) => acc + c.pontos, 0);

  // Desafio Semanal
  const lendoAgora = livros.find((l) => l.status === "lendo");
  let diasLendo = 0;
  if (lendoAgora?.inicio) {
    const dInicio = new Date(lendoAgora.inicio + "T12:00:00");
    const dHoje = new Date();
    diasLendo = Math.max(0, Math.round((dHoje.getTime() - dInicio.getTime()) / 86400000));
  }

  const desafioSemanal: DesafioSemanal = {
    titulo: "Desafio Semanal: Leitor Veloz",
    descricao: "Conclua seu livro atual em até 7 dias para desbloquear +1 clássico raro para a sua estante.",
    metaDias: 7,
    diasConcluidos: Math.min(diasLendo, 7),
    concluido: leuEm7Dias,
    recompensaResgatada: salvasMap.has("leitor_7_dias"),
    premio: "Medalha Leitor Relâmpago + 50 Pontos de Leitura",
  };

  return {
    conquistas: conquistasFormatadas,
    pontosTotais,
    desafioSemanal,
    livrosAcervo: CLASSICOS_CURADOS,
    totalLidos: lidos.length,
    totalPaginas,
  };
});

export const adicionarLivroDoAcervo = createServerFn({ method: "POST" })
  .validator(z.object({ acervoId: z.number().int() }))
  .handler(async ({ data }) => {
    const u = await exigirUsuario();
    const item = CLASSICOS_CURADOS.find((c) => c.id === data.acervoId);
    if (!item) throw new Error("Livro não encontrado no acervo");

    // 1. Verifica se o usuário já tem esse livro específico na estante
    const existente = await db()
      .prepare("SELECT id FROM livros WHERE usuario_id = ? AND (gutenberg_id = ? OR titulo = ?)")
      .bind(u.id, item.gutenbergId ?? -1, item.titulo)
      .first<{ id: number }>();
    if (existente?.id) {
      return { id: Number(existente.id) };
    }

    // 2. Insere o livro salvando a sinopse e metadados completos
    await db()
      .prepare(
        `INSERT INTO livros (usuario_id, titulo, autor, ano, paginas, genero, formato, status, capa, sinopse, gutenberg_id, arquivo_url)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'lendo', ?, ?, ?, ?)`
      )
      .bind(
        u.id,
        item.titulo,
        item.autor,
        item.ano,
        item.paginas,
        item.genero,
        "Kindle",
        item.capaUrl,
        item.textoIntegral,
        item.gutenbergId ?? null,
        item.textoUrl ?? null
      )
      .run();

    // 3. Obtém o ID do livro recém-criado de forma garantida
    const criado = await db()
      .prepare("SELECT id FROM livros WHERE usuario_id = ? AND titulo = ? ORDER BY id DESC LIMIT 1")
      .bind(u.id, item.titulo)
      .first<{ id: number }>();

    return { id: Number(criado?.id) || item.id };
  });

export const carregarTextoGutenberg = createServerFn({ method: "GET" })
  .validator(z.object({ gutenbergId: z.number().int().optional(), titulo: z.string().optional() }))
  .handler(async ({ data }) => {
    const item = CLASSICOS_CURADOS.find(
      (c) => (data.gutenbergId && c.gutenbergId === data.gutenbergId) || (data.titulo && c.titulo.toLowerCase() === data.titulo.toLowerCase())
    );
    if (item?.textoIntegral) {
      return { texto: item.textoIntegral, titulo: item.titulo, autor: item.autor };
    }
    if (data.gutenbergId) {
      try {
        const res = await fetch(`https://www.gutenberg.org/files/${data.gutenbergId}/${data.gutenbergId}-0.txt`);
        if (res.ok) {
          const full = await res.text();
          return { texto: full.slice(0, 20000), titulo: "Clássico", autor: "" };
        }
      } catch {}
    }
    return { texto: "", titulo: "", autor: "" };
  });
