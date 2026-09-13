import sys

file_path = r'c:\Projects\Minha Estante\standalone\src\components\estante\leitor-digital.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

target = 'text-justify selection:bg-[#7a3b52]/20 flex-1 overflow-y-auto pr-1 min-h-0 flex flex-col justify-start ${'
replacement = 'text-justify selection:bg-[#7a3b52]/20 flex-1 overflow-y-auto pr-1 min-h-0 flex flex-col justify-start transition-all duration-500 ${adiantadoDoHost ? "blur-md select-none opacity-30 pointer-events-none" : ""} ${'

if target in content:
    content = content.replace(target, replacement)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Patched text-justify div")
else:
    print("Target not found")
