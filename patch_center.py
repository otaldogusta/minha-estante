import sys

file_path = r'c:\Projects\Minha Estante\standalone\src\components\estante\leitor-digital.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

target1 = '''          <div 
            ref={conteudoRef}
            className="flex-1 min-h-0 overflow-y-auto no-scrollbar pb-10 sm:pb-0"
          >'''
replacement1 = '''          <div 
            ref={conteudoRef}
            className={`flex-1 min-h-0 overflow-y-auto no-scrollbar pb-10 sm:pb-0 transition-all duration-500 ${adiantadoDoHost ? 'blur-md select-none opacity-30 pointer-events-none' : ''}`}
          >'''
content = content.replace(target1, replacement1)

target2 = '''            ) : (textoPaginaAtual || "").trim().startsWith("<") ? (
              <div className="relative w-full flex-1 flex flex-col justify-start">
                <div 
                  dangerouslySetInnerHTML={{ __html: textoPaginaAtual }} 
                  onClick={handleContentClick}
                  className={`w-full flex-1 flex flex-col justify-start transition-all duration-300 ${adiantadoDoHost ? 'blur-md select-none opacity-40' : ''}`}
                />
                {adiantadoDoHost && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-papel/80 backdrop-blur-md border border-papel-3 px-6 py-4 rounded-2xl shadow-xl text-center max-w-xs animate-in zoom-in-95">
                      <span className="text-3xl mb-2 block">🛋️</span>
                      <h4 className="font-bold text-tinta text-lg mb-1">Aguardando Host</h4>
                      <p className="text-tinta-2 text-xs">Você marcou a página anterior como lida. Aguarde o Host virar a página para todos lerem juntos!</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative w-full flex-1 flex flex-col justify-start">
                <div className={`w-full flex-1 flex flex-col justify-start transition-all duration-300 ${adiantadoDoHost ? 'blur-md select-none opacity-40' : ''}`}>
                  {textoPaginaAtual}
                </div>
                {adiantadoDoHost && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-papel/80 backdrop-blur-md border border-papel-3 px-6 py-4 rounded-2xl shadow-xl text-center max-w-xs animate-in zoom-in-95">
                      <span className="text-3xl mb-2 block">🛋️</span>
                      <h4 className="font-bold text-tinta text-lg mb-1">Aguardando Host</h4>
                      <p className="text-tinta-2 text-xs">Você marcou a página anterior como lida. Aguarde o Host virar a página para todos lerem juntos!</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </article>'''

replacement2 = '''            ) : (textoPaginaAtual || "").trim().startsWith("<") ? (
              <div 
                dangerouslySetInnerHTML={{ __html: textoPaginaAtual }} 
                onClick={handleContentClick}
                className="w-full flex-1 flex flex-col justify-start"
              />
            ) : (
              textoPaginaAtual
            )}
          </div>
          {adiantadoDoHost && (
            <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none p-6">
              <div className="bg-papel/95 backdrop-blur-xl border border-papel-3 px-8 py-6 rounded-3xl shadow-2xl text-center max-w-sm animate-in zoom-in-95 fade-in duration-300 pointer-events-auto">
                <span className="text-5xl mb-3 block drop-shadow-sm">🛋️</span>
                <h4 className="font-display font-bold text-tinta text-xl mb-2">Aguardando Host</h4>
                <p className="text-tinta-2 text-sm leading-relaxed">Você marcou a página anterior como lida.<br/>Aguarde o Host virar a página para todos continuarem a leitura juntos!</p>
              </div>
            </div>
          )}
        </article>'''

content = content.replace(target2, replacement2)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Patched absolute center overlay")
