# 🎨 Guia Completo de Design System, Animações & UI/UX — Minha Estante

Este documento é o guia definitivo de arquitetura de UI/UX, fontes, paleta de cores, componentes 3D, física de molas e animações para o aplicativo **Minha Estante**. 

---

## 1. 🌿 Filosofia Visual & Identidade

O **Minha Estante** combina a sensação tátil de um **diário físico de leitura em papel e tinta** com a elegância do design moderno, física de molas (*spring physics*) e animações fluidas.

- **Modo Claro (Padrão):** Fundo textura papel creme (`#fbf7ee`), tipografia sépia/marrom café (`#221d16`) e destaques na cor Amora vinha (`#7a3b52`).
- **Modo Noturno (Dark):** Fundo noturno aconchegante (`#120f17`), prateleiras em madeira escura, superfícies translúcidas em vidro foscado (*glassmorphism*) e destaques em Amora Rosa (`#d57292`).

---

## 2. 🎨 Tokens de Cores & Variáveis de Tema

Todas as cores da aplicação são semânticas e sincronizadas automaticamente via `data-theme`.

| Token Tailwind | Modo Claro | Modo Noturno (`dark`) | Uso Obrigatório |
| :--- | :--- | :--- | :--- |
| `bg-papel` | `#fbf7ee` | `#120f17` | Fundo principal da página e modais |
| `bg-papel-2` | `#f3ecdd` | `#1c1822` | Fundo secundário, tags e áreas de entrada |
| `bg-papel-3` | `#ece3cf` | `#2c2535` | Bordas e divisores (`border-papel-3`) |
| `text-tinta` | `#221d16` | `#f4ecf8` | Títulos principais (`h1`, `h2`), valores destacados |
| `text-tinta-2` | `#6b6155` | `#bfaec6` | Subtítulos, rótulos de campos, corpo de texto |
| `text-tinta-3` | `#a2968a` | `#7e7087` | Legendas, timestamps, textos mudos/desabilitados |
| `bg-amora` / `text-amora` | `#7a3b52` | `#d57292` | Cor primária da marca, botões de ação principal, destaques |
| `bg-amora-escura` | `#5e2c3f` | `#ea95b0` | Estado `:hover` dos botões primários |
| `bg-amora-clara` | `#f0e2e8` | `#2f1d2a` | Avatares, badges ativos e fundos de destaque |

> ❌ **PROIBIDO:** Usar cores genéricas como `bg-gray-200`, `bg-blue-500`, `text-black` ou cores inline soltas. Use sempre os tokens da marca.

---

## 3. 📚 Componentes de Assinatura Visual (Livros & Prateleiras)

### 3.1. Efeito 3D nas Capas de Livros (`.livro-capa`)
As capas de livros possuem física tridimensional realista com lombada, brilho suave e efeito de inclinação 3D ao passar o mouse (*hover tilt*):
- **Efeito Hover:** `transform: perspective(700px) rotateY(-14deg) translateY(-8px) scale(1.03)`.
- **Lombada e Relevo:** Gradientes integrados `linear-gradient` simulam o vinco e a textura do papel.
```tsx
<div className="livro-capa">
  <img src={capaUrl} alt={titulo} className="h-full w-full object-cover rounded-[3px_8px_8px_3px]" />
</div>
```

### 3.2. Prateleira de Madeira (`.prateleira`)
Linha estrutural em gradiente de madeira com sombra realista que sustenta cada fileira de livros:
```tsx
<div className="prateleira flex snap-x gap-5 overflow-x-auto pb-2 sm:flex-wrap">
  {/* Cards de livros */}
</div>
```

### 3.3. Fita de Progresso com Brilho Shimmer (`.fita-progresso`)
Utilizada para indicar a porcentagem de leitura do livro atual ("Lendo agora"):
```tsx
<div className="fita-progresso">
  <span style={{ width: `${porcentagem}%` }} />
</div>
```
- **Animação:** Efeito de brilho de luz contínuo (`fita-brilho`) deslizando em loop.

