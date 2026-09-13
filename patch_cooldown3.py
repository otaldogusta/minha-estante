import sys

file_path = r'c:\Projects\Minha Estante\standalone\src\components\estante\leitor-digital.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    'const [historicoEnvios, setHistoricoEnvios] = useState<number[]>([]);',
    'const historicoEnviosRef = useRef<number[]>([]);'
)

target_logic = '''const agora = Date.now();
    const recentes = historicoEnvios.filter(t => agora - t < 5000);
    
    if (recentes.length >= 3) {
      setCooldownChat(5); // 5s de punição
      return;
    }
    
    const msg = mensagemInput.trim();
    setMensagemInput("");
    setEnviandoMsg(true);
    setHistoricoEnvios([...recentes, agora]);'''

replacement_logic = '''const agora = Date.now();
    const recentes = historicoEnviosRef.current.filter(t => agora - t < 5000);
    
    if (recentes.length >= 3) {
      setCooldownChat(5); // 5s de punição
      return;
    }
    
    const msg = mensagemInput.trim();
    setMensagemInput("");
    setEnviandoMsg(true);
    historicoEnviosRef.current = [...recentes, agora];'''

content = content.replace(target_logic, replacement_logic)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Patched ref")
