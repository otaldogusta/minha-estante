# -*- coding: utf-8 -*-
import re

with open(r'c:\Projects\Minha Estante\standalone\src\components\estante\leitor-digital.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Add imports
text = text.replace('encerrarSala,', 'encerrarSala,\n  enviarMensagemSala,\n  type SalaMensagem,')

# Add state
state_old = '''const [criandoSala, setCriandoSala] = useState(false);'''
state_new = state_old + '''\n  const [chatAberto, setChatAberto] = useState(false);\n  const [mensagemInput, setMensagemInput] = useState("");\n  const [enviandoMsg, setEnviandoMsg] = useState(false);\n  const mensagensEndRef = useRef<HTMLDivElement>(null);\n\n  useEffect(() => {\n    if (chatAberto) {\n      mensagensEndRef.current?.scrollIntoView({ behavior: "smooth" });\n    }\n  }, [dadosSala?.mensagens?.length, chatAberto]);\n\n  async function handleEnviarMensagem(e: React.FormEvent) {\n    e.preventDefault();\n    if (!mensagemInput.trim() || !codigoSala || enviandoMsg) return;\n    const msg = mensagemInput.trim();\n    setMensagemInput("");\n    setEnviandoMsg(true);\n    try {\n      await enviarMensagemSala({ data: { codigo: codigoSala, mensagem: msg } });\n    } finally {\n      setEnviandoMsg(false);\n    }\n  }'''
text = text.replace(state_old, state_new)

with open(r'c:\Projects\Minha Estante\standalone\src\components\estante\leitor-digital.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
