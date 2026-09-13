import sys

file_path = r'c:\Projects\Minha Estante\standalone\src\components\estante\formulario-livro.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

target3 = '            <label className="flex items-center gap-2 text-sm text-tinta-2 cursor-pointer">\n              <input\n                type="checkbox"\n                checked={!!v.privado}'

replacement3 = '''            <label className={rotulo}>
              Link do Arquivo (URL pública)
              <input
                className={`${campo} mt-1`}
                value={v.arquivo_url ?? ""}
                onChange={(e) => set("arquivo_url", e.target.value || null)}
                placeholder="Ex: https://drive.google.com/file/... (para leitura em grupo)"
              />
            </label>
            <label className="flex items-center gap-2 text-sm text-tinta-2 cursor-pointer mt-4">
              <input
                type="checkbox"
                checked={!!v.privado}'''

content = content.replace(target3, replacement3)

with open(file_path, 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
