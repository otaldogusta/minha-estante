import sys

file_path = r'c:\Projects\Minha Estante\standalone\src\components\estante\leitor-digital.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

target_mudar = '''if (codigoSala && dadosSala && !dadosSala.souHost) {
      if (novaPag > paginaAtual) {
        // Sinaliza prontidão automaticamente ao avançar
        marcarPaginaPronta({ data: { codigo: codigoSala, pagina: paginaAtual } }).catch(() => {});
      }
    }'''

replacement_mudar = '''if (codigoSala && dadosSala && !dadosSala.souHost) {
      if (novaPag > paginaAtual) {
        // Sinaliza prontidão automaticamente ao avançar
        marcarPaginaPronta({ data: { codigo: codigoSala, pagina: paginaAtual } }).catch(() => {});
      } else if (novaPag < paginaAtual) {
        // Desmarca prontidão ao voltar (marca como se a pronta fosse a anterior)
        marcarPaginaPronta({ data: { codigo: codigoSala, pagina: novaPag - 1 } }).catch(() => {});
      }
    }'''

content = content.replace(target_mudar, replacement_mudar)

target_blur_cond = '''const textoPaginaAtual = exibindoCapa
    ? ""
    : (paginasTexto[paginaTextoEfetiva - 1] || paginasTexto[0] || "");'''

replacement_blur_cond = '''const textoPaginaAtual = exibindoCapa
    ? ""
    : (paginasTexto[paginaTextoEfetiva - 1] || paginasTexto[0] || "");
    
  const adiantadoDoHost = codigoSala && dadosSala && !dadosSala.souHost && paginaAtual > dadosSala.paginaAtual;'''

content = content.replace(target_blur_cond, replacement_blur_cond)

target_render1 = '''<div 
                dangerouslySetInnerHTML={{ __html: textoPaginaAtual }} 
                onClick={handleContentClick}
                className="w-full flex-1 flex flex-col justify-start"
              />'''
replacement_render1 = '''<div className="relative w-full flex-1 flex flex-col justify-start">
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
              </div>'''

content = content.replace(target_render1, replacement_render1)

target_render2 = ''') : (
              textoPaginaAtual
            )}'''
replacement_render2 = ''') : (
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
            )}'''

content = content.replace(target_render2, replacement_render2)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Patched leitor-digital with blur")
