import sys

file_path = r'c:\Projects\Minha Estante\standalone\src\components\estante\leitor-digital.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    'import { createPortal } from "react-dom";',
    'import { createPortal } from "react-dom";\nimport { useClickOutside, useEscapeKey } from "../../lib/hooks";'
)

content = content.replace(
    'const reacoesRef = useRef<HTMLDivElement>(null);',
    'const reacoesRef = useRef<HTMLDivElement>(null);\n  const modalSalaRef = useRef<HTMLDivElement>(null);\n  const confirmarSaidaRef = useRef<HTMLDivElement>(null);'
)

# Remove the old useEffect for reacoesRef
old_use_effect = '''  useEffect(() => {
    if (!menuReacoesAberto) return;
    function handleClickOutside(e: MouseEvent) {
      if (reacoesRef.current && !reacoesRef.current.contains(e.target as Node)) {
        setMenuReacoesAberto(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuReacoesAberto]);'''

new_hooks = '''  useClickOutside(reacoesRef, () => {
    if (menuReacoesAberto) setMenuReacoesAberto(false);
  });

  useClickOutside(modalSalaRef, () => {
    if (modalSalaAberto) setModalSalaAberto(false);
  });
  useEscapeKey(() => {
    if (modalSalaAberto) setModalSalaAberto(false);
  });

  useClickOutside(confirmarSaidaRef, () => {
    if (confirmarSaida) setConfirmarSaida(false);
  });
  useEscapeKey(() => {
    if (confirmarSaida) setConfirmarSaida(false);
  });'''

content = content.replace(old_use_effect, new_hooks)

# Now we need to attach refs to the modals
# The first modal: <div className="w-full max-w-md rounded-2xl border border-papel-3 bg-papel p-6 shadow-2xl text-tinta space-y-5 animate-in zoom-in-95">
modal_sala_target = '<div className="w-full max-w-md rounded-2xl border border-papel-3 bg-papel p-6 shadow-2xl text-tinta space-y-5 animate-in zoom-in-95">'
modal_sala_replacement = '<div ref={modalSalaRef} className="w-full max-w-md rounded-2xl border border-papel-3 bg-papel p-6 shadow-2xl text-tinta space-y-5 animate-in zoom-in-95">'
content = content.replace(modal_sala_target, modal_sala_replacement)

# The second modal (confirmarSaida):
confirm_saida_target = '<div className="w-full max-w-sm rounded-2xl border border-papel-3 bg-papel p-6 shadow-2xl text-tinta animate-in zoom-in-95">'
confirm_saida_replacement = '<div ref={confirmarSaidaRef} className="w-full max-w-sm rounded-2xl border border-papel-3 bg-papel p-6 shadow-2xl text-tinta animate-in zoom-in-95">'
content = content.replace(confirm_saida_target, confirm_saida_replacement)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Patched completely!")
