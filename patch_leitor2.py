# -*- coding: utf-8 -*-
import re

with open(r'c:\Projects\Minha Estante\standalone\src\components\estante\leitor-digital.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

main_old = '''<ReacoesFlutuantesContainer />

      {/* Área Principal de Leitura */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-4 sm:py-6 flex flex-col justify-between overflow-hidden relative">'''
      
main_new = '''<ReacoesFlutuantesContainer />

      <div className="flex-1 flex overflow-hidden relative">
        {/* Área Principal de Leitura */}
        <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-4 sm:py-6 flex flex-col justify-between overflow-hidden relative transition-all duration-300">'''

text = text.replace(main_old, main_new)

footer_old = '''        {/* Bottom Footer de Controles */}
        <footer className={sticky bottom-0 z-40 border-t px-4 py-3 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4 border-inherit bg-inherit/90 transition-all duration-300 }>'''

footer_new = '''        </main>

        {/* Chat Sidebar / Overlay */}
        {codigoSala && dadosSala && (
          <aside
            className={
              absolute sm:relative right-0 top-0 bottom-0 z-[45]
              w-full sm:w-[320px] flex flex-col border-l border-inherit bg-inherit
              transition-all duration-300 ease-in-out font-sans
              
            }
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-inherit">
              <h3 className="font-semibold text-sm">Chat da Sala</h3>
              <button 
                onClick={() => setChatAberto(false)}
                className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              >
                ?
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {!dadosSala.mensagens || dadosSala.mensagens.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-50 text-center px-4">
                  <span className="text-2xl mb-2">??</span>
                  <p className="text-xs">Nenhuma mensagem ainda. Mande um oi!</p>
                </div>
              ) : (
                dadosSala.mensagens.map((m) => (
                  <div key={m.id} className="text-sm">
                    <span className="font-semibold" style={{ color: "var(--color-amora)" }}>{m.usuarioNome}: </span>
                    <span className="opacity-90">{m.mensagem}</span>
                  </div>
                ))
              )}
              <div ref={mensagensEndRef} />
            </div>

            <form onSubmit={handleEnviarMensagem} className="p-3 border-t border-inherit bg-inherit/50 flex gap-2">
              <input 
                type="text"
                placeholder="Digite algo..."
                value={mensagemInput}
                onChange={(e) => setMensagemInput(e.target.value)}
                maxLength={200}
                className="flex-1 rounded-full px-4 py-2 text-sm bg-black/5 dark:bg-white/10 outline-none focus:ring-1 focus:ring-amora placeholder:opacity-50"
              />
              <button
                type="submit"
                disabled={!mensagemInput.trim() || enviandoMsg}
                className="w-9 h-9 rounded-full bg-amora text-white flex items-center justify-center disabled:opacity-50 flex-shrink-0 cursor-pointer"
              >
                ?
              </button>
            </form>
          </aside>
        )}
      </div>

        {/* Bottom Footer de Controles */}
        <footer className={sticky bottom-0 z-40 border-t px-4 py-3 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4 border-inherit bg-inherit/90 transition-all duration-300 }>'''

text = text.replace(footer_old, footer_new)

with open(r'c:\Projects\Minha Estante\standalone\src\components\estante\leitor-digital.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