---

## 4. ✨ Animações & Micro-interações

### 4.1. Transição de Entrada de Página (`.page-layout-transition`)
Animação suave de fade-in e subida ao trocar de rotas:
- Classe: `page-layout-transition` (`animation: page-fade-in 0.65s cubic-bezier(0.16, 1, 0.3, 1)`).

### 4.2. Efeito Mola em Botões e Ícones (`.spring-bounce`)
Aplica física de mola nos botões e elementos clicáveis:
```tsx
<button className="spring-bounce inline-flex h-8 w-8 items-center justify-center rounded-full border border-papel-3">
  {/* Ícone */}
</button>
```
- **Hover:** `translateY(-2px) scale(1.02)` com mola cúbica `cubic-bezier(0.175, 0.885, 0.32, 1.275)`.
- **Clique (Active):** `translateY(1px) scale(0.97)`.

### 4.3. Animação de Surgimento de Cards (`.surgir`)
Utilizada ao carregar elementos da tela para dar sensação de vida.

### 4.4. Confete de Mini-Páginas (`.confete-pagina`)
Partículas de folhas de papel caindo com rotação aleatória ao concluir a leitura de um livro.

### 4.5. Textura de Papel (`.textura-papel`)
Padrão pontilhado sutil de diário impresso aplicado ao fundo principal.

---

## 5. 📦 Arquitetura de Superfícies & Cards

### 5.1. Card Padrão Interativo (`.card-surface`)
Usado em leitores, cartas e formulários:
```tsx
<div className="card-surface group flex items-center gap-4 rounded-2xl border border-papel-3/80 p-5 shadow-sm transition-all hover:border-amora hover:shadow-md active:translate-y-[1px]">
  {/* Conteúdo */}
</div>
```

### 5.2. Modal Popups & Backdrop Glasser (`.modal-backdrop`)
```tsx
<div className="modal-backdrop" onClick={fechar}>
  <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-papel-3 bg-papel textura-papel shadow-2xl surgir max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
    <div className="flex items-center justify-between border-b border-papel-3 p-5">
      <h2 className="font-display text-xl font-semibold text-tinta">Título do Modal</h2>
      <button onClick={fechar} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-papel-3 text-tinta text-lg cursor-pointer">✕</button>
    </div>
    <div className="overflow-y-auto p-6 space-y-4 flex-1 custom-scrollbar">
      {/* Conteúdo */}
    </div>
  </div>
</div>
```

---

## 6. 🔤 Tipografia Oficial

- **`font-display` (Titular):** *"Source Serif 4"*, Georgia, serif. Utilizada em títulos (`h1`, `h2`), capas e nomes de autores.
- **`font-ui` (Interface):** *"Outfit"*, system-ui, sans-serif. Utilizada no corpo de texto, botões e navegação.
- **`font-num` (Numerais):** *"IBM Plex Mono"*, monospace. Utilizada para anos, métricas, páginas e valores financeiros.

---

## 7. 🔘 Botões & Controles

- **Botão Primário:** `rounded-xl bg-amora px-6 py-3 text-sm font-medium text-papel transition-colors hover:bg-amora-escura active:translate-y-[1px] disabled:opacity-60 cursor-pointer`
- **Botão Secundário:** `rounded-xl border border-amora px-4 py-2 text-sm font-medium text-amora transition-colors hover:bg-amora hover:text-papel active:translate-y-[1px] cursor-pointer`
- **Campos de Texto:** `w-full rounded-lg border border-papel-3 bg-papel px-3 py-2.5 text-tinta placeholder:text-tinta-3 focus:border-amora focus:outline-none transition-colors`

---

## 8. 📱 Scrollbar & Responsividade

