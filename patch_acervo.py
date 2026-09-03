import sys
import re

file_path = r'c:\Projects\Minha Estante\standalone\src\routes\acervo.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

if 'useClickOutside' not in content:
    content = content.replace(
        'import { useState } from "react";',
        'import { useState, useRef } from "react";\nimport { useClickOutside, useEscapeKey } from "../lib/hooks";'
    )

if 'const intencaoLeituraRef' not in content:
    content = content.replace(
        'const [intencaoLeituraModal, setIntencaoLeituraModal] = useState<LivroAcervo | null>(null);',
        'const [intencaoLeituraModal, setIntencaoLeituraModal] = useState<LivroAcervo | null>(null);\n  const amostraRef = useRef<HTMLDivElement>(null);\n  const intencaoLeituraRef = useRef<HTMLDivElement>(null);\n\n  useClickOutside(amostraRef, () => { if (amostraModal) setAmostraModal(null); });\n  useEscapeKey(() => { if (amostraModal) setAmostraModal(null); });\n  useClickOutside(intencaoLeituraRef, () => { if (intencaoLeituraModal) setIntencaoLeituraModal(null); });\n  useEscapeKey(() => { if (intencaoLeituraModal) setIntencaoLeituraModal(null); });'
    )

intencao_target = '<div className="max-w-sm w-full rounded-2xl border border-papel-3 bg-papel p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">'
intencao_replace = '<div ref={intencaoLeituraRef} className="max-w-sm w-full rounded-2xl border border-papel-3 bg-papel p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">'
content = content.replace(intencao_target, intencao_replace)

amostra_target = '<div className="max-w-lg w-full rounded-2xl border border-papel-3 bg-papel p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">'
amostra_replace = '<div ref={amostraRef} className="max-w-lg w-full rounded-2xl border border-papel-3 bg-papel p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">'
content = content.replace(amostra_target, amostra_replace)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Patched acervo.tsx")
