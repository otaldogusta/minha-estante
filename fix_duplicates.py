import re

with open(r'c:\Projects\Minha Estante\standalone\src\lib\api\sala-leitura.functions.ts', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace('''export type SalaMensagem = {
  id: number;
  usuarioId: number;
  usuarioNome: string;
  mensagem: string;
  criadoEm: string;
};

export type SalaMensagem = {''', '''export type SalaMensagem = {''')

with open(r'c:\Projects\Minha Estante\standalone\src\lib\api\sala-leitura.functions.ts', 'w', encoding='utf-8') as f:
    f.write(text)
