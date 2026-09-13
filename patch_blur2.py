import sys
import re

file_path = r'c:\Projects\Minha Estante\standalone\src\components\estante\leitor-digital.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

target = '''<div className={`text-justify selection:bg-[#7a3b52]/20 flex-1 overflow-y-auto pr-1 min-h-0 flex flex-col justify-start ${
              !exibindoCapa && !precisaCarregarArquivo && (textoPaginaAtual || "").trim().startsWith("<") ? "" : "whitespace-pre-line"
            }`}>'''

replacement = '''<div className={`text-justify selection:bg-[#7a3b52]/20 flex-1 overflow-y-auto pr-1 min-h-0 flex flex-col justify-start transition-all duration-300 ${
              !exibindoCapa && !precisaCarregarArquivo && (textoPaginaAtual || "").trim().startsWith("<") ? "" : "whitespace-pre-line"
            } ${adiantadoDoHost ? 'blur-md select-none opacity-30 pointer-events-none' : ''}`}>'''

if target in content:
    content = content.replace(target, replacement)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Patched text container blur")
else:
    print("Target not found")

