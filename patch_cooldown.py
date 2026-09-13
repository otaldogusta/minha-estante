import sys

file_path = r'c:\Projects\Minha Estante\standalone\src\components\estante\leitor-digital.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

target_state = '''const [enviandoMsg, setEnviandoMsg] = useState(false);'''
replacement_state = '''const [enviandoMsg, setEnviandoMsg] = useState(false);
  const [cooldownChat, setCooldownChat] = useState(0);

  useEffect(() => {
    if (cooldownChat <= 0) return;
    const timer = setTimeout(() => setCooldownChat((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldownChat]);'''
content = content.replace(target_state, replacement_state)

target_handler = '''async function handleEnviarMensagem(e: React.FormEvent) {
    e.preventDefault();
    if (!mensagemInput.trim() || !codigoSala || enviandoMsg) return;
    const msg = mensagemInput.trim();
    setMensagemInput("");
    setEnviandoMsg(true);'''

replacement_handler = '''async function handleEnviarMensagem(e: React.FormEvent) {
    e.preventDefault();
    if (!mensagemInput.trim() || !codigoSala || enviandoMsg || cooldownChat > 0) return;
    const msg = mensagemInput.trim();
    setMensagemInput("");
    setEnviandoMsg(true);'''
content = content.replace(target_handler, replacement_handler)

target_handler_finally = '''} finally {
      setEnviandoMsg(false);
    }
  }'''
replacement_handler_finally = '''} finally {
      setEnviandoMsg(false);
      setCooldownChat(2); // 2 segundos de timeout
    }
  }'''
content = content.replace(target_handler_finally, replacement_handler_finally)

target_input = '''placeholder="Digite algo..."
                value={mensagemInput}
                onChange={(e) => setMensagemInput(e.target.value)}
                maxLength={200}
                className="flex-1 rounded-full px-4 py-2 text-sm bg-black/5 dark:bg-white/10 outline-none focus:ring-1 focus:ring-amora placeholder:opacity-50"
              />
              <button
                type="submit"
                disabled={!mensagemInput.trim() || enviandoMsg}'''
replacement_input = '''placeholder={cooldownChat > 0 ? `Aguarde ${cooldownChat}s...` : "Digite algo..."}
                value={mensagemInput}
                onChange={(e) => setMensagemInput(e.target.value)}
                disabled={cooldownChat > 0}
                maxLength={200}
                className="flex-1 rounded-full px-4 py-2 text-sm bg-black/5 dark:bg-white/10 outline-none focus:ring-1 focus:ring-amora placeholder:opacity-50 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!mensagemInput.trim() || enviandoMsg || cooldownChat > 0}'''
content = content.replace(target_input, replacement_input)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Patched cooldown")
