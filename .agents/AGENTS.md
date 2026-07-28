# 🛡️ Regras Obrigatórias de Desenvolvimento, Segurança & UI/UX — Minha Estante

## 1. 🛑 Confirmação Prévia de Alterações Críticas (Confirmation Modal Rule)
Sempre que uma ação puder alterar, sobrescrever, importar, sincronizar em lote ou excluir dados (ex: sincronização com a planilha do Google Sheets, exclusão de livros, revogação de convites ou alteração de conta/dados), **É OBRIGATÓRIO** exibir um modal de confirmação prévio e explícito explicando os impactos da ação antes de disparar a mutação no banco de dados.

---

## 2. 🪟 Arquitetura Obrigatória de Modais (Modal Portal, Scroll Lock, Fechamento & ESC)
- **Portal de Montagem (`createPortal`):** Todo e qualquer modal **DEVE** ser renderizado utilizando `createPortal(modalJSX, document.body)` para desvincular o componente de containers ancestrais com `transform`, `overflow` ou `backdrop-blur`. Isso garante que o modal permaneça 100% fixo e alinhado ao centro da janela (*viewport*), evitando que fique cortado ou invisível.
- **Trava de Rolagem do Fundo (`Body Scroll Lock`):** Todo modal DEVE conter `useEffect` para acionar `document.body.style.overflow = "hidden"` ao abrir e restaurar `document.body.style.overflow = ""` ao fechar, impedindo que a rolagem do mouse ou toque no celular vaze para a página de trás (*scroll bleed*).
- **Fechar ao Clicar Fora (Backdrop Click):** O container do fundo escuro (`fixed inset-0`) DEVE possuir o handler `onClick={onClose}` e o card interno do modal DEVE possuir `onClick={(e) => e.stopPropagation()}` para fechar instantaneamente ao clicar fora da caixa do modal.
- **Fechar com Tecla `ESC` e Botão `X`:** É OBRIGATÓRIO registrar o listener global da tecla `Escape` (`window.addEventListener("keydown", (e) => { if (e.key === "Escape") onClose(); })`) e fornecer o botão `X` visível no cabeçalho.
- **Centralização Padrão (`Dead-Center`):** O backdrop DEVE utilizar alinhamento centralizado (`position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; padding: 1.5rem;`) e o card interno usar `my-auto max-h-[85vh]` para alinhamento perfeitamente centralizado.

---

## 3. 🎨 Tokens Semânticos & Contraste de Tema
- **Proibição de Cores Brutas:** Nunca utilize classes estáticas como `bg-white/60`, `bg-gray-200` ou `text-black` em inputs ou caixas de texto.
- **Compatibilidade Noturna:** Use sempre os tokens semânticos (`.card-surface`, `bg-papel`, `bg-papel-2`, `border-papel-3`, `text-tinta`, `text-tinta-2`) definidos em `DESIGN_SYSTEM.md`, garantindo contraste nítido em ambos os temas.

---

## 4. 🖱️ Micro-interações de Hover, Cursor & Física de Mola (Hover & Spring Rule)
- **Cursor Pointer Obrigatório:** Todo e qualquer elemento interativo (botões, links, ícones, cards, checkboxes e pills) **DEVE** incluir a classe `cursor-pointer`.
- **Física de Mola (`.spring-bounce`):** Botões e elementos clicáveis devem utilizar micro-interações táteis no hover (`translateY(-2px) scale(1.02)`) com física de mola cúbica e afundamento realista ao pressionar (`translateY(1px) scale(0.97)`).
- **Cards Interativos (`.card-surface`):** Cards e cartões clicáveis devem ter transição suave de borda para a cor da marca (`hover:border-amora`), elevação de sombra e levitação suave ao passar o cursor.
- **Efeito 3D nas Capas (`.livro-capa`):** As capas dos livros em estantes e galerias devem aplicar projeção 3D realista com vinco de lombada e inclinação tridimensional (`transform: perspective(700px) rotateY(-14deg) translateY(-8px) scale(1.03)`).

---

## 5. 🎈 Popovers e Tooltips Flutuantes "Na Frente de Tudo" (Floating Overlay & Overflow Rule)
- **Sobreposição sem Cortes (`Always On Top`):** Tooltips, popovers e prévias flutuantes acionadas por hover ou clique **NUNCA DEVEM** ser cortados por `overflow-hidden` do card pai nem ficar sobrepostos por outros elementos.
- **Isolamento de Overflow:** O container externo do card DEVE utilizar `overflow-visible` (aplicando `overflow-hidden` apenas na div de fundo para efeitos de brilho) e o popover DEVE utilizar `z-50 backdrop-blur-2xl drop-shadow-2xl` posicionado no topo (`bottom-full mb-2`) para flutuar livremente **na frente de absolutamente tudo**.

