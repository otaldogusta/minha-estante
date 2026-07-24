# 🛡️ Regras Obrigatórias de Desenvolvimento, Segurança & UI/UX — Minha Estante

## 1. 🛑 Confirmação Prévia de Alterações Críticas (Confirmation Modal Rule)
Sempre que uma ação puder alterar, sobrescrever, importar, sincronizar em lote ou excluir dados (ex: sincronização com a planilha do Google Sheets, exclusão de livros, revogação de convites ou alteração de conta), **É OBRIGATÓRIO** exibir um modal de confirmação prévio e explícito explicando os impactos da ação antes de disparar a mutação no banco de dados.

---

## 2. 🪟 Arquitetura de Modais & Trava de Rolagem (Modal Portal & Scroll Lock)
- **Portal de Montagem (`createPortal`):** Todo e qualquer modal **DEVE** ser renderizado utilizando `createPortal(modalJSX, document.body)` para desvincular o componente de containers ancestrais com `transform`, `overflow` ou `will-change`. Isso garante que o modal permaneça 100% fixo e alinhado à janela do usuário (*viewport*), independente do scroll da página.
- **Trava de Rolagem do Fundo (`Body Scroll Lock`):** Todo modal em exibição DEVE acionar `document.body.style.overflow = "hidden"` ao abrir e restaurar ao fechar, impedindo que a rolagem do mouse ou toque no celular vaze para a página ao fundo (*scroll bleed*).
- **Centralização Padrão (`Dead-Center`):** O backdrop DEVE utilizar a classe `.modal-backdrop` (`position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; padding: 1.5rem;`) e a caixa interna deve usar `my-auto max-h-[85vh]` para alinhamento perfeitamente centralizado.

---

## 3. 🎨 Tokens Semânticos & Contraste de Tema
- **Proibição de Cores Brutas:** Nunca utilize classes estáticas como `bg-white/60`, `bg-gray-200` ou `text-black` em inputs ou caixas de texto.
- **Compatibilidade Noturna:** Use sempre os tokens semânticos (`.card-surface`, `bg-papel`, `bg-papel-2`, `border-papel-3`, `text-tinta`, `text-tinta-2`) definidos em `DESIGN_SYSTEM.md`, garantindo contraste nítido em ambos os temas.