- **Scrollbar Global:** Pílula flutuante sem fundo (`transparent !important`) e sem setas.
- **Modo Sem Scrollbar (`.no-scrollbar`):** Esconde barras de rolagens sem quebrar a funcionalidade de scroll.
- **Responsividade:** Telas completas usam `max-w-6xl px-4 sm:px-6`. Formulários focados usam `max-w-md` ou `max-w-lg`.

---

## 9. 🛡️ Segurança, Privacidade & Plataforma Social (Multi-Tenant)

Para suportar o crescimento da rede com múltiplos leitores e interações sociais com total segurança:

1. **Proteção Anti-IDOR (Isolamento entre Contas):**
   Toda requisição de escrita/deleção (`UPDATE`, `DELETE`) **exige** a cláusula `WHERE usuario_id = u.id` diretamente na query SQL. Nenhum leitor pode alterar dados de outro leitor.

2. **Privacidade Absoluta de Cartas Lacradas:**
   Cartas condicionadas a um livro têm o corpo substituído por `NULL` diretamente no servidor (`CASE WHEN desbloqueada THEN corpo ELSE NULL END`). O texto da carta **nunca trafega pela rede** enquanto o livro não for concluído.

3. **Livros Privados (`privado = 1`):**
   Livros marcados como privados são filtrados no SQL em perfis públicos (`WHERE privado = 0`). O valor financeiro investido (`valor`) e anotações privadas jamais vazam para outros usuários.

4. **Autenticação Criptográfica:**
   - **Senhas:** Criptografadas com Web Crypto API PBKDF2 (100.000 iterações + salt de 16 bytes).
   - **Timing Attacks:** Comparação de senha em tempo constante (`diff |= a[i] ^ b[i]`).
   - **Sessão:** Tokens de 256 bits em cookies `HttpOnly`, `Secure` e `SameSite=Lax`.

5. **Cabeçalhos OWASP no Vercel Edge:**
   - `X-Content-Type-Options: nosniff`
   - `X-Frame-Options: SAMEORIGIN` (Proteção Anti-Clickjacking)
   - `X-XSS-Protection: 1; mode=block`
   - `Permissions-Policy: camera=(), microphone=(), geolocation=()`

---

## 10. 🛑 Regra de Ouro: Confirmação Prévia em Qualquer Alteração (Confirmation Modal Rule)

1. **Modal de Confirmação Obrigatório:**
   Toda e qualquer ação que possa alterar, sobrescrever, importar, sincronizar em lote ou excluir dados (sincronização com o Google Sheets, exclusão de livros/resenhas, revogação de convites ou alterações de conta) **DEVE OBRIGATORIAMENTE** exibir um modal de confirmação prévio e explícito explicando os impactos da ação antes de executar a mutação no banco de dados.

2. **Montagem via React Portal (`createPortal`):**
   Todos os modais do sistema devem ser renderizados montados diretamente no `document.body` via `createPortal(modalJSX, document.body)`. Isso impede que o modal seja distorcido por containers pais com `transform` ou `overflow` e garante que permaneça **100% fixo e centralizado no viewport do usuário** independente da posição do scroll da página.

3. **Bloqueio de Rolagem do Fundo (`Body Scroll Lock`):**
   A abertura de qualquer modal ativa `document.body.style.overflow = "hidden"` no mount e restaura no unmount para eliminar completamente o vazamento de scroll (*scroll bleed*).

4. **Micro-interações de Hover & Física de Mola (`.spring-bounce` & `.livro-capa`):**
   Todos os elementos interativos (botões, links, cards, ícones, checkboxes e pílulas de filtro) **DEVEM OBRIGATORIAMENTE INCLUIR `cursor-pointer`**, efeito de elevação/levitação suave no hover (`translateY(-2px) scale(1.02)`) com física de mola cúbica e inclinação 3D nas capas de livros (`transform: perspective(700px) rotateY(-14deg) translateY(-8px) scale(1.03)`).


