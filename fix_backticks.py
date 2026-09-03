import re

with open(r'c:\Projects\Minha Estante\standalone\src\lib\api\sala-leitura.functions.ts', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace('''UPDATE sala_participantes 
           SET ultimo_sinal = datetime('now')
           WHERE sala_id = ? AND usuario_id = ?''', '''UPDATE sala_participantes 
           SET ultimo_sinal = datetime('now')
           WHERE sala_id = ? AND usuario_id = ?''')

with open(r'c:\Projects\Minha Estante\standalone\src\lib\api\sala-leitura.functions.ts', 'w', encoding='utf-8') as f:
    f.write(text)
