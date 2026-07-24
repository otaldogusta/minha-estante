#!/usr/bin/env python3
"""Cria o banco SQLite local com schema + dados atuais do site."""
import sqlite3, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MIGRATIONS = os.path.join(ROOT, "migrations")
DATA_DIR = os.path.join(ROOT, "data")
DB_PATH = os.path.join(DATA_DIR, "minha-estante.db")

ORDER = [
    "0001_init.sql", "0001_livros.sql", "0002_seed.sql",
    "0003_resenhas.sql", "0004_capas.sql", "0005_auth.sql",
    "0006_carta.sql", "0007_cartas.sql", "0008_estantes_por_usuario.sql",
    "0009_convites.sql", "0010_limpeza_teste.sql",
    "0011_limpa_convites_teste.sql", "0012_limpeza_simulacao_entrega.sql",
    "0013_limpa_convites_acumulados.sql", "0014_recuperacao.sql",
    "0015_limpa_recuperacao_teste.sql",
]

EXTRA = """
INSERT OR IGNORE INTO cartas (id, de_usuario_id, para_usuario_id, corpo, lida, criado_em)
SELECT 3, 2, 1, 'Oi gatinha, vim aqui pra dizer que vc é a mulher da minha vida! amo cada momento ao seu lado, cada sensação, cada cheiro, cada abraço, cada você.
Você é quem me da sentido as coisas e me mostrou o que é amar de verdade.

Um passarinho verde me contou que vc tava construindo uma planilha de livros, e então resolvi simplificar ela - não significa que esta horrível lixo e podre - pois precisava de um toque especial para que vc economizasse o seu tempo precioso e me dar mais atenção.

Agora ela ta com uma cara nova, e detalhe, aqui ja está todos os seus livros, resenhas e tudo mais que estava na planilha, então não precisa se preocupar tabao.

Espero que goste, feliz namoreidos de 4, te amo 🧡.', 0, '2026-07-23 13:17:20'
WHERE NOT EXISTS (SELECT 1 FROM cartas WHERE id = 3);

INSERT OR IGNORE INTO convites (codigo, criado_por, usado_por, criado_em)
VALUES ('76be46c2a4d29cd5db639c08', 2, NULL, '2026-07-22 23:16:20'),
       ('f604be7528a6b0b923d6b1ac', 2, NULL, '2026-07-22 23:16:22');
"""

def main():
    print(f"Criando banco local em: {DB_PATH}")
    os.makedirs(DATA_DIR, exist_ok=True)

    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)
        print("  (banco anterior removido)")

    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    conn.text_factory = str

    for fname in ORDER:
        fpath = os.path.join(MIGRATIONS, fname)
        if not os.path.exists(fpath):
            print(f"  [AVISO] {fname} não encontrado")
            continue
        with open(fpath, "r", encoding="utf-8") as f:
            sql = f.read()
        try:
            conn.executescript(sql)
            print(f"  OK {fname}")
        except Exception as e:
            print(f"  [ERRO] {fname}: {e}")
            conn.close()
            sys.exit(1)

    print("  --- dados adicionais ---")
    conn.executescript(EXTRA)
    print("  OK carta + convites")

    cur = conn.execute("""
        SELECT
          (SELECT COUNT(*) FROM usuarios) AS usuarios,
          (SELECT COUNT(*) FROM livros) AS livros,
          (SELECT COUNT(*) FROM cartas) AS cartas,
          (SELECT COUNT(*) FROM convites) AS convites
    """)
    row = cur.fetchone()
    print(f"\nBanco criado com sucesso!")
    print(f"  Usuários: {row[0]}")
    print(f"  Livros:    {row[1]}")
    print(f"  Cartas:    {row[2]}")
    print(f"  Convites:  {row[3]}")

    conn.close()

if __name__ == "__main__":
    main()