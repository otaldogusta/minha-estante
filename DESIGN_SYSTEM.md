# 🎨 Guia de Design System & UI/UX — Minha Estante

Este documento é a especificação oficial de UI/UX, cores, formas, tipografia e componentes para o aplicativo **Minha Estante**. Ao criar novas telas, componentes ou formulários, siga rigorosamente as diretrizes abaixo para garantir consistência total em todo o produto.

---

## 1. 🌿 Filosofia Visual & Identidade

O **Minha Estante** tem uma estética visual inspirada em um **diário físico de leitura em papel e tinta**, combinada com modernidade, elegância e responsividade.

- **Modo Claro (Padrão):** Textura sutil de papel creme (`#fbf7ee`), tinta sépia/marrom café (`#221d16`) e destaques em Amora vinha (`#7a3b52`).
- **Modo Noturno (Dark):** Fundo noturno profundo acolhedor (`#181512`), superfícies de vidro fOSCo (*glassmorphism*), detalhes em papel aquecido e destaques em Amora Rosa (`#d57292`).

---

## 2. 🎨 Tokens de Cores (Tailwind v4)

Todas as cores da aplicação são semânticas e adaptáveis aos modos Claro/Escuro via atributos `data-theme`.

| Token Tailwind | Cor Hex (Light) | Uso Obrigatório |
| :--- | :--- | :--- |
| `bg-papel` | `#fbf7ee` | Fundo principal da página e modais |
| `bg-papel-2` | `#f3ecdd` | Fundo secundário, tags inativas e campos |
| `bg-papel-3` | `#ece3cf` | Bordas e divisores (`border-papel-3`) |
| `text-tinta` | `#221d16` | Títulos principais (`h1`, `h2`), valores destacados |
| `text-tinta-2` | `#6b6155` | Subtítulos, rótulos de campos, corpo de texto |
| `text-tinta-3` | `#a2968a` | Legendas, timestamps, textos mudos/desabilitados |
| `bg-amora` / `text-amora` | `#7a3b52` | Cor primária da marca, botões de ação principal, destaques |
| `bg-amora-escura` | `#5e2c3f` | Estado `:hover` dos botões primários |
| `bg-amora-clara` | `#f0e2e8` | Avatares, badges ativos e fundos de destaque |

> ❌ **PROIBIDO:** Usar cores genéricas como `bg-gray-200`, `bg-blue-500`, `text-black`, `border-gray-300` ou cores inline aleatórias. Use sempre os tokens da marca (`papel`, `tinta`, `amora`).

---

## 3. 📦 Arquitetura de Superfícies & Cards

Para manter a consistência entre todas as telas do aplicativo, utilize apenas as superfícies padrão:

### 3.1. Card Padrão Interativo (`card-surface`)
Todos os cards de lista (livros, leitores, cartas, integrações) **devem** utilizar a classe `.card-surface`:
```tsx
<div className="card-surface group flex items-center gap-4 rounded-2xl border border-papel-3/80 p-5 shadow-sm transition-all hover:border-amora hover:shadow-md active:translate-y-[1px]">
  {/* Conteúdo do card */}
</div>
```
- **Borda:** `border border-papel-3/80` (no hover transmuta para `hover:border-amora`).
- **Arredondamento:** `rounded-2xl` (16px).
- **Sombra:** `shadow-sm` no estado normal e `shadow-md` no hover.

### 3.2. Modal Popups
Todos os modais do sistema devem compartilhar a mesma estrutura:
```tsx
<div className="modal-backdrop" onClick={fechar}>
  <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-papel-3 bg-papel textura-papel shadow-2xl surgir max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
    <div className="flex items-center justify-between border-b border-papel-3 p-5">
      <h2 className="font-display text-xl font-semibold text-tinta">Título do Modal</h2>
      <button onClick={fechar} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-papel-3 text-tinta text-lg cursor-pointer">✕</button>
    </div>
    <div className="overflow-y-auto p-6 space-y-4 flex-1 custom-scrollbar">
      {/* Conteúdo do Modal */}
    </div>
  </div>
</div>
```

---

## 4. 🔤 Hierarquia Tipográfica & Fontes

1. **Títulos Principais (`h1`, `h2`, nomes de livros, seções):**
   - Classe: `font-display text-tinta tracking-tight font-semibold`
   - Estilo: Tipografia clássica serifada / editorial.
2. **Números & Estatísticas (`2026`, valores em R$, contadores):**
   - Classe: `font-num text-tinta` (ou `text-amora`)
   - Estilo: Numerais tabulares alinhados.
3. **Corpo de Texto e Rótulos (`p`, `label`, descrições):**
   - Classe: `font-sans text-tinta-2`
   - Estilo: Leitura agradável e legível.

---

## 5. 🔘 Botões & Controles Interativos

### 5.1. Botão Primário (Ação Principal / CTA)
Usado para submeter formulários, confirmar ações ou adicionar livros:
```tsx
<button className="rounded-xl bg-amora px-6 py-3 text-sm font-medium text-papel transition-colors hover:bg-amora-escura active:translate-y-[1px] disabled:opacity-60 cursor-pointer">
  Salvar alterações
</button>
```

### 5.2. Botão Secundário / Contorno
Usado para ações secundárias ou convites:
```tsx
<button className="rounded-xl border border-amora px-4 py-2 text-sm font-medium text-amora transition-colors hover:bg-amora hover:text-papel active:translate-y-[1px] cursor-pointer">
  + Convidar
</button>
```

### 5.3. Botões Circulares de Ícone (Tema, Fechar, Conta)
```tsx
<button className="spring-bounce inline-flex h-8 w-8 items-center justify-center rounded-full border border-papel-3 text-tinta-2 hover:border-amora hover:text-amora hover:bg-papel-2/50 cursor-pointer">
  {/* Ícone SVG */}
</button>
```

### 5.4. Campos de Entrada de Texto (`<input>`, `<textarea>`, `<select>`)
```tsx
<input className="w-full rounded-lg border border-papel-3 bg-papel px-3 py-2.5 text-tinta placeholder:text-tinta-3 focus:border-amora focus:outline-none transition-colors" />
```

---

## 6. 📱 Regras de Layout & Responsividade

1. **Largura Máxima das Páginas:**
   - Páginas completas com grades (Estante, Retrospectiva): `max-w-6xl px-4 sm:px-6`
   - Listas médias (Leitores, Cartas): `max-w-2xl px-4 sm:px-6`
   - Formulários focados (Conta, Login, Novo Livro): `max-w-lg` ou `max-w-sm px-4`
2. **Grades de Números em Telas Pequenas:**
   - Em celulares (`<640px`), use `grid-cols-2 gap-x-2 gap-y-6` com tamanhos adaptativos `text-xl sm:text-2xl md:text-3xl` e a classe `truncate` em valores monetários ou longos para nunca quebrar a tela.
3. **Barra de Rolagem (Scrollbar):**
   - A barra de rolagem global é sem fundo (`background: transparent !important`) com pílula de 8px e sem setinhas.
   - Em containers que rolam horizontalmente (ex: abas ou filtros), use a classe `.no-scrollbar`.

---

## 7. ✨ Animações & Micro-interações

- **Entrada de Tela:** Adicione `.surgir` para uma transição suave de fade-in e subida.
- **Efeito Mola em Ícones:** Adicione `.spring-bounce` em links e botões circulares.
- **Indicadores de Lista:** Adicione `transition-transform duration-300 motion-safe:group-hover:translate-x-1` em setas (`→`).
