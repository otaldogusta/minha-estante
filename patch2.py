import sys

file_path = r'c:\Projects\Minha Estante\standalone\src\components\estante\leitor-digital.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

target = '''<div className="rounded-xl border border-amora/30 bg-amora-clara/40 p-4 space-y-2">
                  <p className="text-xs font-semibold text-amora uppercase tracking-wider">
                    Sessão em Andamento · Código: {codigoSala}
                  </p>
                  <p className="text-sm font-medium text-tinta">
                    {dadosSala.souHost ? "👑 Você é o Moderador/Host desta leitura coletiva." : `Host: ${dadosSala.hostNome}`}
                  </p>
                  <p className="text-xs text-tinta-2">
                    {dadosSala.participantes.length} leitor(es) conectado(s) na página {dadosSala.paginaAtual}.
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold text-tinta-2">Leitores na sala:</p>'''

replacement = '''<div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between text-xs text-tinta-2 border-b border-papel-3 pb-2">
                    <span className="font-semibold">Leitores na sala ({dadosSala.participantes.length})</span>
                    <span>Página atual: <span className="font-bold text-tinta">{dadosSala.paginaAtual}</span></span>
                  </div>'''

if target in content:
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content.replace(target, replacement))
    print('Patched successfully!')
else:
    print('Target not found')
