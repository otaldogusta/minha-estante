# Minha Estante — design brief

## Design read
Um diário de leitura pessoal para uma leitora dedicada (50 livros em 3 anos), feito de presente: registro afetivo, caloroso e íntimo, o oposto de um dashboard corporativo.

## Concept spine
"A estante de madeira que virou caderno": a página É uma estante. Os livros reais (capas) são o material visual central; o app apenas constrói prateleiras, etiquetas e um marcador de página ao redor deles. Cada tela é um móvel da mesma sala de leitura.

## Delivery tier
`editorial` (produto/ferramenta de uso diário): tipografia + as capas reais como imagem + chrome bespoke, micro-motion apenas. O momento wow é a própria estante: capas em relevo com tilt 3D ao hover, prateleira com sombra de madeira, e o cartão "Lendo agora" com fita de progresso animada.

## Locked palette
- Papel: `#FBF7EE` (fundo), `#F3ECDD` (tinta de seção)
- Tinta: `#221D16` (texto), `#6B6155` (secundário)
- Acento único: amora `#7A3B52` (saturação ~44%) para CTAs, estrelas ativas e a fita de progresso
- Defesa: papel + tinta remete a miolo de livro; a amora vem das lombadas de romance/suspense que dominam a coleção. Nenhuma família banida (não é beige+brass: acento é berry frio, sem dourados).

## Locked type
- Display: `Source Serif 4` (serif JUSTIFICADO: o produto é literalmente sobre livros; registro editorial genuíno, não "premium genérico")
- UI/corpo: `Outfit`
- Números/detalhe: `IBM Plex Mono` (datas, páginas, preços)

## Tier-1 técnica
Estante viva (variação de W-CARD-TILT do catálogo): capas com perspectiva/tilt 3D respondendo ao hover do usuário + prateleiras com profundidade; no mobile, scroll horizontal por prateleira. Responde ao input do usuário; reduced-motion cai para estático.

## Section plan (home)
1. Cabeçalho fino com marca tipográfica + navegação (Estante / Adicionar / Retrospectiva)
2. "Lendo agora" — cartão hero horizontal com capa, fita de progresso, dias de leitura
3. Faixa de números do ano (livros, páginas, nota média, gasto) em mono
4. Estante por ano com filtros (gênero, busca) — prateleiras de capas
Layout families distintas por seção; zero eyebrows.

## Asset plan
- Imagens de conteúdo: capas reais (Google Books/Open Library), 44/50 já resolvidas no seed
- Capa tipográfica gerada em CSS para livros sem capa (título + autor sobre padrão de amora)
- Branding: cover 3:2 + OG capsule + favicon via pipeline de branding
- (Opcional pós-launch, mediante aprovação: ilustração pintada de canto de leitura para a Retrospectiva)

## CTA inventory
- "Adicionar livro" (primário, pill amora com livro que abre no hover) — home header
- "Terminei este livro" (no cartão Lendo agora, botão fita: sublinhado que vira check)
- "Salvar" (formulário, retângulo tinta com estado de progresso)
Cada um é componente próprio com identidade de interação própria.

## Copy
Português brasileiro, tom de caderno pessoal ("sua estante", "lendo agora", "uma palavra para este livro"). Sem em-dash. Números reais da coleção dela, nunca placeholders.
