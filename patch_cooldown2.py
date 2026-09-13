import sys

file_path = r'c:\Projects\Minha Estante\standalone\src\components\estante\leitor-digital.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

target_state = '''const [cooldownChat, setCooldownChat] = useState(0);'''
replacement_state = '''const [cooldownChat, setCooldownChat] = useState(0);
  const [historicoEnvios, setHistoricoEnvios] = useState<number[]>([]);'''
content = content.replace(target_state, replacement_state)

target_handler = '''async function handleEnviarMensagem(e: React.FormEvent) {
    e.preventDefault();
    if (!mensagemInput.trim() || !codigoSala || enviandoMsg || cooldownChat > 0) return;
    const msg = mensagemInput.trim();
    setMensagemInput("");
    setEnviandoMsg(true);'''

replacement_handler = '''async function handleEnviarMensagem(e: React.FormEvent) {
    e.preventDefault();
    if (!mensagemInput.trim() || !codigoSala || enviandoMsg || cooldownChat > 0) return;
    
    const agora = Date.now();
    const recentes = historicoEnvios.filter(t => agora - t < 5000);
    
    if (recentes.length >= 3) {
      setCooldownChat(5); // 5s de punição
      return;
    }
    
    const msg = mensagemInput.trim();
    setMensagemInput("");
    setEnviandoMsg(true);
    setHistoricoEnvios([...recentes, agora]);'''
content = content.replace(target_handler, replacement_handler)

target_finally = '''} finally {
      setEnviandoMsg(false);
      setCooldownChat(2); // 2 segundos de timeout
    }'''
replacement_finally = '''} finally {
      setEnviandoMsg(false);
    }'''
content = content.replace(target_finally, replacement_finally)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Patched burst cooldown")
