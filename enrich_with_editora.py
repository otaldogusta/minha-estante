import sqlite3, urllib.request, json, urllib.parse, unicodedata, time

DB = r'C:\Projects\Minha Estante\standalone\data\minha-estante.db'

def norm(s):
    if not s: return ''
    return unicodedata.normalize('NFD', s).encode('ascii','ignore').decode().lower().strip()

def search_google_books(titulo, autor, editora):
    queries = []
    if editora:
        queries.append(f'intitle:"{titulo}" inauthor:"{autor}" {editora}')
        queries.append(f'"{titulo}" "{autor}" "{editora}"')
        queries.append(f'"{titulo}" "{editora}"')
    queries.append(f'intitle:"{titulo}" inauthor:"{autor}"')
    queries.append(f'"{titulo}" "{autor}"')
    
    for q in queries:
        url = 'https://www.googleapis.com/books/v1/volumes?q=' + urllib.parse.quote(q) + '&maxResults=5&langRestrict=pt'
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=6) as response:
                data = json.loads(response.read().decode('utf-8'))
                for item in data.get('items', []):
                    info = item.get('volumeInfo', {})
                    t = info.get('title', '')
                    a = ' '.join(info.get('authors', []))
                    pub = info.get('publisher', '')
                    image_links = info.get('imageLinks', {})
                    img = image_links.get('extraLarge') or image_links.get('large') or image_links.get('medium') or image_links.get('thumbnail') or image_links.get('smallThumbnail')
                    
                    if not img: continue
                    # Clean up google books image URL to get high res and http->https
                    img = img.replace('http://', 'https://').replace('&edge=curl', '')
                    
                    # Verify title matches closely
                    if norm(titulo) in norm(t) or norm(t) in norm(titulo) or (len(norm(titulo))>5 and norm(titulo)[:10] in norm(t)):
                        # If publisher matches too, awesome!
                        if editora and norm(editora) in norm(pub):
                            return img, f"GoogleBooks Exact Publisher ({pub})"
                        return img, f"GoogleBooks Match ({t} by {pub})"
        except Exception as e:
            pass
        time.sleep(0.2)
    return None, None

def search_itunes(titulo, autor, editora):
    queries = []
    if editora:
        queries.append(f'{titulo} {autor} {editora}')
        queries.append(f'{titulo} {editora}')
    queries.append(f'{titulo} {autor}')
    
    for q in queries:
        url = 'https://itunes.apple.com/search?term=' + urllib.parse.quote(q) + '&media=ebook&entity=ebook&limit=5'
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=6) as response:
                data = json.loads(response.read().decode('utf-8'))
                for item in data.get('results', []):
                    track = item.get('trackName', '')
                    artist = item.get('artistName', '')
                    art = item.get('artworkUrl100', '')
                    if not art: continue
                    if norm(titulo) in norm(track) or norm(track) in norm(titulo):
                        if norm(autor) in norm(artist) or norm(artist) in norm(autor) or norm(autor).split()[-1] in norm(artist):
                            high_res = art.replace('100x100bb', '512x512bb')
                            return high_res, f"iTunes Match ({track} by {artist})"
        except Exception as e:
            pass
        time.sleep(0.2)
    return None, None

conn = sqlite3.connect(DB)
livros = conn.execute("SELECT id, titulo, autor, editora, capa FROM livros WHERE usuario_id=1 ORDER BY id").fetchall()

print(f"Enriching covers using Editora + Autor for {len(livros)} books...")
print("="*70)

updated_count = 0
for (lid, titulo, autor, editora, capa_atual) in livros:
    img, src = search_google_books(titulo, autor, editora)
    if not img:
        img, src = search_itunes(titulo, autor, editora)
    
    if img:
        print(f"[{lid}] {titulo} | Editora: {editora}")
        print(f"  Capas: {src}")
        print(f"  URL: {img[:80]}")
        conn.execute("UPDATE livros SET capa=? WHERE id=?", (img, lid))
        updated_count += 1
    else:
        print(f"[{lid}] {titulo} | Editora: {editora} -> Sem resultado no Google Books/iTunes com Editora")

conn.commit()
conn.close()
print("="*70)
print(f"Total capas atualizadas com busca precisa (Editora+Autor): {updated_count}/{len(livros)}")