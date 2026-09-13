import sys

file_path = r'c:\Projects\Minha Estante\standalone\src\components\estante\leitor-digital.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

target_state = '''const [chatAberto, setChatAberto] = useState(false);
  const [mensagemInput, setMensagemInput] = useState("");'''

replacement_state = '''const [chatAberto, setChatAberto] = useState(false);
  const [qtdMensagensLidas, setQtdMensagensLidas] = useState(0);
  const [mensagemInput, setMensagemInput] = useState("");

  useEffect(() => {
    if (chatAberto && dadosSala?.mensagens) {
      setQtdMensagensLidas(dadosSala.mensagens.length);
    }
  }, [chatAberto, dadosSala?.mensagens]);'''

content = content.replace(target_state, replacement_state)

target_ui = '''{dadosSala.mensagens && dadosSala.mensagens.length > 0 && !chatAberto && ('''
replacement_ui = '''{dadosSala.mensagens && dadosSala.mensagens.length > qtdMensagensLidas && !chatAberto && ('''

content = content.replace(target_ui, replacement_ui)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Patched chat red dot logic")
