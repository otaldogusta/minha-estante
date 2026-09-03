import sys

file_path = r'c:\Projects\Minha Estante\standalone\src\routes\novo.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

if 'useClickOutside' not in content:
    content = content.replace(
        'import { useState, useEffect } from "react";',
        'import { useState, useEffect, useRef } from "react";\nimport { useClickOutside, useEscapeKey } from "../lib/hooks";'
    )
    content = content.replace(
        'const [modalPlanilha, setModalPlanilha] = useState(false);',
        'const [modalPlanilha, setModalPlanilha] = useState(false);\n  const modalRef = useRef<HTMLDivElement>(null);\n  useClickOutside(modalRef, () => { if (modalPlanilha) setModalPlanilha(false); });\n  useEscapeKey(() => { if (modalPlanilha) setModalPlanilha(false); });'
    )
    content = content.replace(
        '<div className="w-full max-w-5xl bg-papel rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">',
        '<div ref={modalRef} className="w-full max-w-5xl bg-papel rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">'
    )
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
print("Patched novo")
