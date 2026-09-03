import sys

file_path = r'c:\Projects\Minha Estante\standalone\src\components\estante\leitor-digital.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

target = '''<div key={p.usuarioId} className="flex items-center justify-between rounded-lg bg-papel-2 px-3 py-2 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{p.nome}</span>
                            {p.usuarioId === dadosSala.hostUsuarioId && (
                              <span className="text-[10px] text-amora font-bold">👑 Host</span>
                            )}
                          </div>'''

replacement = '''<div key={p.usuarioId} className="flex items-center justify-between rounded-lg bg-papel-2 px-3 py-2 text-xs group/participante">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{p.nome}</span>
                            {p.usuarioId === dadosSala.hostUsuarioId ? (
                              <span className="text-[10px] text-amora font-bold">👑 Host</span>
                            ) : (
                              dadosSala.souHost && (
                                <button 
                                  onClick={() => handleExpulsarParticipante(p.usuarioId, p.nome)}
                                  className="ml-1 flex h-4 w-4 items-center justify-center rounded-full text-tinta-3 hover:bg-rose-100 hover:text-rose-600 opacity-0 group-hover/participante:opacity-100 transition-all cursor-pointer"
                                  title={`Remover ${p.nome}`}
                                >
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-2.5 h-2.5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                                </button>
                              )
                            )}
                          </div>'''

if target in content:
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content.replace(target, replacement))
    print('Patched successfully!')
else:
    print('Target not found')
